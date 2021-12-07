<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    // Table name
    protected $table = 'rooms';
    // Primary key
    public $primaryKey = 'id';
    // Timestamps
    public $timestamps = true;
}
