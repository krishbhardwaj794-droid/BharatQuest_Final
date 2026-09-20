var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// scripts/generate_seed_sql.ts
var fs = __toESM(require("fs"), 1);
var path = __toESM(require("path"), 1);

// src/data/quests.ts
var questsData = [
  {
    id: "ancient-india-01",
    displayTitle: "Ancient India",
    subtitle: "The Lost Artifact \xB7 Mission 01",
    description: "Journey back to the dawn of civilization. Unravel mysteries of the Indus Valley, Vedic age, and mighty empires through archaeological clues.",
    difficulty: "Easy",
    estimatedTime: "~5 min",
    xpReward: "+250 XP Max",
    requiredLevel: 1,
    status: "active",
    icon: "\u{1F3FA}",
    badgeId: "heritage-explorer",
    badgeName: "Heritage Explorer",
    tags: ["Indus Valley", "Archeology", "Harappa"]
  },
  {
    id: "explore-india-02",
    displayTitle: "Explore India \u2014 Level 2",
    subtitle: "Rivers and Landscapes",
    description: "Traverse India\u2019s legendary geography \u2014 from Himalayan passes to Indus tributaries, Deccan plateaus, and sacred river basins.",
    difficulty: "Intermediate",
    estimatedTime: "10 min",
    xpReward: "+75 XP",
    requiredLevel: 4,
    status: "locked",
    icon: "\u{1F5FA}\uFE0F",
    badgeId: "river-navigator",
    badgeName: "River Navigator",
    tags: ["Geography", "Rivers", "Himalayas"]
  },
  {
    id: "culture-traditions-03",
    displayTitle: "Culture & Traditions",
    subtitle: "Classical Arts & Heritage",
    description: "Discover the vibrant tapestry of Indian festivals, classical dance forms, musical heritages, and timeless artistic traditions across 28 states.",
    difficulty: "Medium",
    estimatedTime: "15 min",
    xpReward: "+100 XP",
    requiredLevel: 5,
    status: "coming",
    icon: "\u{1F3AD}",
    badgeId: "quest-warrior",
    badgeName: "Quest Warrior",
    tags: ["Festivals", "Architecture", "Arts"]
  },
  {
    id: "freedom-movement-04",
    displayTitle: "Freedom Movement",
    subtitle: "The Struggle for Swaraj",
    description: "Walk alongside freedom fighters. Relive the landmark movements, sacrifices, and unity that birthed a modern sovereign republic.",
    difficulty: "Advanced",
    estimatedTime: "15 min",
    xpReward: "+150 XP",
    requiredLevel: 6,
    status: "coming",
    icon: "\u{1F1EE}\u{1F1F3}",
    badgeId: "star-scholar",
    badgeName: "Star Scholar",
    tags: ["Independence", "Modern History", "Leaders"]
  }
];

