import { Question } from '../types';

export interface QuestionImageSearchInfo {
  title: string;
  query: string;
  url: string;
}

/**
 * High-precision metadata mapping for existing questions in the BharatQuest banks.
 * Never includes answers, options, or letters to prevent spoiler leakage.
 */
const QUESTION_EXACT_MAP: Record<string, { title: string; query: string }> = {
  // Ancient India Questions
  'ai_001': { title: 'Indus Valley', query: 'Indus Valley Civilization archaeological sites' },
  'ai_002': { title: 'Harappa', query: 'Harappa archaeological site Punjab ruins' },
  'ai_003': { title: 'Indus Sanitation', query: 'Indus Valley drainage systems urban planning' },
  'ai_004': { title: 'Indus Script', query: 'Indus script seals steatite artifacts' },
  'ai_005': { title: 'Dholavira', query: 'Dholavira archaeological site India' },
  'ai_006': { title: 'Mohenjo-daro', query: 'Mohenjo-daro Great Bath archaeological ruins' },
  'ai_007': { title: 'Lothal Dockyard', query: 'Lothal ancient dockyard Gujarat Indus Valley' },
  'ai_008': { title: 'Kalibangan', query: 'Kalibangan ploughed field Rajasthan archaeological site' },
  'ai_009': { title: 'Rakhigarhi', query: 'Rakhigarhi Indus Valley archaeological excavation Haryana' },
  'ai_010': { title: 'Dancing Girl Bronze', query: 'Dancing Girl Mohenjo-daro bronze figurine National Museum' },
  'ai_011': { title: 'Harappan Bricks', query: 'Harappan burnt brick architecture Indus Valley' },
  'ai_012': { title: 'Pashupati Seal', query: 'Pashupati seal Mohenjo-daro steatite artifact' },
  'ai_013': { title: 'Meluhha Trade', query: 'Ancient Meluhha Indus Valley Mesopotamian trade seals' },
  'ai_014': { title: 'Mehrgarh', query: 'Mehrgarh Neolithic archaeological site Balochistan' },
  'ai_015': { title: 'Chanhudaro', query: 'Chanhudaro bead making workshop Indus Valley artifacts' },
  'ai_016': { title: 'Harappan Weights', query: 'Harappan chert cubical weights measurement Indus Valley' },
  'ai_017': { title: 'Shortugai', query: 'Shortugai Indus Valley lapis lazuli trading post Afghanistan' },
  'ai_018': { title: 'The Great Granary', query: 'Great Granary Harappa circular brick platforms' },
  'ai_019': { title: 'Lion Capital', query: 'Lion Capital of Ashoka Sarnath archaeological museum' },
  'ai_020': { title: 'Taxila University', query: 'Ancient Taxila university ruins Gandhara archaeological site' },
  'ai_021': { title: 'Barabar Caves', query: 'Barabar Hill Caves Bihar ancient rock cut architecture' },
  'ai_022': { title: 'Sutkagan Dor', query: 'Sutkagan Dor coastal Indus Valley outpost Makran' },

  // Culture & Traditions Questions
  'ct_001': { title: 'Kathakali', query: 'Kathakali classical dance Kerala makeup costume' },
  'ct_002': { title: 'Natya Shastra', query: 'Natya Shastra Bharata Muni ancient Sanskrit performing arts' },
  'ct_003': { title: 'Madhubani Art', query: 'Madhubani painting Mithila folk art Bihar' },
  'ct_004': { title: 'Dravidian Gopuram', query: 'Dravidian temple gopuram monumental gateway tower' },
  'ct_005': { title: 'Bharatanatyam', query: 'Bharatanatyam classical dance India' },
  'ct_006': { title: 'Bihu Festival', query: 'Bihu festival dance Assam folk culture' },
  'ct_007': { title: 'Kathak Dance', query: 'Kathak classical dance Northern India ghungroo' },
  'ct_008': { title: 'Konark Sun Temple', query: 'Konark Sun Temple Odisha stone chariot wheels architecture' },
  'ct_009': { title: 'Carnatic Music', query: 'Carnatic music trinity Tyagaraja classical Indian music' },
  'ct_010': { title: 'Warli Tribal Art', query: 'Warli tribal painting Maharashtra geometric folk art' },
  'ct_011': { title: 'Kailasa Temple', query: 'Kailasa Temple Cave 16 Ellora monolithic rock cut architecture' },
  'ct_012': { title: 'Sattriya Dance', query: 'Sattriya classical dance Assam Sankaradeva monastery' },
  'ct_013': { title: 'Kathputli Puppetry', query: 'Kathputli string puppetry Rajasthan traditional folk art' },
  'ct_014': { title: 'Brihadisvara Temple', query: 'Brihadisvara Temple Thanjavur Chola architecture granite vimana' },
  'ct_015': { title: 'Ajanta Murals', query: 'Ajanta Caves Buddhist fresco wall murals Maharashtra' },
  'ct_016': { title: 'Odissi Dance', query: 'Odissi classical dance Tribhanga posture sculpture Odisha' },

  // Indian Geography / Rivers Questions
  'ri_001': { title: 'Gangotri Glacier', query: 'Gangotri glacier Gomukh Bhagirathi Himalayas source' },
  'ri_002': { title: 'Brahmaputra River', query: 'Yarlung Tsangpo Brahmaputra river Tibet Arunachal Pradesh gorge' },
  'ri_003': { title: 'Godavari River', query: 'Godavari River Dakshin Ganga peninsular India landscape' },
  'ri_004': { title: 'Narmada Rift Valley', query: 'Narmada River rift valley Marble Rocks Bhedaghat Vindhya Satpura' },
  'ri_005': { title: 'Punjab Rivers', query: 'Rivers of Punjab Satluj Beas Ravi Chenab Jhelum map' },
  'ri_006': { title: 'Majuli Island', query: 'Majuli river island Assam Brahmaputra freshwater island' },
  'ri_007': { title: 'Kaveri River', query: 'Kaveri River Talakaveri India' },
  'ri_008': { title: 'Tungabhadra River', query: 'Tungabhadra River Hampi Vijayanagara ruins Karnataka' },
  'ri_009': { title: 'Hirakud Dam', query: 'Hirakud Dam Mahanadi River Odisha longest earthen dam' },
  'ri_010': { title: 'Tapi River', query: 'Tapi River Betul Satpura range west flowing India' },
  'ri_011': { title: 'Sundarbans Delta', query: 'Sundarbans mangrove forest delta Bengal tiger ecosystem' },
  'ri_012': { title: 'Triveni Sangam', query: 'Triveni Sangam Prayagraj Ganga Yamuna confluence' },
  'ri_013': { title: 'Teesta River', query: 'Teesta River Sikkim gorge Himalayas water landscape' },
  'ri_014': { title: 'Luni River', query: 'Luni River Thar Desert Rajasthan ephemeral river' },
  'ri_015': { title: 'Sabarmati River', query: 'Sabarmati Riverfront Ahmedabad Gandhi Ashram Gujarat' },
  'ri_016': { title: 'Indus River Origin', query: 'Indus River Sengge Zangbo Mount Kailash Lake Mansarovar Tibet' },

  // Freedom Movement Questions
  'fm_001': { title: 'Mangal Pandey', query: 'Mangal Pandey 1857 Sepoy Mutiny Barrackpore memorial' },
  'fm_002': { title: 'Champaran Satyagraha', query: 'Champaran Satyagraha 1917 Mahatma Gandhi indigo farmers Bihar' },
  'fm_003': { title: 'Dandi Salt March', query: 'Dandi Salt March 1930 Mahatma Gandhi freedom movement' },
  'fm_004': { title: 'Quit India Movement', query: 'Quit India Movement 1942 Gowalia Tank Maidan Mumbai' },
  'fm_005': { title: 'Jallianwala Bagh', query: 'Jallianwala Bagh memorial Amritsar bullet marks 1919' },
  'fm_006': { title: 'Netaji Subhas Bose', query: 'Netaji Subhas Chandra Bose Azad Hind Fauj Indian National Army' },
  'fm_007': { title: 'Dr. B.R. Ambedkar', query: 'Dr BR Ambedkar Constituent Assembly Drafting Committee India' },
  'fm_008': { title: 'Sardar Vallabhbhai Patel', query: 'Sardar Vallabhbhai Patel Iron Man of India Statue of Unity' },
  'fm_009': { title: 'Bhagat Singh', query: 'Bhagat Singh Indian revolutionary freedom fighter memorial' },
  'fm_010': { title: 'Swadeshi Movement', query: 'Swadeshi Movement 1905 Bengal partition bonfire foreign goods' },
  'fm_011': { title: 'Chauri Chaura', query: 'Chauri Chaura incident 1922 Non Cooperation Movement memorial' },
  'fm_012': { title: 'Lokmanya Tilak', query: 'Bal Gangadhar Tilak Swaraj is my birthright freedom fighter' },
  'fm_013': { title: 'Kakori Action', query: 'Kakori Train Action 1925 revolutionary memorial HRA' },
  'fm_014': { title: 'Bardoli Satyagraha', query: 'Bardoli Satyagraha 1928 Sardar Patel Gujarat peasants' },
  'fm_015': { title: 'Poona Pact', query: 'Poona Pact 1932 Yerwada Central Jail Gandhi Ambedkar' },
  'fm_016': { title: 'Dr. Rajendra Prasad', query: 'Dr Rajendra Prasad first President of India Rashtrapati Bhavan' },
};

