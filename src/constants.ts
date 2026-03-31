export interface FarmingItem {
  id: string;
  title: string;
  category: 'tool' | 'method' | 'treatment';
  description: string;
  details: string;
  image: string;
  tags: string[];
  regionFocus?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  season?: string;
  impact: string;
  guideContent?: string;
}

export interface MarketPrice {
  id: string;
  commodity: string;
  price: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: string;
  location: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  location: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  time: string;
}

export const MARKET_PRICES: MarketPrice[] = [
  { id: '1', commodity: 'Extra Virgin Olive Oil', price: '25.500', unit: 'DT/L', trend: 'up', change: '+2.5%', location: 'Sfax' },
  { id: '2', commodity: 'Deglet Nour Dates', price: '8.200', unit: 'DT/Kg', trend: 'stable', change: '0%', location: 'Tozeur' },
  { id: '3', commodity: 'Maltese Oranges', price: '1.800', unit: 'DT/Kg', trend: 'down', change: '-5.2%', location: 'Cap Bon' },
  { id: '4', commodity: 'Durum Wheat', price: '130.000', unit: 'DT/Quintal', trend: 'up', change: '+1.2%', location: 'Béja' },
];

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: '1',
    author: 'Ahmed Ben Salem',
    avatar: 'https://i.pravatar.cc/150?u=ahmed',
    location: 'Béja',
    content: 'The wheat harvest is looking promising this year despite the low rainfall. Modern irrigation made the difference!',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    likes: 24,
    comments: 5,
    time: '2h ago'
  },
  {
    id: '2',
    author: 'Leila Mansour',
    avatar: 'https://i.pravatar.cc/150?u=leila',
    location: 'Sfax',
    content: 'Just finished the mechanical pruning of my olive trees. Much faster than manual labor!',
    likes: 18,
    comments: 2,
    time: '5h ago'
  }
];