// src/data/questions/ancientIndia.ts
var ancientIndiaQuestionBank = [
  {
    id: "ai_001",
    topic: "Ancient India",
    title: "Identify the Civilization",
    question: "This artifact is associated with which ancient civilization?",
    sub: "Inspect the terracotta seal markings and ancient wheel motifs.",
    clue: "Clue: Look closely at baked terracotta pottery, standardized bricks, and animal seal motifs.",
    options: ["Indus Valley Civilization", "Mauryan Empire", "Gupta Empire", "Chola Dynasty"],
    correctAnswer: "Indus Valley Civilization",
    hint: "Flourished along the Indus river system and its tributaries around 2600\u20131900 BCE.",
    fact: "The Indus Valley Civilization pioneered urban sanitation, standardized weights, and baked-brick grid cities.",
    difficulty: "Easy"
  },
  {
    id: "ai_002",
    topic: "Ancient India",
    title: "Major Urban Centre",
    question: "Which city was one of the first excavated major urban centres of the Indus Valley Civilization?",
    sub: "Inspect the planned grid brickwork and fortified citadels.",
    clue: "Clue: Located in Punjab, this city gave its name to the entire archaeological culture upon discovery in the 1920s.",
    options: ["Harappa", "Pataliputra", "Madurai", "Ujjain"],
    correctAnswer: "Harappa",
    hint: "Excavated in the 1920s by Daya Ram Sahni in Punjab (now Pakistan).",
    fact: "Harappa featured a massive fortified citadel, granaries, worker quarters, and standardized burnt-brick architecture.",
    difficulty: "Easy"
  },
  {
    id: "ai_003",
    topic: "Ancient India",
    title: "Town Planning & Sanitation",
    question: "Which feature is strongly associated with the urban planning of the Indus Valley Civilization?",
    sub: "Notice the terracotta pipe conduits and hydraulic engineering.",
    clue: "Clue: The settlements possessed an underground municipal engineering marvel unseen elsewhere in the ancient world.",
    options: ["Advanced drainage systems", "Large stone temples", "Rock-cut caves", "Massive iron fortresses"],
    correctAnswer: "Advanced drainage systems",
    hint: "Renowned for covered masonry street gutters, inspection traps, and household soak pits.",
    fact: "Harappan engineers constructed covered masonry drains beneath paved streets with household soak pits\u2014centuries ahead of their time.",
    difficulty: "Easy"
  },
  {
    id: "ai_004",
    topic: "Ancient India",
    title: "Ancient Inscriptions & Seals",
    question: "Which writing system is associated with the Indus Valley Civilization?",
    sub: "Examine the unread pictograms engraved alongside animal motifs.",
    clue: "Clue: Thousands of steatite seals feature this enigmatic pictographic script, which remains undeciphered today.",
    options: ["Indus script", "Brahmi", "Devanagari", "Persian"],
    correctAnswer: "Indus script",
    hint: "This enigmatic pictographic writing system found on seals and terracotta tablets remains undeciphered to this day.",
    fact: "The Indus script consists of over 400 unique signs, written primarily from right to left on seals, amulets, and copper tablets.",
    difficulty: "Medium"
  },
  {
    id: "ai_005",
    topic: "Ancient India",
    title: "Monumental Archaeological Site",
    question: "Which of the following is an important UNESCO World Heritage archaeological site of the Indus Valley Civilization in Gujarat?",
    sub: "Study the stone-masonry reservoirs and giant stepped water storage.",
    clue: "Clue: Located in Gujarat's Rann of Kutch, this site features a colossal rainwater harvesting cascade.",
    options: ["Dholavira", "Nalanda", "Sanchi", "Ajanta"],
    correctAnswer: "Dholavira",
    hint: "Located in the Rann of Kutch, Gujarat, famous for 16 giant rock-cut reservoirs.",
    fact: "Dholavira is celebrated for its extraordinary stone architecture and a sophisticated water conservation network.",
    difficulty: "Easy"
  },
  {
    id: "ai_006",
    topic: "Ancient India",
    title: "The Great Bath",
    question: "At which Indus Valley city was the famous 'Great Bath' discovered?",
    sub: "Examine the water-tight bitumen lined public hydraulic structure.",
    clue: "Clue: This metropolis on the right bank of the Indus River also revealed the famous 'Priest-King' sculpture.",
    options: ["Mohenjo-daro", "Kalibangan", "Banawali", "Ropar"],
    correctAnswer: "Mohenjo-daro",
    hint: "Located in Sindh, Pakistan, its name translates to 'Mound of the Dead'.",
    fact: "The Great Bath was made watertight by fitting finely fitted bricks with gypsum plaster and a layer of natural bitumen (tar).",
    difficulty: "Medium"
  },
  {
    id: "ai_007",
    topic: "Ancient India",
    title: "Ancient Maritime Port",
    question: "Which Indus Valley site is internationally famous for possessing a tidal dockyard connected to the Arabian Sea?",
    sub: "Trace the ancient maritime trade routes across the Gulf of Khambhat.",
    clue: "Clue: Located in the Bhal region of Gujarat, this port was a hub for bead-making and gemstone export.",
    options: ["Lothal", "Alamgirpur", "Manda", "Chanhudaro"],
    correctAnswer: "Lothal",
    hint: "Located in Gujarat, it possessed a massive brick basin engineered to receive ships at high tide.",
    fact: "Lothal's dockyard is considered the world's earliest known engineered tidal dock, connecting Harappan trade to Mesopotamia.",
    difficulty: "Medium"
  },
  {
    id: "ai_008",
    topic: "Ancient India",
    title: "Earliest Ploughed Field",
    question: "At which Harappan site was archaeological evidence of the world's earliest ploughed agricultural field discovered?",
    sub: "Analyze the criss-cross furrows indicating double cropping.",
    clue: "Clue: Located on the banks of the Ghaggar River in Hanumangarh district, Rajasthan.",
    options: ["Kalibangan", "Daimabad", "Kot Diji", "Amri"],
    correctAnswer: "Kalibangan",
    hint: "The name means 'black bangles', referring to the terracotta bangles found scattered in the soil.",
    fact: "Excavations at Kalibangan uncovered a grid of ploughed furrows from 2800 BCE, indicating two different crops grown simultaneously.",
    difficulty: "Hard"
  },
  {
    id: "ai_009",
    topic: "Ancient India",
    title: "Largest Harappan Site in India",
    question: "Which site in Haryana is recognized as one of the largest settlements of the Indus Valley Civilization?",
    sub: "Study the sprawling mounds spanning over 350 hectares in Hisar district.",
    clue: "Clue: Recent excavations here have uncovered massive residential clusters, cemeteries, and drainage networks.",
    options: ["Rakhigarhi", "Hastinapur", "Indraprastha", "Kurukshetra"],
    correctAnswer: "Rakhigarhi",
    hint: "Located in the Ghaggar-Hakra river plain in Haryana.",
    fact: "Rakhigarhi spans over 350 hectares, making it one of the largest Harappan urban centres discovered in South Asia.",
    difficulty: "Medium"
  },
  {
    id: "ai_010",
    topic: "Ancient India",
    title: "Metallurgical Masterpiece",
    question: "The iconic bronze figurine of the 'Dancing Girl' was cast using which ancient metallurgical technique?",
    sub: "Examine the lost-wax bronze casting technique that flourished 4,500 years ago.",
    clue: "Clue: This cire-perdue method used beeswax models encased in clay before molten metal was poured in.",
    options: ["Lost-wax casting (Cire-perdue)", "Sand casting", "Hammered sheet repouss\xE9", "Die punching"],
    correctAnswer: "Lost-wax casting (Cire-perdue)",
    hint: "The process involves sculpting wax, coating it in clay, melting the wax out, and pouring liquid bronze.",
    fact: "The 10.5 cm bronze Dancing Girl from Mohenjo-daro showcases mastery of the lost-wax casting technique circa 2300 BCE.",
    difficulty: "Hard"
  },
  {
    id: "ai_011",
    topic: "Ancient India",
    title: "Standardized Brick Dimensions",
    question: "What was the standardized mathematical ratio of thickness, width, and length used for Harappan burnt bricks?",
    sub: "Notice the modular proportions used uniformly across thousands of miles.",
    clue: "Clue: The bricks followed a strict geometric proportion of 1 : 2 : 4.",
    options: ["1 : 2 : 4", "1 : 3 : 5", "2 : 3 : 6", "1 : 1 : 2"],
    correctAnswer: "1 : 2 : 4",
    hint: "The length was four times the thickness, and the width was twice the thickness.",
    fact: "Harappan baked bricks uniformly maintained a 1 : 2 : 4 ratio across cities from Gujarat to Punjab, showing unprecedented civic standardization.",
    difficulty: "Hard"
  },
  {
    id: "ai_012",
    topic: "Ancient India",
    title: "Pashupati Seal Motif",
    question: "The famous 'Pashupati Seal' from Mohenjo-daro depicts a seated horned figure surrounded by which four animals?",
    sub: "Inspect the engraved wildlife surrounding the seated yogic deity.",
    clue: "Clue: The four animals depicted around the central figure include an elephant, a tiger, a rhinoceros, and a buffalo.",
    options: ["Elephant, Tiger, Rhinoceros, and Buffalo", "Lion, Horse, Bull, and Camel", "Cow, Goat, Deer, and Leopard", "Peacock, Snake, Monkey, and Bear"],
    correctAnswer: "Elephant, Tiger, Rhinoceros, and Buffalo",
    hint: "Two deers or ibexes are also depicted beneath the stool/throne.",
    fact: "The Pashupati Seal is considered by many historians as an early proto-Shiva representation, flanked by four iconic animals.",
    difficulty: "Hard"
  },
  {
    id: "ai_013",
    topic: "Ancient India",
    title: "Mesopotamian Trade Records",
    question: "In ancient Sumerian and Akkadian cuneiform inscriptions, which name is believed to refer to the Indus Valley region?",
    sub: "Trace maritime trade documents mentioning carnelian, lapis lazuli, and timber.",
    clue: "Clue: Mesopotamian King Sargon of Akkad boasted that ships from this land docked at his quays.",
    options: ["Meluhha", "Dilmun", "Magan", "Elam"],
    correctAnswer: "Meluhha",
    hint: "Dilmun was Bahrain, Magan was Oman, and this third land was the Indus realm.",
    fact: "Mesopotamian tablets refer to 'Meluhha' as an eastern seafaring land that exported carnelian beads, ivory combs, and timber.",
    difficulty: "Hard"
  },
  {
    id: "ai_014",
    topic: "Ancient India",
    title: "Pre-Harappan Agricultural Roots",
    question: "Which archaeological site in Balochistan shows the earliest evidence of settled agriculture and cattle herding in South Asia (circa 7000 BCE)?",
    sub: "Examine the Neolithic mud-brick granaries and early wheat cultivation.",
    clue: "Clue: Located near the Bolan Pass, this site bridges the Stone Age to the Bronze Age.",
    options: ["Mehrgarh", "Bhirrana", "Burzahom", "Koldihwa"],
    correctAnswer: "Mehrgarh",
    hint: "Located on the Kachi plain near the Bolan Pass.",
    fact: "Mehrgarh provides unbroken evidence of early wheat farming, barley cultivation, and zebu cattle domestication starting around 7000 BCE.",
    difficulty: "Medium"
  },
  {
    id: "ai_015",
    topic: "Ancient India",
    title: "Ancient Bead Workshop",
    question: "Which small Harappan city was an exclusively specialized industrial centre for bead making, shell cutting, and seal carving without a citadel?",
    sub: "Notice the stone drills and furnace kilns for glazing carnelian.",
    clue: "Clue: Located 130 km south of Mohenjo-daro in Sindh.",
    options: ["Chanhudaro", "Desalpur", "Kot Diji", "Rojdi"],
    correctAnswer: "Chanhudaro",
    hint: "Unlike other Harappan towns, it had no fortified upper citadel.",
    fact: "Chanhudaro was an industrial hub with specialized copper tools and furnaces used to craft microscopic steatite and carnelian beads.",
    difficulty: "Hard"
  },
  {
    id: "ai_016",
    topic: "Ancient India",
    title: "Standardized Measurement System",
    question: "The weights used by Harappan merchants for weighing precious commodities were made predominantly of which fine stone?",
    sub: "Inspect the polished cubic weights with precisely calibrated binary increments.",
    clue: "Clue: A hard, fine-grained sedimentary rock, often banded and silica-rich.",
    options: ["Chert", "Sandstone", "Granite", "Limestone"],
    correctAnswer: "Chert",
    hint: "Quarried primarily from the Rohri Hills in Sindh.",
    fact: "Harappan chert weights were calibrated to a binary system (1, 2, 4, 8, 16, 32) at lower levels and decimal at higher levels.",
    difficulty: "Medium"
  },
  {
    id: "ai_017",
    topic: "Ancient India",
    title: "Northernmost Frontier Post",
    question: "Which Harappan trading post was established in northern Afghanistan to control trade in lapis lazuli gemstones?",
    sub: "Trace the Oxus (Amu Darya) river trading route to Central Asia.",
    clue: "Clue: Located near the Kokcha river valley, famed for deep blue lapis lazuli mines.",
    options: ["Shortugai", "Mundigak", "Altyn Depe", "Sarazm"],
    correctAnswer: "Shortugai",
    hint: "An isolated Harappan settlement far to the north on the Amu Darya.",
    fact: "Shortugai was founded directly adjacent to the Badakhshan lapis lazuli mines, complete with typical Harappan pottery and seals.",
    difficulty: "Hard"
  },
  {
    id: "ai_018",
    topic: "Ancient India",
    title: "The Great Granary",
    question: "The 'Great Granary' complex, consisting of twelve circular brick platforms arranged in two rows, was excavated at which site?",
    sub: "Observe the raised air ducts beneath the storage rooms to prevent grain rot.",
    clue: "Clue: Located on the banks of the Ravi River in Punjab.",
    options: ["Harappa", "Kalibangan", "Sutkagan Dor", "Banawali"],
    correctAnswer: "Harappa",
    hint: "This city was situated on the left bank of the Ravi river.",
    fact: "The granaries at Harappa were built on raised brick platforms with ventilation chambers to protect stored wheat and barley from moisture.",
    difficulty: "Medium"
  },
  {
    id: "ai_019",
    topic: "Ancient India",
    title: "National Emblem Capital",
    question: "The Lion Capital, which forms the National Emblem of India, was erected by Emperor Ashoka at which sacred site?",
    sub: "Notice the four Asiatic lions standing back to back above the Ashoka Chakra.",
    clue: "Clue: The site where Gautama Buddha delivered his first sermon (Dhammacakkappavattana Sutta).",
    options: ["Sarnath", "Bodh Gaya", "Kushinagar", "Lumbini"],
    correctAnswer: "Sarnath",
    hint: "Located near Varanasi, Uttar Pradesh, where the first turning of the Wheel of Dharma occurred.",
    fact: "Ashoka's Lion Capital at Sarnath features four lions atop an abacus with a bull, horse, lion, and elephant separated by 24-spoke Dharmachakras.",
    difficulty: "Easy"
  },
  {
    id: "ai_020",
    topic: "Ancient India",
    title: "Ancient University of Taxila",
    question: "Which ancient centre of higher learning, located in the Gandhara region, educated Chanakya (Kautilya) and Chandragupta Maurya?",
    sub: "Examine the renowned university that attracted scholars from across Asia in medicine, military arts, and philosophy.",
    clue: "Clue: UNESCO World Heritage site situated in modern-day Rawalpindi district, Pakistan.",
    options: ["Takshashila (Taxila)", "Nalanda", "Vikramashila", "Valabhi"],
    correctAnswer: "Takshashila (Taxila)",
    hint: "It flourished centuries before Nalanda and was visited by Alexander the Great.",
    fact: "Takshashila was an ancient learning hub where Panini compiled his Sanskrit grammar and Charaka advanced Ayurvedic medicine.",
    difficulty: "Medium"
  },
  {
    id: "ai_021",
    topic: "Ancient India",
    title: "Earliest Rock-Cut Caves",
    question: "The Barabar Hill Caves in Bihar, the oldest surviving rock-cut caves in India, were commissioned during which empire?",
    sub: "Study the mirror-like polished granite surfaces and bow-shaped roofs.",
    clue: "Clue: Commissioned by Emperor Ashoka and his grandson Dasharatha for the Ajivika ascetics.",
    options: ["Mauryan Empire", "Gupta Empire", "Satavahana Empire", "Kushan Empire"],
    correctAnswer: "Mauryan Empire",
    hint: "Commissioned in the 3rd century BCE by Ashoka the Great.",
    fact: "The Barabar Caves feature exquisite Mauryan glass-like wall polish (Mauryan polish) on hard granite bedrock.",
    difficulty: "Hard"
  },
  {
    id: "ai_022",
    topic: "Ancient India",
    title: "Ancient Water Storage in Arid Lands",
    question: "Which westernmost coastal Indus Valley outpost stood on the Makran coast near the Iranian border to monitor sea trade?",
    sub: "Analyze the fortified stone citadel built to safeguard maritime traders.",
    clue: "Clue: Located on the Dasht River near the Arabian Sea.",
    options: ["Sutkagan Dor", "Dholavira", "Manda", "Balakot"],
    correctAnswer: "Sutkagan Dor",
    hint: "The westernmost recognized boundary post of the Harappan civilization.",
    fact: "Sutkagan Dor guarded the maritime trade gateway between the Indus Valley and the Persian Gulf civilizations.",
    difficulty: "Hard"
  }
];

