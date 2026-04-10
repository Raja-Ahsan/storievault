<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogCategory::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        $categories = $query->orderBy('name')->paginate(15)->withQueryString();

        return Inertia::render('admin/blog-categories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search']),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/blog-categories/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:blog_categories,name',
        ]);

        BlogCategory::create($validated);

        return redirect()->route('admin-dashboard.blog-categories.index')
            ->with('success', 'Blog category created.');
    }

    public function edit(BlogCategory $blog_category)
    {
        return Inertia::render('admin/blog-categories/Edit', [
            'category' => $blog_category,
        ]);
    }

    public function update(Request $request, BlogCategory $blog_category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:blog_categories,name,'.$blog_category->id,
        ]);

        $blog_category->update($validated);

        return redirect()->route('admin-dashboard.blog-categories.index')
            ->with('success', 'Blog category updated.');
    }

    public function destroy(BlogCategory $blog_category)
    {
        if ($blog_category->posts()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete a category that is assigned to posts.');
        }

        $blog_category->delete();

        return redirect()->route('admin-dashboard.blog-categories.index')
            ->with('success', 'Blog category deleted.');
    }
}
