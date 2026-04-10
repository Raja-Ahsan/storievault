<?php

use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\GuestAuthController;
use App\Http\Controllers\Admin\StoriesController as AdminStoriesController;
use App\Http\Controllers\User\StoriesController as UserStoriesController;
use Laravel\Socialite\Facades\Socialite;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\CommentsController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StoriesController;
use App\Http\Controllers\StoryDraftsController;
use App\Http\Controllers\StoryLikesController;
use App\Http\Controllers\StoryRatingsController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PublishRequestController;
use App\Http\Controllers\StoriesController as MainStoriesController;
use App\Http\Controllers\StripeController;
use App\Http\Controllers\User\UserDashboardController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\Admin\PackagesController as AdminPackagesController;
use App\Http\Controllers\Admin\PublishPackageController as AdminPublishPackageController;
use App\Http\Controllers\Admin\SubscriptionController as AdminSubscriptionController;
use App\Http\Controllers\Admin\RatingController as AdminRatingController;
use App\Http\Controllers\Admin\BlogPostController;
use App\Http\Controllers\Admin\BlogCategoryController;
use App\Http\Controllers\Admin\BlogTagController;
use App\Http\Controllers\BlogController;

// SEO: sitemap and robots.txt (served by Laravel, not Inertia)
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/robots.txt', function () {
    $baseUrl = rtrim(config('app.url'), '/');
    $sitemapUrl = (str_contains($baseUrl, 'localhost')) 
        ? $baseUrl . '/sitemap.xml' 
        : 'https://www.storievault.com/sitemap.xml';

    $lines = [
        'User-agent: *',
        'Disallow:',
        'Sitemap: ' . $sitemapUrl,
    ];
    return response(implode("\n", $lines), 200, [
        'Content-Type' => 'text/plain; charset=UTF-8',
        'Cache-Control' => 'public, max-age=86400',
    ]);
})->name('robots');

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/from-the-vault', [HomeController::class, 'fromTheVault'])->name('from-the-vault');

Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [BlogController::class, 'show'])->name('blog.show');
// google auth 


Route::middleware('web')->group(function () {
    Route::get('/auth/google', [GoogleController::class, 'redirect'])->name('google.redirect');
    Route::get('/auth/google/callback', [GoogleController::class, 'callback']);
});


Route::middleware('auth')->group(function () {
    Route::post('/subscribe/{package}', [SubscriptionController::class, 'subscribe'])->name('subscribe');
    Route::post('/subscription/renew', [SubscriptionController::class, 'renew'])->name('subscription.renew');
    Route::post('/subscription/{id}/toggle-renewal', [SubscriptionController::class, 'toggleRenewal'])->name('subscription.toggle-renewal');
    Route::get('/subscription-success', [SubscriptionController::class, 'success'])->name('subscription.success');
});

// Route::get('/auth/facebook/redirect', [FacebookController::class, 'redirect'])->name('facebook.redirect');
// Route::get('/auth/facebook/callback', [FacebookController::class, 'callback'])->name('facebook.callback');


// Guest login route
Route::get('/guest-login', [GuestAuthController::class, 'guestLogin'])->name('guest.login');

// Logout and register route for guest users
Route::get('/logout-and-register', [GuestAuthController::class, 'logoutAndRegister'])->name('guest.logout.register');


// Stories routes
Route::get('/stories', [StoriesController::class, 'index'])->name('stories.index');
Route::get('/{category_slug}-stories', [StoriesController::class, 'index'])
    ->name('stories.category')
    ->where('category_slug', '[a-z0-9\-]+');
Route::get('/stories/{story}', [StoriesController::class, 'show'])->name('stories.show');
Route::get('/stories/{story}/read', [StoriesController::class, 'read'])->name('stories.read');
Route::middleware('auth')->group(function () {
    Route::get('/create-story', [StoriesController::class, 'createStory'])->name('stories.create');
    Route::post('/create-story', [StoriesController::class, 'storeStory'])->name('stories.store');
});


// Community routes
Route::middleware('auth')->group(function () {
    Route::get('/community', [CommunityController::class, 'index'])->name('community.index');
    Route::get('/community/{story}', [CommunityController::class, 'show'])->name('community.show');
});