// src/data/questions/exploreIndia.ts
var exploreIndiaQuestionBank = [
  {
    id: "ri_001",
    topic: "Indian Geography",
    title: "Origin of the Sacred River",
    question: "Which glacier in the Himalayas is the primary source of the Bhagirathi, the principal headstream of the River Ganga?",
    sub: "Observe the high-altitude Himalayan glaciology and headwater tributaries.",
    clue: "Clue: Located in Uttarkashi district of Uttarakhand, this terminus translates to 'Cow\\'s Mouth'.",
    options: ["Gaumukh (Gangotri Glacier)", "Siachen Glacier", "Pindari Glacier", "Zemu Glacier"],
    correctAnswer: "Gaumukh (Gangotri Glacier)",
    hint: "Located in the Garhwal Himalayas at over 4,000 meters elevation, feeding the Bhagirathi.",
    fact: "The River Ganga officially forms at Devprayag where the Bhagirathi (from Gaumukh) meets the Alaknanda.",
    difficulty: "Easy"
  },
  {
    id: "ri_002",
    topic: "Indian Geography",
    title: "The Trans-Himalayan Giant",
    question: "Before entering Arunachal Pradesh, by what name is the Brahmaputra River known across the Tibetan Plateau?",
    sub: "Trace the east-flowing river traversing north of the Himalayas.",
    clue: "Clue: This Tibetan name literally translates to 'The Purifier' and cuts through the world's deepest canyon.",
    options: ["Yarlung Tsangpo", "Mekong", "Yangtze", "Salween"],
    correctAnswer: "Yarlung Tsangpo",
    hint: "It originates from the Angsi Glacier near Mount Kailash before carving the Great Bend around Namcha Barwa.",
    fact: "The Brahmaputra flows 1,700 km as the Yarlung Tsangpo across southern Tibet before entering India as the Siang/Dihang.",
    difficulty: "Medium"
  },
  {
    id: "ri_003",
    topic: "Indian Geography",
    title: "Dakshin Ganga & Peninsular Drainage",
    question: "Which river is the longest river in Peninsular India, popularly known as 'Dakshin Ganga'?",
    sub: "Analyze the east-flowing peninsular drainage basin originating in the Western Ghats.",
    clue: "Clue: Originating at Trimbakeshwar near Nashik, Maharashtra, this 1,465 km river flows into the Bay of Bengal.",
    options: ["Godavari", "Krishna", "Kaveri", "Mahanadi"],
    correctAnswer: "Godavari",
    hint: "India's second longest river after the Ganga, draining about 10% of India's total land area.",
    fact: "The Godavari spans 1,465 km, originating at Trimbakeshwar in the Western Ghats and forming a fertile delta in Andhra Pradesh.",
    difficulty: "Easy"
  },
  {
    id: "ri_004",
    topic: "Indian Geography",
    title: "Rift Valley Drainage",
    question: "Which major river flows westward through a tectonic rift valley between the Vindhya and Satpura mountain ranges?",
    sub: "Examine the west-flowing rivers that empty into the Gulf of Khambhat (Arabian Sea).",
    clue: "Clue: Famous for the Marble Rocks and Dhuandhar Falls near Jabalpur, Madhya Pradesh.",
    options: ["Narmada", "Godavari", "Chambal", "Betwa"],
    correctAnswer: "Narmada",
    hint: "Originates at Amarkantak plateau in Madhya Pradesh and forms the Sardar Sarovar Dam reservoir.",
    fact: "Unlike most peninsular rivers that flow east into the Bay of Bengal, the Narmada flows west through a fault rift valley.",
    difficulty: "Medium"
  },
  {
    id: "ri_005",
    topic: "Indian Geography",
    title: "Five Rivers of Punjab",
    question: "Which five major rivers gave Punjab its historic name ('Land of Five Waters')?",
    sub: "Trace the eastern tributaries of the Indus river system.",
    clue: "Clue: Jhelum, Chenab, Ravi, Beas, and Sutlej.",
    options: [
      "Jhelum, Chenab, Ravi, Beas, and Sutlej",
      "Ganga, Yamuna, Saraswati, Gomti, and Ghaghara",
      "Narmada, Tapi, Mahi, Sabarmati, and Luni",
      "Godavari, Krishna, Kaveri, Penna, and Vaigai"
    ],
    correctAnswer: "Jhelum, Chenab, Ravi, Beas, and Sutlej",
    hint: "All five rivers eventually converge into the Panjnad before joining the Indus River.",
    fact: "The Persian word 'Panj' (five) and 'Aab' (water) formed 'Punjab', referring to these five Indus tributaries.",
    difficulty: "Easy"
  },
  {
    id: "ri_006",
    topic: "Indian Geography",
    title: "World's Largest River Island",
    question: "Majuli, recognized as the world's largest inhabited freshwater river island, is formed by which mighty river in Assam?",
    sub: "Discover the cultural epicenter of Neo-Vaishnavite sattras and bio-diversity.",
    clue: "Clue: Formed where the Brahmaputra bifurcates and merges with the Kherkutia Xuti.",
    options: ["Brahmaputra", "Ganga", "Mahanadi", "Godavari"],
    correctAnswer: "Brahmaputra",
    hint: "Located in Assam, it is also India's first island district.",
    fact: "Majuli is the largest river island in the world, renowned for preserving 15th-century Assamese Neo-Vaishnavite monasteries.",
    difficulty: "Easy"
  },
  {
    id: "ri_007",
    topic: "Indian Geography",
    title: "Sacred River of Tamil Nadu",
    question: "The Kaveri (Cauvery) River originates at Talakaveri in the Brahmagiri Hills of which district?",
    sub: "Trace the river that feeds the ancient Grand Anicut (Kallanai) dam.",
    clue: "Clue: Located in the Western Ghats of Kodagu (Coorg), Karnataka.",
    options: ["Kodagu (Coorg)", "Wayanad", "Chikmagalur", "Idukki"],
    correctAnswer: "Kodagu (Coorg)",
    hint: "Famed as the coffee-growing district of Karnataka.",
    fact: "The Kaveri flows 800 km through Karnataka and Tamil Nadu before dividing into a fertile delta at Poompuhar.",
    difficulty: "Medium"
  },
  {
    id: "ri_008",
    topic: "Indian Geography",
    title: "Major Tributary of the Krishna",
    question: "Which historic river is the chief tributary of the River Krishna, on whose banks the Vijayanagara Empire built its capital at Hampi?",
    sub: "Identify the river formed by the confluence of the Tunga and Bhadra streams.",
    clue: "Clue: Flowing through Karnataka and Andhra Pradesh, its ancient name was Pampa.",
    options: ["Tungabhadra", "Bhima", "Koyna", "Ghataprabha"],
    correctAnswer: "Tungabhadra",
    hint: "Formed at Koodli by the union of two streams, Tunga and Bhadra.",
    fact: "The ruins of the Vijayanagara Empire at Hampi stand directly on the southern bank of the Tungabhadra River.",
    difficulty: "Medium"
  },
  {
    id: "ri_009",
    topic: "Indian Geography",
    title: "Longest Earthen Dam River",
    question: "The Hirakud Dam, one of the longest major earthen dams in the world, is built across which river in Odisha?",
    sub: "Analyze the river system that drains the Chhattisgarh basin into the Bay of Bengal.",
    clue: "Clue: Originating in the Sihawa highlands of Dhamtari district, Chhattisgarh.",
    options: ["Mahanadi", "Brahmani", "Baitarani", "Subarnarekha"],
    correctAnswer: "Mahanadi",
    hint: "Its name literally translates to 'The Great River'.",
    fact: "The Hirakud Dam across the Mahanadi River spans over 25 km including dikes, constructed in 1957.",
    difficulty: "Medium"
  },
  {
    id: "ri_010",
    topic: "Indian Geography",
    title: "The Twin of the Narmada",
    question: "Which west-flowing river originates near Multai in the Betul district of Madhya Pradesh and flows parallel to the Narmada?",
    sub: "Inspect the river that flows through Surat into the Gulf of Khambhat.",
    clue: "Clue: Often described as the 'daughter of the Sun god' (Surya-putri).",
    options: ["Tapi (Tapti)", "Sabarmati", "Mahi", "Sharavati"],
    correctAnswer: "Tapi (Tapti)",
    hint: "Flows for 724 km through Madhya Pradesh, Maharashtra, and Gujarat.",
    fact: "The Tapi and Narmada are the two major peninsular rivers that flow westward across India into the Arabian Sea.",
    difficulty: "Medium"
  },
  {
    id: "ri_011",
    topic: "Indian Geography",
    title: "World's Largest Mangrove Delta",
    question: "The Sundarbans delta, the largest mangrove forest ecosystem on Earth, is formed by the confluence of which rivers?",
    sub: "Examine the Bengal delta where the Royal Bengal tiger and Sundari trees thrive.",
    clue: "Clue: Formed by the Ganga, Brahmaputra, and Meghna rivers.",
    options: ["Ganga, Brahmaputra, and Meghna", "Indus, Jhelum, and Chenab", "Godavari and Krishna", "Mahanadi and Baitarani"],
    correctAnswer: "Ganga, Brahmaputra, and Meghna",
    hint: "A UNESCO World Heritage site shared between India and Bangladesh.",
    fact: "The Sundarbans spans over 10,000 square kilometers, named after the prolific mangrove species Heritiera fomes (Sundari).",
    difficulty: "Easy"
  },
  {
    id: "ri_012",
    topic: "Indian Geography",
    title: "The Sacred Triveni Sangam",
    question: "At Prayagraj (Allahabad), the River Ganga is joined by its largest right-bank tributary, which originates at Yamunotri Glacier. Which river is this?",
    sub: "Trace the longest tributary river in India.",
    clue: "Clue: Originating on the Bandarpunch peak in Uttarakhand, it flows past Delhi and Agra.",
    options: ["Yamuna", "Ghaghara", "Gomti", "Kosi"],
    correctAnswer: "Yamuna",
    hint: "Runs 1,376 km before meeting the Ganga at the sacred Triveni Sangam.",
    fact: "The Yamuna is the longest tributary river in India and second largest by discharge after the Ghaghara.",
    difficulty: "Easy"
  },
  {
    id: "ri_013",
    topic: "Indian Geography",
    title: "Lifeline of Sikkim",
    question: "Which fast-flowing river originates from Tso Lhamo lake and cuts through dramatic gorges across Sikkim and West Bengal?",
    sub: "Inspect the major tributary of the Brahmaputra originating in high-altitude glaciers.",
    clue: "Clue: Known for whitewater rafting and forming the boundary between Darjeeling and Kalimpong.",
    options: ["Teesta", "Rangeet", "Manas", "Subansiri"],
    correctAnswer: "Teesta",
    hint: "Carves through the Eastern Himalayas before joining the Brahmaputra (Jamuna) in Bangladesh.",
    fact: "The Teesta River flows 414 km from high glacial lakes in Sikkim, sustaining the Eastern Himalayan ecology.",
    difficulty: "Hard"
  },
  {
    id: "ri_014",
    topic: "Indian Geography",
    title: "River of the Thar Desert",
    question: "Which is the largest river in the Thar Desert region of Rajasthan, known for its inland drainage ending in the Rann of Kutch?",
    sub: "Study the river that originates in the Pushkar valley of the Aravalli Range.",
    clue: "Clue: Its name derives from the Sanskrit word 'Lavanavati' (Salt River) because its water turns brackish downstream.",
    options: ["Luni", "Ghaggar", "Sabarmati", "Banas"],
    correctAnswer: "Luni",
    hint: "Freshwater for the first 100 km, it becomes saline as it enters the desert flats.",
    fact: "The Luni is an endorheic river, meaning it does not drain into any sea but dissipates into the marshes of the Rann of Kutch.",
    difficulty: "Hard"
  },
  {
    id: "ri_015",
    topic: "Indian Geography",
    title: "Historic River of Gujarat",
    question: "On the banks of which river did Mahatma Gandhi establish his famous Ashram in Ahmedabad in 1917?",
    sub: "Observe the river originating in the Dhebar lake in Udaipur, Rajasthan.",
    clue: "Clue: Flows south-west into the Gulf of Khambhat after passing Gandhinagar and Ahmedabad.",
    options: ["Sabarmati", "Mahi", "Damanganga", "Shetrunji"],
    correctAnswer: "Sabarmati",
    hint: "From here, Gandhiji launched the historic Dandi Salt March in 1930.",
    fact: "The Sabarmati River was the focal point of India's independence movement when Gandhi established the Sabarmati Satyagraha Ashram.",
    difficulty: "Easy"
  },
  {
    id: "ri_016",
    topic: "Indian Geography",
    title: "Source of the Indus",
    question: "The Indus River (Sindhu) originates in Tibet in the vicinity of which sacred peak and lake?",
    sub: "Trace the 3,180 km trans-Himalayan river that gave India its historic name.",
    clue: "Clue: Originates at Bokhar Chu glacier near Lake Manasarovar and Mount Kailash.",
    options: ["Mount Kailash & Lake Manasarovar", "Nanda Devi & Roopkund", "Kanchenjunga & Gurudongmar", "Annapurna & Tilicho"],
    correctAnswer: "Mount Kailash & Lake Manasarovar",
    hint: "Revered in Tibetan as 'Sengge Zangbo' (Lion's Mouth).",
    fact: "The Indus flows northwest through Ladakh, India, between the Ladakh and Zanskar mountain ranges before entering Pakistan.",
    difficulty: "Medium"
  }
];

