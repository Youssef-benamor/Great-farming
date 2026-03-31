/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import ReactMarkdown from "react-markdown";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  FARMING_DATA,
  FarmingItem,
  TRANSLATIONS,
  MARKET_PRICES,
  COMMUNITY_POSTS,
} from "./constants";
import { askFarmingExpert } from "./services/geminiService";
import {
  auth,
  db,
  signInWithGoogle,
  logout,
  onAuthStateChanged,
  FirebaseUser,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "./firebase";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Market from "./pages/Market";
import Forum from "./pages/Forum";
import Profile from "./pages/Profile";
import { WeatherWidget } from "./components/WeatherWidget";

export const CategoryIcon = ({
  category,
  className = "w-5 h-5",
}: {
  category: FarmingItem["category"];
  className?: string;
}) => {
  switch (category) {
    case "tool":
      return <Wrench className={className} />;
    case "method":
      return <Sprout className={className} />;
    case "treatment":
      return <FlaskConical className={className} />;
  }
};

export const Badge = ({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error";
}) => {
  const variants = {
    default: "bg-olive-100 text-olive-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-sand-100 text-sand-700",
    error: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

export default function App() {
  const [lang, setLang] = useState<"en" | "fr" | "tn">("en");
  const [activeCategory, setActiveCategory] = useState<
    FarmingItem["category"] | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<FarmingItem | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "ai"; content: string; image?: string }[]
  >([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [weather, setWeather] = useState<{
    temp: number;
    condition: string;
    location: string;
    humidity?: number;
    windSpeed?: number;
    forecast?: {
      date: string;
      maxTemp: number;
      minTemp: number;
      condition: string;
    }[];
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
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          const newProfile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || "Farmer",
            photoURL: firebaseUser.photoURL || "",
            reputation: 0,
            bio: "",
            createdAt: Timestamp.now(),
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
    const fetchWeather = async (
      lat: number,
      lon: number,
      locationName: string,
    ) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`,
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data && data.current) {
          const forecast = data.daily
            ? data.daily.time
                .slice(1, 4)
                .map((time: string, index: number) => ({
                  date: time,
                  maxTemp: data.daily.temperature_2m_max[index + 1],
                  minTemp: data.daily.temperature_2m_min[index + 1],
                  condition: data.daily.weather_code[index + 1].toString(),
                }))
            : [];

          setWeather({
            temp: data.current.temperature_2m,
            condition: data.current.weather_code.toString(),
            location: locationName,
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
            forecast,
          });
        }
      } catch (err) {
        console.error("Weather fetch failed:", err);
        if (locationName === "Current Location") {
          fetchWeather(36.8065, 10.1815, "Tunis");
        } else {
          setWeather({
            temp: 22,
            condition: "0",
            location: "Tunis",
            humidity: 45,
            windSpeed: 12,
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
          console.warn(
            "Geolocation denied or failed, using default (Tunis)",
            error,
          );
          fetchWeather(36.8065, 10.1815, "Tunis");
        },
        { timeout: 5000 },
      );
    } else {
      fetchWeather(36.8065, 10.1815, "Tunis");
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !selectedImage) return;

    const userMessage =
      chatInput || (selectedImage ? "Analyze this plant image." : "");
    const currentImage = selectedImage;

    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, image: currentImage || undefined },
    ]);
    setChatInput("");
    setSelectedImage(null);
    setIsTyping(true);

    let imageBase64 = "";
    let mimeType = "";
    if (currentImage) {
      const parts = currentImage.split(",");
      mimeType = parts[0].match(/:(.*?);/)?.[1] || "";
      imageBase64 = parts[1];
    }

    const aiResponse = await askFarmingExpert(
      userMessage,
      imageBase64,
      mimeType,
    );
    setChatMessages((prev) => [...prev, { role: "ai", content: aiResponse }]);
    setIsTyping(false);
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
              onClick={() => setActiveCategory("all")}
            >
              <div className="w-10 h-10 bg-olive-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-olive-200">
                <Leaf className="w-6 h-6" />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight text-olive-900">
                Great Farming
              </span>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className={`text-sm font-bold uppercase tracking-widest transition-all relative py-2 ${
                  location.pathname === "/"
                    ? "text-olive-600"
                    : "text-olive-900/40 hover:text-olive-900"
                }`}
              >
                {t.navHome}
                {location.pathname === "/" && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-olive-600 rounded-full"
                  />
                )}
              </Link>
              <Link
                to="/market"
                className={`text-sm font-bold uppercase tracking-widest transition-all relative py-2 ${
                  location.pathname === "/market"
                    ? "text-olive-600"
                    : "text-olive-900/40 hover:text-olive-900"
                }`}
              >
                {t.navMarket}
                {location.pathname === "/market" && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-olive-600 rounded-full"
                  />
                )}
              </Link>
              <Link
                to="/forum"
                className={`text-sm font-bold uppercase tracking-widest transition-all relative py-2 ${
                  location.pathname === "/forum"
                    ? "text-olive-600"
                    : "text-olive-900/40 hover:text-olive-900"
                }`}
              >
                {t.navForum}
                {location.pathname === "/forum" && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-olive-600 rounded-full"
                  />
                )}
              </Link>
              <Link
                to="/chat"
                className={`text-sm font-bold uppercase tracking-widest transition-all relative py-2 ${
                  location.pathname === "/chat"
                    ? "text-olive-600"
                    : "text-olive-900/40 hover:text-olive-900"
                }`}
              >
                {t.navExpert}
                {location.pathname === "/chat" && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-olive-600 rounded-full"
                  />
                )}
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {isAuthReady &&
                (user ? (
                  <div className="flex items-center gap-3">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 group"
                    >
                      <img
                        src={
                          user.photoURL ||
                          `https://ui-avatars.com/api/?name=${user.displayName}`
                        }
                        alt={user.displayName || "User"}
                        className="w-8 h-8 rounded-full border border-olive-200 group-hover:border-olive-500 transition-all"
                      />
                      <div className="hidden xl:block text-left">
                        <div className="text-[10px] font-bold text-olive-900 truncate max-w-[80px]">
                          {user.displayName}
                        </div>
                        <div className="text-[8px] font-bold text-olive-400 uppercase tracking-widest">
                          {userProfile?.reputation || 0} Rep
                        </div>
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
                ))}
              <div className="hidden sm:flex items-center bg-earth-100 rounded-full p-1">
                {(["en", "fr", "tn"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                      lang === l
                        ? "bg-white text-olive-900 shadow-sm"
                        : "text-olive-400 hover:text-olive-900"
                    }`}
                  >
                    {l === "tn" ? "Tounsi" : l}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-olive-900 hover:bg-earth-100 rounded-xl transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
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
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
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
            }
          />
          <Route
            path="/chat"
            element={
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
            }
          />
          <Route path="/market" element={<Market lang={lang} />} />
          <Route
            path="/forum"
            element={
              <Forum
                lang={lang}
                user={user}
                isAuthReady={isAuthReady}
                userProfile={userProfile}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <Profile
                lang={lang}
                user={user}
                isAuthReady={isAuthReady}
                userProfile={userProfile}
              />
            }
          />
        </Routes>
      </main>

      {/* Fixed Chat Button */}
      <Link
        to="/chat"
        className="fixed bottom-8 right-8 w-16 h-16 bg-olive-900 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-olive-800 transition-all hover:scale-110 active:scale-95 z-[9999] group"
      >
        <MessageSquare className="w-8 h-8" />
        <span className="absolute right-full mr-4 px-4 py-2 bg-olive-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {t.navExpert}
        </span>
      </Link>

      {/* Footer */}
      <footer className="bg-earth-100 py-20 border-t border-earth-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-olive-600 rounded-xl flex items-center justify-center text-white">
                  <Leaf className="w-6 h-6" />
                </div>
                <span className="text-2xl font-serif font-bold text-olive-900">
                  Great Farming
                </span>
              </div>
              <p className="text-olive-800/60 max-w-sm leading-relaxed">
                Empowering the next generation of Tunisian farmers with
                data-driven insights and sustainable practices.
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-earth-200">
            <p className="text-xs font-bold text-olive-800/40 uppercase tracking-widest">
              © 2026 Great Farming. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
