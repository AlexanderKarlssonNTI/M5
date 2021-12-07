<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class World extends Model
{
    // Table name
    protected $table = 'worlds';
    // Primary key
    public $primaryKey = 'id';
    // Timestamps
    public $timestamps = true;
}
