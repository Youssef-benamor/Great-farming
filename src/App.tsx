/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, 
  Wrench, 
  FlaskConical, 
  Search, 
  MessageSquare, 
  Send, 
  X, 
  Leaf, 
  Droplets, 
  Sun, 
  MapPin,
  ArrowRight,
  Menu,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Zap,
  Globe,
  Camera,
  Cloud,
  Thermometer,
  Wind,
  ShoppingBag,
  Plus,
  User,
  LogOut,
  LogIn,
  Download,
  Phone,
  AlertCircle,
  Key,
  Github
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { FARMING_DATA, FarmingItem, TRANSLATIONS, MARKET_PRICES, COMMUNITY_POSTS } from './constants';
import { askFarmingExpert } from './services/geminiService';
import { auth, db, signInWithGoogle, logout, onAuthStateChanged, FirebaseUser, doc, getDoc, setDoc, Timestamp } from './firebase';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Market from './pages/Market';
import Forum from './pages/Forum';
import Profile from './pages/Profile';
import { WeatherWidget } from './components/WeatherWidget';

export const CategoryIcon = ({ category, className = "w-5 h-5" }: { category: FarmingItem['category'], className?: string }) => {
  switch (category) {
    case 'tool': return <Wrench className={className} />;
    case 'method': return <Sprout className={className} />;
    case 'treatment': return <FlaskConical className={className} />;
  }
};

