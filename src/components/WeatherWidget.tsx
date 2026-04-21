import React from 'react';
import { motion } from 'motion/react';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, Wind, Droplets, MapPin } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface WeatherWidgetProps {
  weather: { 
    temp: number, 
    condition: string, 
    location: string, 
    humidity?: number, 
    windSpeed?: number,
    forecast?: { date: string, maxTemp: number, minTemp: number, condition: string }[]
  } | null;
  lang: 'en' | 'fr' | 'tn';
}

const getDayName = (dateStr: string, lang: 'en' | 'fr' | 'tn') => {
  const date = new Date(dateStr);
  const days = {
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    fr: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    tn: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  };
  return days[lang][date.getDay()];
};

const getWeatherIcon = (code: string) => {
  const c = parseInt(code);
  if (c === 0) return <Sun className="w-8 h-8 text-amber-400" />;
  if (c >= 1 && c <= 3) return <Cloud className="w-8 h-8 text-gray-400" />;
  if (c >= 45 && c <= 48) return <Cloud className="w-8 h-8 text-gray-300 opacity-50" />;
  if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return <CloudRain className="w-8 h-8 text-blue-400" />;
  if ((c >= 71 && c <= 77) || (c >= 85 && c <= 86)) return <CloudSnow className="w-8 h-8 text-blue-100" />;
  if (c >= 95) return <CloudLightning className="w-8 h-8 text-purple-400" />;
  return <Sun className="w-8 h-8 text-amber-400" />;
};

const getWeatherDescription = (code: string, lang: 'en' | 'fr' | 'tn') => {
  const c = parseInt(code);
  const descriptions: Record<string, Record<'en' | 'fr' | 'tn', string>> = {
    '0': { en: 'Clear Sky', fr: 'Ciel Dégagé', tn: 'سماء صافية' },
    '1-3': { en: 'Partly Cloudy', fr: 'Partiellement Nuageux', tn: 'سحب عابرة' },
    '45-48': { en: 'Foggy', fr: 'Brouillard', tn: 'ضبابة' },
    'rain': { en: 'Rainy', fr: 'Pluvieux', tn: 'مطر' },
    'snow': { en: 'Snowy', fr: 'Neigeux', tn: 'ثلج' },
    'storm': { en: 'Thunderstorm', fr: 'Orageux', tn: 'رعد و برق' },
  };

  if (c === 0) return descriptions['0'][lang];
  if (c >= 1 && c <= 3) return descriptions['1-3'][lang];
  if (c >= 45 && c <= 48) return descriptions['45-48'][lang];
  if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return descriptions['rain'][lang];
  if ((c >= 71 && c <= 77) || (c >= 85 && c <= 86)) return descriptions['snow'][lang];
  if (c >= 95) return descriptions['storm'][lang];
  return descriptions['0'][lang];
};

export const WeatherWidget = ({ weather, lang }: WeatherWidgetProps) => {
  const t = TRANSLATIONS[lang];

  if (!weather) {
    return (
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border border-earth-200 shadow-xl flex items-center gap-4 w-full">
        <div className="w-12 h-12 bg-earth-100 rounded-2xl animate-pulse flex items-center justify-center">
          <Cloud className="w-6 h-6 text-earth-300" />
        </div>
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-olive-400 animate-pulse">{t.loadingWeather}</div>
          <div className="w-16 h-3 bg-earth-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[40px] border border-earth-200/50 shadow-xl flex flex-col justify-between h-full min-h-[300px] relative overflow-hidden group"
    >
      <div className="absolute top-[-5%] right-[-5%] p-2 opacity-5 text-olive-600 group-hover:opacity-10 transition-opacity">
        <Wind className="w-48 h-48 -rotate-12" />
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-olive-50 text-olive-600 rounded-full w-fit mb-1">
            <MapPin className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {weather.location === "Current Location" ? t.currentLocation : 
               weather.location === "Tunis" ? t.tunis : weather.location}
            </span>
          </div>
          <div className="flex gap-4 text-olive-400">
            <div className="flex items-center gap-1.5 group-hover:text-olive-600 transition-colors">
              <Droplets className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold">{weather.humidity ?? 65}%</span>
            </div>
            <div className="flex items-center gap-1.5 group-hover:text-olive-600 transition-colors">
              <Wind className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold">{weather.windSpeed ?? 12} km/h</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="scale-125 origin-left">
            {getWeatherIcon(weather.condition)}
          </div>
          <div className="flex flex-col">
            <span className="text-6xl font-serif font-extrabold text-olive-900 tracking-tighter leading-none">{Math.round(weather.temp)}°</span>
            <span className="text-sm font-bold text-olive-800/60 mt-2">{getWeatherDescription(weather.condition, lang)}</span>
          </div>
        </div>
      </div>

      {weather.forecast && weather.forecast.length > 0 && (
        <div className="mt-8 pt-6 border-t border-earth-200/50 grid grid-cols-3 gap-2 relative z-10">
          {weather.forecast.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-olive-400">
                {getDayName(day.date, lang)}
              </span>
              <div className="scale-75">
                {getWeatherIcon(day.condition)}
              </div>
              <div className="flex gap-2 text-[10px] font-bold">
                <span className="text-olive-900">{Math.round(day.maxTemp)}°</span>
                <span className="text-olive-400">{Math.round(day.minTemp)}°</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
