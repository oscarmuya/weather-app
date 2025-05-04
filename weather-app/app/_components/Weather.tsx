"use client";

import Head from "next/head";
import { useState, FormEvent, useEffect } from "react";
import { LocationEdit, Search } from "lucide-react";
import { fetchThumbnail, formatDate } from "../_helpers/helpers";
import Image from "next/image";
import { WeatherData } from "@/types/weather";
import { Skeleton } from "@mui/material";

const getWindDirection = (deg: number): string => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round((deg % 360) / 45) % 8];
};

export default function Weather(): React.JSX.Element {
  const [fetchedCity, setFetchedCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherData[]>([]);
  const [thumbnail, setThumbnail] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("Paris");
  const [error, setError] = useState("");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(`Searching for: ${searchQuery}`);
    fetchWeather();
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Fetch from our backend API
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(searchQuery)}&units=${unit}`
      );

      if (!response.ok) {
        throw new Error("City not found or server error");
      }

      const data = await response.json();
      const res = await fetchThumbnail(data.city);
      setFetchedCity(data.city);
      setThumbnail(res);

      const forecastList = data.current.list;
      setWeather(forecastList[0]);
      setForecast([forecastList[8], forecastList[16], forecastList[24]]);
    } catch (error) {
      setError("Failed to fetch weather data. Please try again.");
      console.error("Error fetching weather:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    const next = unit === "metric" ? "imperial" : "metric";
    setUnit(next);
  };

  return (
    <>
      <Head>
        <title>Weather Dashboard</title>
        <meta name="description" content="Weather Dashboard App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-4xl md:min-w-4xl flex gap-3 mx-auto h-[80vh] overflow-hidden bg-white rounded-lg shadow-md">
          <div className="relative h-full flex-[0.3] overflow-hidden">
            {loading || !weather ? (
              <Skeleton
                width="100%"
                height="100%"
                className="h-full w-full"
                variant="rectangular"
              />
            ) : (
              <>
                <Image
                  src={thumbnail}
                  alt=""
                  fill
                  className="object-cover"
                  priority
                />
                <div
                  className="relative justify-between z-10 flex flex-col h-full w-full items-center text-center p-4
                  bg-black/30 backdrop-blur-xs
                  text-gray-200"
                >
                  <div className="flex flex-col items-center gap-1">
                    <WeatherIcon day={weather} />
                    <div className="text-4xl font-bold my-2">
                      {weather.main.temp}
                      {unit === "imperial" ? "°F" : "°C"}
                    </div>
                    <div className="text-lg mb-2">
                      {weather.weather[0].description}
                    </div>
                  </div>

                  <div className="flex text-base font-bold flex-col items-center justify-end">
                    <div className="">{formatDate(weather.dt)}</div>
                    <div className="">{fetchedCity}</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex-[0.7] flex flex-col justify-between p-6">
            <div className="flex w-full gap-2 items-center">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex w-full gap-2">
                <div className="relative">
                  <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center">
                    <LocationEdit size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search city..."
                    className="flex-grow w-auto px-4 pl-10 bg-transparent py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="flex cursor-pointer items-center aspect-square justify-center h-10 w-10 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                >
                  <Search size={20} />
                </button>
              </form>

              <div className="relative rounded-full bg-gray-200 select-none inline-block">
                <input
                  type="checkbox"
                  id="unit-toggle"
                  className="sr-only peer"
                  checked={unit === "imperial"}
                  onChange={toggle}
                />

                <div className="pointer-events-none z-0 absolute top-1 left-1 w-10 h-8 bg-white rounded-full shadow transform transition-transform peer-checked:translate-x-10" />
                <label
                  htmlFor="unit-toggle"
                  className="flex font-semibold top-0 left-0 z-10 items-center justify-between w-22 h-10 bg-transparent  rounded-full p-1 cursor-pointer transition-colors"
                >
                  <span className="relative z-10 w-[45%] text-center text-xs text-black/70">
                    °C
                  </span>
                  <span className="relative z-10 w-[45%] text-center text-xs text-black/70">
                    °F
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-col w-full">
              {/* forecast */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                {loading || !weather
                  ? [1, 2, 3].map((index) => (
                      <div key={index} className="h-[180px]">
                        <Skeleton
                          variant="rectangular"
                          height="100%"
                          width="100%"
                          className="rounded-lg"
                        />
                      </div>
                    ))
                  : forecast.map((day, index) => (
                      <div
                        key={index}
                        className="p-4 border flex flex-col items-center border-gray-200 rounded-lg"
                      >
                        <h3 className="text-sm mb-2">{formatDate(day.dt)}</h3>
                        <WeatherIcon day={day} />

                        <div className="text-sm">
                          {day.main.temp_min}{" "}
                          {unit === "imperial" ? "°F" : "°C"}
                        </div>
                      </div>
                    ))}
              </div>
              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {loading || !weather ? (
                  [1, 2].map((index) => (
                    <div key={index} className="h-[140px]">
                      <Skeleton
                        variant="rectangular"
                        height="100%"
                        width="100%"
                        className="rounded-lg"
                      />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="text-lg mb-2">Wind Status</h3>
                      <div className="text-3xl font-bold mb-1">
                        {weather.wind.speed} km/h
                      </div>
                      <div className="text-sm">
                        Direction: {getWindDirection(weather.wind.deg)}
                      </div>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="text-lg mb-2">Humidity</h3>
                      <div className="text-3xl font-bold mb-2">
                        {weather.main.humidity}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gray-400 h-2.5 rounded-full"
                          style={{ width: `${weather.main.humidity}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

const WeatherIcon = ({ day }: { day: WeatherData }): React.JSX.Element => {
  return (
    <div>
      <Image
        src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@4x.png`}
        alt={day.weather[0].description}
        width={150}
        height={150}
        className="w-32 h-32"
      />
    </div>
  );
};
