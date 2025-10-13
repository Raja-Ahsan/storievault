<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\PublishRequest;

class StoriesController extends Controller
{
    /**
     * Display a listing of the stories.
     */
    public function index(Request $request)
    {
        // Only show non-community stories
        $query = Story::with('rating')->where('is_community', false);
        
        // Filter by genre if provided
        if ($request->has('genre') && $request->genre !== 'all') {
            $query->where('genre', $request->genre);
        }

        // Filter by rating if provided
        if ($request->has('rating') && $request->rating !== 'all') {
            $query->where('rating_id', $request->rating);
        }

        // Search by title or description if provided
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        // Get all available genres for the filter dropdown (only from non-community stories)
        $genres = Story::where('is_community', false)
            ->select('genre')
            ->distinct()
            ->pluck('genre');

        // Get all ratings for the filter dropdown
        $ratings = \App\Models\Rating::orderBy('name')->get();

        // Paginate the results - use fresh() to ensure we get the latest data
        $stories = $query->latest()->paginate(9);

        // We'll keep the data refresh to ensure accurate counts
        // but we won't force a page refresh in the frontend
        foreach ($stories as $key => $story) {
            $stories[$key] = $story->fresh(['rating']);
        }

        return Inertia::render('Stories/Index', [
            'stories' => $stories,
            'genres' => $genres,
            'ratings' => $ratings,
            'filters' => $request->only(['search', 'genre', 'rating']),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function store(Request $request)
    {

        $user = Auth::user();

        // ADD THIS CHECK HERE
        if (!$user->subscription || $user->subscription->stripe_status !== 'active') {
            return redirect()->back()->with('error', 'Active subscription required to create stories');
        }

        if (!Auth::check()) {
            return redirect()->back()->with('error', 'You must be logged in to submit a story.');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);
        Story::create([
            'title' => $request->title,
            'content' => $request->content,

            'user_id' => Auth::id(),
            'status' => 'pending',
            'read_count' => 0,
            'likes_count' => 0,
            'comment_count' => 0,
            'is_community' => false,
        ]);

        return redirect()->back()->with('success', 'Story submitted for approval.');
    }

    /**
     * Display the specified story.
     */
    public function show(Story $story)
    {
        // Load the characters and rating for this story
        $story->load(['characters', 'rating']);
        
        // Get all ratings for the rating selector
        $ratings = \App\Models\Rating::orderBy('name')->get();

        return Inertia::render('Stories/Show', [
            'story' => $story,
            'ratings' => $ratings,
        ]);
    }

    /**
     * Display the story for reading.
     */
    public function read(Story $story)
    {
        // Only increment read count for non-admin users (including guests)
        if (Auth::check() && Auth::user()->role !== 'admin') {
            // Check if this user has already read this story
            $existingRead = \App\Models\StoryRead::where('story_id', $story->id)
                ->where('user_id', Auth::id())
                ->first();

            // Only increment if this is a new read
            if (!$existingRead) {
                // Increment the read count
                $story->increment('read_count');

                // Track the read in the story_reads table
                $this->trackStoryRead($story);
            }
        }

        // Paginate the story content on the backend
        $paginatedContent = $this->paginateStoryContent($story->content);

        return Inertia::render('Stories/Read', [
            'story' => $story,
            'paginatedContent' => $paginatedContent,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    /**
     * Paginate story content into pages suitable for book display
     */
    private function paginateStoryContent($content, $pageWidth = 460, $pageHeight = 600)
    {
        if (empty($content)) {
            return [];
        }

        // Calculate available height accounting for padding (20px top + 20px bottom = 40px)
        $availableHeight = $pageHeight - 40;
        
        // Split content into meaningful chunks (paragraphs, lists, headings, etc.)
        // Use a more precise regex to capture complete HTML elements
        $chunks = preg_split('/(<(?:p|div|ul|ol|h[1-6])[^>]*>.*?<\/(?:p|div|ul|ol|h[1-6])>)/is', $content, -1, PREG_SPLIT_DELIM_CAPTURE);
        
        // Filter out empty chunks and standalone tags
        $chunks = array_filter($chunks, function($chunk) {
            $trimmed = trim($chunk);
            return !empty($trimmed) && !preg_match('/^<\/?(p|div|ul|ol|h[1-6])[^>]*>$/i', $trimmed);
        });
        
        $pages = [];
        $currentPage = '';
        
        foreach ($chunks as $chunk) {
            $trimmedChunk = trim($chunk);
            if (empty($trimmedChunk)) continue;
            
            $testContent = $currentPage . $trimmedChunk;
            
            // Simulate the content height by counting lines and characters
            $estimatedHeight = $this->estimateContentHeight($testContent, $pageWidth);
            
            if ($estimatedHeight > $availableHeight && !empty($currentPage)) {
                // Current page is full, save it and start new page
                $pages[] = trim($currentPage);
                
                // Check if the current chunk is too long for one page
                if ($this->estimateContentHeight($trimmedChunk, $pageWidth) > $availableHeight) {
                    // Split by sentences if chunk is too long
                    $textContent = strip_tags($trimmedChunk);
                    $sentences = preg_split('/(?<=[.!?])\s+/', $textContent);
                    
                    $partialContent = '';
                    $htmlTags = $this->extractHtmlTags($trimmedChunk);
                    
                    foreach ($sentences as $sentence) {
                        $testSentence = $partialContent . ($partialContent ? ' ' : '') . $sentence;
                        $testHTML = $this->wrapWithHtmlTags($testSentence, $htmlTags);
                        
                        if ($this->estimateContentHeight($testHTML, $pageWidth) > $availableHeight && !empty($partialContent)) {
                            // Save this partial page
                            $finalHTML = $this->wrapWithHtmlTags($partialContent, $htmlTags);
                            $pages[] = trim($finalHTML);
                            $partialContent = $sentence;
                        } else {
                            $partialContent = $testSentence;
                        }
                    }
                    
                    // Handle remaining content
                    if (!empty(trim($partialContent))) {
                        $currentPage = $this->wrapWithHtmlTags($partialContent, $htmlTags);
                    } else {
                        $currentPage = '';
                    }
                } else {
                    $currentPage = $trimmedChunk;
                }
            } else {
                // Add chunk to current page
                $currentPage = $testContent;
            }
        }
        
        // Add the last page if it has content
        if (!empty(trim($currentPage))) {
            $pages[] = trim($currentPage);
        }
        
        // Ensure we have pages and they're not empty
        return array_filter($pages, function($page) {
            return !empty($page) && strlen(trim($page)) > 0;
        });
    }

    /**
     * Extract HTML tags from content for reconstruction
     */
    private function extractHtmlTags($content)
    {
        $tags = [];
        if (preg_match('/<([^>]+)>/', $content, $matches)) {
            $tags['open'] = '<' . $matches[1] . '>';
        }
        if (preg_match('/<\/([^>]+)>/', $content, $matches)) {
            $tags['close'] = '</' . $matches[1] . '>';
        }
        return $tags;
    }

    /**
     * Wrap content with HTML tags
     */
    private function wrapWithHtmlTags($content, $tags)
    {
        if (empty($tags['open']) || empty($tags['close'])) {
            return $content;
        }
        return $tags['open'] . $content . $tags['close'];
    }

    /**
     * Estimate content height based on text content and container width
     */
    private function estimateContentHeight($content, $containerWidth)
    {
        // Remove HTML tags for text analysis
        $textContent = strip_tags($content);
        
        // Basic estimation: assume average character width and line height
        $avgCharWidth = 8; // pixels
        $lineHeight = 25; // pixels (17px font-size * 1.6 line-height)
        $padding = 40; // 20px top + 20px bottom
        
        // Calculate characters per line
        $charsPerLine = floor($containerWidth / $avgCharWidth);
        
        // Calculate number of lines needed
        $lines = ceil(strlen($textContent) / $charsPerLine);
        
        // Add some extra height for HTML elements (headings, paragraphs, etc.)
        $htmlOverhead = substr_count($content, '<h') * 10; // Extra space for headings
        $htmlOverhead += substr_count($content, '<p') * 5; // Extra space for paragraphs
        
        return ($lines * $lineHeight) + $padding + $htmlOverhead;
    }

    /**
     * Track a story read in the database.
     */
    private function trackStoryRead(Story $story)
    {
        // Track reads for logged-in non-admin users (including guests)
        if (Auth::check() && Auth::user()->role !== 'admin') {
            // Create a new StoryRead record
            $storyRead = new \App\Models\StoryRead([
                'story_id' => $story->id,
                'user_id' => Auth::id(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            $storyRead->save();
        }
    }

    /**
     * Store a community story.
     */
    public function storeCommunity(Request $request)
    {
        $user = Auth::user();

        if (!$user->subscription || $user->subscription->stripe_status !== 'active') {
            return response()->json([
                'error' => 'Active subscription required to add community stories'
            ], 403);
        }

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'character_id' => 'nullable|integer',
            'original_story_id' => 'required|integer|exists:stories,id',
            'rating' => 'nullable|integer|exists:ratings,id',
        ]);

        // Check daily word limit before creating the story
        $packageWordsLimit = $user->subscription->package->words_limit ?? 0;
        if ($packageWordsLimit > 0) {
            // Get today's date
            $today = now()->startOfDay();
            
            // Get daily word usage (from community stories added today)
            $dailyStories = Story::where('user_id', $user->id)
                ->where('is_community', true)
                ->whereDate('created_at', $today)
                ->get();
                
            // Calculate current daily word usage
            $currentDailyWords = $dailyStories->sum(function($story) {
                return str_word_count(strip_tags($story->content));
            });
            
            // Calculate new story word count
            $newStoryWords = str_word_count(strip_tags($data['content']));
            
            // Check if adding this story would exceed the daily limit
            if (($currentDailyWords + $newStoryWords) > $packageWordsLimit) {
                return response()->json([
                    'error' => "Daily word limit exceeded. You have used {$currentDailyWords} words today out of {$packageWordsLimit} allowed. This story would add {$newStoryWords} words, exceeding your limit by " . (($currentDailyWords + $newStoryWords) - $packageWordsLimit) . " words."
                ], 422);
            }
        }

        // Get the original story
        $originalStory = Story::findOrFail($data['original_story_id']);

        // Create a new story for the community
        $story = new Story();
        $story->title = $data['title'];
        $story->description = "A continuation of \"{$originalStory->title}\" by {$user->name}";
        $story->author = $user->name;
        $story->genre = $originalStory->genre;
        $story->rating_id = $data['rating'] ?? $originalStory->rating_id;
        $story->cover_image = $originalStory->cover_image;
        $story->content = $data['content'];
        $story->read_count = 0;
        $story->comment_count = 0;
        $story->is_community = true;
        $story->user_id = $user->id;
        $story->save();

        return response()->json([
            'success' => true,
            'message' => 'Story added to community successfully',
            'story' => $story,
        ]);
    }

    public function storeDraftSession(Request $request)
    {
        // Check if user is not logged in
        if (!Auth::check()) {
            return redirect()->route('login')->with('error', 'You must be logged in to publish stories.');
        }

        $user = Auth::user();

        // Check if user is a guest (is_guest = 1)
        if ($user->is_guest) {
            return redirect()->route('register')->with('error', 'Guest users cannot publish stories. Please create a full account to continue.');
        }

        // Check if user account is inactive (is_active = 0)
        if (!$user->is_active) {
            return redirect()->route('login')->with('error', 'Your account is inactive. Please contact support for assistance.');
        }

        // Check if user has active subscription
        if (!$user->subscription || $user->subscription->stripe_status !== 'active') {
            return redirect()->route('packages')->with('error', 'Active subscription required to save drafts');
        }

        session()->put('story_publish_data', $request->only(['story_id', 'character_name', 'content']));
        return redirect()->route('stories.publish.packages');
    }

    public function showPublishForm(Request $request, Story $story)
    {
        // Check if user is not logged in
        if (!Auth::check()) {
            return redirect()->route('login')->with('error', 'You must be logged in to publish stories.');
        }

        $user = Auth::user();

        // Check if user is a guest (is_guest = 1)
        if ($user->is_guest) {
            return redirect()->route('register')->with('error', 'Guest users cannot publish stories. Please create a full account to continue.');
        }

        // Check if user account is inactive (is_active = 0)
        if (!$user->is_active) {
            return redirect()->route('login')->with('error', 'Your account is inactive. Please contact support for assistance.');
        }

        // Check if user has active subscription
        if (!$user->subscription || $user->subscription->stripe_status !== 'active') {
            return redirect()->route('packages')->with('error', 'Active subscription required to access publish packages');
        }

        $prefill = session('story_publish_data');
        
        // Get package information from query parameters
        $packageData = null;
        if ($request->has('package') && $request->has('package_price')) {
            $packageData = [
                'id' => $request->get('package'),
                'name' => $request->get('package_name'),
                'price' => $request->get('package_price')
            ];
        }

        return Inertia::render('Stories/Publish/Form', [
            'prefill' => $prefill,
            'story' => $story,
            'package' => $packageData,
            'ratings' => \App\Models\Rating::orderBy('name')->get()
        ]);
    }

    public function showPackages()
    {
        // Check if user is not logged in
        if (!Auth::check()) {
            return redirect()->route('login')->with('error', 'You must be logged in to publish stories.');
        }

        $user = Auth::user();

        // Check if user is a guest (is_guest = 1)
        if ($user->is_guest) {
            return redirect()->route('register')->with('error', 'Guest users cannot publish stories. Please create a full account to continue.');
        }

        // Check if user account is inactive (is_active = 0)
        if (!$user->is_active) {
            return redirect()->route('login')->with('error', 'Your account is inactive. Please contact support for assistance.');
        }

        // Check if user has active subscription
        if (!$user->subscription || $user->subscription->stripe_status !== 'active') {
            return redirect()->route('packages')->with('error', 'Active subscription required to access publish packages');
        }

        $session = session('story_publish_data');

        if (!$session || !isset($session['story_id'])) {
            return redirect()->route('stories.index')->with('error', 'Story session data not found.');
        }

        // ✅ Fetch story from DB using story_id from session
        $story = Story::find($session['story_id']);

        if (!$story) {
            return redirect()->route('stories.index')->with('error', 'Story not found.');
        }

        // Fetch active publish packages
        $publishPackages = \App\Models\PublishPackage::where('is_active', true)->get();

        return Inertia::render('Stories/Publish/Packages', [
            'story' => $story,
            'publishPackages' => $publishPackages,
        ]);
    }

    public function storePublishRequest(Request $request)
    {
        // Check if user is not logged in
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'You must be logged in to publish stories.'
            ], 401);
        }

        $user = Auth::user();

        // Check if user has active subscription
        if (!$user->subscription || $user->subscription->stripe_status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Active subscription required to publish stories'
            ], 403);
        }

        // Check if user is a guest (is_guest = 1)
        if ($user->is_guest) {
            return response()->json([
                'success' => false,
                'message' => 'Guest users cannot publish stories. Please create a full account to continue.'
            ], 403);
        }

        // Check if user account is inactive (is_active = 0)
        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account is inactive. Please contact support for assistance.'
            ], 403);
        }

