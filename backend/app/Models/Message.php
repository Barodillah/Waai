<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Message extends Model
{
    protected $table = 'messages';
    protected $keyType = 'string';
    public $incrementing = false;
    
    // No updated_at in messages table
    const UPDATED_AT = null;

    protected $fillable = [
        'id', 'session_id', 'sender_type', 'sender_user_id', 
        'sender_persona_id', 'sender_model_id', 'text', 
        'reply_to_id', 'is_forwarded'
    ];

    protected $casts = [
        'is_forwarded' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function session()
    {
        return $this->belongsTo(Session::class, 'session_id');
    }

    public function userSender()
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }

    public function personaSender()
    {
        return $this->belongsTo(Persona::class, 'sender_persona_id');
    }

    public function replyTo()
    {
        return $this->belongsTo(Message::class, 'reply_to_id');
    }

    public function reads()
    {
        return $this->hasMany(MessageRead::class, 'message_id');
    }
}
