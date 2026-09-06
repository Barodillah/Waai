<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Session extends Model
{
    protected $table = 'sessions';
    protected $keyType = 'string';
    public $incrementing = false;
    
    protected $fillable = [
        'id', 'type', 'name', 'avatar_url', 'invite_code', 'created_by'
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

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members()
    {
        return $this->hasMany(SessionMember::class, 'session_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'session_id')->orderBy('created_at', 'asc');
    }
}
