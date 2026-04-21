import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Zap, Camera, ArrowRight, TrendingUp, FlaskConical, Plus } from 'lucide-react';
import { FARMING_DATA, FarmingItem, TRANSLATIONS } from '../constants';
import { CategoryIcon, Badge } from '../App';
import { WeatherWidget } from '../components/WeatherWidget';

interface HomeProps {
  lang: 'en' | 'fr' | 'tn';
  activeCategory: FarmingItem['category'] | 'all';
  setActiveCategory: (cat: FarmingItem['category'] | 'all') => void;
  setSelectedItem: (item: FarmingItem | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  uploadInputRef: React.RefObject<HTMLInputElement>;
  setIsChatOpen: (open: boolean) => void;
  setChatMessages: (messages: any) => void;
  searchQuery: string;
  weather: { temp: number, condition: string, location: string, humidity?: number, windSpeed?: number } | null;
}

export default function Home({ 
  lang, 
  activeCategory, 
  setActiveCategory, 
  setSelectedItem, 
  fileInputRef, 
  uploadInputRef,
  setIsChatOpen, 
  setChatMessages,
  searchQuery,
  weather
}: HomeProps) {
  const t = TRANSLATIONS[lang];
  const [calcCategory, setCalcCategory] = React.useState<'trees' | 'fruits' | 'vegetables' | ''>('');
  const [calcSubCrop, setCalcSubCrop] = React.useState<string>('');
  const [calcSize, setCalcSize] = React.useState<string>('');
  const [calcResult, setCalcResult] = React.useState<{ nitrogen: number, phosphorus: number, potassium: number } | null>(null);

  const handleCalculate = () => {
    const size = parseFloat(calcSize);
    if (isNaN(size) || size <= 0 || !calcSubCrop) return;

    let base = { n: 100, p: 40, k: 80 };
    
    // Trees
    if (calcSubCrop === 'treeOlive') base = { n: 100, p: 40, k: 80 };
    if (calcSubCrop === 'treeAlmond') base = { n: 80, p: 30, k: 60 };
    if (calcSubCrop === 'treeCitrus') base = { n: 150, p: 60, k: 120 };
    if (calcSubCrop === 'treePomegranate') base = { n: 90, p: 40, k: 90 };
    if (calcSubCrop === 'treeFig') base = { n: 70, p: 30, k: 80 };
    if (calcSubCrop === 'treeDate') base = { n: 110, p: 50, k: 130 };

    // Fruits
    if (calcSubCrop === 'fruitGrapes') base = { n: 100, p: 50, k: 150 };
    if (calcSubCrop === 'fruitWatermelon') base = { n: 140, p: 60, k: 180 };
    if (calcSubCrop === 'fruitMelon') base = { n: 130, p: 50, k: 160 };
    if (calcSubCrop === 'fruitStrawberry') base = { n: 150, p: 70, k: 200 };
    if (calcSubCrop === 'fruitApricot') base = { n: 110, p: 40, k: 120 };
    if (calcSubCrop === 'fruitPeach') base = { n: 120, p: 50, k: 140 };

    // Vegetables
    if (calcSubCrop === 'vegTomato') base = { n: 180, p: 80, k: 250 };
    if (calcSubCrop === 'vegPepper') base = { n: 160, p: 70, k: 220 };
    if (calcSubCrop === 'vegOnion') base = { n: 140, p: 60, k: 180 };
    if (calcSubCrop === 'vegPotato') base = { n: 150, p: 70, k: 240 };
    if (calcSubCrop === 'vegGarlic') base = { n: 120, p: 50, k: 150 };
    if (calcSubCrop === 'vegArtichoke') base = { n: 130, p: 60, k: 170 };

    setCalcResult({
      nitrogen: base.n * size,
      phosphorus: base.p * size,
      potassium: base.k * size
    });
  };

  const filteredData = FARMING_DATA.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-earth-100 via-white to-earth-50" />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/4 right-0 w-[800px] h-[800px] bg-gradient-to-tr from-olive-600/10 to-olive-200/30 rounded-full blur-[120px] mix-blend-multiply" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/3 -left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-sand-300/10 to-olive-200/20 rounded-full blur-[100px] mix-blend-multiply" 
          />
        </div>
        
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-min gap-4 lg:gap-6 items-start">
            
            {/* Main Greeting Panel (Bento Span 8) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="md:col-span-12 lg:col-span-8 glass-dark p-10 sm:p-16 rounded-[40px] flex flex-col justify-end min-h-[400px] border border-white/5"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-olive-600/20 text-olive-300 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8 w-fit backdrop-blur-md">
                <MapPin className="w-3 h-3" />
                {t.hubLabel}
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-extrabold text-white leading-[1.1] mb-6 tracking-tighter">
                {t.heroTitle.split(' ')[0]} <br />
                <span className="text-sand-300 italic font-mono tracking-tight">{t.heroTitle.split(' ').slice(1).join(' ')}</span>
              </h1>
              <p className="text-lg text-white/50 max-w-xl leading-relaxed text-balance">
                {t.heroSubtitle}
              </p>
            </motion.div>

            {/* Quick Actions Panel (Bento Span 4) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="md:col-span-6 lg:col-span-4 glass rounded-[40px] p-8 min-h-[400px] flex flex-col gap-4 border border-earth-200/50"
            >
              <div className="flex-grow flex flex-col gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex-1 bg-olive-900 text-white rounded-[24px] font-bold text-sm uppercase tracking-widest shadow-xl shadow-olive-900/10 hover:bg-black transition-all flex flex-col items-center justify-center gap-3 group"
                >
                  <Camera className="w-8 h-8 text-sand-300 group-hover:scale-110 transition-transform" />
                  {t.scanPlant}
                </motion.button>

                <div className="flex gap-4 h-24">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => uploadInputRef.current?.click()}
                    className="flex-1 bg-white text-olive-900 rounded-[20px] font-bold border border-earth-200/50 hover:bg-earth-50 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5 text-olive-600" />
                    <span className="text-[10px] uppercase tracking-widest">Upload</span>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const catalog = document.getElementById('catalog');
                      catalog?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex-1 bg-sand-300 text-olive-900 rounded-[20px] font-bold hover:bg-sand-400 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    <span className="text-[10px] uppercase tracking-widest">Demo</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Immersive Image (Bento Span 8) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="md:col-span-12 lg:col-span-8 relative aspect-[21/9] lg:aspect-auto lg:h-[300px] rounded-[40px] overflow-hidden group shadow-[0_16px_40px_-10px_rgba(0,0,0,0.2)]"
            >
              <img 
                src="https://thumbs.dreamstime.com/b/happy-multiracial-farmers-standing-tools-greenhouse-portrait-smiling-multicultural-male-female-290811884.jpg" 
                alt="Happy multiracial farmers standing in greenhouse" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-olive-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-8 flex gap-6">
                 <div>
                  <div className="text-3xl font-serif font-bold text-white">80M+</div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-sand-300">{t.statTrees}</div>
                </div>
                <div>
                  <div className="text-3xl font-serif font-bold text-white">1.2M</div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-sand-300">{t.statFarmers}</div>
                </div>
              </div>
            </motion.div>

            {/* Weather Element (Bento Span 4) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:col-span-6 lg:col-span-4"
            >
              <WeatherWidget weather={weather} lang={lang} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section id="catalog" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
            <div className="max-w-xl">
              <h2 className="text-5xl font-serif font-bold text-olive-900 mb-6 leading-tight">{t.indexTitle}</h2>
              <p className="text-lg text-olive-800/60 leading-relaxed">{t.indexSubtitle}</p>
            </div>
            
            <div className="flex bg-earth-100 p-1.5 rounded-2xl self-start md:self-auto">
              {(['all', 'tool', 'method', 'treatment'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    activeCategory === cat 
                       ? 'bg-white text-olive-900 shadow-xl' 
                      : 'text-olive-900/40 hover:text-olive-900'
                  }`}
                >
                  {cat}s
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            {filteredData.map((item, index) => {
              const isLarge = index % 5 === 0;
              const isMedium = index % 5 === 1 || index % 5 === 2;
              
              const colSpan = isLarge ? 'md:col-span-12 lg:col-span-8' : 'md:col-span-6 lg:col-span-4';
              const aspectRatio = isLarge ? 'aspect-[21/9] lg:aspect-[16/7]' : 'aspect-[4/3]';

              return (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index % 5 * 0.1, duration: 0.7 }}
                  className={`group cursor-pointer flex flex-col ${colSpan}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className={`relative ${aspectRatio} rounded-[32px] overflow-hidden mb-6 shadow-lg group-hover:shadow-[0_20px_40px_-15px_rgba(0,71,255,0.15)] transition-all duration-700 bg-earth-100`}>
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-[1.03]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-olive-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="absolute top-6 left-6">
                      <div className="glass px-4 py-2 rounded-[16px] flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-olive-900 border border-white/50">
                        <CategoryIcon category={item.category} className="w-4 h-4" />
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <div className="px-2 pb-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-3 gap-4">
                      <h3 className={`${isLarge ? 'text-3xl' : 'text-2xl'} font-serif font-extrabold text-olive-900 group-hover:text-olive-600 transition-colors tracking-tight leading-tight`}>{item.title}</h3>
                      <Badge variant={item.difficulty === 'Advanced' ? 'warning' : 'default'} className="shrink-0">{item.difficulty}</Badge>
                    </div>
                    <p className={`text-olive-800/60 ${isLarge ? 'text-base' : 'text-sm'} line-clamp-2 leading-relaxed mt-auto`}>{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Soil & Water Section */}
      <section className="py-32 bg-earth-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-olive-200/30 rounded-full blur-3xl" />
              <h2 className="text-5xl font-serif font-bold text-olive-900 mb-8 leading-tight">{t.soilTitle}</h2>
              <p className="text-lg text-olive-800/60 mb-12 leading-relaxed">{t.soilSubtitle}</p>
              
              <div className="space-y-6">
                {[
                  { title: t.soilClay, desc: t.soilClayDesc, icon: <TrendingUp className="w-5 h-5" /> },
                  { title: t.soilSandy, desc: t.soilSandyDesc, icon: <Zap className="w-5 h-5" /> },
                  { title: t.soilCalc, desc: t.soilCalcDesc, icon: <ArrowRight className="w-5 h-5" /> }
                ].map((soil, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-6 p-6 bg-white rounded-3xl shadow-sm border border-earth-200"
                  >
                    <div className="w-12 h-12 bg-olive-100 rounded-2xl flex items-center justify-center text-olive-600">
                      {soil.icon}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-olive-900">{soil.title}</h4>
                      <p className="text-xs text-olive-400 font-bold uppercase tracking-widest">{soil.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-white p-10 lg:p-16 rounded-[60px] shadow-2xl border border-earth-200 relative">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-500 rounded-3xl flex items-center justify-center text-white shadow-xl rotate-12">
                <FlaskConical className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-olive-900 mb-8">{t.calcTitle}</h3>
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-olive-400 mb-3 block">{t.calcCategory}</label>
                  <select 
                    value={calcCategory}
                    onChange={(e) => {
                      setCalcCategory(e.target.value as any);
                      setCalcSubCrop('');
                      setCalcResult(null);
                    }}
                    className="w-full p-4 bg-earth-50 border-none rounded-2xl text-sm font-bold text-olive-900 focus:ring-2 focus:ring-olive-500"
                  >
                    <option value="">{lang === 'tn' ? 'اختار الصنف' : lang === 'fr' ? 'Choisir la Catégorie' : 'Select Category'}</option>
                    <option value="trees">{t.calcCategoryTrees}</option>
                    <option value="fruits">{t.calcCategoryFruits}</option>
                    <option value="vegetables">{t.calcCategoryVegetables}</option>
                  </select>
                </div>

                <AnimatePresence>
                  {calcCategory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="text-[10px] font-bold uppercase tracking-widest text-olive-400 mb-3 block">{t.calcSubCrop}</label>
                      <select 
                        value={calcSubCrop}
                        onChange={(e) => setCalcSubCrop(e.target.value)}
                        className="w-full p-4 bg-earth-50 border-none rounded-2xl text-sm font-bold text-olive-900 focus:ring-2 focus:ring-olive-500"
                      >
                        <option value="">{lang === 'tn' ? 'اختار النوع' : lang === 'fr' ? 'Choisir le Type' : 'Select Type'}</option>
                        {calcCategory === 'trees' && (
                          <>
                            <option value="treeOlive">{t.treeOlive}</option>
                            <option value="treeAlmond">{t.treeAlmond}</option>
                            <option value="treeCitrus">{t.treeCitrus}</option>
                            <option value="treePomegranate">{t.treePomegranate}</option>
                            <option value="treeFig">{t.treeFig}</option>
                            <option value="treeDate">{t.treeDate}</option>
                          </>
                        )}
                        {calcCategory === 'fruits' && (
                          <>
                            <option value="fruitGrapes">{t.fruitGrapes}</option>
                            <option value="fruitWatermelon">{t.fruitWatermelon}</option>
                            <option value="fruitMelon">{t.fruitMelon}</option>
                            <option value="fruitStrawberry">{t.fruitStrawberry}</option>
                            <option value="fruitApricot">{t.fruitApricot}</option>
                            <option value="fruitPeach">{t.fruitPeach}</option>
                          </>
                        )}
                        {calcCategory === 'vegetables' && (
                          <>
                            <option value="vegTomato">{t.vegTomato}</option>
                            <option value="vegPepper">{t.vegPepper}</option>
                            <option value="vegOnion">{t.vegOnion}</option>
                            <option value="vegPotato">{t.vegPotato}</option>
                            <option value="vegGarlic">{t.vegGarlic}</option>
                            <option value="vegArtichoke">{t.vegArtichoke}</option>
                          </>
                        )}
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-olive-400 mb-3 block">{t.calcSize}</label>
                  <input 
                    type="number" 
                    value={calcSize}
                    onChange={(e) => setCalcSize(e.target.value)}
                    placeholder="e.g. 5" 
                    className="w-full p-4 bg-earth-50 border-none rounded-2xl text-sm font-bold text-olive-900 focus:ring-2 focus:ring-olive-500" 
                  />
                </div>

                <AnimatePresence>
                  {calcResult && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-olive-50 p-6 rounded-3xl border border-olive-100 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-olive-400 uppercase tracking-widest">Nitrogen (N)</span>
                        <span className="text-lg font-serif font-bold text-olive-900">{calcResult.nitrogen} kg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-olive-400 uppercase tracking-widest">Phosphorus (P)</span>
                        <span className="text-lg font-serif font-bold text-olive-900">{calcResult.phosphorus} kg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-olive-400 uppercase tracking-widest">Potassium (K)</span>
                        <span className="text-lg font-serif font-bold text-olive-900">{calcResult.potassium} kg</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCalculate}
                  className="w-full py-5 bg-olive-900 text-white rounded-2xl font-bold shadow-xl shadow-olive-100"
                >
                  {t.calcBtn}
                </motion.button>
                <p className="text-[10px] text-center text-olive-400 font-bold uppercase tracking-widest">{t.calcPowered}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
