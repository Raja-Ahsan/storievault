<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(Request $request)
    {
        $query = Category::query();

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $categories = $query->orderBy('name')->paginate(10);

        return Inertia::render('admin/categories/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search']),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create()
    {
        return Inertia::render('admin/categories/Create');
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'slug' => 'nullable|string|max:255|unique:categories,slug',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:512',
            'content' => 'nullable|string',
            'faqs' => 'nullable|array',
            'faqs.*.question' => 'nullable|string|max:500',
            'faqs.*.answer' => 'nullable|string|max:2000',
        ]);
        $validated['faqs'] = $this->sanitizeFaqs($request->input('faqs', []));

        try {
            $validated['slug'] = !empty($validated['slug'])
                ? \Illuminate\Support\Str::slug($validated['slug'])
                : \Illuminate\Support\Str::slug($validated['name']);
            $category = Category::create($validated);

            return redirect()->route('admin-dashboard.categories.index')
                ->with('success', 'Category created successfully!');
        } catch (\Exception $e) {
            Log::error('Error creating category: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create category. Please try again.');
        }
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(Category $category)
    {
        return Inertia::render('admin/categories/Edit', [
            'category' => $category,
        ]);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'slug' => 'nullable|string|max:255|unique:categories,slug,' . $category->id,
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:512',
            'content' => 'nullable|string',
            'faqs' => 'nullable|array',
            'faqs.*.question' => 'nullable|string|max:500',
            'faqs.*.answer' => 'nullable|string|max:2000',
        ]);
        $validated['faqs'] = $this->sanitizeFaqs($request->input('faqs', []));

        try {
            $validated['slug'] = !empty($validated['slug'])
                ? \Illuminate\Support\Str::slug($validated['slug'])
                : \Illuminate\Support\Str::slug($validated['name']);
            $category->update($validated);

            return redirect()->route('admin-dashboard.categories.index')
                ->with('success', 'Category updated successfully!');
        } catch (\Exception $e) {
            Log::error('Error updating category: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update category. Please try again.');
        }
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Category $category)
    {
        try {
            // Note: Currently stories table doesn't have category_id column
            // This check can be added later when category_id is added to stories table
            // $storiesCount = \App\Models\Story::where('category_id', $category->id)->count();
            // if ($storiesCount > 0) {
            //     return redirect()->back()
            //         ->with('error', "Cannot delete category '{$category->name}' because it is being used by {$storiesCount} stories.");
            // }

            $category->delete();

            return redirect()->route('admin-dashboard.categories.index')
                ->with('success', 'Category deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Error deleting category: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to delete category. Please try again.');
        }
    }

    /**
     * Keep only FAQ entries that have both question and answer.
     */
    private function sanitizeFaqs(array $faqs): array
    {
        return array_values(array_filter(array_map(function ($item) {
            $q = trim($item['question'] ?? '');
            $a = trim($item['answer'] ?? '');
            return ($q !== '' && $a !== '') ? ['question' => $q, 'answer' => $a] : null;
        }, $faqs)));
    }
}