// src/data/questions/cultureTraditions.ts
var cultureTraditionsQuestionBank = [
  {
    id: "ct_001",
    topic: "Culture & Traditions",
    title: "Classical Dance of Kerala",
    question: "Which classical dance form of Kerala is internationally famous for its elaborate facial makeup, billowing skirts, and dramatic story-telling?",
    sub: "Discover the vibrant performing art traditions of southern India.",
    clue: "Clue: Characters wear distinct green (paccha) makeup for noble heroes and red/black for demonic villains.",
    options: ["Kathakali", "Mohiniyattam", "Koodiyattam", "Chakyar Koothu"],
    correctAnswer: "Kathakali",
    hint: "Combines dance, music, mime, and facial mudras to depict scenes from the Ramayana and Mahabharata.",
    fact: "Kathakali evolved during the 17th century in Kerala under the patronage of the Raja of Kottarakkara.",
    difficulty: "Easy"
  },
  {
    id: "ct_002",
    topic: "Culture & Traditions",
    title: "Ancient Treatise on Performing Arts",
    question: "Which foundational Sanskrit treatise on dramaturgy, dance, and aesthetics is attributed to sage Bharata Muni?",
    sub: "Inspect the ancient text that codified the Navarasa (nine aesthetic emotions).",
    clue: "Clue: Known as the 'Fifth Veda' of the performing arts.",
    options: ["Natya Shastra", "Abhinaya Darpana", "Sangita Ratnakara", "Brihaddesi"],
    correctAnswer: "Natya Shastra",
    hint: "Contains 36 chapters detailing theatrical stage design, musical scales, and emotional expression (rasa).",
    fact: "The Natya Shastra, compiled between 200 BCE and 200 CE, forms the common foundation for all Indian classical dance forms.",
    difficulty: "Medium"
  },
  {
    id: "ct_003",
    topic: "Culture & Traditions",
    title: "Mithila Folk Painting",
    question: "Madhubani painting, celebrated for its intricate geometric patterns and natural dye pigments, originated in which region of Bihar?",
    sub: "Examine traditional domestic wall murals depicting nature and mythology.",
    clue: "Clue: Practiced traditionally by women in the ancient Mithila region.",
    options: ["Mithila", "Magadha", "Anga", "Bhojpur"],
    correctAnswer: "Mithila",
    hint: "Historically painted on freshly plastered mud walls using fingers, twigs, and matchsticks.",
    fact: "Madhubani paintings are distinguished by eye-catching colors filled in double line borders without leaving empty spaces.",
    difficulty: "Easy"
  },
  {
    id: "ct_004",
    topic: "Culture & Traditions",
    title: "Dravidian Temple Tower",
    question: "In Dravidian temple architecture, what is the monumental, highly ornamented entrance tower of a temple complex called?",
    sub: "Analyze the architectural anatomy of grand South Indian temples.",
    clue: "Clue: Rising above the temple boundary walls with hundreds of sculpted celestial figures.",
    options: ["Gopuram", "Vimana", "Shikhara", "Mandapa"],
    correctAnswer: "Gopuram",
    hint: "The central tower over the sanctum is the Vimana, while this monumental gateway is the outer tower.",
    fact: "Gopurams grew to towering heights during the Vijayanagara and Nayaka periods, serving as civic landmarks.",
    difficulty: "Medium"
  },
  {
    id: "ct_005",
    topic: "Culture & Traditions",
    title: "Classical Dance of Tamil Nadu",
    question: "Which ancient classical dance form originated in the temples of Tamil Nadu, previously known as Sadir Attam?",
    sub: "Observe the geometric precision of the Aramandi (half-sit) posture and rhythmic jathis.",
    clue: "Clue: Revived by Rukmini Devi Arundale and E. Krishna Iyer at Kalakshetra in the 1930s.",
    options: ["Bharatanatyam", "Kuchipudi", "Odissi", "Kathak"],
    correctAnswer: "Bharatanatyam",
    hint: "Considered the oldest classical dance tradition of India, practiced by temple devadasis.",
    fact: "Bharatanatyam is noted for its sculptural postures, intricate footwork, and expressive eye and hand mudras.",
    difficulty: "Easy"
  },
  {
    id: "ct_006",
    topic: "Culture & Traditions",
    title: "New Year Festival of Assam",
    question: "Which festive celebration marks the Assamese New Year and the onset of the spring seeding season in mid-April?",
    sub: "Listen to the rhythmic beats of the dhol, pepa horn, and graceful group dancing.",
    clue: "Clue: Also known as Rongali Bihu, celebrated with feasting and traditional pithas.",
    options: ["Bohag Bihu", "Hornbill Festival", "Wangala", "Chapchar Kut"],
    correctAnswer: "Bohag Bihu",
    hint: "The most important of the three Bihu festivals of Assam.",
    fact: "Rongali or Bohag Bihu celebrates fertility and new agricultural beginnings with seven days of music, dance, and gifting of gamosas.",
    difficulty: "Easy"
  },
  {
    id: "ct_007",
    topic: "Culture & Traditions",
    title: "Classical Dance of Northern India",
    question: "Which classical dance form from Northern India derives its name from the Sanskrit word 'Katha' (story) and is famous for lightning-fast pirouettes (chakkars)?",
    sub: "Notice the tatkar footwork synchronized with the beats of the tabla.",
    clue: "Clue: Developed across the Lucknow, Jaipur, and Banaras Gharanas.",
    options: ["Kathak", "Manipuri", "Sattriya", "Chhau"],
    correctAnswer: "Kathak",
    hint: "Storytellers who traveled between village temples before performing in Mughal courts.",
    fact: "Kathak uniquely blends Hindu temple devotional storytelling with elegant courtly subtleties developed in royal darbars.",
    difficulty: "Easy"
  },
  {
    id: "ct_008",
    topic: "Culture & Traditions",
    title: "Sun Temple Chariot Architecture",
    question: "The Konark Sun Temple in Odisha is built in the monumental form of a celestial chariot with how many carved stone wheels?",
    sub: "Examine the 13th-century Kalinga architectural masterpiece built by King Narasimhadeva I.",
    clue: "Clue: It features 24 wheels symbolizing the 24 hours of the day or fortnights of the year.",
    options: ["24 wheels", "12 wheels", "16 wheels", "32 wheels"],
    correctAnswer: "24 wheels",
    hint: "Each wheel functions as an accurate sundial to calculate the time of day from the shadow.",
    fact: "Konark's 24 stone wheels are pulled by seven carved horses representing the seven days of the week or colors of sunlight.",
    difficulty: "Medium"
  },
  {
    id: "ct_009",
    topic: "Culture & Traditions",
    title: "Carnatic Music Trinity",
    question: "Tyagaraja, Muthuswami Dikshitar, and Syama Sastri are reverently honored as the 'Trinity' of which classical musical tradition?",
    sub: "Trace the 18th-century golden era of South Indian devotional ragas and krithis.",
    clue: "Clue: All three masters were born in the historic town of Thiruvarur, Tamil Nadu.",
    options: ["Carnatic Music", "Hindustani Music", "Dhrupad", "Thumri"],
    correctAnswer: "Carnatic Music",
    hint: "The classical music system prevalent in the southern Indian states.",
    fact: "The Musical Trinity of Carnatic music composed thousands of devotional krithis that established standard concert repertoires.",
    difficulty: "Medium"
  },
  {
    id: "ct_010",
    topic: "Culture & Traditions",
    title: "Tribal Art of Maharashtra",
    question: "Which ancient tribal art form from the Sahyadri mountains of Maharashtra uses simple geometric shapes (circle, triangle, square) painted with white rice paste?",
    sub: "Look closely at the rhythmic spiral dance circles depicting communal harmony.",
    clue: "Clue: Named after the indigenous Warli tribe of Palghar and Thane districts.",
    options: ["Warli painting", "Gond art", "Pithora painting", "Cheriyal scroll"],
    correctAnswer: "Warli painting",
    hint: "The circle represents the sun and moon, the triangle depicts mountains, and the square signifies sacred human enclosures.",
    fact: "Warli paintings, traditionally created by women during weddings and harvest rites, use only natural white rice pigment on ochre mud walls.",
    difficulty: "Easy"
  },
  {
    id: "ct_011",
    topic: "Culture & Traditions",
    title: "Monolithic Rock Temple of Ellora",
    question: "The colossal monolithic Kailasa Temple (Cave 16) at Ellora was carved top-down out of a single volcanic basalt cliff under which dynasty?",
    sub: "Marvel at the excavation that removed over 200,000 tonnes of rock without structural joins.",
    clue: "Clue: Commissioned by King Krishna I in the 8th century CE.",
    options: ["Rashtrakuta Dynasty", "Chalukya Dynasty", "Pallava Dynasty", "Chola Dynasty"],
    correctAnswer: "Rashtrakuta Dynasty",
    hint: "This dynasty ruled large parts of the Deccan from Manyakheta between the 6th and 10th centuries.",
    fact: "The Kailasa temple is the world's largest monolithic rock-cut monument, carved vertically downward from the cliff apex.",
    difficulty: "Hard"
  },
  {
    id: "ct_012",
    topic: "Culture & Traditions",
    title: "Classical Monastic Dance of Assam",
    question: "Which classical dance form was introduced in the 15th century by the saint-reformer Mahapurusha Srimanta Sankaradeva in the monasteries (sattras) of Assam?",
    sub: "Observe the devotional dance accompanied by the khol drum and cymbals.",
    clue: "Clue: Recognized as a classical dance form of India by Sangeet Natak Akademi in 2000.",
    options: ["Sattriya", "Manipuri", "Chhau", "Yakshagana"],
    correctAnswer: "Sattriya",
    hint: "Named after the 'sattras' (monasteries) where it was preserved for centuries exclusively by celibate monks.",
    fact: "Sattriya dance emerged as an integral part of the Vaishnavite Bhakti movement in Assam, dramatizing mythological stories through song and gesture.",
    difficulty: "Hard"
  },
  {
    id: "ct_013",
    topic: "Culture & Traditions",
    title: "Traditional String Puppetry",
    question: "What is the ancient string puppetry tradition of Rajasthan called, where master puppeteers manipulate wooden marionettes with whistling sound effects?",
    sub: "Watch the colorful wooden puppets clad in glittering traditional Rajasthani textiles.",
    clue: "Clue: The name literally translates to 'wooden doll' (Kaath = wood, Putli = doll).",
    options: ["Kathputli", "Tholu Bommalata", "Gombeyatta", "Bommalattam"],
    correctAnswer: "Kathputli",
    hint: "Practiced by the nomadic Bhatt community of Rajasthan to narrate historical tales of Amar Singh Rathore.",
    fact: "Kathputli puppeteers control the figures with two to five strings looped around their fingers while voicing dialogue with a bamboo reed whistle (boli).",
    difficulty: "Medium"
  },
  {
    id: "ct_014",
    topic: "Culture & Traditions",
    title: "Living Chola Temples",
    question: "The Brihadisvara Temple at Thanjavur, celebrated for its 80-tonne monolithic granite dome apex, was built by which Chola emperor in 1010 CE?",
    sub: "Study the grand culmination of South Indian temple architecture.",
    clue: "Clue: One of the greatest conquerors and naval monarchs of the Chola Empire.",
    options: ["Rajaraja Chola I", "Rajendra Chola I", "Kulothunga Chola I", "Parantaka Chola I"],
    correctAnswer: "Rajaraja Chola I",
    hint: "Built to commemorate his imperial victories, popularly called the 'Big Temple'.",
    fact: "The Brihadisvara Temple's 16-storey vimana rises 66 meters, topped by a single octagonal granite cupola estimated at 80 tonnes.",
    difficulty: "Medium"
  },
  {
    id: "ct_015",
    topic: "Culture & Traditions",
    title: "Buddhist Mural Paintings of Ajanta",
    question: "The world-famous ancient fresco murals of the Ajanta Caves primarily depict stories from which Buddhist canonical literature?",
    sub: "Admire the compassionate Bodhisattva Padmapani holding a blue lotus in Cave 1.",
    clue: "Clue: Stories depicting the previous lives and incarnations of Gautama Buddha.",
    options: ["Jataka Tales", "Panchatantra", "Tripitaka", "Hitopadesha"],
    correctAnswer: "Jataka Tales",
    hint: "Parables illustrating virtues such as generosity, wisdom, and renunciation across human and animal forms.",
    fact: "Ajanta's rock-cut caves preserve the finest masterworks of ancient Indian painting, dating between 2nd century BCE and 5th century CE.",
    difficulty: "Easy"
  },
  {
    id: "ct_016",
    topic: "Culture & Traditions",
    title: "Classical Odissi Posture",
    question: "In classical Odissi dance, which signature tripartite body deflection posture breaks the body at the neck, torso, and knees?",
    sub: "Notice the graceful sculptural pose seen on temple friezes of Konark and Puri.",
    clue: "Clue: The term literally translates to 'three bends'.",
    options: ["Tribhanga", "Chowk", "Samabhanga", "Abhanga"],
    correctAnswer: "Tribhanga",
    hint: "Complements the square, grounded 'Chowk' posture representing Lord Jagannatha.",
    fact: "The Tribhanga posture creates a fluid S-curve silhouette that directly replicates the dancing celestial figures carved on Odishan stone temples.",
    difficulty: "Hard"
  }
];

