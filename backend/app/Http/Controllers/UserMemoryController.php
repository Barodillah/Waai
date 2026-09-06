<?php

namespace App\Http\Controllers;

use App\Models\UserMemory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserMemoryController extends Controller
{
    public function index(Request $request)
    {
        $memories = UserMemory::where('user_id', $request->user()->id)->get();
        return response()->json($memories);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'memories' => 'required|array',
            'memories.*.parameter' => 'required|string|max:255',
            'memories.*.value' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $userId = $request->user()->id;
        $savedMemories = [];

        foreach ($request->memories as $mem) {
            // Check if parameter already exists to update it, or create new
            $memory = UserMemory::updateOrCreate(
                ['user_id' => $userId, 'parameter' => $mem['parameter']],
                ['value' => $mem['value']]
            );
            $savedMemories[] = $memory;
        }

        return response()->json(['message' => 'Memories saved', 'memories' => $savedMemories], 201);
    }

    public function destroy(Request $request, $id)
    {
        $memory = UserMemory::where('id', $id)->where('user_id', $request->user()->id)->first();
        if (!$memory) {
            return response()->json(['message' => 'Memory not found'], 404);
        }
        $memory->delete();
        return response()->json(['message' => 'Memory deleted']);
    }
}
