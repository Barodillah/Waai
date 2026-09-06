<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PersonaController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\UserMemoryController;

// Get current user profile
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Update user profile name
Route::middleware('auth:sanctum')->put('/user', function (Request $request) {
    $request->validate([
        'name' => 'required|string|max:255',
    ]);
    
    $user = $request->user();
    $user->name = $request->name;
    $user->save();
    
    return response()->json(['message' => 'Profile updated successfully', 'user' => $user]);
});

Route::middleware('auth:sanctum')->group(function () {
    // User Memories
    Route::get('/user/memories', [UserMemoryController::class, 'index']);
    Route::post('/user/memories', [UserMemoryController::class, 'store']);
    Route::delete('/user/memories/{id}', [UserMemoryController::class, 'destroy']);

    // Personas
    Route::get('/personas', [PersonaController::class, 'index']);
    Route::post('/personas', [PersonaController::class, 'store']);
    Route::put('/personas/{id}', [PersonaController::class, 'update']);
    Route::delete('/personas/{id}', [PersonaController::class, 'destroy']);

    // Sessions (Chats)
    Route::get('/sessions', [ChatController::class, 'getSessions']);
    Route::post('/sessions', [ChatController::class, 'createSession']);
    Route::put('/sessions/{id}', [ChatController::class, 'updateSession']);
    Route::put('/sessions/{id}/model', [ChatController::class, 'updateSessionModel']);
    Route::delete('/sessions/{id}', [ChatController::class, 'deleteSession']);

    // Messages
    Route::get('/sessions/{id}/messages', [ChatController::class, 'getMessages']);
    Route::post('/sessions/{id}/messages', [ChatController::class, 'saveMessage']);
    Route::delete('/sessions/{id}/messages/{messageId}', [ChatController::class, 'deleteMessage']);
    Route::post('/sessions/{id}/read', [ChatController::class, 'markAsRead']);
});