// src/data/questions/freedomMovement.ts
var freedomMovementQuestionBank = [
  {
    id: "fm_001",
    topic: "Freedom Movement",
    title: "The 1857 Uprising",
    question: "Which Indian sepoy fired the first historic shot against the British East India Company at Barrackpore on March 29, 1857?",
    sub: "Examine the historic revolt against the Enfield rifle cartridges.",
    clue: "Clue: A soldier in the 34th Bengal Native Infantry who became the first martyr of 1857.",
    options: ["Mangal Pandey", "Tatya Tope", "Kunwar Singh", "Bakht Khan"],
    correctAnswer: "Mangal Pandey",
    hint: "His bold defiance sparked the wider revolt across Meerut, Delhi, and Kanpur.",
    fact: "Mangal Pandey's courageous resistance galvanized the Great Rebellion of 1857, often described as India's First War of Independence.",
    difficulty: "Easy"
  },
  {
    id: "fm_002",
    topic: "Freedom Movement",
    title: "Gandhiji's First Satyagraha",
    question: "Mahatma Gandhi launched his first historic Satyagraha campaign on Indian soil in 1917 at which place to defend exploited indigo farmers?",
    sub: "Trace the early civil disobedience movement in northern Bihar.",
    clue: "Clue: Farmers were coerced under the oppressive 'Tinkathia' system to plant indigo on 3/20ths of their lands.",
    options: ["Champaran", "Kheda", "Bardoli", "Ahmedabad"],
    correctAnswer: "Champaran",
    hint: "Invited to this Bihar district by local farmer Raj Kumar Shukla.",
    fact: "The Champaran Satyagraha of 1917 successfully abolished the exploitative Tinkathia system and established Gandhi's leadership in India.",
    difficulty: "Easy"
  },
  {
    id: "fm_003",
    topic: "Freedom Movement",
    title: "The Historic Salt March",
    question: "In 1930, Mahatma Gandhi marched 240 miles from Sabarmati Ashram to the coastal village of Dandi to defy which British tax law?",
    sub: "Witness the landmark Civil Disobedience campaign that ignited the nation.",
    clue: "Clue: A direct tax on an essential everyday mineral commodity required by every human being.",
    options: ["Salt Tax (Salt Law)", "Land Revenue Tax", "Stamp Duty", "Cotton Import Duty"],
    correctAnswer: "Salt Tax (Salt Law)",
    hint: "On April 6, 1930, Gandhi picked up a lump of natural salt from the beach to break the British monopoly.",
    fact: "The 24-day Dandi March galvanized nationwide civil disobedience, resulting in over 60,000 freedom fighters voluntarily courting arrest.",
    difficulty: "Easy"
  },
  {
    id: "fm_004",
    topic: "Freedom Movement",
    title: "Quit India Resolution",
    question: "During which mass movement in August 1942 did Mahatma Gandhi issue the clarion call 'Do or Die' (Karo ya Maro) from Gowalia Tank, Bombay?",
    sub: "Analyze the decisive nationwide movement demanding immediate British withdrawal.",
    clue: "Clue: Launched following the failure of the Cripps Mission during World War II.",
    options: ["Quit India Movement (August Kranti)", "Non-Cooperation Movement", "Civil Disobedience Movement", "Rowlatt Satyagraha"],
    correctAnswer: "Quit India Movement (August Kranti)",
    hint: "The historic Gowalia Tank Maidan in Mumbai is now commemorated as August Kranti Maidan.",
    fact: "The Quit India Movement of 1942 was the most intense mass uprising of the freedom struggle, paralyzing British administrative machinery.",
    difficulty: "Easy"
  },
  {
    id: "fm_005",
    topic: "Freedom Movement",
    title: "Tragedy of Jallianwala Bagh",
    question: "The horrific Jallianwala Bagh massacre occurred on the festival day of Baisakhi in 1919 in which city?",
    sub: "Remember the unarmed citizens gathered to protest the arrest of Dr. Saifuddin Kitchlew and Dr. Satyapal.",
    clue: "Clue: Located near the Golden Temple in Punjab, where Brigadier General Reginald Dyer ordered troops to open fire.",
    options: ["Amritsar", "Lahore", "Ludhiana", "Jalandhar"],
    correctAnswer: "Amritsar",
    hint: "Over a thousand peaceful men, women, and children were trapped inside the walled enclosure on April 13, 1919.",
    fact: "The massacre prompted Rabindranath Tagore to renounce his British Knighthood in moral protest against imperial brutality.",
    difficulty: "Easy"
  },
  {
    id: "fm_006",
    topic: "Freedom Movement",
    title: "Netaji & The Azad Hind Fauj",
    question: "Netaji Subhas Chandra Bose revitalized the Indian National Army (INA) and gave the historic rallying cry 'Give me blood, and I shall give you freedom!' from which country?",
    sub: "Trace the armed struggle for Indian liberation across Southeast Asia during World War II.",
    clue: "Clue: He established the Provisional Government of Free India (Arzi Hukumat-e-Azad Hind) in Singapore and Burma.",
    options: ["Burma (Myanmar) & Singapore", "Japan", "Germany", "Thailand"],
    correctAnswer: "Burma (Myanmar) & Singapore",
    hint: "The INA advanced through Burma and unfurled the Tricolor at Moirang, Manipur in 1944.",
    fact: "Netaji's Azad Hind Fauj included soldiers from all faiths as well as the revolutionary all-women Rani of Jhansi Regiment.",
    difficulty: "Medium"
  },
  {
    id: "fm_007",
    topic: "Freedom Movement",
    title: "Architect of the Constitution",
    question: "Who served as the Chairman of the Drafting Committee of the Constituent Assembly of India and is revered as the Chief Architect of the Indian Constitution?",
    sub: "Honor the champion of social democracy and fundamental human rights.",
    clue: "Clue: Renowned jurist, economist, and social reformer who also served as Independent India's first Law Minister.",
    options: ["Dr. B.R. Ambedkar", "Dr. Rajendra Prasad", "Jawaharlal Nehru", "Sardar Vallabhbhai Patel"],
    correctAnswer: "Dr. B.R. Ambedkar",
    hint: "Born in Mhow, Madhya Pradesh, he dedicated his life to eradicating untouchability and social discrimination.",
    fact: "Dr. B.R. Ambedkar synthesized the world's longest written constitution, guaranteeing fundamental rights and equality to every citizen.",
    difficulty: "Easy"
  },
  {
    id: "fm_008",
    topic: "Freedom Movement",
    title: "Integration of Princely States",
    question: "Which leader, known as the 'Iron Man of India' and 'Bismarck of India', peacefully integrated over 560 princely states into the Indian Union?",
    sub: "Trace the heroic unification of the Indian republic following independence in 1947.",
    clue: "Clue: Served as the first Deputy Prime Minister and Home Minister of India.",
    options: ["Sardar Vallabhbhai Patel", "C. Rajagopalachari", "Maulana Abul Kalam Azad", "Govind Ballabh Pant"],
    correctAnswer: "Sardar Vallabhbhai Patel",
    hint: "Assisted by civil servant V.P. Menon, he negotiated the Instruments of Accession.",
    fact: "Sardar Patel's diplomatic resolve unified a fragmented subcontinent into one sovereign democratic republic.",
    difficulty: "Easy"
  },
  {
    id: "fm_009",
    topic: "Freedom Movement",
    title: "Young Revolutionary Martyr",
    question: "Which charismatic revolutionary socialist founded the Naujawan Bharat Sabha and was martyred at age 23 alongside Rajguru and Sukhdev in Lahore Jail?",
    sub: "Remember the visionary hero who coined the popular usage of 'Inquilab Zindabad!'",
    clue: "Clue: Threw non-lethal smoke bombs in the Central Legislative Assembly in 1929 to 'make the deaf hear'.",
    options: ["Bhagat Singh", "Chandrashekhar Azad", "Batukeshwar Dutt", "Ram Prasad Bismil"],
    correctAnswer: "Bhagat Singh",
    hint: "Martyred on March 23, 1931, commemorated annually as Shaheed Diwas.",
    fact: "Bhagat Singh combined fearlessness with profound intellectual study, inspiring millions of Indian youth toward unconditional freedom.",
    difficulty: "Easy"
  },
  {
    id: "fm_010",
    topic: "Freedom Movement",
    title: "The Swadeshi Movement",
    question: "The historic Swadeshi and Boycott Movement of 1905 was launched in direct protest against which imperial decision by Lord Curzon?",
    sub: "Analyze the mass protests promoting Indian-made goods and boycotting British textiles.",
    clue: "Clue: The controversial administrative division of Bengal on communal lines.",
    options: ["Partition of Bengal (1905)", "Rowlatt Act", "Ilbert Bill", "Vernacular Press Act"],
    correctAnswer: "Partition of Bengal (1905)",
    hint: "Led by leaders like Bal Gangadhar Tilak, Bipin Chandra Pal, and Lala Lajpat Rai (Lal-Bal-Pal).",
    fact: "The Swadeshi Movement popularized the singing of Bankim Chandra's 'Vande Mataram' and ignited national pride in indigenous industries.",
    difficulty: "Medium"
  },
  {
    id: "fm_011",
    topic: "Freedom Movement",
    title: "Withdrawal of Non-Cooperation",
    question: "Mahatma Gandhi abruptly called off the nationwide Non-Cooperation Movement in February 1922 following a violent incident at which town?",
    sub: "Examine Gandhi's unyielding commitment to strict Ahimsa (non-violence).",
    clue: "Clue: A clash in Gorakhpur district, Uttar Pradesh, where a police station was set ablaze.",
    options: ["Chauri Chaura", "Kakori", "Meerut", "Jhansi"],
    correctAnswer: "Chauri Chaura",
    hint: "Gandhi declared he would not allow a movement based on truth to turn violent at any cost.",
    fact: "Gandhi undertook a 5-day penitential fast and suspended the Non-Cooperation Movement because he refused to compromise on non-violence.",
    difficulty: "Medium"
  },
  {
    id: "fm_012",
    topic: "Freedom Movement",
    title: "Swaraj is My Birthright",
    question: "Which nationalist leader declared the immortal slogan 'Swaraj is my birthright, and I shall have it!' during the freedom struggle?",
    sub: "Celebrate the pioneer of the Home Rule movement and public Ganesh Utsav celebrations.",
    clue: "Clue: Revering him as 'The Father of the Indian Unrest', the Indian public conferred on him the title 'Lokmanya'.",
    options: ["Bal Gangadhar Tilak", "Gopal Krishna Gokhale", "Dadabhai Naoroji", "Subhas Chandra Bose"],
    correctAnswer: "Bal Gangadhar Tilak",
    hint: "He founded the influential nationalist newspapers 'Kesari' (in Marathi) and 'Mahratta' (in English).",
    fact: "Lokmanya Tilak transformed the freedom struggle from an elite debate into a vibrant mass movement.",
    difficulty: "Easy"
  },
  {
    id: "fm_013",
    topic: "Freedom Movement",
    title: "Kakori Train Action",
    question: "The historic Kakori Train Action of August 1925 was orchestrated by revolutionaries of which patriotic organization to fund their struggle?",
    sub: "Remember martyrs Ram Prasad Bismil, Ashfaqulla Khan, and Roshan Singh.",
    clue: "Clue: The Hindustan Republican Association (HRA), later reorganized by Chandrashekhar Azad.",
    options: ["Hindustan Republican Association (HRA)", "Ghadar Party", "Anushilan Samiti", "Abhinav Bharat"],
    correctAnswer: "Hindustan Republican Association (HRA)",
    hint: "Took place near Kakori, Lucknow, seizing British government treasury from a train.",
    fact: "Ram Prasad Bismil and Ashfaqulla Khan demonstrated supreme communal brotherhood in their joint sacrifice for Mother India.",
    difficulty: "Hard"
  },
  {
    id: "fm_014",
    topic: "Freedom Movement",
    title: "The Bardoli Satyagraha",
    question: "Vallabhbhai Patel was formally bestowed the affectionate title 'Sardar' (Leader) by the women of which region after his victorious peasant tax revolt in 1928?",
    sub: "Inspect the disciplined non-violent refusal to pay a 22% arbitrary land revenue hike.",
    clue: "Clue: A taluka in Surat district, Gujarat.",
    options: ["Bardoli", "Kheda", "Dandi", "Anand"],
    correctAnswer: "Bardoli",
    hint: "His masterful organization forced the British government to cancel the unjust land tax hikes.",
    fact: "The women of Bardoli bestowed the honorific 'Sardar' upon Vallabhbhai Patel for his steadfast leadership.",
    difficulty: "Medium"
  },
  {
    id: "fm_015",
    topic: "Freedom Movement",
    title: "The Poona Pact of 1932",
    question: "The historic Poona Pact of September 1932 was an agreement signed inside Yerwada Central Jail between which two eminent leaders?",
    sub: "Examine the agreement resolving political representation for Depressed Classes.",
    clue: "Clue: Replaced separate electorates with reserved seats in provincial legislatures.",
    options: ["Mahatma Gandhi and Dr. B.R. Ambedkar", "Jawaharlal Nehru and Subhas Chandra Bose", "Sardar Patel and Muhammad Ali Jinnah", "Lala Lajpat Rai and Bipin Chandra Pal"],
    correctAnswer: "Mahatma Gandhi and Dr. B.R. Ambedkar",
    hint: "Signed to end Mahatma Gandhi's fast-unto-death in Yerwada Jail, Pune.",
    fact: "The Poona Pact nearly doubled reserved seats for Depressed Classes in provincial legislatures from 71 to 148.",
    difficulty: "Medium"
  },
  {
    id: "fm_016",
    topic: "Freedom Movement",
    title: "First President of Independent India",
    question: "Who was unanimously elected as the first President of the Republic of India on January 24, 1950, by the Constituent Assembly?",
    sub: "Honor the veteran freedom fighter and scholar from Ziradei, Bihar.",
    clue: "Clue: He served as the President of the Constituent Assembly throughout the constitution-making process.",
    options: ["Dr. Rajendra Prasad", "Dr. S. Radhakrishnan", "C. Rajagopalachari", "Dr. Zakir Husain"],
    correctAnswer: "Dr. Rajendra Prasad",
    hint: "He is the only Indian President to have served two full terms in office (1950\u20131962).",
    fact: "Dr. Rajendra Prasad led the Constituent Assembly through 11 sessions spanning nearly 3 years to adopt India's Constitution.",
    difficulty: "Easy"
  }
];

