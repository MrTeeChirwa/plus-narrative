import { WeatherData, ForecastData } from './types';

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

function validateApiKey() {
  if (!API_KEY) {
    throw new Error('OpenWeather API key is not configured. Please check your environment variables.');
  }
}

export async function getCurrentWeather(city: string): Promise<WeatherData> {
  validateApiKey();
  
  if (!city.trim()) {
    throw new Error('Please enter a city name');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your configuration.');
      }
      if (response.status === 404) {
        throw new Error(`City "${city}" not found. Please check the spelling and try again.`);
      }
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to fetch weather data. Please try again.');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch weather data: ${error.message || 'Unknown error'}`);
  }
}

export async function getHourlyForecast(city: string): Promise<ForecastData> {
  validateApiKey();
  
  if (!city.trim()) {
    throw new Error('Please enter a city name');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your configuration.');
      }
      if (response.status === 404) {
        throw new Error(`City "${city}" not found. Please check the spelling and try again.`);
      }
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to fetch forecast data. Please try again.');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch forecast data: ${error.message || 'Unknown error'}`);
  }
}

export function getWeatherIcon(code: string): string {
  const iconMap: { [key: string]: string } = {
    '01d': 'sun',
    '01n': 'moon',
    '02d': 'cloud-sun',
    '02n': 'cloud-moon',
    '03d': 'cloud',
    '03n': 'cloud',
    '04d': 'cloud',
    '04n': 'cloud',
    '09d': 'cloud-drizzle',
    '09n': 'cloud-drizzle',
    '10d': 'cloud-rain',
    '10n': 'cloud-rain',
    '11d': 'cloud-lightning',
    '11n': 'cloud-lightning',
    '13d': 'cloud-snow',
    '13n': 'cloud-snow',
    '50d': 'cloud-fog',
    '50n': 'cloud-fog',
  };
  return iconMap[code] || 'cloud';
}

export function getDailyForecastFromHourly(forecast: ForecastData) {
  const dailyForecasts = new Map();
  
  forecast.list.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!dailyForecasts.has(date)) {
      dailyForecasts.set(date, item);
    }
  });

  return Array.from(dailyForecasts.values());
}