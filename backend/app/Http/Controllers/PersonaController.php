<?php

namespace App\Http\Controllers;

use App\Models\Persona;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PersonaController extends Controller
{
    public function index(Request $request)
    {
        // Get personas created by the authenticated user
        $personas = Persona::where('created_by', $request->user()->id)->get();
        return response()->json($personas);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'avatar_url' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:255',
            'system_prompt' => 'required|string',
            'base_model' => 'nullable|string|max:255',
            'interest' => 'nullable|string|max:255',
            'tone' => 'nullable|string|max:255',
            'character_types' => 'nullable|string|max:255',
            'welcome_message' => 'nullable|string',
            'advanced_settings' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $persona = new Persona($request->all());
        $persona->created_by = $request->user()->id;
        $persona->save();

        return response()->json($persona, 201);
    }

    public function update(Request $request, $id)
    {
        $persona = Persona::where('id', $id)->where('created_by', $request->user()->id)->first();
        if (!$persona) {
            return response()->json(['message' => 'Persona not found or unauthorized'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'avatar_url' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:255',
            'system_prompt' => 'required|string',
            'base_model' => 'nullable|string|max:255',
            'interest' => 'nullable|string|max:255',
            'tone' => 'nullable|string|max:255',
            'character_types' => 'nullable|string|max:255',
            'welcome_message' => 'nullable|string',
            'advanced_settings' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $persona->update($request->all());

        return response()->json($persona);
    }

    public function destroy(Request $request, $id)
    {
        $persona = Persona::where('id', $id)->where('created_by', $request->user()->id)->first();
        if (!$persona) {
            return response()->json(['message' => 'Persona not found or unauthorized'], 404);
        }

        $persona->delete();
        return response()->json(['message' => 'Persona deleted successfully']);
    }
}