// src/data/missions.ts
var missionsData = {
  "ancient-india-01": {
    id: "ancient-india-01",
    title: "Ancient India \u2014 Mission 01: The Lost Artifact",
    shortTitle: "Ancient India \xB7 Mission 01",
    categoryTag: "\u{1F3FA} Ancient India \xB7 Mission 01",
    theme: "Ancient India",
    topic: "history",
    difficultyTier: "Basic",
    timeLimit: 300,
    // 5 minutes = 300s
    questionCount: 5,
    // Exactly 5 questions
    questionBank: ancientIndiaQuestionBank,
    badgeId: "heritage-explorer",
    badgeName: "Heritage Explorer",
    completionMessage: "You have successfully decoded the archaeological secrets of the Indus Valley!"
  },
  "explore-india-02": {
    id: "explore-india-02",
    title: "Explore India \u2014 Level 2: Rivers of India \u2014 The Journey of Water",
    shortTitle: "Explore India \xB7 Level 2",
    categoryTag: "\u{1F30A} Explore India \xB7 Level 2 \xB7 Rivers of India",
    theme: "Indian Geography",
    topic: "geography",
    difficultyTier: "Intermediate",
    timeLimit: 180,
    // 3 minutes = 180s
    questionCount: 3,
    // Exactly 3 questions
    questionBank: exploreIndiaQuestionBank,
    badgeId: "river-navigator",
    badgeName: "River Navigator",
    completionMessage: "You have successfully navigated the sacred and lifeline river networks of India!"
  },
  "culture-traditions-03": {
    id: "culture-traditions-03",
    title: "Culture & Traditions \u2014 Level 3: Living Heritages",
    shortTitle: "Culture & Traditions",
    categoryTag: "\u{1F3AD} Culture & Traditions",
    theme: "Indian Culture",
    topic: "culture",
    difficultyTier: "Intermediate",
    timeLimit: 300,
    questionCount: 5,
    questionBank: cultureTraditionsQuestionBank,
    badgeId: "quest-warrior",
    badgeName: "Quest Warrior",
    completionMessage: "You celebrated and mastered the vibrant classical and folk traditions of India!"
  },
  "freedom-movement-04": {
    id: "freedom-movement-04",
    title: "Freedom Movement \u2014 Level 4: The Struggle for Swaraj",
    shortTitle: "Freedom Movement",
    categoryTag: "\u{1F1EE}\u{1F1F3} Freedom Movement",
    theme: "Modern History",
    topic: "history",
    difficultyTier: "Advanced",
    timeLimit: 300,
    questionCount: 5,
    questionBank: freedomMovementQuestionBank,
    badgeId: "star-scholar",
    badgeName: "Star Scholar",
    completionMessage: "You relived the monumental sacrifices and triumphs that birthed free India!"
  }
};

