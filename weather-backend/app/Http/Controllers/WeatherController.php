<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class WeatherController extends Controller
{
    protected string $apiKey;
    protected string $baseUrl = 'https://api.openweathermap.org/data/2.5';
    protected string $geoUrl = 'https://api.openweathermap.org/geo/1.0';

    public function __construct()
    {
        $this->apiKey = env('OPENWEATHER_API_KEY');
    }

    /**
     * Get weather for a city
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getWeather(Request $request): JsonResponse
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'city' => 'required|string|max:255',
            'units' => 'nullable|string|in:metric,imperial',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $city = $request->city;
        $units = $request->units ?? 'metric';

        
        
        // Cache key for this request
        $cacheKey = "weather_{$city}_{$units}";
        
        // Check cache first (cache for 30 minutes)
        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        try {
            // Step 1: Get geo coordinates (latitude, longitude) for the city
            $geoResponse = Http::get("{$this->geoUrl}/direct", [
                'q' => $city,
                'limit' => 1,
                'appid' => $this->apiKey,
            ]);

            if ($geoResponse->failed() || empty($geoResponse->json())) {
                return response()->json(['message' => 'City not found'], 404);
            }

            $geoData = $geoResponse->json()[0];
            $lat = $geoData['lat'];
            $lon = $geoData['lon'];
            $cityName = $geoData['name'];
            $country = $geoData['country'];

            // Step 2: Get weather data using coordinates
            $weatherResponse = Http::get("{$this->baseUrl}/forecast", [
                'lat' => $lat,
                'lon' => $lon,
                'exclude' => 'minutely,hourly,alerts',
                'units' => $units,
                'appid' => $this->apiKey,
            ]);

            if ($weatherResponse->failed()) {
                return response()->json(['message' => 'Failed to retrieve weather data'], 500);
            }

            $weatherData = $weatherResponse->json();
            
            // Format response data
            $responseData = [
                'current' => $weatherData,
                'city' => $cityName,
            ];

            // Cache the result
            Cache::put($cacheKey, $responseData, now()->addMinutes(30));

            return response()->json($responseData);
            
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred: ' . $e->getMessage()], 500);
        }
    }
}