import { NextResponse } from "next/server";

type WeatherResponse =
  | {
      current: {
        temp: number;
        humidity: number;
        wind_speed: number;
        weather: {
          description: string;
          icon: string;
        }[];
        dt: number;
      };
      daily: {
        dt: number;
        temp: {
          day: number;
        };
        weather: {
          description: string;
          icon: string;
        }[];
      }[];
      city: string;
    }
  | { error: string };

const LARAVEL_API_URL =
  process.env.LARAVEL_API_URL || "http://localhost:8000/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  const units = searchParams.get("units") || "metric";

  if (!city) {
    return NextResponse.json(
      { error: "City parameter is required" },
      { status: 400 }
    );
  }

  console.log("fetching weather data for city:", city, "with units:", units);

  try {
    const response = await fetch(
      `${LARAVEL_API_URL}/weather?city=${encodeURIComponent(
        city as string
      )}&units=${units}`
    );

    const r = response.status;
    console.log("Response from Laravel API:", r);

    if (!response.ok) {
      const responseData = await response.text();
      // Return the error from the backend with the correct status code
      return NextResponse.json(
        {
          error: responseData || "Error fetching weather data",
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();

    // Return the successful response data
    return NextResponse.json(
      { data: responseData as WeatherResponse },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching weather data from Laravel backend:", error);
    // Return an internal server error response
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