/**
 * Keyword-based visual topics for fast and accurate topic matching.
 */
const KEYWORD_VISUAL_TOPICS: Array<{ keywords: string[]; title: string; query: string }> = [
  // Specific examples from specification
  { keywords: ['indus valley', 'harappan civilization'], title: 'Indus Valley', query: 'Indus Valley Civilization archaeological sites' },
  { keywords: ['dholavira'], title: 'Dholavira', query: 'Dholavira archaeological site India' },
  { keywords: ['harappan pottery', 'terracotta pottery'], title: 'Harappan Pottery', query: 'Harappan pottery artifacts' },
  { keywords: ['bharatanatyam'], title: 'Bharatanatyam', query: 'Bharatanatyam classical dance India' },
  { keywords: ['red fort'], title: 'Red Fort', query: 'Red Fort Delhi historical monument' },
  { keywords: ['ashoka', 'mauryan'], title: 'Ashoka', query: 'Emperor Ashoka Mauryan Empire' },
  { keywords: ['aryabhata'], title: 'Aryabhata', query: 'Aryabhata ancient Indian mathematician astronomy' },
  { keywords: ['kaveri', 'cauvery', 'talakaveri'], title: 'Kaveri River', query: 'Kaveri River Talakaveri India' },
  { keywords: ['himalaya', 'himalayas', 'himalayan'], title: 'Himalayas', query: 'Himalayas India landscape' },
  { keywords: ['great bath', 'mohenjo-daro', 'mohenjodaro'], title: 'Mohenjo-daro', query: 'Mohenjo-daro Great Bath archaeological ruins' },
  { keywords: ['lothal', 'dockyard'], title: 'Lothal', query: 'Lothal ancient dockyard Gujarat Indus Valley' },
  { keywords: ['kalibangan'], title: 'Kalibangan', query: 'Kalibangan ploughed field Rajasthan archaeological site' },
  { keywords: ['dancing girl'], title: 'Dancing Girl', query: 'Dancing Girl Mohenjo-daro bronze figurine National Museum' },
  { keywords: ['pashupati'], title: 'Pashupati Seal', query: 'Pashupati seal Mohenjo-daro steatite artifact' },
  { keywords: ['kathakali'], title: 'Kathakali', query: 'Kathakali classical dance Kerala makeup costume' },
  { keywords: ['madhubani', 'mithila'], title: 'Madhubani Art', query: 'Madhubani painting Mithila folk art Bihar' },
  { keywords: ['gopuram'], title: 'Dravidian Gopuram', query: 'Dravidian temple gopuram monumental gateway tower' },
  { keywords: ['konark', 'sun temple'], title: 'Konark Sun Temple', query: 'Konark Sun Temple Odisha stone chariot wheels architecture' },
  { keywords: ['kailasa temple', 'ellora'], title: 'Kailasa Temple', query: 'Kailasa Temple Cave 16 Ellora monolithic rock cut architecture' },
  { keywords: ['ajanta'], title: 'Ajanta Caves', query: 'Ajanta Caves Buddhist fresco wall murals Maharashtra' },
  { keywords: ['gangotri', 'bhagirathi'], title: 'Gangotri Glacier', query: 'Gangotri glacier Gomukh Bhagirathi Himalayas source' },
  { keywords: ['brahmaputra', 'tsangpo'], title: 'Brahmaputra', query: 'Yarlung Tsangpo Brahmaputra river Tibet Arunachal Pradesh gorge' },
  { keywords: ['godavari', 'dakshin ganga'], title: 'Godavari River', query: 'Godavari River Dakshin Ganga peninsular India landscape' },
  { keywords: ['narmada'], title: 'Narmada River', query: 'Narmada River rift valley Marble Rocks Bhedaghat Vindhya Satpura' },
  { keywords: ['majuli'], title: 'Majuli Island', query: 'Majuli river island Assam Brahmaputra freshwater island' },
  { keywords: ['sundarbans', 'mangrove'], title: 'Sundarbans Delta', query: 'Sundarbans mangrove forest delta Bengal tiger ecosystem' },
  { keywords: ['jallianwala'], title: 'Jallianwala Bagh', query: 'Jallianwala Bagh memorial Amritsar bullet marks 1919' },
  { keywords: ['salt march', 'dandi'], title: 'Dandi Salt March', query: 'Dandi Salt March 1930 Mahatma Gandhi freedom movement' },
  { keywords: ['quit india'], title: 'Quit India Movement', query: 'Quit India Movement 1942 Gowalia Tank Maidan Mumbai' },
  { keywords: ['bhagat singh'], title: 'Bhagat Singh', query: 'Bhagat Singh Indian revolutionary freedom fighter memorial' },
  { keywords: ['ambedkar'], title: 'Dr. B.R. Ambedkar', query: 'Dr BR Ambedkar Constituent Assembly Drafting Committee India' },
  { keywords: ['patel', 'statue of unity', 'bardoli'], title: 'Sardar Patel', query: 'Sardar Vallabhbhai Patel Iron Man of India Statue of Unity' },
  { keywords: ['subhas', 'netaji', 'azad hind'], title: 'Netaji Subhas Bose', query: 'Netaji Subhas Chandra Bose Azad Hind Fauj Indian National Army' },
  { keywords: ['taj mahal'], title: 'Taj Mahal', query: 'Taj Mahal Agra monument India' },
  { keywords: ['qutub minar'], title: 'Qutub Minar', query: 'Qutub Minar complex Delhi' },
  { keywords: ['sanchi'], title: 'Sanchi Stupa', query: 'Sanchi Stupa Buddhist monument Madhya Pradesh' },
  { keywords: ['hampi'], title: 'Hampi Ruins', query: 'Hampi Vijayanagara ruins Karnataka' },
];

