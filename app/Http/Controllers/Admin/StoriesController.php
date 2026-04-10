<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Story;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Intervention\Image\Facades\Image;


class StoriesController extends Controller
{
    /**
     * Display a listing of the stories.
     */
    public function index(Request $request)
    {
        $query = Story::query()->with('user');
    
        // Only fetch standard stories
        $query->where('is_community', false);
    
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }
    
        $stories = $query->orderByDesc('id')->paginate(10);
    
        return Inertia::render('admin/stories/Index', [
            'stories' => $stories,
            'filters' => $request->only('search'),
        ]);
    }

    public function pending()
    {
        $stories = Story::where('status', 'pending')->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('admin/stories/Pending', [
            'stories' => $stories,
            'pageTitle' => 'Pending Stories',
        ]);
    }


    public function approve(Story $story)
    {
        $story->update(['status' => 'approved']);
        return redirect()->back()->with('success', 'Story approved.');
    }

    public function reject(Story $story)
    {
        $story->update(['status' => 'rejected']);
        return redirect()->back()->with('success', 'Story rejected.');
    }

    public function communityStories(Request $request)
    {
        $query = Story::where('is_community', true)->with(['user' => function($query) {
            $query->select('id', 'name', 'username', 'email');
        }]);
    
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }
    
        $stories = $query->orderByDesc('id')->paginate(10);
    
        return Inertia::render('admin/stories/Community', [
            'stories' => $stories,
            'filters' => $request->only('search'),
            'pageTitle' => 'Community Stories',
        ]);
    }

    public function create()
    {
        $categories = \App\Models\Category::orderBy('name')->get();
        
        return Inertia::render('admin/stories/Create', [
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created story in storage.
     */
    public function store(Request $request)
    {
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
        
        // Get logged-in admin user
        $user = \Illuminate\Support\Facades\Auth::user();

        $storyData = [
            'title' => $validated['title'],
            'description' => $validated['description'],
            'author' => $user->username, // Use username as author
            'genre' => $category->name, // Store category name in genre field
            'rating_id' => null,
            'content' => $validated['content'],
            'is_community' => false, // Admin-created stories are not community stories
            'read_count' => 0,
            'likes_count' => 0,
            'comment_count' => 0,
        ];

        // Handle cover image upload
        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('admin_stories/cover_images', 'public');
            $storyData['cover_image'] = $path;
        }

        if ($request->hasFile('backcover_image')) {
            $path = $request->file('backcover_image')->store('admin_stories/backcover_images', 'public');
            $storyData['backcover_image'] = $path;
        }
        

        $story = Story::create($storyData);

       



        return redirect()->route('admin-dashboard.stories.index')
            ->with('success', 'Story created successfully.');


    }

    /**
     * Display the specified story.
     */
    public function show(Story $story)

    {
        // Load the characters relationship
        $story->load('characters');

        return Inertia::render('admin/stories/Show', [
            'story' => $story,
        ]);
    }

    public function edit(Story $story)
    {
        // Load the characters and rating relationships
        $story->load(['characters', 'rating']);
        
        $ratings = \App\Models\Rating::orderBy('name')->get();

        return Inertia::render('admin/stories/Edit', [
            'story' => $story,
            'ratings' => $ratings,
        ]);
    }

    public function update(Request $request, Story $story)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'author' => 'required|string|max:255',
            'genre' => 'required|string|max:100',
            'rating' => 'nullable|string|exists:ratings,name',
            'content' => 'required|string',
            'cover_image' => 'nullable|image|max:2048', // Max 2MB
            'backcover_image' => 'nullable|image|max:2048', // Max 2MB
            'characters' => 'nullable|array',
            'characters.*.name' => 'required|string|max:255',
            'characters.*.description' => 'nullable|string',
            'character_updates' => 'nullable|array',
            'character_deletes' => 'nullable|array',
        ]);

        // Get rating_id from rating name
        $ratingId = null;
        if ($validated['rating']) {
            $rating = \App\Models\Rating::where('name', $validated['rating'])->first();
            $ratingId = $rating ? $rating->id : null;
        }

        $storyData = [
            'title' => $validated['title'],
            'description' => $validated['description'],
            'author' => $validated['author'],
            'genre' => $validated['genre'],
            'rating_id' => $ratingId,
            'content' => $validated['content'],
        ];

        // Handle cover image upload
        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('cover_images', 'public');
            $storyData['cover_image'] = $path;
        }

        if ($request->hasFile('backcover_image')) {
            $path = $request->file('backcover_image')->store('admin_stories/backcover_images', 'public');
            $storyData['backcover_image'] = $path;
        }

        $story->update($storyData);

        // Handle character updates
        if (isset($validated['characters']) && is_array($validated['characters'])) {
            foreach ($validated['characters'] as $characterData) {
                // If it's a new character, create it
                if (isset($characterData['is_new']) && $characterData['is_new']) {
                    $story->characters()->create([
                        'name' => $characterData['name'],
                        'description' => $characterData['description'] ?? '',
                    ]);
                }
            }
        }

        // Update existing characters
        if (isset($validated['character_updates']) && is_array($validated['character_updates'])) {
            foreach ($validated['character_updates'] as $id => $updates) {
                $character = $story->characters()->find($id);
                if ($character) {
                    $character->update($updates);
                }
            }
        }

        // Delete characters
        if (isset($validated['character_deletes']) && is_array($validated['character_deletes'])) {
            foreach ($validated['character_deletes'] as $id) {
                $character = $story->characters()->find($id);
                if ($character) {
                    $character->delete();
                }
            }
        }

        return redirect()->route('admin-dashboard.stories.index')
            ->with('success', 'Story updated successfully.');
    }

    /**
     * Remove the specified story from storage.
     */
    public function destroy(Story $story)
    {
        // Keep cover images for story page display - do not delete cover images
        // if ($story->cover_image) {
        //     Storage::disk('public')->delete($story->cover_image);
        // }

        // Delete associated data (comments, likes, etc.)
        $story->comments()->delete();
        $story->likes()->delete();
        $story->drafts()->delete();
        $story->characters()->delete(); // Delete characters

        $story->delete();

        // Check if the request came from community stories page
        $referrer = request()->header('referer');
        if ($referrer && str_contains($referrer, 'community/stories')) {
            return redirect()->route('admin-dashboard.stories.community')
                ->with('success', 'Community story deleted successfully.');
        }

        return redirect()->route('admin-dashboard.stories.index')
            ->with('success', 'Story deleted successfully.');
    }
}
