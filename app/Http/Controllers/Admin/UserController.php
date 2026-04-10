<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index()
    {
        // Clean up old guest users (older than 24 hours)
        $this->cleanupOldGuestUsers();
        
        // Get regular users (non-guest) for admin panel with subscription data
        $query = User::where('is_guest', false)->with(['subscription.package']);
        
        // Add search functionality
        if (request()->has('search') && !empty(request('search'))) {
            $searchTerm = request('search');
            $query->where(function($q) use ($searchTerm) {
                $q->where('username', 'like', "%{$searchTerm}%")
                  ->orWhere('full_name', 'like', "%{$searchTerm}%")
                  ->orWhere('name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%");
            });
        }
        
        $users = $query->latest()->paginate(10);

        // Get guest users count for admin info
        $guestUsersCount = User::where('is_guest', true)->count();

        return Inertia::render('admin/users/UserIndex', [
            'users' => $users,
            'guestUsersCount' => $guestUsersCount,
        ]);
    }

    /**
     * Clean up old guest users (older than 24 hours)
     */
    private function cleanupOldGuestUsers()
    {
        // Delete guest users older than 24 hours
        User::where('is_guest', true)
            ->where('created_at', '<', now()->subHours(24))
            ->delete();
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        return Inertia::render('admin/users/Create');
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users|regex:/^[a-zA-Z0-9_]+$/',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:user,admin',
        ], [
            'username.regex' => 'Username can only contain letters, numbers, and underscores.',
            'username.unique' => 'This username is already taken. Please choose another one.',
        ]);

        $user = User::create([
            'name' => $validated['full_name'], // Keep name for backward compatibility
            'full_name' => $validated['full_name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'is_admin' => $validated['role'] === 'admin' ? 1 : 0,
            'is_guest' => false,
            'is_active' => true,
        ]);

        return redirect()->route('admin-dashboard.users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        $user->load(['subscription.package']);
        
        return Inertia::render('admin/users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        return Inertia::render('admin/users/Edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'username' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z0-9_]+$/', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
        ], [
            'username.regex' => 'Username can only contain letters, numbers, and underscores.',
            'username.unique' => 'This username is already taken. Please choose another one.',
        ]);

        $userData = [
            'name' => $validated['full_name'], // Keep name for backward compatibility
            'full_name' => $validated['full_name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
        ];

        if (!empty($validated['password'])) {
            $userData['password'] = Hash::make($validated['password']);
        }

        $user->update($userData);

        return redirect()->route('admin-dashboard.users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('admin-dashboard.users.index')
            ->with('success', 'User deleted successfully.');
    }


    public function toggleStatus(User $user)
    {
        $user->is_active = !$user->is_active;
        $user->save();

        return redirect()->back()->with('success', 'User status updated.');
    }

    /**
     * Toggle user admin role (promote to admin or demote to user).
     */
    public function promoteToAdmin(Request $request, User $user)
    {
        // Prevent modifying the current admin user
        if ($request->user()->id === $user->id) {
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'error' => 'You cannot change your own admin status.'], 400);
            }
            return redirect()->back()->with('error', 'You cannot change your own admin status.');
        }

        // Toggle the role: if admin, make user; if user, make admin
        $newRole = $user->role === 'admin' ? 'user' : 'admin';
        $newIsAdmin = $newRole === 'admin' ? 1 : 0;
        $action = $newRole === 'admin' ? 'promoted to admin' : 'demoted to user';
        
        $user->update([
            'role' => $newRole,
            'is_admin' => $newIsAdmin
        ]);

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => "User has been {$action} successfully."]);
        }

        return redirect()->back()->with('success', "User has been {$action} successfully.");
    }
}
