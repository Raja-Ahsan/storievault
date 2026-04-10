<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PublishRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublishRequestController extends Controller
{
    public function index()
    {
        $publishRequests = PublishRequest::with(['user' => function($query) {
            $query->select('id', 'name', 'username', 'email');
        }, 'story'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('admin/publish-requests/Index', [
            'publishRequests' => $publishRequests,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function updateStatus(Request $request, PublishRequest $publishRequest)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $publishRequest->update([
            'status' => $request->status,
        ]);

        return redirect()->back()->with('success', '');
    }
}
