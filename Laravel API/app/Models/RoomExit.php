<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomExit extends Model
{
    // Table name
    protected $table = 'exits';
    // Primary key
    public $primaryKey = 'id';
    // Timestamps
    public $timestamps = false;
}
