"use client";

import { useState, useEffect, memo } from "react";
import { Sun, Cloud, CloudRain, CloudLightning, Cloudy } from "lucide-react";
import { motion } from "framer-motion";

const WeatherWidget = memo(() => {
  const [data, setData] = useState({
    temp: "--",
    icon: "Clear",
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        if (!API_KEY) return;

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=7.88&lon=98.39&units=metric&appid=${API_KEY}`,
        );
        const weatherData = await res.json();

        if (weatherData.main) {
          setData({
            temp: Math.round(weatherData.main.temp).toString(),
            icon: weatherData.weather[0].main,
          });
        }
      } catch (e) {
        console.error("Weather error:", e);
      }
    };

    fetchWeather();
    const weatherTimer = setInterval(fetchWeather, 600000);

    return () => clearInterval(weatherTimer);
  }, []);

  const WeatherIcon = () => {
    const iconClass = "w-4 h-4 text-brand-lime";
    switch (data.icon) {
      case "Clear":
        return <Sun className={iconClass} />;
      case "Rain":
        return <CloudRain className={iconClass} />;
      case "Clouds":
        return <Cloudy className={iconClass} />;
      case "Thunderstorm":
        return <CloudLightning className={iconClass} />;
      default:
        return <Cloud className={iconClass} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.5,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.15em] text-brand-white/80"
    >
      <span className="hidden sm:inline drop-shadow-xs/50">
        PHUKET, THAILAND
      </span>
      <span className="sm:hidden drop-shadow-xs/50">PHUKET</span>

      <div className="flex items-center gap-1.5 ml-1 bg-brand-lime/10 px-2.5 py-1 rounded-full border border-brand-lime/10">
        <WeatherIcon />
        <span className="text-brand-lime font-mono tabular-nums">
          {data.temp}°C
        </span>
      </div>
    </motion.div>
  );
});

WeatherWidget.displayName = "WeatherWidget";

export default WeatherWidget;
