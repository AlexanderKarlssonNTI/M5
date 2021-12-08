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
            $table->unsignedInteger('room_total_amount');
            $table->unsignedInteger('room_row_amount');
            $table->unsignedInteger('room_branch_factor');
            $table->timestamps();
        });

        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->boolean('enterable');
            $table->foreignId('world_id');
        });

        Schema::create('exits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id');
            $table->foreignId('has_exit_to_room_id');
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
        Schema::dropIfExists('exits');
    }
}