export const TRANSLATIONS = {
  en: {
    heroTitle: "Modern Argo Logic",
    heroSubtitle: "Bridging traditional Tunisian heritage with cutting-edge technology.",
    explore: "Explore Catalog",
    consult: "Consult Expert",
    marketPrices: "Market Prices",
    community: "Community",
    weather: "Weather",
    difficulty: "Difficulty",
    impact: "Impact",
    expertOverview: "Expert Overview",
    techImplementation: "Technical Implementation",
    projectedImpact: "Projected Impact",
    expertName: "Argo Expert",
    expertStatus: "System Online",
    chatPlaceholder: "Type your agricultural query...",
    derjaToggle: "Derja",
    frenchToggle: "Français",
    englishToggle: "English",
    marketplace: "Marketplace",
    listItem: "List Item",
    seller: "Seller",
    hubLabel: "Tunisian Agricultural Hub",
    guidedDemo: "Guided Demo",
    scanPlant: "Scan Plant",
    uploadPhoto: "Upload Photo",
    statTrees: "Olive Trees",
    statFarmers: "Farmers",
    statWater: "Water Saved",
    indexTitle: "The Agricultural Innovation Index",
    indexSubtitle: "A specialized database of tools and methods optimized for the unique challenges of the Tunisian climate.",
    soilTitle: "Soil Health & Water Logic",
    soilSubtitle: "Tunisia's diverse soil types—from the fertile North to the arid South—require specific nutrient management and irrigation strategies.",
    soilClay: "Clay-Heavy (North)",
    soilClayDesc: "High water retention, needs aeration.",
    soilSandy: "Sandy (South)",
    soilSandyDesc: "Fast drainage, needs organic matter.",
    soilCalc: "Calcareous (Coastal)",
    soilCalcDesc: "High pH, needs specific fertilization.",
    calcTitle: "Nutrient Calculator",
    calcCategory: "Category",
    calcSubCrop: "Specific Crop",
    calcCategoryTrees: "Trees",
    calcCategoryFruits: "Fruits",
    calcCategoryVegetables: "Vegetables",
    treeOlive: "Olive",
    treeAlmond: "Almond",
    treeCitrus: "Citrus",
    treePomegranate: "Pomegranate",
    treeFig: "Fig",
    treeDate: "Date Palm",
    fruitGrapes: "Grapes",
    fruitWatermelon: "Watermelon",
    fruitMelon: "Melon",
    fruitStrawberry: "Strawberry",
    fruitApricot: "Apricot",
    fruitPeach: "Peach",
    vegTomato: "Tomato",
    vegPepper: "Pepper",
    vegOnion: "Onion",
    vegPotato: "Potato",
    vegGarlic: "Garlic",
    vegArtichoke: "Artichoke",
    calcSize: "Field Size (Hectares)",
    calcBtn: "Calculate Requirements",
    calcPowered: "Powered by Argo AI Logic",
    chartTitle: "Price Volatility Index",
    chartSubtitle: "Last 6 Months (DT/Unit)",
    chartOlive: "Olive Oil",
    chartDates: "Dates",
    realtimeIndex: "Real-time Index",
    likes: "Likes",
    comments: "Comments",
    chatIntro: "Ask about Tunisian soil, modern irrigation, or upload a plant photo for AI diagnosis.",
    scanYourPlant: "Scan Your Plant",
    trySample: "Try Sample Analysis",
    navHome: "Home",
    navMarket: "Market",
    navExpert: "AI Expert",
    navForum: "Forum",
    currentLocation: "Current Location",
    tunis: "Tunis",
    loadingWeather: "Loading weather...",
    forum: "Community Forum",
    forumSubtitle: "Connect with other farmers, share experiences, and get advice.",
    forumCategories: "Categories",
    forumCategoryOlive: "Olive",
    forumCategoryCitrus: "Citrus",
    forumCategoryCereal: "Cereal",
    forumCategoryGeneral: "General",
    forumNewPost: "New Post",
    forumPostTitle: "Title",
    forumPostContent: "Content",
    forumPostCategory: "Category",
    forumPostSubmit: "Post",
    forumComments: "Comments",
    forumCommentPlaceholder: "Add a comment...",
    forumCommentSubmit: "Comment",
    forumReputation: "Reputation",
    forumProfile: "Profile",
    forumMyPosts: "My Posts",
    forumNoPosts: "No posts found in this category.",
    forumLoginRequired: "Please login to participate in the community.",
    forumLoginBtn: "Login with Google"
  },
  fr: {
    heroTitle: "Logique Argo Moderne",
    heroSubtitle: "Relier l'héritage traditionnel tunisien aux technologies de pointe.",
    explore: "Explorer le Catalogue",
    consult: "Consulter l'Expert",
    marketPrices: "Prix du Marché",
    community: "Communauté",
    difficulty: "Difficulté",
    impact: "Impact",
    expertOverview: "Aperçu de l'Expert",
    techImplementation: "Mise en œuvre Technique",
    projectedImpact: "Impact Projeté",
    expertName: "Expert Argo",
    expertStatus: "Système en ligne",
    chatPlaceholder: "Tapez votre requête agricole...",
    derjaToggle: "Derja",
    frenchToggle: "Français",
    englishToggle: "English",
    marketplace: "Marché",
    listItem: "Publier",
    seller: "Vendeur",
    hubLabel: "Pôle Agricole Tunisien",
    guidedDemo: "Démo Guidée",
    scanPlant: "Scanner la Plante",
    uploadPhoto: "Télécharger Photo",
    statTrees: "Oliviers",
    statFarmers: "Agriculteurs",
    statWater: "Eau Économisée",
    indexTitle: "L'Indice d'Innovation Agricole",
    indexSubtitle: "Une base de données spécialisée d'outils et de méthodes optimisés pour les défis uniques du climat tunisien.",
    soilTitle: "Santé du Sol & Logique de l'Eau",
    soilSubtitle: "Les divers types de sols de la Tunisie—du Nord fertile au Sud aride—nécessitent des stratégies spécifiques de gestion des nutriments et d'irrigation.",
    soilClay: "Argileux (Nord)",
    soilClayDesc: "Forte rétention d'eau, nécessite une aération.",
    soilSandy: "Sableux (Sud)",
    soilSandyDesc: "Drainage rapide, nécessite de la matière organique.",
    soilCalc: "Calcaire (Côtier)",
    soilCalcDesc: "pH élevé, nécessite une fertilisation spécifique.",
    calcTitle: "Calculateur de Nutriments",
    calcCategory: "Catégorie",
    calcSubCrop: "Culture Spécifique",
    calcCategoryTrees: "Arbres",
    calcCategoryFruits: "Fruits",
    calcCategoryVegetables: "Légumes",
    treeOlive: "Olivier",
    treeAlmond: "Amandier",
    treeCitrus: "Agrumes",
    treePomegranate: "Grenadier",
    treeFig: "Figuier",
    treeDate: "Palmier Dattier",
    fruitGrapes: "Raisins",
    fruitWatermelon: "Pastèque",
    fruitMelon: "Melon",
    fruitStrawberry: "Fraise",
    fruitApricot: "Abricot",
    fruitPeach: "Pêche",
    vegTomato: "Tomate",
    vegPepper: "Poivron",
    vegOnion: "Oignon",
    vegPotato: "Pomme de terre",
    vegGarlic: "Ail",
    vegArtichoke: "Artichaut",
    calcSize: "Taille du Champ (Hectares)",
    calcBtn: "Calculer les Besoins",
    calcPowered: "Propulsé par Argo AI Logic",
    chartTitle: "Indice de Volatilité des Prix",
    chartSubtitle: "Derniers 6 Mois (DT/Unité)",
    chartOlive: "Huile d'Olive",
    chartDates: "Dattes",
    realtimeIndex: "Indice en Temps Réel",
    likes: "J'aime",
    comments: "Commentaires",
    chatIntro: "Posez des questions sur le sol tunisien, l'irrigation moderne ou téléchargez une photo de plante pour un diagnostic IA.",
    scanYourPlant: "Scanner Votre Plante",
    trySample: "Essayer une Analyse Type",
    navHome: "Accueil",
    navMarket: "Marché",
    navExpert: "Expert IA",
    navForum: "Forum",
    currentLocation: "Position Actuelle",
    tunis: "Tunis",
    loadingWeather: "Chargement météo...",
    forum: "Forum Communautaire",
    forumSubtitle: "Connectez-vous avec d'autres agriculteurs, partagez vos expériences et obtenez des conseils.",
    forumCategories: "Catégories",
    forumCategoryOlive: "Olive",
    forumCategoryCitrus: "Agrumes",
    forumCategoryCereal: "Céréales",
    forumCategoryGeneral: "Général",
    forumNewPost: "Nouveau Post",
    forumPostTitle: "Titre",
    forumPostContent: "Contenu",
    forumPostCategory: "Catégorie",
    forumPostSubmit: "Publier",
    forumComments: "Commentaires",
    forumCommentPlaceholder: "Ajouter un commentaire...",
    forumCommentSubmit: "Commenter",
    forumReputation: "Réputation",
    forumProfile: "Profil",
    forumMyPosts: "Mes Posts",
    forumNoPosts: "Aucun post trouvé dans cette catégorie.",
    forumLoginRequired: "Veuillez vous connecter pour participer à la communauté.",
    forumLoginBtn: "Se connecter avec Google"
  },
  tn: {
    heroTitle: "الفلاحة العصرية",
    heroSubtitle: "نربطو بين تقاليدنا التونسية و أحدث التكنولوجيات.",
    explore: "شوف الكتالوج",
    consult: "اسأل الخبير",
    marketPrices: "أسوام السوق",
    community: "اللمة",
    difficulty: "الصعوبة",
    impact: "المنفعة",
    expertOverview: "نصيحة الخبير",
    techImplementation: "كيفاش تطبقها",
    projectedImpact: "النتيجة المتوقعة",
    expertName: "خبير الفلاحة",
    expertStatus: "الخبير موجود",
    chatPlaceholder: "اسأل أي حاجة على الفلاحة...",
    derjaToggle: "تونسي",
    frenchToggle: "Français",
    englishToggle: "English",
    marketplace: "السوق",
    listItem: "بيع حاجة",
    seller: "البائع",
    hubLabel: "مركز الفلاحة التونسي",
    guidedDemo: "تجربة البرنامج",
    scanPlant: "صور النبتة",
    uploadPhoto: "حمل صورة",
    statTrees: "زيتونة",
    statFarmers: "فلاح",
    statWater: "ماء مقتصد",
    indexTitle: "دليل الابتكار الفلاحي",
    indexSubtitle: "قاعدة بيانات متخصصة في الأدوات والطرق المناسبة للمناخ التونسي.",
    soilTitle: "صحة التربة و تسيير الماء",
    soilSubtitle: "أنواع التربة في تونس مختلفة، من الشمال للجنوب، وكل وحدة لازمها طريقة خاصة في التسميد والري.",
    soilClay: "تربة طينية (الشمال)",
    soilClayDesc: "تشد الماء برشا، لازمها تهوية.",
    soilSandy: "تربة رملية (الجنوب)",
    soilSandyDesc: "تضيع الماء فيسع، لازمها غبار.",
    soilCalc: "تربة كلسية (الساحل)",
    soilCalcDesc: "فيها برشا كلس، لازمها دواء خاص.",
    calcTitle: "حساب الأسمدة",
    calcCategory: "الصنف",
    calcSubCrop: "النوع بالضبط",
    calcCategoryTrees: "أشجار",
    calcCategoryFruits: "غلال",
    calcCategoryVegetables: "خضرة",
    treeOlive: "زيتون",
    treeAlmond: "لوز",
    treeCitrus: "قوارص",
    treePomegranate: "رمان",
    treeFig: "كرموس",
    treeDate: "دقلة",
    fruitGrapes: "عنب",
    fruitWatermelon: "دلاع",
    fruitMelon: "بطيخ",
    fruitStrawberry: "فراولة",
    fruitApricot: "مشمش",
    fruitPeach: "خوخ",
    vegTomato: "طماطم",
    vegPepper: "فلفل",
    vegOnion: "بصل",
    vegPotato: "بطاطا",
    vegGarlic: "ثوم",
    vegArtichoke: "ڨنارية",
    calcSize: "مساحة الأرض (هكتار)",
    calcBtn: "احسب قداش لازم",
    calcPowered: "بقدرة الذكاء الاصطناعي",
    chartTitle: "مؤشر تبدل الأسوام",
    chartSubtitle: "آخر 6 شهور (دينار)",
    chartOlive: "زيت زيتونة",
    chartDates: "دقلة",
    realtimeIndex: "الأسوام توة",
    likes: "إعجاب",
    comments: "تعليق",
    chatIntro: "اسأل على التربة، الري، ولا صور نبتة مريضة باش الخبير يشخصها.",
    scanYourPlant: "صور نبتتك",
    trySample: "جرب مثال",
    navHome: "الرئيسية",
    navMarket: "السوق",
    navExpert: "خبير الذكاء الاصطناعي",
    navForum: "اللمة",
    currentLocation: "موقعك الحالي",
    tunis: "تونس",
    loadingWeather: "قاعدين نشوفو في الطقس...",
    forum: "لمة الفلاحة",
    forumSubtitle: "تواصل مع فلاحين آخرين، شارك تجاربك و خوذ نصايح.",
    forumCategories: "الأصناف",
    forumCategoryOlive: "زيتون",
    forumCategoryCitrus: "قوارص",
    forumCategoryCereal: "حبوب",
    forumCategoryGeneral: "عام",
    forumNewPost: "موضوع جديد",
    forumPostTitle: "العنوان",
    forumPostContent: "الموضوع",
    forumPostCategory: "الصنف",
    forumPostSubmit: "نشر",
    forumComments: "تعاليق",
    forumCommentPlaceholder: "أكتب تعليق...",
    forumCommentSubmit: "تعليق",
    forumReputation: "السمعة",
    forumProfile: "الملف الشخصي",
    forumMyPosts: "مواضيعي",
    forumNoPosts: "ما فما حتى موضوع في الصنف هذا.",
    forumLoginRequired: "لازمك تسجل دخولك باش تشارك في اللمة.",
    forumLoginBtn: "دخول بـ Google"
  }
};

