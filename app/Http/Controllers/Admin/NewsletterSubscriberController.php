<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NewsletterSubscriberController extends Controller
{
    public function index(Request $request)
    {
        $query = NewsletterSubscriber::query()->latest();

        if ($request->filled('search')) {
            $query->where('email', 'like', '%' . $request->search . '%');
        }

        return Inertia::render('admin/newsletter/Index', [
            'subscribers' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only('search'),
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    public function destroy(NewsletterSubscriber $newsletter)
    {
        $newsletter->delete();

        return redirect()
            ->route('admin-dashboard.newsletter.index')
            ->with('success', 'Subscriber removed.');
    }
}
