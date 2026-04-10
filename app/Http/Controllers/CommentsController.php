<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Story;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\ValidationException;

class CommentsController extends Controller
{
    /**
     * Store a newly created comment in storage.
     */
    public function store(Request $request, Story $story): RedirectResponse
    {
        try {
            // Validate the request
            $validated = $request->validate([
                'content' => 'required|string|max:1000',
                'parent_id' => 'nullable|exists:story_comments,id',
            ]);

            // Create the comment
            $comment = new Comment([
                'user_id' => Auth::id(),
                'story_id' => $story->id,
                'parent_id' => $validated['parent_id'] ?? null,
                'content' => $validated['content'],
                'is_approved' => true,
            ]);

            $comment->save();

            // Increment the comment count on the story
            // We count both top-level comments and replies
            $story->comment_count = Comment::where('story_id', $story->id)->count();
            $story->save();

            return Redirect::back()
                ->with('success', 'Comment added successfully!')
                ->with('preserveScroll', true);
        } catch (ValidationException $e) {
            return Redirect::back()->withErrors($e->errors())->withInput();
        }
    }

    /**
     * Update the specified comment in storage.
     */
    public function update(Request $request, Comment $comment): RedirectResponse
    {
        // Check if the user is authorized to update the comment
        if (Auth::id() !== $comment->user_id) {
            return Redirect::back()->with('error', 'You are not authorized to update this comment.');
        }

        try {
            // Validate the request
            $validated = $request->validate([
                'content' => 'required|string|max:1000',
            ]);

            // Update the comment
            $comment->update([
                'content' => $validated['content'],
            ]);

            return Redirect::back()
                ->with('success', 'Comment updated successfully!')
                ->with('preserveScroll', true);
        } catch (ValidationException $e) {
            return Redirect::back()->withErrors($e->errors())->withInput();
        }
    }

    /**
     * Remove the specified comment from storage.
     */
    public function destroy(Comment $comment): RedirectResponse
    {
        // Check if the user is authorized to delete the comment
        if (Auth::id() !== $comment->user_id) {
            return Redirect::back()->with('error', 'You are not authorized to delete this comment.');
        }

        // Get the story before deleting the comment
        $story = $comment->story;

        // No need to count replies separately as we'll count all comments after deletion

        // Delete the comment (this will also delete all replies due to cascade)
        $comment->delete();

        // Update the comment count on the story after deletion
        // Count all remaining comments for this story
        $story->comment_count = Comment::where('story_id', $story->id)->count();
        $story->save();

        return Redirect::back()
            ->with('success', 'Comment deleted successfully!')
            ->with('preserveScroll', true);
    }

    /**
     * Get comments for a story.
     */
    public function getComments(Story $story)
    {
        // Load comments with their users and replies
        $comments = $story->comments()
            ->with(['user', 'replies.user'])
            ->whereNull('parent_id')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'comments' => $comments,
        ]);
    }
}
