<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class AdminRatingController extends Controller
{
    /**
     * Display a listing of ratings.
     */
    public function index(Request $request)
    {
        $query = Rating::query();

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $ratings = $query->orderBy('name')->paginate(10);

        return Inertia::render('admin/rating/Index', [
            'ratings' => $ratings,
            'filters' => $request->only(['search']),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new rating.
     */
    public function create()
    {
        return Inertia::render('admin/rating/Create');
    }

    /**
     * Store a newly created rating in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:ratings,name',
        ]);

        try {
            $rating = Rating::create($validated);

            return redirect()->route('admin-dashboard.ratings.index')
                ->with('success', 'Rating created successfully!');
        } catch (\Exception $e) {
            Log::error('Error creating rating: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create rating. Please try again.');
        }
    }

    /**
     * Show the form for editing the specified rating.
     */
    public function edit(Rating $rating)
    {
        return Inertia::render('admin/rating/Edit', [
            'rating' => $rating,
        ]);
    }

    /**
     * Update the specified rating in storage.
     */
    public function update(Request $request, Rating $rating)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:ratings,name,' . $rating->id,
        ]);

        try {
            $rating->update($validated);

            return redirect()->route('admin-dashboard.ratings.index')
                ->with('success', 'Rating updated successfully!');
        } catch (\Exception $e) {
            Log::error('Error updating rating: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update rating. Please try again.');
        }
    }

    /**
     * Remove the specified rating from storage.
     */
    public function destroy(Rating $rating)
    {
        try {
            // Check if rating is being used by stories
            $storiesCount = \App\Models\Story::where('rating_id', $rating->id)->count();
            $publishRequestsCount = \App\Models\PublishRequest::where('rating', $rating->name)->count();

            if ($storiesCount > 0 || $publishRequestsCount > 0) {
                return redirect()->back()
                    ->with('error', "Cannot delete rating '{$rating->name}' because it is being used by {$storiesCount} stories and {$publishRequestsCount} publish requests.");
            }

            $rating->delete();

            return redirect()->route('admin-dashboard.ratings.index')
                ->with('success', 'Rating deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Error deleting rating: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to delete rating. Please try again.');
        }
    }
}
