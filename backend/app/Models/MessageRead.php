<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class MessageRead extends Model
{
    protected $table = 'message_reads';
    protected $keyType = 'string';
    public $incrementing = false;
    
    // No updated_at/created_at in message_reads table (it uses read_at)
    public $timestamps = false;

    protected $fillable = [
        'id', 'message_id', 'user_id', 'read_at'
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
            if (empty($model->read_at)) {
                $model->read_at = $model->freshTimestamp();
            }
        });
    }

    public function message()
    {
        return $this->belongsTo(Message::class, 'message_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
