<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WorldController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['cors'])->group(function () {
    Route::post('create', [WorldController::class, 'store']);
    Route::get('load', [WorldController::class, 'load']);
    Route::delete('worlds/{worldId}/delete', [WorldController::class, 'delete']);
    Route::get('worlds/{worldId}', [WorldController::class, 'view']);
    Route::put('worlds/{worldId}', [WorldController::class, 'edit']);
});