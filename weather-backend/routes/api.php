<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WeatherController;

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

// Weather API endpoint
Route::get('/weather', [WeatherController::class, 'getWeather']);

// Health check endpoint
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});