// src/data/badges.ts
var allBadges = [
  {
    id: "heritage-explorer",
    icon: "\u{1F3FA}",
    name: "Heritage Explorer",
    desc: "Awarded for completing Ancient India \u2014 Mission 01: The Lost Artifact. Proves foundational mastery of Indus Valley archaeological treasures.",
    criteria: "Complete all 5 questions in Ancient India Mission 01.",
    earned: false
  },
  {
    id: "river-navigator",
    icon: "\u{1F30A}",
    name: "River Navigator",
    desc: "Awarded for traversing India\u2019s legendary river systems and geographic corridors in Explore India \u2014 Level 2.",
    criteria: "Complete the Rivers of India exploration mission with at least 80% accuracy.",
    earned: false
  },
  {
    id: "first-discovery",
    icon: "\u{1F50D}",
    name: "First Discovery",
    desc: "Awarded to every explorer who embarks on their journey into India\u2019s vast historical tapestry.",
    criteria: "Register an explorer account and start your BharatQuest journey.",
    earned: true
  },
  {
    id: "quest-warrior",
    icon: "\u2694\uFE0F",
    name: "Quest Warrior",
    desc: "Awarded to dedicated historians who conquer multiple challenging quests across diverse civilizations.",
    criteria: "Reach Level 5 and complete the Culture & Traditions quest.",
    earned: false
  },
  {
    id: "scroll-master",
    icon: "\u{1F4DC}",
    name: "Scroll Master",
    desc: "Awarded for demonstrating encyclopedic mastery with 100% accuracy on a full mission challenge.",
    criteria: "Answer every question correctly on your first attempt without hints or errors.",
    earned: false
  },
  {
    id: "champion",
    icon: "\u{1F3C6}",
    name: "Champion",
    desc: "Awarded for ascending to the coveted podium ranks of the national BharatQuest leaderboard.",
    criteria: "Achieve a top 3 rank on the explorer leaderboard by mastering quests.",
    earned: false
  },
  {
    id: "star-scholar",
    icon: "\u{1F31F}",
    name: "Star Scholar",
    desc: "Awarded to supreme scholars who master all four foundational quest storylines across India.",
    criteria: "Complete Ancient India, Explore India, Culture & Traditions, and Freedom Movement.",
    earned: false
  }
];

