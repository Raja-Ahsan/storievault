<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Story;
use App\Models\PublishRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class StoriesController extends Controller
{
    public function index()
    {
        $userId = Auth::user()->id;
        
        // Get community stories (stories added to community)
        $communityStories = Story::where('user_id', $userId)
            ->where('is_community', true)
            ->orderByDesc('id')
            ->paginate(10);
            
        // Get published stories (standard stories)
        $publishedStories = Story::where('user_id', $userId)
            ->where('is_community', false)
            ->orderByDesc('id')
            ->paginate(10);

        // Get publish requests
        $publishRequests = PublishRequest::where('user_id', $userId)
            ->with(['story' => function($query) {
                $query->select('id', 'title', 'user_id');
            }])
            ->orderByDesc('created_at')
            ->paginate(10);

        return Inertia::render('user/stories/Index', [
            'communityStories' => $communityStories,
            'publishedStories' => $publishedStories,
            'publishRequests' => $publishRequests,
        ]);
    }

    public function create()
    {
        $categories = \App\Models\Category::orderBy('name')->get();
        
        return Inertia::render('user/stories/Create', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        
        // Check if user has active subscription
        if (!$user->subscription || $user->subscription->stripe_status !== 'active') {
            return redirect()->back()->with('error', 'Active subscription required to create stories');
        }
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|exists:categories,id',
            'content' => 'required|string',
            'cover_image' => 'required|image|max:2048', // Max 2MB
            'backcover_image' => 'required|image|max:2048', // Max 2MB
        ]);

        // Get category name from category ID
        $category = \App\Models\Category::findOrFail($validated['category']);

        $storyData = [
            'title' => $validated['title'],
            'description' => $validated['description'],
            'author' => $user->username, // Use username as author
            'genre' => $category->name, // Store category name in genre field
            'content' => $validated['content'],
            'is_community' => true, // User-created stories are community stories
            'read_count' => 0,
            'likes_count' => 0,
            'comment_count' => 0,
            'user_id' => $user->id,
            'status' => 'pending',
        ];

        // Handle cover image upload
        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('user_stories/cover_images', 'public');
            $storyData['cover_image'] = $path;
        }

        if ($request->hasFile('backcover_image')) {
            $path = $request->file('backcover_image')->store('user_stories/backcover_images', 'public');
            $storyData['backcover_image'] = $path;
        }

        Story::create($storyData);

        return redirect()->route('user-dashboard.stories.index')
            ->with('success', 'Story created successfully.');
    }

    public function show(Story $story)
    {
        // Check if the story belongs to the authenticated user
        if ($story->user_id !== Auth::user()->id) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('user/stories/Show', [
            'story' => $story,
        ]);
    }

    public function edit(Story $story)
    {
        // Check if the story belongs to the authenticated user
        if ($story->user_id !== Auth::user()->id) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('user/stories/Edit', [
            'story' => $story,
        ]);
    }

    public function update(Request $request, Story $story)
    {
        // Check if the story belongs to the authenticated user
        if ($story->user_id !== Auth::user()->id) {
            abort(403, 'Unauthorized action.');
        }

        // This will be implemented when the edit form is ready
        return redirect()->route('user-dashboard.stories.index')
            ->with('success', 'Story updated successfully.');
    }

    public function destroy(Story $story)
    {
        // Check if the story belongs to the authenticated user
        if ($story->user_id !== Auth::user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $story->delete();

        return redirect()->route('user-dashboard.stories.index')
            ->with('success', 'Story deleted successfully.');
    }

    public function toggleStatus(Request $request, Story $story)
    {
        // Check if the story belongs to the authenticated user
        if ($story->user_id !== Auth::user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $story->update(['is_active' => $request->is_active]);

        return response()->json(['success' => true]);
    }
}