// Protected community routes requiring subscription
Route::middleware(['auth', 'subscription'])->group(function () {
    Route::post('/community/store', [StoriesController::class, 'storeCommunity'])->name('community.store');
});

// Packages route - accessible without login
Route::get('/packages', function () {
    $packages = \App\Models\Package::where('is_active', true)->get();
    return Inertia::render('Packages', ['packages' => $packages]);
})->name('packages');

// Comments routes
Route::get('/stories/{story}/comments', [CommentsController::class, 'getComments'])->name('comments.get');
Route::middleware('auth')->group(function () {
    Route::post('/stories/{story}/comments', [CommentsController::class, 'store'])->name('comments.store');
    Route::put('/comments/{comment}', [CommentsController::class, 'update'])->name('comments.update')->whereNumber('comment');
    Route::delete('/comments/{comment}', [CommentsController::class, 'destroy'])->name('comments.destroy')->whereNumber('comment');
});

// Likes routes
Route::get('/stories/{story}/likes', [StoryLikesController::class, 'checkLikeStatus'])->name('likes.check');
Route::middleware('auth')->group(function () {
    Route::post('/stories/{story}/likes', [StoryLikesController::class, 'toggleLike'])->name('likes.toggle');
});

// Ratings routes
Route::get('/stories/{story}/rating', [StoryRatingsController::class, 'getRating'])->name('ratings.get');
Route::middleware('auth')->group(function () {
    Route::post('/stories/{story}/rating', [StoryRatingsController::class, 'store'])->name('ratings.store');
});

// Drafts routes
Route::middleware('auth')->group(function () {
    Route::get('/drafts', [StoryDraftsController::class, 'index'])->name('drafts.index');
    Route::post('/drafts', [StoryDraftsController::class, 'store'])->name('drafts.store');
    Route::put('/drafts/{draft}', [StoryDraftsController::class, 'update'])->name('drafts.update');
    Route::delete('/drafts/{draft}', [StoryDraftsController::class, 'destroy'])->name('drafts.destroy');
    Route::get('/usage/data', [StoryDraftsController::class, 'getUsageData'])->name('usage.data');
});


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Route::get('/packages', [PackagesController::class, 'index'])->name('packages.index');
Route::middleware('auth')->group(function () {
    Route::get('/stories/publish/packages', [StoriesController::class, 'showPackages'])->name('stories.publish.packages');
    Route::post('/story/publish-request', [MainStoriesController::class, 'storePublishRequest'])->name('story.publish.request');
    Route::get('/publish-requests', [\App\Http\Controllers\User\PublishRequestController::class, 'index'])->name('user.publish-requests');
});

Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

Route::post('/stripe/payment-intent', [StripeController::class, 'createPaymentIntent']);

Route::middleware('auth')->group(function () {
    Route::post('/stripe/checkout', [StripeController::class, 'createCheckoutSession'])->name('stripe.checkout');
    Route::get('/stripe/success', [StripeController::class, 'success'])->name('stripe.success');
    Route::get('/stripe/cancel', [StripeController::class, 'cancel'])->name('stripe.cancel');
    Route::get('/stripe/publish-success', [StripeController::class, 'publishSuccess'])->name('stripe.publish.success');
    Route::get('/stripe/publish-cancel', [StripeController::class, 'publishCancel'])->name('stripe.publish.cancel');
});

Route::middleware(['auth', 'subscription'])->group(function () {
    Route::get('/stories/publish/form/{story}', [StoriesController::class, 'showPublishForm'])->name('stories.publish.form');
    Route::post('/story/store-draft-session', [StoriesController::class, 'storeDraftSession'])->name('story.draft.session');
});