export const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'error', className?: string }) => {
  const variants = {
    default: 'bg-olive-100 text-olive-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-sand-100 text-sand-700',
    error: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'fr' | 'tn'>('en');
  const [activeCategory, setActiveCategory] = useState<FarmingItem['category'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<FarmingItem | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', content: string, image?: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [weather, setWeather] = useState<{ 
    temp: number, 
    condition: string, 
    location: string, 
    humidity?: number, 
    windSpeed?: number,
    forecast?: { date: string, maxTemp: number, minTemp: number, condition: string }[]
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 100], [0, 0.8]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const t = TRANSLATIONS[lang];
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthReady(true);
      
      if (firebaseUser) {
        // Check if user profile exists in Firestore, if not create it
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const newProfile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Farmer',
            photoURL: firebaseUser.photoURL || '',
            reputation: 0,
            bio: '',
            createdAt: Timestamp.now()
          };
          await setDoc(userRef, newProfile);
          setUserProfile(newProfile);
        } else {
          setUserProfile(userSnap.data());
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number, locationName: string) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data && data.current) {
          const forecast = data.daily ? data.daily.time.slice(1, 4).map((time: string, index: number) => ({
            date: time,
            maxTemp: data.daily.temperature_2m_max[index + 1],
            minTemp: data.daily.temperature_2m_min[index + 1],
            condition: data.daily.weather_code[index + 1].toString()
          })) : [];

          setWeather({
            temp: data.current.temperature_2m,
            condition: data.current.weather_code.toString(),
            location: locationName,
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
            forecast
          });
        }
      } catch (err: any) {
        // Fallback to Tunis default if fetch fails for current location
        if (locationName === "Current Location") {
          fetchWeather(36.8065, 10.1815, "Tunis");
        } else {
          // Final fallback to static data if even Tunis fetch fails
          setWeather({
            temp: 22,
            condition: "0",
            location: "Tunis",
            humidity: 45,
            windSpeed: 12
          });
        }
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude, "Current Location");
        },
        (error) => {
          console.warn("Geolocation denied or failed, using default (Tunis)", error);
          fetchWeather(36.8065, 10.1815, "Tunis"); // Default to Tunis
        },
        { timeout: 5000 }
      );
    } else {
      fetchWeather(36.8065, 10.1815, "Tunis"); // Default to Tunis
    }
  }, []);

  const filteredData = FARMING_DATA.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setIsChatOpen(true); // Open chat to show preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !selectedImage) return;

    const userMessage = chatInput || (selectedImage ? "Analyze this plant image." : "");
    const currentImage = selectedImage;
    
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage, image: currentImage || undefined }]);
    setChatInput('');
    setSelectedImage(null);
    setIsTyping(true);

    let imageBase64 = "";
    let mimeType = "";
    if (currentImage) {
      const parts = currentImage.split(',');
      mimeType = parts[0].match(/:(.*?);/)?.[1] || "";
      imageBase64 = parts[1];
    }

    const aiResponse = await askFarmingExpert(userMessage, imageBase64, mimeType);
    
    if (aiResponse === "QUOTA_EXCEEDED") {
      setQuotaExceeded(true);
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        content: t.quotaExceededDesc 
      }]);
    } else {
      setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    }
    
    setIsTyping(false);
  };

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      setQuotaExceeded(false);
      // Optionally show a success message
      setChatMessages(prev => [...prev, { role: 'ai', content: t.apiKeySelected }]);
    } catch (error) {
      console.error("Error selecting API key:", error);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleDownloadGuide = (item: FarmingItem) => {
    if (!item.guideContent) return;
    
    const blob = new Blob([item.guideContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.toLowerCase().replace(/\s+/g, '-')}-technical-guide.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row selection:bg-olive-600 selection:text-white overflow-x-hidden bg-earth-50">
      
      {/* Floating Desktop Sidebar (Dashboard Aesthetic) */}
      <motion.aside 
        className="hidden md:flex flex-col fixed w-20 lg:w-72 h-[calc(100vh-2rem)] top-4 left-4 rounded-[2rem] border border-earth-200/50 bg-white/80 backdrop-blur-3xl shadow-[0_16px_40px_-10px_rgba(0,71,255,0.08)] z-50 overflow-hidden"
      >
        <div className="flex flex-col h-full p-4 lg:p-6">
          {/* Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer mb-12"
            onClick={() => { setActiveCategory('all'); window.location.href='/'; }}
          >
            <div className="w-12 h-12 flex-shrink-0 bg-olive-600 rounded-[1rem] flex items-center justify-center text-white shadow-[0_8px_20px_rgba(0,71,255,0.3)]">
              <Leaf className="w-6 h-6" />
            </div>
            <div className="hidden lg:block">
              <span className="text-xl font-serif font-extrabold tracking-tighter text-olive-900 leading-none block">Great Farming</span>
              <span className="text-[10px] font-mono text-olive-500 uppercase tracking-widest">Unreleased Build</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col gap-2 flex-grow">
            <Link to="/" className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${location.pathname === '/' ? 'bg-olive-50 text-olive-600' : 'text-olive-900/50 hover:bg-earth-100 hover:text-olive-900'}`}>
              <MapPin className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:block text-sm font-bold uppercase tracking-widest">{t.navHome}</span>
            </Link>
            <Link to="/market" className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${location.pathname === '/market' ? 'bg-olive-50 text-olive-600' : 'text-olive-900/50 hover:bg-earth-100 hover:text-olive-900'}`}>
              <TrendingUp className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:block text-sm font-bold uppercase tracking-widest">{t.navMarket}</span>
            </Link>
            <Link to="/forum" className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${location.pathname === '/forum' ? 'bg-olive-50 text-olive-600' : 'text-olive-900/50 hover:bg-earth-100 hover:text-olive-900'}`}>
              <Zap className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:block text-sm font-bold uppercase tracking-widest">{t.navForum}</span>
            </Link>
            <Link to="/chat" className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${location.pathname === '/chat' ? 'bg-olive-50 text-olive-600' : 'text-olive-900/50 hover:bg-earth-100 hover:text-olive-900'}`}>
              <FlaskConical className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:block text-sm font-bold uppercase tracking-widest">{t.navExpert}</span>
            </Link>
          </div>

          {/* Bottom Tools */}
          <div className="mt-auto pt-6 border-t border-earth-200/50 flex flex-col gap-4">
            <div className="hidden lg:flex flex-col gap-2 bg-earth-100 rounded-2xl p-1.5">
              {(['en', 'fr', 'tn'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-4 py-2 text-center rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    lang === l ? 'bg-white text-olive-900 shadow-sm' : 'text-olive-400 hover:text-olive-900 hover:bg-white/50'
                  }`}
                >
                  {l === 'tn' ? 'Tounsi' : l}
                </button>
              ))}
            </div>

            {isAuthReady && (
              user ? (
                <div className="flex flex-col gap-3">
                  <Link to="/profile" className="flex items-center gap-3 p-2 hover:bg-earth-100 rounded-2xl transition-all">
                    <img 
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                      alt={user.displayName || 'User'} 
                      className="w-10 h-10 rounded-[12px] border border-earth-200"
                    />
                    <div className="hidden lg:block text-left overflow-hidden">
                      <div className="text-xs font-bold text-olive-900 truncate">{user.displayName}</div>
                      <div className="text-[10px] font-mono text-olive-500">{userProfile?.reputation || 0} Rep</div>
                    </div>
                  </Link>
                  <button onClick={() => logout()} className="hidden lg:flex items-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <button onClick={() => signInWithGoogle()} className="flex items-center justify-center gap-2 px-4 py-4 bg-olive-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-olive-100">
                  <LogIn className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden lg:block">Authenticate</span>
                </button>
              )
            )}
          </div>
        </div>
      </motion.aside>

      {/* Mobile Top Nav (Sticky) */}
      <div className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-3xl border-b border-earth-200/50 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2" onClick={() => setActiveCategory('all')}>
          <div className="w-8 h-8 bg-olive-600 rounded-lg flex items-center justify-center text-white">
            <Leaf className="w-4 h-4" />
          </div>
          <span className="font-serif font-extrabold text-olive-900 tracking-tighter">Great Farming</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-olive-900 bg-earth-100 rounded-xl">
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-earth-200 overflow-hidden"
            >
              <div className="px-4 py-8 space-y-8">
                <div className="flex flex-col gap-4">
                  <Link 
                    to="/" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold text-olive-900 px-4 py-2 hover:bg-earth-50 rounded-xl transition-colors"
                  >
                    {t.navHome}
                  </Link>
                  <Link 
                    to="/market" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold text-olive-900 px-4 py-2 hover:bg-earth-50 rounded-xl transition-colors"
                  >
                    {t.navMarket}
                  </Link>
                  <Link 
                    to="/forum" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold text-olive-900 px-4 py-2 hover:bg-earth-50 rounded-xl transition-colors"
                  >
                    {t.navForum}
                  </Link>
                  <Link 
                    to="/chat" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold text-olive-900 px-4 py-2 hover:bg-earth-50 rounded-xl transition-colors"
                  >
                    {t.navExpert}
                  </Link>
                  {user && (
                    <Link 
                      to="/profile" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-lg font-bold text-olive-900 px-4 py-2 hover:bg-earth-50 rounded-xl transition-colors flex items-center gap-3"
                    >
                      <User className="w-5 h-5" />
                      {t.forumProfile}
                    </Link>
                  )}
                </div>

                <div className="px-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-olive-400 mb-4">Language / Langue / اللغة</div>
                  <div className="flex flex-wrap items-center bg-earth-100 rounded-2xl p-1.5 gap-1 w-full max-w-sm">
                    {(['en', 'fr', 'tn'] as const).map(l => (
                      <button
                        key={l}
                        onClick={() => {
                          setLang(l);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                          lang === l ? 'bg-white text-olive-900 shadow-sm' : 'text-olive-400 hover:text-olive-900'
                        }`}
                      >
                        {l === 'tn' ? 'Tounsi' : l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-4 relative">
                  <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
                  <input 
                    type="text" 
                    placeholder={t.chatPlaceholder} 
                    className="pl-12 pr-4 py-4 bg-earth-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-olive-500 transition-all w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="md:pl-24 lg:pl-80 flex-1 flex flex-col min-h-screen relative z-10 min-w-0 transition-all duration-300">
          <Routes>
          <Route path="/" element={
            <Home 
              lang={lang}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              setSelectedItem={setSelectedItem}
              fileInputRef={fileInputRef}
              uploadInputRef={uploadInputRef}
              setIsChatOpen={setIsChatOpen}
              setChatMessages={setChatMessages}
              searchQuery={searchQuery}
              weather={weather}
            />
          } />
          <Route path="/chat" element={
            <Chat 
              lang={lang}
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
              isTyping={isTyping}
              setIsTyping={setIsTyping}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              chatInput={chatInput}
              setChatInput={setChatInput}
              fileInputRef={fileInputRef}
              uploadInputRef={uploadInputRef}
              chatEndRef={chatEndRef}
              quotaExceeded={quotaExceeded}
              setQuotaExceeded={setQuotaExceeded}
              handleSelectKey={handleSelectKey}
            />
          } />
          <Route path="/market" element={<Market lang={lang} />} />
          <Route path="/forum" element={<Forum lang={lang} user={user} isAuthReady={isAuthReady} userProfile={userProfile} />} />
          <Route path="/profile" element={<Profile lang={lang} user={user} isAuthReady={isAuthReady} userProfile={userProfile} />} />
        </Routes>
      </div>

      {/* Minimalist Dashboard Footer */}
      <footer className="mt-auto px-6 py-6 border-t border-earth-200/50 bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-olive-600" />
            <span className="font-serif font-bold text-olive-900 tracking-tight">Great Farming Core</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-olive-500">
            <a href="https://maps.app.goo.gl/RCnwYEDMC4a9itXSA" target="_blank" rel="noreferrer" className="hover:text-olive-900 transition-colors flex items-center gap-1"><MapPin className="w-3 h-3"/> Somaa Unit</a>
            <a href="https://maps.app.goo.gl/sF3j2AkY2sJPJTgj9" target="_blank" rel="noreferrer" className="hover:text-olive-900 transition-colors flex items-center gap-1"><MapPin className="w-3 h-3"/> Korba Unit</a>
            <a href="tel:+21629793853" className="hover:text-olive-900 transition-colors flex items-center gap-1"><Phone className="w-3 h-3"/> Connect</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/Youssef-benamor" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-mono text-olive-600 hover:text-black transition-colors bg-earth-100 px-3 py-1.5 rounded-full">
              <Github className="w-4 h-4" />
              <span>Youssef Benamor Dev</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Item Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-olive-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative bg-white rounded-[48px] overflow-hidden max-w-6xl w-full max-h-[90vh] shadow-2xl flex flex-col lg:flex-row"
            >
              <div className="lg:w-1/2 h-80 lg:h-auto relative">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden" />
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-6 left-6 p-3 glass rounded-full text-white hover:bg-white/40 transition-all lg:hidden"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="lg:w-1/2 p-6 sm:p-10 lg:p-16 overflow-y-auto custom-scrollbar">
                <div className="hidden lg:flex justify-end mb-8">
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="p-3 text-olive-300 hover:text-olive-900 transition-colors"
                  >
                    <X className="w-8 h-8" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="glass px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-olive-900">
                    <CategoryIcon category={selectedItem.category} />
                    {selectedItem.category}
                  </div>
                  <Badge variant={selectedItem.difficulty === 'Advanced' ? 'warning' : 'default'}>{selectedItem.difficulty}</Badge>
                </div>

                <h2 className="text-5xl lg:text-6xl font-serif font-bold text-olive-900 mb-8 leading-tight">{selectedItem.title}</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-12">
                  <div className="bg-earth-50 p-6 rounded-3xl">
                    <Calendar className="w-6 h-6 text-olive-600 mb-3" />
                    <div className="text-[10px] font-bold uppercase tracking-widest text-olive-400 mb-1">{lang === 'tn' ? 'أحسن وقت' : lang === 'fr' ? 'Meilleure Saison' : 'Best Season'}</div>
                    <div className="text-lg font-serif font-bold text-olive-900">{selectedItem.season || (lang === 'tn' ? 'على طول العام' : lang === 'fr' ? 'Toute l\'année' : 'Year-round')}</div>
                  </div>
                  <div className="bg-earth-50 p-6 rounded-3xl">
                    <Zap className="w-6 h-6 text-olive-600 mb-3" />
                    <div className="text-[10px] font-bold uppercase tracking-widest text-olive-400 mb-1">{t.impact}</div>
                    <div className="text-lg font-serif font-bold text-olive-900">{lang === 'tn' ? 'النجاعة' : lang === 'fr' ? 'Efficacité' : 'Efficiency'}</div>
                  </div>
                </div>

                <div className="space-y-10">
                  <section>
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-olive-400 mb-4">{t.expertOverview}</h4>
                    <p className="text-xl text-olive-800/70 leading-relaxed font-serif italic">"{selectedItem.description}"</p>
                  </section>
                  
                  <section>
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-olive-400 mb-4">{t.techImplementation}</h4>
                    <p className="text-lg text-olive-800/70 leading-relaxed">{selectedItem.details}</p>
                  </section>

                  <section className="bg-olive-50 p-8 rounded-[32px] border border-olive-100">
                    <div className="flex items-start gap-4">
                      <ShieldCheck className="w-8 h-8 text-olive-600 flex-shrink-0" />
                      <div>
                        <h4 className="text-lg font-serif font-bold text-olive-900 mb-2">{t.projectedImpact}</h4>
                        <p className="text-olive-800/70 leading-relaxed">{selectedItem.impact}</p>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="mt-16 flex flex-col sm:flex-row gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownloadGuide(selectedItem)}
                    className="flex-grow py-5 bg-olive-900 text-white rounded-[24px] font-bold shadow-2xl shadow-olive-200 hover:bg-olive-800 transition-all"
                  >
                    {lang === 'tn' ? 'تحميل الدليل التقني' : lang === 'fr' ? 'Télécharger le Guide Technique' : 'Download Technical Guide'}
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedItem(null);
                      setIsChatOpen(true);
                      setChatInput(lang === 'tn' ? `نحب نعرف أكثر على ${selectedItem.title}.` : lang === 'fr' ? `Je veux en savoir plus sur les exigences techniques pour ${selectedItem.title}.` : `I want to learn more about the technical requirements for ${selectedItem.title}.`);
                    }}
                    className="p-5 glass text-olive-900 rounded-[24px] hover:bg-earth-100 transition-all"
                  >
                    <MessageSquare className="w-7 h-7" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Bot Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="absolute inset-0 bg-olive-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(10px)" }}
              className="relative w-full max-w-[500px] h-full max-h-[700px] bg-white rounded-[40px] shadow-2xl border border-white/40 flex flex-col overflow-hidden"
            >
              <div className="p-6 bg-olive-900 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Sprout className="w-7 h-7 text-olive-400" />
                  </div>
                  <div>
                    <div className="font-serif font-bold text-lg">{t.expertName}</div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t.expertStatus}</div>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-earth-50/30 custom-scrollbar">
                {chatMessages.length === 0 && (
                  <div className="text-center py-16">
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-20 h-20 bg-olive-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-olive-600"
                    >
                      <MessageSquare className="w-10 h-10" />
                    </motion.div>
                    <h4 className="text-xl font-serif font-bold text-olive-900 mb-2 text-balance">{t.consult}</h4>
                    <p className="text-sm text-olive-800/60 px-12 leading-relaxed mb-8">{t.chatIntro}</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-8 py-4 bg-green-600 text-white rounded-2xl font-bold shadow-xl shadow-green-100 flex items-center gap-2 mx-auto"
                    >
                      <Camera className="w-5 h-5" />
                      {t.scanYourPlant}
                    </motion.button>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] space-y-3`}>
                      {msg.image && (
                        <div className="rounded-2xl overflow-hidden shadow-md border-2 border-white">
                          <img src={msg.image} alt="Uploaded" className="max-w-full h-auto" />
                        </div>
                      )}
                      <div className={`p-4 rounded-[24px] shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-olive-900 text-white rounded-tr-none' 
                          : 'bg-white text-olive-900 border border-earth-100 rounded-tl-none'
                      }`}>
                        <div className="markdown-body">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-[24px] shadow-sm border border-earth-100 rounded-tl-none">
                      <div className="flex gap-1.5">
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-olive-300 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-olive-300 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-olive-300 rounded-full" />
                      </div>
                    </div>
                  </div>
                )}
                {quotaExceeded && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col items-center text-center gap-4"
                  >
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="font-bold text-amber-900">{t.quotaExceeded}</h5>
                      <p className="text-xs text-amber-800/70 mt-1">{t.quotaExceededDesc}</p>
                    </div>
                    <button 
                      onClick={handleSelectKey}
                      className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-700 transition-colors"
                    >
                      <Key className="w-4 h-4" />
                      {t.selectApiKey}
                    </button>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="px-6 pb-2 shrink-0">
                <AnimatePresence>
                  {selectedImage && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-olive-500"
                    >
                      <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-1 right-1 bg-olive-900 text-white p-1 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-earth-100 flex gap-3 shrink-0">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 bg-earth-100 text-olive-600 rounded-2xl hover:bg-earth-200 transition-colors shrink-0"
                >
                  <Camera className="w-6 h-6" />
                </button>
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t.chatPlaceholder}
                  className="flex-grow px-6 py-4 bg-earth-100 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-olive-500 transition-all min-w-0"
                />
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit" 
                  disabled={!chatInput.trim() && !selectedImage}
                  className="p-4 bg-olive-900 text-white rounded-2xl shadow-lg shadow-olive-100 hover:bg-olive-800 transition-colors shrink-0 disabled:opacity-50"
                >
                  <Send className="w-6 h-6" />
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Chat Trigger */}
      <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-50">
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-2xl transition-all ${
            isChatOpen ? 'bg-white text-olive-900' : 'bg-olive-900 text-white'
          }`}
        >
          {isChatOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
        </motion.button>
      </div>

      {/* Hidden File Input for Camera */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Hidden File Input for Device Upload */}
      <input 
        type="file" 
        ref={uploadInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