        try {
            $request->validate([
                'story_id' => 'required|exists:stories,id',
                'character' => 'required',
                'content' => 'required',
                'title' => 'required',
                'genre' => 'required',
                'rating' => 'nullable|string',
            ]);

            // Get the story to access its cover_image
            $story = Story::findOrFail($request->story_id);

            $publishRequest = PublishRequest::create([
                'user_id' => Auth::id(),
                'cover_image' => $story->cover_image, // Get cover_image from the story
                'story_id' => $request->story_id,
                'title' => $request->title,
                'character' => $request->character,
                'genre' => $request->genre,
                'rating' => $request->rating ?? $story->rating,
                'content' => $request->content,
                'status' => 'pending',
            ]);

            // Don't create payment record here - it will be created after successful Stripe payment
            // Payment::create([
            //     'user_id' => Auth::id(),
            //     'publish_request_id' => $publishRequest->id,
            //     'stripe_payment_intent_id' => 'manual_' . time(),
            //     'amount' => 19.00,
            //     'currency' => 'USD',
            //     'status' => 'succeeded',
            //     'payment_method' => 'card',
            //     'description' => 'Story Publishing Package - ' . $request->title,
            // ]);

            Log::info('Publish request created successfully', [
                'publish_request_id' => $publishRequest->id,
                'user_id' => Auth::id(),
                'story_id' => $request->story_id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Publish request created successfully',
                'publishRequest' => [
                    'id' => $publishRequest->id,
                    'title' => $publishRequest->title,
                    'status' => $publishRequest->status
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating publish request', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create publish request. Please try again.'
            ], 500);
        }
    }
}
