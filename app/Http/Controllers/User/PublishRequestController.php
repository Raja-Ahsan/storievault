<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\PublishRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PublishRequestController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        $publishRequests = PublishRequest::where('user_id', $user->id)
            ->with(['story' => function($query) {
                $query->select('id', 'title', 'user_id');
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('user/publish-requests/Index', [
            'publishRequests' => $publishRequests,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }
}