// Admin Routes
Route::prefix('admin-dashboard')->name('admin-dashboard.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->middleware(['auth']);
    Route::resource('users', UserController::class);
    Route::resource('stories', \App\Http\Controllers\Admin\StoriesController::class);
    Route::resource('packages', AdminPackagesController::class);
    Route::resource('publish-packages', AdminPublishPackageController::class);
    Route::resource('subscriptions', AdminSubscriptionController::class)->only(['index', 'show']);
    Route::get('subscriptions/users/with', [AdminSubscriptionController::class, 'usersWithSubscriptions'])->name('subscriptions.users.with');
    Route::get('subscriptions/users/without', [AdminSubscriptionController::class, 'usersWithoutSubscriptions'])->name('subscriptions.users.without');
    Route::get('community/stories', [AdminStoriesController::class, 'communityStories'])->name('stories.community');


    Route::get('stories/pending', [\App\Http\Controllers\Admin\StoriesController::class, 'pending'])->name('stories.pending');
    Route::post('{story}/approve', [\App\Http\Controllers\Admin\StoriesController::class, 'approve'])->name('stories.approve');
    Route::post('{story}/reject', [\App\Http\Controllers\Admin\StoriesController::class, 'reject'])->name('stories.reject');
    Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::post('users/{user}/promote-to-admin', [UserController::class, 'promoteToAdmin'])->name('users.promote-to-admin');

    Route::get('publish-requests', [PublishRequestController::class, 'index'])->name('publish-requests');
    Route::patch('publish-requests/{publishRequest}/status', [PublishRequestController::class, 'updateStatus'])->name('admin.publish-requests.update-status');
    
    // Coupons routes
    Route::get('coupons', [\App\Http\Controllers\Admin\CouponController::class, 'index'])->name('coupons.index');
    Route::get('coupons/create', [\App\Http\Controllers\Admin\CouponController::class, 'create'])->name('coupons.create');
    Route::post('coupons', [\App\Http\Controllers\Admin\CouponController::class, 'store'])->name('coupons.store');
    Route::put('coupons/{coupon}', [\App\Http\Controllers\Admin\CouponController::class, 'update'])->name('coupons.update');
    Route::delete('coupons/{coupon}', [\App\Http\Controllers\Admin\CouponController::class, 'destroy'])->name('coupons.destroy');

    // Rating routes
    Route::resource('ratings', \App\Http\Controllers\Admin\AdminRatingController::class);

    // Category routes (story / SEO categories)
    Route::resource('categories', \App\Http\Controllers\Admin\CategoryController::class);

    Route::resource('blog-posts', BlogPostController::class);
    Route::resource('blog-categories', BlogCategoryController::class)->except(['show']);
    Route::resource('blog-tags', BlogTagController::class)->except(['show']);

});

Route::prefix('user-dashboard')->name('user-dashboard.')->middleware(['auth', 'user'])->group(function() {
    Route::get('/', [UserDashboardController::class, 'index'])->name('user.dashboard');
    Route::resource('stories', UserStoriesController::class);
    Route::put('stories/{story}/toggle-status', [UserStoriesController::class, 'toggleStatus'])->name('stories.toggle-status');
});


Route::get('/publish', function () {
    return Inertia::render('Publish');
})->name('publish');
Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::get('/custom-prompt-generator', function () {
    return Inertia::render('CustomPromptGenerator');
})->name('custom-prompt-generator');


Route::get('/terms-and-conditions', function () {
    return Inertia::render('Terms');
})->name('terms-and-conditions');

Route::get('/privacy-policy', function () {
    return Inertia::render('PrivacyPolicy');
})->name('privacy-policy');

Route::get('/community-guidelines', function () {
    return Inertia::render('CommunityGuideLines');
})->name('community-guidelines');

Route::get('/how-it-works', function () {
    return Inertia::render('HowItWorks');
})->name('how-it-works');

Route::get('/contests', function () {
    return Inertia::render('Contests');
})->name('contests');

Route::get('/create-contest', function () {
    return Inertia::render('Contests/CreateContest');
})->name('create-contest');

Route::get('/monthly-fiction-contest', function () {
    return Inertia::render('Contests/MonthlyFictionContest');
})->name('monthly-fiction-contest');

Route::get('/poetry-contest', function () {
    return Inertia::render('Contests/PoetryContest');
})->name('poetry-contest');

Route::get('/faqs', function () {
    return Inertia::render('Faqs');
})->name('faqs');

Route::post('/chatgpt/send', [ChatbotController::class, 'send']);
Route::post('/custom-prompt-generator/generate', [ChatbotController::class, 'generatePrompt'])->name('custom-prompt-generator.generate');

// new dashboard implementation
Route::get('/dashboard-new', function () {
    return Inertia::render('admin/DashboardNew');
})->name('dashboardNew');

// Wrong / unknown URLs → redirect to home instead of 404
Route::fallback(function () {
    return redirect()->route('home');
});

require __DIR__ . '/auth.php';
