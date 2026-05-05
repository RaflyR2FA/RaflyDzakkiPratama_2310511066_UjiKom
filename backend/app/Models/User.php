<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'department',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = ['password' => 'hashed'];

    public function borrows()
    {
        return $this->hasMany(Borrow::class);
    }

    public function items()
    {
        return $this->hasMany(Item::class, 'created_by');
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    // Role helpers
    public function isAdmin()      { return $this->role === 'admin'; }
    public function isModerator()  { return $this->role === 'moderator'; }
    public function isStaff()      { return $this->role === 'staff'; }
    public function canManage()    { return in_array($this->role, ['moderator', 'admin']); }
}
