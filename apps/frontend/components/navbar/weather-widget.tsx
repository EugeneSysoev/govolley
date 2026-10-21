"use client";

import { useState, useEffect, memo } from "react";
import { Sun, Cloud, CloudRain, CloudLightning, Cloudy } from "lucide-react";
import { motion } from "framer-motion";

const WeatherWidget = memo(() => {
  const [data, setData] = useState({
    temp: "--",
    icon: "Clear",
  });
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/weather');
        if (!res.ok) throw new Error('Weather unavailable');
        const weatherData = await res.json();
        if (active) {
          setData({ temp: String(weatherData.temp), icon: weatherData.icon });
          setUnavailable(false);
        }
      } catch {
        if (active) setUnavailable(true);
      }
    };

    fetchWeather();
    const weatherTimer = setInterval(fetchWeather, 600000);

    return () => { active = false; clearInterval(weatherTimer); };
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
        {!unavailable && <WeatherIcon />}
        <span className="text-brand-lime font-mono tabular-nums">
          {unavailable ? 'Погода недоступна' : `${data.temp}°C`}
        </span>
      </div>
    </motion.div>
  );
});

WeatherWidget.displayName = "WeatherWidget";

export default WeatherWidget;
