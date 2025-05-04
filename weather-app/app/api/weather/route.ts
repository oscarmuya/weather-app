import { NextResponse } from "next/server";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const GEO_URL = "https://api.openweathermap.org/geo/1.0";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const units = searchParams.get("units") || "metric";

  if (!city) {
    return NextResponse.json(
      {
        message: "Validation failed",
        errors: { city: ["City parameter is required"] },
      },
      { status: 422 }
    );
  }

  if (units && !["metric", "imperial"].includes(units)) {
    return NextResponse.json(
      {
        message: "Validation failed",
        errors: { units: ["Units must be either metric or imperial"] },
      },
      { status: 422 }
    );
  }

  console.log("Fetching weather data for city:", city, "with units:", units);

  try {
    // Step 1: Get geo coordinates (latitude, longitude) for the city
    const geoResponse = await fetch(
      `${GEO_URL}/direct?q=${encodeURIComponent(
        city
      )}&limit=1&appid=${OPENWEATHER_API_KEY}`
    );

    const res = await geoResponse.json();
    if (!geoResponse.ok || res.length === 0) {
      return NextResponse.json({ message: "City not found" }, { status: 404 });
    }

    const geoData = res[0];
    const lat = geoData.lat;
    const lon = geoData.lon;
    const cityName = geoData.name;
    const country = geoData.country;

    // Step 2: Get weather data using coordinates
    const weatherResponse = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${OPENWEATHER_API_KEY}`
    );

    if (!weatherResponse.ok) {
      return NextResponse.json(
        { message: "Failed to retrieve weather data" },
        { status: 500 }
      );
    }

    const weatherData = await weatherResponse.json();

    // Format response data
    const responseData = {
      current: weatherData,
      city: cityName,
    };

    // Return the successful response data
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json(
      {
        message:
          "An error occurred: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