export const FARMING_DATA: FarmingItem[] = [
  {
    id: 'olive-pruning-modern',
    title: 'Precision Olive Pruning',
    category: 'method',
    description: 'Modern mechanical pruning techniques for Tunisian olive groves to maximize yield and tree health.',
    details: 'Using specialized mechanical pruners and pneumatic tools reduces labor costs and ensures cleaner cuts, which are vital for preventing diseases like Verticillium wilt in Sfax and Sahel regions. Proper pruning increases sunlight penetration and airflow, significantly reducing the risk of fungal infections.',
    image: 'https://images.squarespace-cdn.com/content/v1/63e7e1dd7bda54190b4e2d9b/5509a94a-5982-4b48-b366-d89c2331d4ad/Pruning+and+Training.jpeg',
    tags: ['Olive', 'Pruning', 'Sfax', 'Sahel'],
    regionFocus: 'Tunisia (Central & Coastal)',
    difficulty: 'Intermediate',
    season: 'Winter (Dec - Feb)',
    impact: 'Increases yield by up to 30% and extends tree lifespan.',
    guideContent: `TECHNICAL GUIDE: PRECISION OLIVE PRUNING
==========================================

1. Timing: Prune during the dormant season (December to February).
2. Tools: Use sterilized mechanical pruners and pneumatic tools.
3. Technique: 
   - Remove dead or diseased wood first.
   - Open the center of the canopy for light penetration.
   - Maintain a balanced structure to support fruit load.
4. Post-Pruning: Apply copper-based fungicide to large cuts to prevent infection.`
  },
  {
    id: 'smart-irrigation-iot',
    title: 'IoT-Based Smart Irrigation',
    category: 'tool',
    description: 'Sensor-driven drip irrigation systems optimized for water-scarce regions.',
    details: 'Soil moisture sensors and weather data integration allow farmers to provide the exact amount of water needed. This is crucial for Cap Bon citrus farms and Deglet Nour palms in Tozeur. The system can be monitored via smartphone, providing real-time alerts on water usage and soil health.',
    image: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&q=80&w=800',
    tags: ['Irrigation', 'IoT', 'Water Saving', 'Citrus'],
    regionFocus: 'Tunisia (National)',
    difficulty: 'Advanced',
    impact: 'Reduces water consumption by 40-60% while maintaining optimal growth.',
    guideContent: `TECHNICAL GUIDE: SMART IRRIGATION IOT
=======================================

1. Sensor Placement: Install soil moisture sensors at 20cm and 40cm depths.
2. Calibration: Calibrate sensors based on soil type (Clay vs Sandy).
3. Automation: Set thresholds for automatic watering based on real-time data.
4. Maintenance: Regularly check drip lines for clogs and sensors for battery life.`
  },
  {
    id: 'organic-pest-control',
    title: 'Biological Pest Management',
    category: 'treatment',
    description: 'Natural "medications" and predators to control common Mediterranean pests.',
    details: 'Utilizing beneficial insects and pheromone traps to combat the Mediterranean fruit fly (Ceratitis capitata) without harsh chemicals, preserving soil quality and export value. This method aligns with international organic standards, opening new markets for Tunisian produce.',
    image: 'https://lgpress.clemson.edu/wp-content/uploads/sites/3/2021/05/ipm-bio-feature.jpg',
    tags: ['Organic', 'Pest Control', 'Sustainability'],
    regionFocus: 'Mediterranean Basin',
    difficulty: 'Intermediate',
    season: 'Spring/Summer',
    impact: 'Eliminates chemical residue and protects local biodiversity.',
    guideContent: `TECHNICAL GUIDE: BIOLOGICAL PEST MANAGEMENT
============================================

1. Monitoring: Use pheromone traps to track pest populations.
2. Beneficials: Release specific predators (e.g., ladybugs) early in the season.
3. Cultural Practices: Remove fallen fruit to break pest life cycles.
4. Organic Sprays: Use neem oil or soap-based sprays only when necessary.`
  },
  {
    id: 'drone-crop-monitoring',
    title: 'Agricultural Drones',
    category: 'tool',
    description: 'Multispectral imaging for early detection of plant stress and nutrient deficiency.',
    details: 'Drones can map large cereal fields in the North (Béja, Jendouba) to identify areas needing specific fertilization or treatment before the whole crop is affected. NDVI (Normalized Difference Vegetation Index) mapping provides a precise health check for every square meter of the field.',
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800',
    tags: ['Drones', 'Technology', 'Cereals', 'Béja'],
    regionFocus: 'Tunisia (North)',
    difficulty: 'Advanced',
    impact: 'Reduces fertilizer waste by 20% and prevents large-scale crop loss.',
    guideContent: `TECHNICAL GUIDE: AGRICULTURAL DRONES
======================================

1. Flight Planning: Map the field boundaries and set flight altitude.
2. Imaging: Use multispectral cameras for NDVI mapping.
3. Analysis: Identify stress zones using specialized software.
4. Action: Apply targeted fertilization based on the generated maps.`
  },
  {
    id: 'hydroponic-fodder',
    title: 'Hydroponic Green Fodder',
    category: 'method',
    description: 'Growing livestock feed in controlled environments with 90% less water.',
    details: 'A vital solution for Tunisian livestock farmers during drought periods, providing fresh barley sprouts year-round regardless of rainfall. 1kg of seeds can produce up to 7kg of fresh green fodder in just 7 days, using minimal space and water.',
    image: 'https://www.hydroponicsafrica.org/wp-content/uploads/2020/10/Fooder.jpg',
    tags: ['Hydroponics', 'Livestock', 'Drought Resilience'],
    regionFocus: 'Arid Regions',
    difficulty: 'Intermediate',
    season: 'Year-round',
    impact: 'Ensures food security for livestock during severe droughts.',
    guideContent: `TECHNICAL GUIDE: HYDROPONIC GREEN FODDER
==========================================

1. Seed Preparation: Clean and soak barley seeds for 12 hours.
2. Trays: Spread seeds evenly in hydroponic trays.
3. Environment: Maintain temperature at 18-22°C and high humidity.
4. Harvesting: Harvest on day 7 when sprouts are 15-20cm tall.`
  },
  {
    id: 'copper-fungicide-olive',
    title: 'Modern Copper Formulations',
    category: 'treatment',
    description: 'Advanced fungicides for "Peacock Spot" in olive trees.',
    details: 'Newer liquid copper formulations provide better coverage and rainfastness, essential for protecting Tunisian olive groves during the humid autumn months. These formulations are designed to be effective at lower concentrations, reducing copper accumulation in the soil.',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800',
    tags: ['Fungicide', 'Olive', 'Disease Control'],
    regionFocus: 'Coastal Tunisia',
    difficulty: 'Beginner',
    season: 'Autumn (Oct - Nov)',
    impact: 'Prevents defoliation and ensures consistent annual production.',
    guideContent: `TECHNICAL GUIDE: MODERN COPPER FORMULATIONS
=============================================

1. Mixing: Follow manufacturer instructions for dilution.
2. Application: Spray thoroughly, covering both sides of the leaves.
3. Timing: Apply after harvest and before heavy autumn rains.
4. Safety: Wear protective gear and avoid spraying during high winds.`
  }
];


