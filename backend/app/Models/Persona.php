<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Persona extends Model
{
    protected $table = 'personas';
    protected $keyType = 'string';
    public $incrementing = false;
    
    protected $fillable = [
        'id', 'created_by', 'name', 'avatar_url', 'description', 
        'system_prompt', 'base_model', 'interest', 'tone', 'character_types', 'welcome_message', 'advanced_settings'
    ];

    protected $casts = [
        'advanced_settings' => 'array',
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
}
