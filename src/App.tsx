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
  Phone
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

export const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'error' }) => {
  const variants = {
    default: 'bg-olive-100 text-olive-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-sand-100 text-sand-700',
    error: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${variants[variant]}`}>
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
      } catch (err) {
        console.error("Weather fetch failed:", err);
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
    setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    setIsTyping(false);
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
    <div className="min-h-screen flex flex-col selection:bg-olive-200 overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        style={{ backgroundColor: `rgba(253, 252, 251, ${navOpacity.get()})` }}
        className="fixed top-0 w-full z-40 backdrop-blur-md border-b border-earth-200 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setActiveCategory('all')}
            >
              <div className="w-10 h-10 bg-olive-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-olive-200">
                <Leaf className="w-6 h-6" />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight text-olive-900">Great Farming</span>
            </motion.div>
            
              <div className="hidden md:flex items-center gap-8">
                <Link 
                  to="/"
                  className={`text-sm font-bold uppercase tracking-widest transition-all relative py-2 ${
                    location.pathname === '/' ? 'text-olive-600' : 'text-olive-900/40 hover:text-olive-900'
                  }`}
                >
                  {t.navHome}
                  {location.pathname === '/' && (
                    <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-olive-600 rounded-full" />
                  )}
                </Link>
                <Link 
                  to="/market"
                  className={`text-sm font-bold uppercase tracking-widest transition-all relative py-2 ${
                    location.pathname === '/market' ? 'text-olive-600' : 'text-olive-900/40 hover:text-olive-900'
                  }`}
                >
                  {t.navMarket}
                  {location.pathname === '/market' && (
                    <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-olive-600 rounded-full" />
                  )}
                </Link>
                <Link 
                  to="/forum"
                  className={`text-sm font-bold uppercase tracking-widest transition-all relative py-2 ${
                    location.pathname === '/forum' ? 'text-olive-600' : 'text-olive-900/40 hover:text-olive-900'
                  }`}
                >
                  {t.navForum}
                  {location.pathname === '/forum' && (
                    <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-olive-600 rounded-full" />
                  )}
                </Link>
                <Link 
                  to="/chat"
                  className={`text-sm font-bold uppercase tracking-widest transition-all relative py-2 ${
                    location.pathname === '/chat' ? 'text-olive-600' : 'text-olive-900/40 hover:text-olive-900'
                  }`}
                >
                  {t.navExpert}
                  {location.pathname === '/chat' && (
                    <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-olive-600 rounded-full" />
                  )}
                </Link>
              </div>

              <div className="flex items-center gap-4">
                {isAuthReady && (
                  user ? (
                    <div className="flex items-center gap-3">
                      <Link to="/profile" className="flex items-center gap-2 group">
                        <img 
                          src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                          alt={user.displayName || 'User'} 
                          className="w-8 h-8 rounded-full border border-olive-200 group-hover:border-olive-500 transition-all"
                        />
                        <div className="hidden xl:block text-left">
                          <div className="text-[10px] font-bold text-olive-900 truncate max-w-[80px]">{user.displayName}</div>
                          <div className="text-[8px] font-bold text-olive-400 uppercase tracking-widest">{userProfile?.reputation || 0} Rep</div>
                        </div>
                      </Link>
                      <button 
                        onClick={() => logout()}
                        className="p-2 text-olive-400 hover:text-red-500 transition-colors"
                        title="Logout"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => signInWithGoogle()}
                      className="flex items-center gap-2 px-4 py-2 bg-olive-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-olive-800 transition-all shadow-lg shadow-olive-100"
                    >
                      <LogIn className="w-3 h-3" />
                      Login
                    </button>
                  )
                )}
              <div className="hidden sm:flex items-center bg-earth-100 rounded-full p-1">
                {(['en', 'fr', 'tn'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                      lang === l ? 'bg-white text-olive-900 shadow-sm' : 'text-olive-400 hover:text-olive-900'
                    }`}
                  >
                    {l === 'tn' ? 'Tounsi' : l}
                  </button>
                ))}
              </div>
              <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
                <input 
                  type="text" 
                  placeholder={t.chatPlaceholder} 
                  className="pl-10 pr-4 py-2 bg-earth-100 border-none rounded-full text-sm focus:ring-2 focus:ring-olive-500 transition-all w-48 lg:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-olive-900 hover:bg-earth-100 rounded-xl transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
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
                  <div className="flex items-center bg-earth-100 rounded-2xl p-1.5 w-fit">
                    {(['en', 'fr', 'tn'] as const).map(l => (
                      <button
                        key={l}
                        onClick={() => {
                          setLang(l);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
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
      </motion.nav>

      <main className="flex-grow">
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
            />
          } />
          <Route path="/market" element={<Market lang={lang} />} />
          <Route path="/forum" element={<Forum lang={lang} user={user} isAuthReady={isAuthReady} />} />
          <Route path="/profile" element={<Profile lang={lang} user={user} isAuthReady={isAuthReady} userProfile={userProfile} />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-earth-100 py-20 border-t border-earth-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-olive-600 rounded-xl flex items-center justify-center text-white">
                  <Leaf className="w-6 h-6" />
                </div>
                <span className="text-2xl font-serif font-bold text-olive-900">Great Farming</span>
              </div>
              <p className="text-olive-800/60 max-w-sm leading-relaxed">
                Empowering the next generation of Tunisian farmers with data-driven insights and sustainable practices.
                <br />
                <span className="text-[10px] font-bold uppercase tracking-widest mt-4 block">
                  Owned & Developed by <a href="https://github.com/Youssef-benamor" target="_blank" rel="noopener noreferrer" className="hover:text-olive-600 transition-colors underline underline-offset-2">Youssef Benamor</a>
                </span>
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex flex-col gap-4">
                  <a 
                    href="https://maps.app.goo.gl/RCnwYEDMC4a9itXSA" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 text-sm font-bold text-olive-900 hover:text-olive-600 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                      <MapPin className="w-4 h-4 text-olive-600" />
                    </div>
                    <span>Great Farming Somaa</span>
                  </a>
                  <a 
                    href="tel:+21629793853" 
                    className="inline-flex items-center gap-2 text-sm font-bold text-olive-900 hover:text-olive-600 transition-colors group ml-1"
                  >
                    <Phone className="w-4 h-4 text-olive-600" />
                    <span>+216 29 793 853</span>
                  </a>
                </div>
                <div className="pt-2">
                  <a 
                    href="https://maps.app.goo.gl/sF3j2AkY2sJPJTgj9" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 text-sm font-bold text-olive-900 hover:text-olive-600 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                      <MapPin className="w-4 h-4 text-olive-600" />
                    </div>
                    <span>Great Farming Boujrida</span>
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-olive-400 mb-6">Explore</h5>
              <ul className="space-y-4 text-sm font-bold text-olive-900/60">
                <li>
                  <button 
                    onClick={() => {
                      if (location.pathname !== '/') {
                        navigate('/');
                        setTimeout(() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }), 100);
                      } else {
                        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                      }
                      setActiveCategory('tool');
                    }}
                    className="hover:text-olive-900 transition-colors cursor-pointer text-left"
                  >
                    Tools & Tech
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      if (location.pathname !== '/') {
                        navigate('/');
                        setTimeout(() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }), 100);
                      } else {
                        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                      }
                      setActiveCategory('method');
                    }}
                    className="hover:text-olive-900 transition-colors cursor-pointer text-left"
                  >
                    Modern Methods
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      if (location.pathname !== '/') {
                        navigate('/');
                        setTimeout(() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }), 100);
                      } else {
                        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                      }
                      setActiveCategory('treatment');
                    }}
                    className="hover:text-olive-900 transition-colors cursor-pointer text-left"
                  >
                    Plant Health
                  </button>
                </li>
              </ul>
              <div className="mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsChatOpen(true);
                    setChatInput(lang === 'tn' ? "نحب نحجز استشارة فلاحية." : lang === 'fr' ? "Je souhaite réserver une consultation agricole." : "I would like to book an agricultural consulting session.");
                  }}
                  className="px-6 py-3 bg-olive-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-olive-100 hover:bg-olive-700 transition-all"
                >
                  {lang === 'tn' ? 'حجز استشارة' : lang === 'fr' ? 'Réserver une Consultation' : 'Book a Consulting'}
                </motion.button>
              </div>
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-olive-400 mb-6">Community</h5>
              <ul className="space-y-4 text-sm font-bold text-olive-900/60">
                <li>
                  <button 
                    onClick={() => {
                      setIsChatOpen(true);
                      setChatInput(lang === 'tn' ? "كيفاش نجم نتواصل مع خبراء فلاحين؟" : lang === 'fr' ? "Comment puis-je contacter des experts agricoles ?" : "How can I connect with agricultural experts?");
                    }}
                    className="hover:text-olive-900 transition-colors cursor-pointer text-left"
                  >
                    Expert Network
                  </button>
                </li>
                <li>
                  <Link to="/forum" className="hover:text-olive-900 transition-colors">
                    Farmer Forums
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setIsChatOpen(true);
                      setChatInput(lang === 'tn' ? "وريني قصص نجاح فلاحية في تونس." : lang === 'fr' ? "Montre-moi des réussites agricoles en Tunisie." : "Show me some agricultural success stories in Tunisia.");
                    }}
                    className="hover:text-olive-900 transition-colors cursor-pointer text-left"
                  >
                    Case Studies
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-earth-200 gap-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-olive-800/40 uppercase tracking-widest">© 2026 Great Farming. All rights reserved.</p>
              <p className="text-[10px] font-bold text-olive-800/30 uppercase tracking-widest">
                Developed by <a href="https://github.com/Youssef-benamor" target="_blank" rel="noopener noreferrer" className="hover:text-olive-600 transition-colors underline underline-offset-2">Youssef Benamor</a>
              </p>
            </div>
            <div className="flex gap-8">
            </div>
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
              <div className="lg:w-1/2 p-10 lg:p-16 overflow-y-auto custom-scrollbar">
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
                
                <div className="grid grid-cols-2 gap-8 mb-12">
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
      <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-40">
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
