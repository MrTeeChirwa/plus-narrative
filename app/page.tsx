"use client";

import { useState, useEffect } from "react";
import { Search, Cloud, Sun, Heart, MapPin, ChevronLeft, ChevronRight, Thermometer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { getCurrentWeather, getHourlyForecast, getWeatherIcon, getDailyForecastFromHourly } from "@/lib/weather";
import { convertTemp } from "@/lib/utils";
import { getFavorites, addFavorite, removeFavorite, isFavorite } from "@/lib/storage";
import type { WeatherData, ForecastData } from "@/lib/types";
import * as Icons from "lucide-react";

export default function Home() {
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [currentCity, setCurrentCity] = useState("Roodepoort");
  const [searchInput, setSearchInput] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState("Today");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { 
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);

    if (!initialized) {
      setFavorites(getFavorites());
      fetchWeatherData(currentCity);
      setInitialized(true);
    }

    return () => clearInterval(interval);
  }, [initialized, currentCity]);

  const fetchWeatherData = async (city: string) => {
    if (!city.trim()) return;
    
    try {
      setLoading(true);
      setError("");
      
      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeather(city),
        getHourlyForecast(city)
      ]);
      
      setWeather(weatherData);
      setForecast(forecastData);
      setError("");
    } catch (err: any) {
      console.error('Error fetching weather:', err);
      setError(err.message || "Failed to fetch weather data");
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCurrentCity(searchInput.trim());
      setSearchInput("");
      fetchWeatherData(searchInput.trim());
    }
  };

  const toggleFavorite = (city: string) => {
    if (isFavorite(city)) {
      removeFavorite(city);
    } else {
      addFavorite(city);
    }
    setFavorites(getFavorites());
  };

  const getWeatherIconComponent = (iconCode: string) => {
    const iconName = getWeatherIcon(iconCode);
    const IconComponent = (Icons as any)[iconName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')] || Cloud;
    return <IconComponent className="w-12 h-12 text-white" />;
  };

  const renderForecastContent = () => {
    if (!forecast) return null;

    switch (activeTab) {
      case "Today":
        return (
          <div className="forecast-grid">
            {forecast.list.slice(0, 7).map((item, index) => (
              <Card key={index} className="forecast-card">
                <p className="forecast-time">
                  {new Date(item.dt * 1000).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}
                </p>
                <div className="forecast-icon-container">
                  {item.weather[0] && getWeatherIconComponent(item.weather[0].icon)}
                </div>
                <p className="forecast-temp">
                  {Math.round(convertTemp(item.main.temp, unit))}°
                </p>
              </Card>
            ))}
          </div>
        );

      case "Tommorow":
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowData = forecast.list.filter(item => {
          const itemDate = new Date(item.dt * 1000);
          return itemDate.getDate() === tomorrow.getDate();
        });

        return (
          <div className="forecast-grid">
            {tomorrowData.map((item, index) => (
              <Card key={index} className="forecast-card">
                <p className="forecast-time">
                  {new Date(item.dt * 1000).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                  })}
                </p>
                <div className="forecast-icon-container">
                  {item.weather[0] && getWeatherIconComponent(item.weather[0].icon)}
                </div>
                <p className="forecast-temp">
                  {Math.round(convertTemp(item.main.temp, unit))}°
                </p>
              </Card>
            ))}
          </div>
        );

      case "Monthly Forecast":
        const dailyForecasts = getDailyForecastFromHourly(forecast);
        
        return (
          <div className="forecast-grid">
            {dailyForecasts.map((item, index) => (
              <Card key={index} className="forecast-card">
                <p className="forecast-time">
                  {new Date(item.dt * 1000).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                <div className="forecast-icon-container">
                  {item.weather[0] && getWeatherIconComponent(item.weather[0].icon)}
                </div>
                <p className="forecast-temp">
                  {Math.round(convertTemp(item.main.temp, unit))}°
                </p>
              </Card>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[#1E1E1E]">
      <div className="max-w-[1440px] mx-auto p-8">
        {/* Header */}
        <div className="header-container">
          <div className="header-top">
            <div className="logo-container">
              <div className="logo-left">
                <div className="relative">
                  <Sun className="w-10 h-10 text-yellow-400 absolute -left-1" />
                  <Cloud className="w-10 h-10 text-white ml-2" />
                </div>
                <div className="flex items-center gap-4">
                  <h1 className="logo-text">Weather<span className="relative">Me<span className="absolute right-0.5 top-12 text-lg text-white/60">{time}</span></span></h1>
                </div>
              </div>
              
              <div className="temp-toggle-container">
                <span className="temp-toggle-label">°C</span>
                <Switch
                  checked={unit === "F"}
                  onCheckedChange={(checked) => setUnit(checked ? "F" : "C")}
                  className="switch-root"
                />
                <span className="temp-toggle-label">°F</span>
              </div>
            </div>

            <div className="nav-container">
              {["Today", "Tommorow", "Monthly Forecast"].map((tab) => (
                <button
                  key={tab}
                  className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search location on enter..."
              className="search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>
        </div>

        {/* Weather Card */}
        {weather && (
          <div className="relative px-20">
            <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-emerald-500/20 p-4 rounded-2xl">
              <ChevronLeft className="w-8 h-8 text-emerald-500" />
            </button>

            <Card className="weather-card">
              <div className="flex justify-between items-start mb-16">
                <div>
                  <div className="flex items-center gap-4">
                    <h2 className="text-4xl text-white font-light">{weather.name}</h2>
                    <MapPin className="text-white w-4 h-4" />
                    <button 
                      onClick={() => toggleFavorite(weather.name)}
                      className="text-white hover:text-pink-500 transition-colors"
                    >
                      <Heart 
                        className={`w-4 h-4 ${isFavorite(weather.name) ? 'fill-pink-500 text-pink-500' : ''}`} 
                      />
                    </button>
                  </div>
                  <p className="text-white/80 mt-2 underline">
                    {new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      weekday: 'short'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-8">
                    <Thermometer className="w-20 h-20 text-white/80" />
                      <div className="text-8xl text-white font-light">
                      {Math.round(convertTemp(weather.main.temp, unit))}°{unit}
                      </div>
                  </div>
                  <div className="bg-white/10 p-6 rounded-2xl">
                    {weather.weather[0] && getWeatherIconComponent(weather.weather[0].icon)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-8">
                <div>
                  <p className="weather-info">Humidity</p>
                  <p className="weather-value">{weather.main.humidity}%</p>
                </div>
                <div>
                  <p className="weather-info">Visibility</p>
                  <p className="weather-value">{(weather.visibility / 1000).toFixed(1)}km</p>
                </div>
                <div>
                  <p className="weather-info">Air Pressure</p>
                  <p className="weather-value">{weather.main.pressure}hPa</p>
                </div>
                <div>
                  <p className="weather-info">Wind</p>
                  <p className="weather-value">{Math.round(weather.wind.speed)}mph</p>
                </div>
              </div>
            </Card>

            <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-emerald-500/20 p-4 rounded-2xl">
              <ChevronRight className="w-8 h-8 text-emerald-500" />
            </button>
          </div>
        )}

        {/* Forecast Content */}
        {renderForecastContent()}

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-center mt-4">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}