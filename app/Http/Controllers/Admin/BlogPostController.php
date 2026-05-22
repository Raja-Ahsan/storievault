<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogPostController extends Controller
{
    public function index(Request $request)
    {
        $query = Post::query()->with(['categories', 'tags', 'media']);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                    ->orWhere('excerpt', 'like', "%{$s}%");
            });
        }

        if ($request->filled('status') && in_array($request->status, ['draft', 'published'], true)) {
            $query->where('status', $request->status);
        }

        $posts = $query->orderByDesc('id')->paginate(10)->withQueryString();

        return Inertia::render('admin/blog-posts/Index', [
            'posts' => $posts,
            'filters' => $request->only(['search', 'status']),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/blog-posts/Create', [
            'blogCategories' => BlogCategory::orderBy('name')->get(),
            'blogTags' => BlogTag::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->prepareScheduleInput($request);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_tags' => 'nullable|string|max:255',
            'facebook_meta' => 'nullable|string|max:255',
            'twitter_meta' => 'nullable|string|max:255',
            'post_type' => 'required|in:general',
            'featured' => 'sometimes|boolean',
            'visibility' => 'required|in:public,private',
            'status' => 'required|in:draft,published',
            'scheduled_publish_at' => 'nullable|date',
            'faqs' => 'nullable|json',
            'image' => 'nullable|image|max:5120',
            'blog_category_ids' => 'nullable|array',
            'blog_category_ids.*' => 'exists:blog_categories,id',
            'blog_tag_ids' => 'nullable|array',
            'blog_tag_ids.*' => 'exists:blog_tags,id',
        ]);

        $faqs = $this->sanitizeFaqsFromValidated($validated['faqs'] ?? null);

        $post = Post::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'excerpt' => $validated['excerpt'] ?? null,
            'meta_title' => $validated['meta_title'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            'meta_tags' => $validated['meta_tags'] ?? null,
            'facebook_meta' => $validated['facebook_meta'] ?? null,
            'twitter_meta' => $validated['twitter_meta'] ?? null,
            'post_type' => $validated['post_type'],
            'featured' => $request->boolean('featured'),
            'visibility' => $validated['visibility'],
            'status' => $validated['status'],
            'scheduled_publish_at' => $validated['scheduled_publish_at'] ?? null,
            'faqs' => $faqs,
            'image' => null,
        ]);

        if ($request->hasFile('image')) {
            $post->addMediaFromRequest('image')->toMediaCollection('posts');
            $post->refresh();
            $post->update(['image' => $post->featured_image]);
        }

        $post->categories()->sync($validated['blog_category_ids'] ?? []);
        $post->tags()->sync($validated['blog_tag_ids'] ?? []);

        return redirect()->route('admin-dashboard.blog-posts.edit', $post)
            ->with('success', 'Blog post created successfully.');
    }

    public function show(Post $blog_post)
    {
        $blog_post->load(['categories', 'tags', 'media']);

        return Inertia::render('admin/blog-posts/Show', [
            'post' => array_merge($blog_post->toArray(), [
                'featured_image_url' => $blog_post->featuredImageUrl(),
            ]),
        ]);
    }

    public function edit(Post $blog_post)
    {
        $blog_post->load(['categories', 'tags', 'media']);

        $existingFaqs = $blog_post->faqs;
        if (! is_array($existingFaqs)) {
            $existingFaqs = [];
        }

        return Inertia::render('admin/blog-posts/Edit', [
            'post' => array_merge($blog_post->toArray(), [
                'blog_category_ids' => $blog_post->categories->pluck('id')->map(fn ($id) => (string) $id)->values()->all(),
                'blog_tag_ids' => $blog_post->tags->pluck('id')->map(fn ($id) => (string) $id)->values()->all(),
                'featured_image_url' => $blog_post->featuredImageUrl(),
                'faqs' => count($existingFaqs) > 0 ? $existingFaqs : [['question' => '', 'answer' => '']],
            ]),
            'blogCategories' => BlogCategory::orderBy('name')->get(),
            'blogTags' => BlogTag::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Post $blog_post)
    {
        $this->prepareScheduleInput($request);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_tags' => 'nullable|string|max:255',
            'facebook_meta' => 'nullable|string|max:255',
            'twitter_meta' => 'nullable|string|max:255',
            'post_type' => 'required|in:general',
            'featured' => 'sometimes|boolean',
            'visibility' => 'required|in:public,private',
            'status' => 'required|in:draft,published',
            'scheduled_publish_at' => 'nullable|date',
            'faqs' => 'nullable|json',
            'image' => 'nullable|image|max:5120',
            'remove_image' => 'sometimes|boolean',
            'blog_category_ids' => 'nullable|array',
            'blog_category_ids.*' => 'exists:blog_categories,id',
            'blog_tag_ids' => 'nullable|array',
            'blog_tag_ids.*' => 'exists:blog_tags,id',
        ]);

        $faqs = $this->sanitizeFaqsFromValidated($validated['faqs'] ?? null);

        $blog_post->update([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'excerpt' => $validated['excerpt'] ?? null,
            'meta_title' => $validated['meta_title'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            'meta_tags' => $validated['meta_tags'] ?? null,
            'facebook_meta' => $validated['facebook_meta'] ?? null,
            'twitter_meta' => $validated['twitter_meta'] ?? null,
            'post_type' => $validated['post_type'],
            'featured' => $request->boolean('featured'),
            'visibility' => $validated['visibility'],
            'status' => $validated['status'],
            'scheduled_publish_at' => $validated['scheduled_publish_at'] ?? null,
            'faqs' => $faqs,
        ]);

        if ($request->boolean('remove_image')) {
            $blog_post->clearMediaCollection('posts');
            $blog_post->update(['image' => null]);
        }

        if ($request->hasFile('image')) {
            $blog_post->clearMediaCollection('posts');
            $blog_post->addMediaFromRequest('image')->toMediaCollection('posts');
            $blog_post->refresh();
            $blog_post->update(['image' => $blog_post->featured_image]);
        }

        $blog_post->categories()->sync($validated['blog_category_ids'] ?? []);
        $blog_post->tags()->sync($validated['blog_tag_ids'] ?? []);

        return redirect()->route('admin-dashboard.blog-posts.edit', $blog_post)
            ->with('success', 'Blog post updated successfully.');
    }

    public function destroy(Post $blog_post)
    {
        $blog_post->clearMediaCollection('posts');
        $blog_post->delete();

        return redirect()->route('admin-dashboard.blog-posts.index')
            ->with('success', 'Blog post deleted.');
    }

    private function prepareScheduleInput(Request $request): void
    {
        if ($request->input('scheduled_publish_at') === '' || $request->input('scheduled_publish_at') === null) {
            $request->merge(['scheduled_publish_at' => null]);
        }
    }

    private function sanitizeFaqsFromValidated(?string $json): array
    {
        if ($json === null || $json === '') {
            return [];
        }

        $decoded = json_decode($json, true);

        return $this->sanitizeFaqs(is_array($decoded) ? $decoded : []);
    }

    /**
     * @param  array<int, mixed>  $faqs
     * @return array<int, array{question: string, answer: string}>
     */
    private function sanitizeFaqs(array $faqs): array
    {
        return array_values(array_filter(array_map(function ($item) {
            if (! is_array($item)) {
                return null;
            }
            $q = trim((string) ($item['question'] ?? ''));
            $a = trim((string) ($item['answer'] ?? ''));

            return ($q !== '' && $a !== '') ? ['question' => $q, 'answer' => $a] : null;
        }, $faqs)));
    }
}
