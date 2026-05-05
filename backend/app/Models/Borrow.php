<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Borrow extends Model
{
    use HasFactory;

    protected $fillable = [
        'borrow_code',
        'user_id',
        'item_code',
        'quantity',
        'borrow_date',
        'return_date_plan',
        'return_date_actual',
        'status',
        'purpose',
        'admin_notes',
        'approved_by',
    ];

    protected $casts = [
        'borrow_date'        => 'date',
        'return_date_plan'   => 'date',
        'return_date_actual' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class, 'item_code', 'item_code');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