/**
 * Clean up title text to make a concise button title (e.g. "Explore [short topic]").
 */
function cleanShortTitle(rawTitle: string): string {
  if (!rawTitle) return 'Heritage Topic';
  let cleaned = rawTitle.replace(/^(the|an|a|ancient|famous|historic|sacred)\s+/i, '');
  cleaned = cleaned.replace(/[—–\-:·].*$/, '').trim();
  const words = cleaned.split(/\s+/);
  if (words.length > 3) {
    cleaned = words.slice(0, 3).join(' ');
  }
  return cleaned;
}

/**
 * Safely sanitizes a fallback query to ensure no answer spoiling occurs.
 */
function buildFallbackSearch(question: Question): { title: string; query: string } {
  const shortTitle = cleanShortTitle(question.title || question.topic || 'Indian Heritage');
  const queryParts = [shortTitle, question.topic, 'India heritage'];
  const cleanQuery = queryParts
    .filter(Boolean)
    .join(' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    title: shortTitle,
    query: cleanQuery || `${question.topic || 'India'} cultural heritage`
  };
}

/**
 * Returns structured search metadata (title, query, and encoded Google Images URL).
 * Strictly guarantees that correct answers or option letters are NEVER revealed.
 */
export function getQuestionImageSearch(question: Question): QuestionImageSearchInfo {
  // 1. If question explicitly has imageSearch defined, use it
  if (question.imageSearch && question.imageSearch.title && question.imageSearch.query) {
    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(question.imageSearch.query)}`;
    return {
      title: question.imageSearch.title,
      query: question.imageSearch.query,
      url
    };
  }

  // 2. Check exact ID match in our predefined curated dictionary
  if (question.id && QUESTION_EXACT_MAP[question.id]) {
    const match = QUESTION_EXACT_MAP[question.id];
    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(match.query)}`;
    return {
      title: match.title,
      query: match.query,
      url
    };
  }

  // 3. Check keywords across question text, title, and sub-text
  const fullText = `${question.title} ${question.question} ${question.sub}`.toLowerCase();
  for (const item of KEYWORD_VISUAL_TOPICS) {
    if (item.keywords.some((kw) => fullText.includes(kw))) {
      const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(item.query)}`;
      return {
        title: item.title,
        query: item.query,
        url
      };
    }
  }

  // 4. Fallback: Clean topic extraction
  const fallback = buildFallbackSearch(question);
  const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(fallback.query)}`;
  return {
    title: fallback.title,
    query: fallback.query,
    url
  };
}

/**
 * Opens Google Images in a new tab without altering player state, XP, or timer.
 */
export function openQuestionImageSearch(question: Question): void {
  const searchInfo = getQuestionImageSearch(question);
  window.open(searchInfo.url, '_blank', 'noopener,noreferrer');
}
