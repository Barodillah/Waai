<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle(Request $request)
    {
        // Detect if request comes from local frontend
        $referer = $request->header('referer', '');
        $origin = $request->query('origin', '');
        
        $isLocal = strpos($referer, 'localhost') !== false || strpos($referer, '127.0.0.1') !== false || $origin === 'local';
        $state = $isLocal ? 'local' : 'prod';

        return Socialite::driver('google')->stateless()->with(['state' => $state])->redirect();
    }

    /**
     * Obtain the user information from Google.
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            // Check if user exists in the database
            $user = DB::table('users')->where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // Register new user
                $userId = (string) Str::uuid();
                DB::table('users')->insert([
                    'id' => $userId,
                    'google_id' => $googleUser->getId(),
                    'email' => $googleUser->getEmail(),
                    'name' => $googleUser->getName(),
                    'avatar_url' => $googleUser->getAvatar(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                $user = DB::table('users')->where('id', $userId)->first();
            } else {
                // Update existing user's google_id and avatar if needed
                DB::table('users')->where('id', $user->id)->update([
                    'google_id' => $googleUser->getId(),
                    'avatar_url' => $googleUser->getAvatar(),
                    'updated_at' => now(),
                ]);
            }

            // Generate Sanctum token using Eloquent User
            $eloquentUser = \App\Models\User::where('email', $user->email)->first();
            
            if (!$eloquentUser) {
                 $eloquentUser = \App\Models\User::create([
                     'id' => $user->id,
                     'name' => $user->name,
                     'email' => $user->email,
                     'password' => bcrypt(Str::random(16)),
                 ]);
            }

            $token = $eloquentUser->createToken('auth_token')->plainTextToken;

            // Redirect back to frontend with the token
            $state = $request->input('state');
            if ($state === 'local') {
                $frontendUrl = env('FRONTEND_URL_LOCAL', 'http://localhost:5173');
            } else {
                $frontendUrl = env('FRONTEND_URL_PROD', 'https://wai.bewhy.id');
            }
            
            return redirect()->to($frontendUrl . '/auth/callback?token=' . $token);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Authentication failed: ' . $e->getMessage()], 500);
        }
    }
}
