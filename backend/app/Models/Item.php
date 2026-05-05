<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Item extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'item_code',
        'item_name',
        'category',
        'description',
        'total_quantity',
        'available_quantity',
        'condition',
        'location',
        'photo',
        'purchase_price',
        'purchase_date',
        'created_by',
    ];

    protected $casts = [
        'purchase_date'  => 'date',
        'purchase_price' => 'decimal:2',
    ];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function borrows()
    {
        return $this->hasMany(Borrow::class, 'item_code', 'item_code');
    }

    public function getStatusAttribute(): string
    {
        if ($this->condition === 'damaged')      return 'damaged';
        if ($this->available_quantity === 0)     return 'fully_borrowed';
        return 'available';
    }
}