// scripts/generate_seed_sql.ts
function escapeSql(str) {
  if (str === void 0 || str === null) return "NULL";
  return `'${str.replace(/'/g, "''")}'`;
}
function escapeSqlArray(arr) {
  if (!arr || arr.length === 0) return "'{}'";
  const escaped = arr.map((s) => `"${s.replace(/"/g, '\\"')}"`).join(",");
  return `'{${escaped}}'`;
}
var sql = `-- ==============================================================================
-- BHARATQUEST DATABASE MIGRATION 002: SEED DATA
-- Total Quests: 4 | Total Badges: 7 | Total Questions: 70
-- ==============================================================================

-- 1. SEED BADGES
INSERT INTO public.badges (id, icon, name, "desc", criteria, order_index)
VALUES
`;
var badgeRows = allBadges.map((b, idx) => {
  return `  (${escapeSql(b.id)}, ${escapeSql(b.icon)}, ${escapeSql(b.name)}, ${escapeSql(b.desc)}, ${escapeSql(b.criteria)}, ${idx + 1})`;
});
sql += badgeRows.join(",\n") + '\nON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, "desc" = EXCLUDED."desc", criteria = EXCLUDED.criteria, icon = EXCLUDED.icon;\n\n';
sql += `-- 2. SEED QUESTS
INSERT INTO public.quests (id, display_title, subtitle, description, difficulty, estimated_time, xp_reward, required_level, status, icon, badge_id, badge_name, tags, topic, time_limit, question_count, difficulty_tier, completion_message, order_index)
VALUES
`;
var questRows = questsData.map((q, idx) => {
  const mission = missionsData[q.id];
  return `  (${escapeSql(q.id)}, ${escapeSql(q.displayTitle)}, ${escapeSql(q.subtitle)}, ${escapeSql(q.description)}, ${escapeSql(q.difficulty)}, ${escapeSql(q.estimatedTime)}, ${escapeSql(q.xpReward)}, ${q.requiredLevel}, ${escapeSql(q.status)}, ${escapeSql(q.icon)}, ${escapeSql(q.badgeId)}, ${escapeSql(q.badgeName)}, ${escapeSqlArray(q.tags)}, ${escapeSql(mission?.topic || "history")}, ${mission?.timeLimit || 300}, ${mission?.questionCount || 5}, ${escapeSql(mission?.difficultyTier || "Basic")}, ${escapeSql(mission?.completionMessage || "")}, ${idx + 1})`;
});
sql += questRows.join(",\n") + "\nON CONFLICT (id) DO UPDATE SET display_title = EXCLUDED.display_title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description, difficulty = EXCLUDED.difficulty, estimated_time = EXCLUDED.estimated_time, xp_reward = EXCLUDED.xp_reward, required_level = EXCLUDED.required_level, status = EXCLUDED.status, icon = EXCLUDED.icon, badge_id = EXCLUDED.badge_id, badge_name = EXCLUDED.badge_name, tags = EXCLUDED.tags, topic = EXCLUDED.topic, time_limit = EXCLUDED.time_limit, question_count = EXCLUDED.question_count, difficulty_tier = EXCLUDED.difficulty_tier, completion_message = EXCLUDED.completion_message;\n\n";
sql += `-- 3. SEED QUESTIONS
INSERT INTO public.questions (id, quest_id, topic, title, question, sub, clue, correct_answer, hint, fact, difficulty, image_search_title, image_search_query, order_index)
VALUES
`;
var allQuestionBanks = [
  { questId: "ancient-india-01", bank: ancientIndiaQuestionBank },
  { questId: "explore-india-02", bank: exploreIndiaQuestionBank },
  { questId: "culture-traditions-03", bank: cultureTraditionsQuestionBank },
  { questId: "freedom-movement-04", bank: freedomMovementQuestionBank }
];
var questionRows = [];
var optionRows = [];
var totalQ = 0;
for (const { questId, bank } of allQuestionBanks) {
  bank.forEach((q, idx) => {
    totalQ++;
    questionRows.push(
      `  (${escapeSql(q.id)}, ${escapeSql(questId)}, ${escapeSql(q.topic)}, ${escapeSql(q.title)}, ${escapeSql(q.question)}, ${escapeSql(q.sub)}, ${escapeSql(q.clue)}, ${escapeSql(q.correctAnswer)}, ${escapeSql(q.hint)}, ${escapeSql(q.fact)}, ${escapeSql(q.difficulty)}, ${escapeSql(q.imageSearch?.title)}, ${escapeSql(q.imageSearch?.query)}, ${idx + 1})`
    );
    q.options.forEach((opt, optIdx) => {
      const isCorrect = opt === q.correctAnswer;
      optionRows.push(
        `  (${escapeSql(q.id)}, ${escapeSql(opt)}, ${isCorrect ? "TRUE" : "FALSE"}, ${optIdx})`
      );
    });
  });
}
sql += questionRows.join(",\n") + "\nON CONFLICT (id) DO UPDATE SET quest_id = EXCLUDED.quest_id, topic = EXCLUDED.topic, title = EXCLUDED.title, question = EXCLUDED.question, sub = EXCLUDED.sub, clue = EXCLUDED.clue, correct_answer = EXCLUDED.correct_answer, hint = EXCLUDED.hint, fact = EXCLUDED.fact, difficulty = EXCLUDED.difficulty, image_search_title = EXCLUDED.image_search_title, image_search_query = EXCLUDED.image_search_query;\n\n";
sql += `-- 4. SEED QUESTION OPTIONS
`;
sql += `-- First clean up existing options for idempotency
`;
sql += `DELETE FROM public.question_options;

`;
sql += `INSERT INTO public.question_options (question_id, option_text, is_correct, order_index)
VALUES
`;
sql += optionRows.join(",\n") + ";\n";
var outPath = path.resolve("supabase/migrations/002_seed_bharatquest.sql");
fs.writeFileSync(outPath, sql, "utf8");
console.log(`Generated ${outPath} with:`);
console.log(`- ${allBadges.length} badges`);
console.log(`- ${questsData.length} quests`);
console.log(`- ${totalQ} questions`);
console.log(`- ${optionRows.length} options`);
