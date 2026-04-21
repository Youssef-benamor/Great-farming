import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, ShoppingBag, Plus, MapPin, MessageSquare, ArrowRight, BarChart3 } from 'lucide-react';
import { TRANSLATIONS, MARKET_PRICES, COMMUNITY_POSTS } from '../constants';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

const PRICE_HISTORY = [
  { month: 'Oct', olive: 18.2, wheat: 110, dates: 7.2 },
  { month: 'Nov', olive: 19.5, wheat: 115, dates: 7.5 },
  { month: 'Dec', olive: 21.0, wheat: 118, dates: 7.8 },
  { month: 'Jan', olive: 23.5, wheat: 122, dates: 8.0 },
  { month: 'Feb', olive: 24.8, wheat: 125, dates: 8.1 },
  { month: 'Mar', olive: 25.5, wheat: 130, dates: 8.2 },
];

interface MarketProps {
  lang: 'en' | 'fr' | 'tn';
}

export default function Market({ lang }: MarketProps) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-earth-50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Market Prices Overview */}
        <section className="mb-20">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-olive-900">{t.marketPrices}</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-olive-400 uppercase tracking-widest">
              <BarChart3 className="w-4 h-4" />
              {t.realtimeIndex}
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-earth-100 h-[400px]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h4 className="text-lg font-serif font-bold text-olive-900">{t.chartTitle}</h4>
                  <p className="text-xs text-olive-400 font-bold uppercase tracking-widest">{t.chartSubtitle}</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-olive-600 rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-olive-900">{t.chartOlive}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-olive-900">{t.chartDates}</span>
                  </div>
                </div>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PRICE_HISTORY}>
                    <defs>
                      <linearGradient id="colorOlive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#66724a" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#66724a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#82905f' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#82905f' }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderRadius: '20px', 
                        border: 'none', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="olive" 
                      stroke="#66724a" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorOlive)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="dates" 
                      stroke="#f3a31a" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#f3a31a' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="space-y-4">
              {MARKET_PRICES.map(price => (
                <motion.div 
                  key={price.id} 
                  whileHover={{ x: 10 }}
                  className="flex items-center justify-between p-6 bg-white rounded-3xl shadow-sm border border-earth-100"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      price.trend === 'up' ? 'bg-green-100 text-green-600' : 
                      price.trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-olive-100 text-olive-600'
                    }`}>
                      <TrendingUp className={`w-5 h-5 ${price.trend === 'down' ? 'rotate-180' : ''}`} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-olive-900">{price.commodity}</div>
                      <div className="text-[10px] text-olive-400 font-bold uppercase tracking-widest">{price.location}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-serif font-bold text-olive-900">{price.price} {price.unit}</div>
                    <div className={`text-[10px] font-bold ${
                      price.trend === 'up' ? 'text-green-600' : 
                      price.trend === 'down' ? 'text-red-600' : 'text-olive-400'
                    }`}>{price.change}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Marketplace */}
          <div>
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-4xl font-serif font-bold text-olive-900">{t.marketplace}</h2>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-olive-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> {t.listItem}
              </motion.button>
            </div>
            
            <div className="space-y-6">
              {[
                { title: "Organic Fertilizer", price: "45 DT", seller: "FarmDirect", image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400" },
                { title: "Drip Irrigation Kit", price: "120 DT", seller: "AgroTech", image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&q=80&w=400" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ x: 10 }}
                  className="flex gap-6 p-4 bg-white rounded-3xl shadow-sm border border-earth-100 group cursor-pointer"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-serif font-bold text-olive-900">{item.title}</h4>
                      <span className="text-[8px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full uppercase tracking-widest">Demo</span>
                    </div>
                    <p className="text-xs text-olive-400 font-bold uppercase tracking-widest mb-2">{t.seller}: {item.seller}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-serif font-bold text-olive-600">{item.price}</span>
                      <ShoppingBag className="w-5 h-5 text-olive-300 group-hover:text-olive-600 transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Community Feed */}
          <div>
            <h2 className="text-4xl font-serif font-bold text-olive-900 mb-12">{t.community}</h2>
            <div className="space-y-8">
              {COMMUNITY_POSTS.map(post => (
                <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 rounded-[40px] shadow-sm border border-earth-100"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img src={post.avatar} alt={post.author} className="w-12 h-12 rounded-2xl object-cover" />
                    <div>
                      <div className="font-serif font-bold text-olive-900">{post.author}</div>
                      <div className="text-[10px] text-olive-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {post.location} • {post.time}
                      </div>
                    </div>
                  </div>
                  <p className="text-olive-800/70 leading-relaxed mb-6">{post.content}</p>
                  {post.image && (
                    <div className="rounded-3xl overflow-hidden mb-6 aspect-video">
                      <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-xs font-bold text-olive-400 hover:text-olive-600 transition-colors">
                      <TrendingUp className="w-4 h-4" /> {post.likes} {t.likes}
                    </button>
                    <button className="flex items-center gap-2 text-xs font-bold text-olive-400 hover:text-olive-600 transition-colors">
                      <MessageSquare className="w-4 h-4" /> {post.comments} {t.comments}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
