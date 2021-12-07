<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorldsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('worlds', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('type');
            $table->unsignedInteger('room_amount');
            $table->timestamps();
        });
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->integer('exits');
            $table->boolval('enterable');
            $table->foreignId('world_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('worlds');
        Schema::dropIfExists('rooms');
    }
}
