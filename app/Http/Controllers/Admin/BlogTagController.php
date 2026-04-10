<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogTag;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogTagController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogTag::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        $tags = $query->orderBy('name')->paginate(20)->withQueryString();

        return Inertia::render('admin/blog-tags/Index', [
            'tags' => $tags,
            'filters' => $request->only(['search']),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/blog-tags/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:blog_tags,name',
        ]);

        BlogTag::create($validated);

        return redirect()->route('admin-dashboard.blog-tags.index')
            ->with('success', 'Blog tag created.');
    }

    public function edit(BlogTag $blog_tag)
    {
        return Inertia::render('admin/blog-tags/Edit', [
            'tag' => $blog_tag,
        ]);
    }

    public function update(Request $request, BlogTag $blog_tag)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:blog_tags,name,'.$blog_tag->id,
        ]);

        $blog_tag->update($validated);

        return redirect()->route('admin-dashboard.blog-tags.index')
            ->with('success', 'Blog tag updated.');
    }

    public function destroy(BlogTag $blog_tag)
    {
        if ($blog_tag->posts()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete a tag that is assigned to posts.');
        }

        $blog_tag->delete();

        return redirect()->route('admin-dashboard.blog-tags.index')
            ->with('success', 'Blog tag deleted.');
    }
}
