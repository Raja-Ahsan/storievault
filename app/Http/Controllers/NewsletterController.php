<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $email = strtolower(trim($validated['email']));

        $existing = NewsletterSubscriber::where('email', $email)->first();
        if ($existing) {
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return back()->with('newsletter_success', 'You are already subscribed to our newsletter.');
            }

            return response()->json([
                'message' => 'You are already subscribed to our newsletter.',
            ]);
        }

        NewsletterSubscriber::create([
            'email' => $email,
            'ip_address' => $request->ip(),
        ]);

        if ($request->expectsJson() && ! $request->header('X-Inertia')) {
            return response()->json([
                'message' => 'Thanks for subscribing to our newsletter!',
            ]);
        }

        return back()->with('newsletter_success', 'Thanks for subscribing to our newsletter!');
    }
}
