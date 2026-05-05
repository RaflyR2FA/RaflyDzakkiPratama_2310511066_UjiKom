<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users',
            'password'              => 'required|min:8|confirmed',
            'role'                  => 'required|in:staff,moderator,admin',
            'department'            => 'nullable|string|max:100',
        ]);

        $user = User::create([
            'name'       => $validated['name'],
            'email'      => $validated['email'],
            'password'   => Hash::make($validated['password']),
            'role'       => $validated['role'],
            'department' => $validated['department'] ?? null,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        ActivityLog::create([
            'user_id'    => $user->id,
            'action'     => 'User Registered',
            'model_type' => 'User',
            'model_id'   => $user->id,
            'new_data'   => ['name' => $user->name, 'role' => $user->role],
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['user' => $user, 'token' => $token], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        ActivityLog::create([
            'user_id'    => $user->id,
            'action'     => 'User Login',
            'model_type' => 'User',
            'model_id'   => $user->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['user' => $user, 'token' => $token]);
    }

    public function logout(Request $request)
    {
        ActivityLog::create([
            'user_id'    => $request->user()->id,
            'action'     => 'User Logout',
            'model_type' => 'User',
            'model_id'   => $request->user()->id,
            'ip_address' => $request->ip(),
        ]);

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Berhasil logout']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
