<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SessionMember extends Model
{
    protected $table = 'session_members';
    protected $keyType = 'string';
    public $incrementing = false;
    
    // No updated_at in session_members table according to schema
    const UPDATED_AT = null;
    
    // In schema joined_at is used instead of created_at
    const CREATED_AT = 'joined_at';

    protected $fillable = [
        'id', 'session_id', 'member_type', 'user_id', 'persona_id', 'model_id', 'role'
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

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function persona()
    {
        return $this->belongsTo(Persona::class, 'persona_id');
    }
}
