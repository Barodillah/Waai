<?php

namespace App\Http\Controllers;

use App\Models\Session;
use App\Models\SessionMember;
use App\Models\Message;
use App\Models\MessageRead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    // Fetch all sessions for the authenticated user
    public function getSessions(Request $request)
    {
        $userId = $request->user()->id;

        // Get sessions where the user is a member
        $sessions = Session::whereHas('members', function ($query) use ($userId) {
            $query->where('member_type', 'user')->where('user_id', $userId);
        })
        ->withCount(['messages as unread_count' => function ($query) use ($userId) {
            $query->where(function($q) use ($userId) {
                $q->where('sender_type', '!=', 'user')
                  ->orWhere('sender_user_id', '!=', $userId);
            })->whereDoesntHave('reads', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            });
        }])
        ->with(['members' => function ($query) {
            $query->with(['persona', 'user']); // eager load details
        }])
        ->orderBy('updated_at', 'desc')
        ->get();

        return response()->json($sessions);
    }

    // Create a new session (1-on-1 or group)
    public function createSession(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:direct,group',
            'name' => 'nullable|string|max:255',
            'avatar_url' => 'nullable|string|max:255',
            'members' => 'required|array', // array of members to add
            'members.*.member_type' => 'required|in:user,persona,model',
            'members.*.user_id' => 'nullable|string',
            'members.*.persona_id' => 'nullable|string',
            'members.*.model_id' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $session = new Session();
            $session->type = $request->type;
            $session->name = $request->name;
            $session->avatar_url = $request->avatar_url;
            $session->created_by = $request->user()->id;
            $session->save();

            // Add the creator as an admin member
            SessionMember::create([
                'session_id' => $session->id,
                'member_type' => 'user',
                'user_id' => $request->user()->id,
                'role' => 'admin'
            ]);

            // Add other members
            foreach ($request->members as $memberData) {
                // Skip if it's the creator to avoid duplicate
                if ($memberData['member_type'] === 'user' && isset($memberData['user_id']) && $memberData['user_id'] === $request->user()->id) {
                    continue;
                }

                SessionMember::create([
                    'session_id' => $session->id,
                    'member_type' => $memberData['member_type'],
                    'user_id' => $memberData['user_id'] ?? null,
                    'persona_id' => $memberData['persona_id'] ?? null,
                    'model_id' => $memberData['model_id'] ?? null,
                    'role' => 'member'
                ]);
            }

            DB::commit();
            
            $session->load('members.persona', 'members.user');
            return response()->json($session, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create session: ' . $e->getMessage()], 500);
        }
    }

    // Update a session (e.g. name/title)
    public function updateSession(Request $request, $id)
    {
        $session = Session::where('id', $id)->where('created_by', $request->user()->id)->first();
        if (!$session) {
            return response()->json(['message' => 'Session not found or unauthorized'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'avatar_url' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $session->name = $request->name;
        if ($request->has('avatar_url')) {
            $session->avatar_url = $request->avatar_url;
        }
        $session->save();

        return response()->json($session);
    }

    public function updateSessionModel(Request $request, $id)
    {
        $session = Session::where('id', $id)->where('created_by', $request->user()->id)->first();
        if (!$session) {
            return response()->json(['message' => 'Session not found or unauthorized'], 404);
        }

        $validator = Validator::make($request->all(), [
            'persona_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $newPersonaId = $request->persona_id;
        $isModel = strpos($newPersonaId, '/') !== false;

        $aiMember = SessionMember::where('session_id', $id)
            ->where('member_type', '!=', 'user')
            ->first();

        if ($aiMember) {
            $aiMember->member_type = $isModel ? 'model' : 'persona';
            $aiMember->model_id = $isModel ? $newPersonaId : null;
            $aiMember->persona_id = $isModel ? null : $newPersonaId;
            $aiMember->save();
        }

        return response()->json(['message' => 'Model updated successfully']);
    }

    // Delete a session
    public function deleteSession(Request $request, $id)
    {
        $session = Session::where('id', $id)->where('created_by', $request->user()->id)->first();
        if (!$session) {
            return response()->json(['message' => 'Session not found or unauthorized'], 404);
        }

        $session->delete();
        return response()->json(['message' => 'Session deleted successfully']);
    }

    // Fetch messages for a session
    public function getMessages(Request $request, $sessionId)
    {
        // Verify user is part of the session
        $isMember = SessionMember::where('session_id', $sessionId)
            ->where('member_type', 'user')
            ->where('user_id', $request->user()->id)
            ->exists();

        if (!$isMember) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = Message::where('session_id', $sessionId)
            ->with(['userSender:id,name,avatar_url', 'personaSender:id,name,avatar_url', 'replyTo:id,sender_type,sender_user_id,sender_persona_id,sender_model_id,text', 'reads:message_id,user_id,read_at'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    // Save a message
    public function saveMessage(Request $request, $sessionId)
    {
        // Verify user is part of the session
        $isMember = SessionMember::where('session_id', $sessionId)
            ->where('member_type', 'user')
            ->where('user_id', $request->user()->id)
            ->exists();

        if (!$isMember) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'sender_type' => 'required|in:user,persona,model,system',
            'sender_user_id' => 'nullable|string',
            'sender_persona_id' => 'nullable|string',
            'sender_model_id' => 'nullable|string',
            'text' => 'required|string',
            'reply_to_id' => 'nullable|string',
            'is_forwarded' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $message = new Message($request->all());
        $message->session_id = $sessionId;
        $message->save();
        
        // Update session's updated_at timestamp
        Session::where('id', $sessionId)->update(['updated_at' => now()]);

        return response()->json($message, 201);
    }
    public function deleteMessage(Request $request, $sessionId, $messageId)
    {
        $session = Session::where('id', $sessionId)->whereHas('members', function ($query) use ($request) {
            $query->where('member_type', 'user')->where('user_id', $request->user()->id);
        })->first();

        if (!$session) {
            return response()->json(['message' => 'Session not found or unauthorized'], 404);
        }

        $message = Message::where('id', $messageId)->where('session_id', $sessionId)->first();
        if (!$message) {
            return response()->json(['message' => 'Message not found'], 404);
        }

        $message->delete();
        return response()->json(['message' => 'Message deleted']);
    }

    public function markAsRead(Request $request, $sessionId)
    {
        $userId = $request->user()->id;

        // Verify user is part of the session
        $isMember = SessionMember::where('session_id', $sessionId)
            ->where('member_type', 'user')
            ->where('user_id', $userId)
            ->exists();

        if (!$isMember) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'message_ids' => 'required|array',
            'message_ids.*' => 'string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $now = now();
        $insertData = [];

        // Check which ones are already read to avoid duplicate key errors
        $existingReads = MessageRead::where('user_id', $userId)
            ->whereIn('message_id', $request->message_ids)
            ->pluck('message_id')
            ->toArray();

        foreach ($request->message_ids as $msgId) {
            if (!in_array($msgId, $existingReads)) {
                $insertData[] = [
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'message_id' => $msgId,
                    'user_id' => $userId,
                    'read_at' => $now
                ];
            }
        }

        if (!empty($insertData)) {
            MessageRead::insert($insertData);
        }

        return response()->json(['message' => 'Messages marked as read']);
    }
}
