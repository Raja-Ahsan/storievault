<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Inertia\Inertia;

class BlogController extends Controller
{
    public function index()
    {
        $posts = Post::query()
            ->with(['categories', 'tags', 'media'])
            ->publiclyVisible()
            ->orderByDesc('featured')
            ->orderByDesc('id')
            ->paginate(9);

        return Inertia::render('Blog/Index', [
            'posts' => $posts,
        ]);
    }

    public function show(string $slug)
    {
        $post = Post::query()
            ->with(['categories', 'tags', 'media'])
            ->where('slug', $slug)
            ->publiclyVisible()
            ->firstOrFail();

        return Inertia::render('Blog/Show', [
            'post' => $post,
        ]);
    }
}
