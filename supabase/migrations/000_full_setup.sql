-- ==============================================================================
-- BHARATQUEST DATABASE MIGRATION 001: INITIAL SCHEMA & ROW LEVEL SECURITY
-- ==============================================================================

-- 1. PROFILES TABLE (Linked directly to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    class_year TEXT,
    avatar TEXT DEFAULT 'E',
    avatar_icon TEXT DEFAULT '🦁',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PLAYER STATS TABLE (XP, Level, accuracy, topic performance)
CREATE TABLE IF NOT EXISTS public.player_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    accuracy NUMERIC DEFAULT 0,
    total_quests INTEGER DEFAULT 0,
    completed_quests INTEGER DEFAULT 0,
    history_score INTEGER DEFAULT 0,
    culture_score INTEGER DEFAULT 0,
    geography_score INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. QUESTS TABLE
CREATE TABLE IF NOT EXISTS public.quests (
    id TEXT PRIMARY KEY,
    display_title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    difficulty TEXT DEFAULT 'Easy',
    estimated_time TEXT DEFAULT '~5 min',
    xp_reward TEXT DEFAULT '+250 XP Max',
    required_level INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active', -- 'active' | 'locked' | 'coming'
    icon TEXT DEFAULT '🏺',
    badge_id TEXT,
    badge_name TEXT,
    tags TEXT[] DEFAULT '{}',
    topic TEXT DEFAULT 'history',
    time_limit INTEGER DEFAULT 300,
    question_count INTEGER DEFAULT 5,
    difficulty_tier TEXT DEFAULT 'Basic',
    completion_message TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BADGES TABLE (Master definitions)
CREATE TABLE IF NOT EXISTS public.badges (
    id TEXT PRIMARY KEY,
    icon TEXT NOT NULL,
    name TEXT NOT NULL,
    "desc" TEXT,
    criteria TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY,
    quest_id TEXT NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
    topic TEXT,
    title TEXT,
    question TEXT NOT NULL,
    sub TEXT,
    clue TEXT,
    correct_answer TEXT NOT NULL,
    hint TEXT,
    fact TEXT,
    difficulty TEXT DEFAULT 'Medium',
    image_search_title TEXT,
    image_search_query TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. QUESTION OPTIONS TABLE (Each option for a question)
CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0
);

-- 7. ATTEMPTS TABLE (Fine-grained question-by-question attempts for analytics)
CREATE TABLE IF NOT EXISTS public.attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quest_id TEXT NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    used_hint BOOLEAN DEFAULT FALSE,
    xp_change INTEGER DEFAULT 0,
    answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. QUEST COMPLETIONS TABLE (High-level mission results)
CREATE TABLE IF NOT EXISTS public.quest_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quest_id TEXT NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
    quest_name TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    accuracy TEXT DEFAULT '0%',
    time_taken TEXT DEFAULT '00:00',
    badge_earned TEXT,
    clues_used INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. USER BADGES TABLE (Badges earned by users)
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, badge_id)
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_questions_quest_id ON public.questions(quest_id);
CREATE INDEX IF NOT EXISTS idx_question_options_qid ON public.question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON public.attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_quest ON public.attempts(quest_id);
CREATE INDEX IF NOT EXISTS idx_completions_user ON public.quest_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_xp ON public.player_stats(xp DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all 9 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- 1. Quests, Badges, Questions, Options are READ-ONLY for everyone (authenticated & anon)
DROP POLICY IF EXISTS "Public read quests" ON public.quests;
CREATE POLICY "Public read quests" ON public.quests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read badges" ON public.badges;
CREATE POLICY "Public read badges" ON public.badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read questions" ON public.questions;
CREATE POLICY "Public read questions" ON public.questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read question_options" ON public.question_options;
CREATE POLICY "Public read question_options" ON public.question_options FOR SELECT USING (true);

-- 2. Profiles: Anyone can view profiles (for leaderboard/community), users modify own profile
DROP POLICY IF EXISTS "Read all profiles" ON public.profiles;
CREATE POLICY "Read all profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert own profile" ON public.profiles;
CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Update own profile" ON public.profiles;
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Player Stats: Anyone can view stats (for leaderboard), users update own stats
DROP POLICY IF EXISTS "Read all player_stats" ON public.player_stats;
CREATE POLICY "Read all player_stats" ON public.player_stats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert own player_stats" ON public.player_stats;
CREATE POLICY "Insert own player_stats" ON public.player_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Update own player_stats" ON public.player_stats;
CREATE POLICY "Update own player_stats" ON public.player_stats FOR UPDATE USING (auth.uid() = user_id);

-- 4. Attempts: User-specific
DROP POLICY IF EXISTS "Read own attempts" ON public.attempts;
CREATE POLICY "Read own attempts" ON public.attempts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Insert own attempts" ON public.attempts;
CREATE POLICY "Insert own attempts" ON public.attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Quest Completions: User-specific
DROP POLICY IF EXISTS "Read own completions" ON public.quest_completions;
CREATE POLICY "Read own completions" ON public.quest_completions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Insert own completions" ON public.quest_completions;
CREATE POLICY "Insert own completions" ON public.quest_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. User Badges: Read all (for badge display & profiles), users earn own badges
DROP POLICY IF EXISTS "Read user_badges" ON public.user_badges;
CREATE POLICY "Read user_badges" ON public.user_badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert own user_badges" ON public.user_badges;
CREATE POLICY "Insert own user_badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE & STATS TRIGGER ON USER REGISTRATION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, class_year, avatar, avatar_icon)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Explorer'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'class_year', 'Class 9–10'),
        UPPER(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'name', 'E') FROM 1 FOR 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_icon', '🦁')
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.player_stats (user_id, xp, level, streak, total_questions, correct_answers, accuracy, total_quests, completed_quests)
    VALUES (NEW.id, 0, 1, 0, 0, 0, 0, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;

    -- Award initial 'first-discovery' badge
    INSERT INTO public.user_badges (user_id, badge_id)
    VALUES (NEW.id, 'first-discovery')
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================
-- BHARATQUEST DATABASE MIGRATION 002: SEED DATA
-- Total Quests: 4 | Total Badges: 7 | Total Questions: 70
-- ==============================================================================

-- 1. SEED BADGES
INSERT INTO public.badges (id, icon, name, "desc", criteria, order_index)
VALUES
  ('heritage-explorer', '🏺', 'Heritage Explorer', 'Awarded for completing Ancient India — Mission 01: The Lost Artifact. Proves foundational mastery of Indus Valley archaeological treasures.', 'Complete all 5 questions in Ancient India Mission 01.', 1),
  ('river-navigator', '🌊', 'River Navigator', 'Awarded for traversing India’s legendary river systems and geographic corridors in Explore India — Level 2.', 'Complete the Rivers of India exploration mission with at least 80% accuracy.', 2),
  ('first-discovery', '🔍', 'First Discovery', 'Awarded to every explorer who embarks on their journey into India’s vast historical tapestry.', 'Register an explorer account and start your BharatQuest journey.', 3),
  ('quest-warrior', '⚔️', 'Quest Warrior', 'Awarded to dedicated historians who conquer multiple challenging quests across diverse civilizations.', 'Reach Level 5 and complete the Culture & Traditions quest.', 4),
  ('scroll-master', '📜', 'Scroll Master', 'Awarded for demonstrating encyclopedic mastery with 100% accuracy on a full mission challenge.', 'Answer every question correctly on your first attempt without hints or errors.', 5),
  ('champion', '🏆', 'Champion', 'Awarded for ascending to the coveted podium ranks of the national BharatQuest leaderboard.', 'Achieve a top 3 rank on the explorer leaderboard by mastering quests.', 6),
  ('star-scholar', '🌟', 'Star Scholar', 'Awarded to supreme scholars who master all four foundational quest storylines across India.', 'Complete Ancient India, Explore India, Culture & Traditions, and Freedom Movement.', 7)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, "desc" = EXCLUDED."desc", criteria = EXCLUDED.criteria, icon = EXCLUDED.icon;

-- 2. SEED QUESTS
INSERT INTO public.quests (id, display_title, subtitle, description, difficulty, estimated_time, xp_reward, required_level, status, icon, badge_id, badge_name, tags, topic, time_limit, question_count, difficulty_tier, completion_message, order_index)
VALUES
  ('ancient-india-01', 'Ancient India', 'The Lost Artifact · Mission 01', 'Journey back to the dawn of civilization. Unravel mysteries of the Indus Valley, Vedic age, and mighty empires through archaeological clues.', 'Easy', '~5 min', '+250 XP Max', 1, 'active', '🏺', 'heritage-explorer', 'Heritage Explorer', '{"Indus Valley","Archeology","Harappa"}', 'history', 300, 5, 'Basic', 'You have successfully decoded the archaeological secrets of the Indus Valley!', 1),
  ('explore-india-02', 'Explore India — Level 2', 'Rivers and Landscapes', 'Traverse India’s legendary geography — from Himalayan passes to Indus tributaries, Deccan plateaus, and sacred river basins.', 'Intermediate', '10 min', '+75 XP', 4, 'locked', '🗺️', 'river-navigator', 'River Navigator', '{"Geography","Rivers","Himalayas"}', 'geography', 180, 3, 'Intermediate', 'You have successfully navigated the sacred and lifeline river networks of India!', 2),
  ('culture-traditions-03', 'Culture & Traditions', 'Classical Arts & Heritage', 'Discover the vibrant tapestry of Indian festivals, classical dance forms, musical heritages, and timeless artistic traditions across 28 states.', 'Medium', '15 min', '+100 XP', 5, 'coming', '🎭', 'quest-warrior', 'Quest Warrior', '{"Festivals","Architecture","Arts"}', 'culture', 300, 5, 'Intermediate', 'You celebrated and mastered the vibrant classical and folk traditions of India!', 3),
  ('freedom-movement-04', 'Freedom Movement', 'The Struggle for Swaraj', 'Walk alongside freedom fighters. Relive the landmark movements, sacrifices, and unity that birthed a modern sovereign republic.', 'Advanced', '15 min', '+150 XP', 6, 'coming', '🇮🇳', 'star-scholar', 'Star Scholar', '{"Independence","Modern History","Leaders"}', 'history', 300, 5, 'Advanced', 'You relived the monumental sacrifices and triumphs that birthed free India!', 4)
ON CONFLICT (id) DO UPDATE SET display_title = EXCLUDED.display_title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description, difficulty = EXCLUDED.difficulty, estimated_time = EXCLUDED.estimated_time, xp_reward = EXCLUDED.xp_reward, required_level = EXCLUDED.required_level, status = EXCLUDED.status, icon = EXCLUDED.icon, badge_id = EXCLUDED.badge_id, badge_name = EXCLUDED.badge_name, tags = EXCLUDED.tags, topic = EXCLUDED.topic, time_limit = EXCLUDED.time_limit, question_count = EXCLUDED.question_count, difficulty_tier = EXCLUDED.difficulty_tier, completion_message = EXCLUDED.completion_message;

-- 3. SEED QUESTIONS
INSERT INTO public.questions (id, quest_id, topic, title, question, sub, clue, correct_answer, hint, fact, difficulty, image_search_title, image_search_query, order_index)
VALUES
  ('ai_001', 'ancient-india-01', 'Ancient India', 'Identify the Civilization', 'This artifact is associated with which ancient civilization?', 'Inspect the terracotta seal markings and ancient wheel motifs.', 'Clue: Look closely at baked terracotta pottery, standardized bricks, and animal seal motifs.', 'Indus Valley Civilization', 'Flourished along the Indus river system and its tributaries around 2600–1900 BCE.', 'The Indus Valley Civilization pioneered urban sanitation, standardized weights, and baked-brick grid cities.', 'Easy', NULL, NULL, 1),
  ('ai_002', 'ancient-india-01', 'Ancient India', 'Major Urban Centre', 'Which city was one of the first excavated major urban centres of the Indus Valley Civilization?', 'Inspect the planned grid brickwork and fortified citadels.', 'Clue: Located in Punjab, this city gave its name to the entire archaeological culture upon discovery in the 1920s.', 'Harappa', 'Excavated in the 1920s by Daya Ram Sahni in Punjab (now Pakistan).', 'Harappa featured a massive fortified citadel, granaries, worker quarters, and standardized burnt-brick architecture.', 'Easy', NULL, NULL, 2),
  ('ai_003', 'ancient-india-01', 'Ancient India', 'Town Planning & Sanitation', 'Which feature is strongly associated with the urban planning of the Indus Valley Civilization?', 'Notice the terracotta pipe conduits and hydraulic engineering.', 'Clue: The settlements possessed an underground municipal engineering marvel unseen elsewhere in the ancient world.', 'Advanced drainage systems', 'Renowned for covered masonry street gutters, inspection traps, and household soak pits.', 'Harappan engineers constructed covered masonry drains beneath paved streets with household soak pits—centuries ahead of their time.', 'Easy', NULL, NULL, 3),
  ('ai_004', 'ancient-india-01', 'Ancient India', 'Ancient Inscriptions & Seals', 'Which writing system is associated with the Indus Valley Civilization?', 'Examine the unread pictograms engraved alongside animal motifs.', 'Clue: Thousands of steatite seals feature this enigmatic pictographic script, which remains undeciphered today.', 'Indus script', 'This enigmatic pictographic writing system found on seals and terracotta tablets remains undeciphered to this day.', 'The Indus script consists of over 400 unique signs, written primarily from right to left on seals, amulets, and copper tablets.', 'Medium', NULL, NULL, 4),
  ('ai_005', 'ancient-india-01', 'Ancient India', 'Monumental Archaeological Site', 'Which of the following is an important UNESCO World Heritage archaeological site of the Indus Valley Civilization in Gujarat?', 'Study the stone-masonry reservoirs and giant stepped water storage.', 'Clue: Located in Gujarat''s Rann of Kutch, this site features a colossal rainwater harvesting cascade.', 'Dholavira', 'Located in the Rann of Kutch, Gujarat, famous for 16 giant rock-cut reservoirs.', 'Dholavira is celebrated for its extraordinary stone architecture and a sophisticated water conservation network.', 'Easy', NULL, NULL, 5),
  ('ai_006', 'ancient-india-01', 'Ancient India', 'The Great Bath', 'At which Indus Valley city was the famous ''Great Bath'' discovered?', 'Examine the water-tight bitumen lined public hydraulic structure.', 'Clue: This metropolis on the right bank of the Indus River also revealed the famous ''Priest-King'' sculpture.', 'Mohenjo-daro', 'Located in Sindh, Pakistan, its name translates to ''Mound of the Dead''.', 'The Great Bath was made watertight by fitting finely fitted bricks with gypsum plaster and a layer of natural bitumen (tar).', 'Medium', NULL, NULL, 6),
  ('ai_007', 'ancient-india-01', 'Ancient India', 'Ancient Maritime Port', 'Which Indus Valley site is internationally famous for possessing a tidal dockyard connected to the Arabian Sea?', 'Trace the ancient maritime trade routes across the Gulf of Khambhat.', 'Clue: Located in the Bhal region of Gujarat, this port was a hub for bead-making and gemstone export.', 'Lothal', 'Located in Gujarat, it possessed a massive brick basin engineered to receive ships at high tide.', 'Lothal''s dockyard is considered the world''s earliest known engineered tidal dock, connecting Harappan trade to Mesopotamia.', 'Medium', NULL, NULL, 7),
  ('ai_008', 'ancient-india-01', 'Ancient India', 'Earliest Ploughed Field', 'At which Harappan site was archaeological evidence of the world''s earliest ploughed agricultural field discovered?', 'Analyze the criss-cross furrows indicating double cropping.', 'Clue: Located on the banks of the Ghaggar River in Hanumangarh district, Rajasthan.', 'Kalibangan', 'The name means ''black bangles'', referring to the terracotta bangles found scattered in the soil.', 'Excavations at Kalibangan uncovered a grid of ploughed furrows from 2800 BCE, indicating two different crops grown simultaneously.', 'Hard', NULL, NULL, 8),
  ('ai_009', 'ancient-india-01', 'Ancient India', 'Largest Harappan Site in India', 'Which site in Haryana is recognized as one of the largest settlements of the Indus Valley Civilization?', 'Study the sprawling mounds spanning over 350 hectares in Hisar district.', 'Clue: Recent excavations here have uncovered massive residential clusters, cemeteries, and drainage networks.', 'Rakhigarhi', 'Located in the Ghaggar-Hakra river plain in Haryana.', 'Rakhigarhi spans over 350 hectares, making it one of the largest Harappan urban centres discovered in South Asia.', 'Medium', NULL, NULL, 9),
  ('ai_010', 'ancient-india-01', 'Ancient India', 'Metallurgical Masterpiece', 'The iconic bronze figurine of the ''Dancing Girl'' was cast using which ancient metallurgical technique?', 'Examine the lost-wax bronze casting technique that flourished 4,500 years ago.', 'Clue: This cire-perdue method used beeswax models encased in clay before molten metal was poured in.', 'Lost-wax casting (Cire-perdue)', 'The process involves sculpting wax, coating it in clay, melting the wax out, and pouring liquid bronze.', 'The 10.5 cm bronze Dancing Girl from Mohenjo-daro showcases mastery of the lost-wax casting technique circa 2300 BCE.', 'Hard', NULL, NULL, 10),
  ('ai_011', 'ancient-india-01', 'Ancient India', 'Standardized Brick Dimensions', 'What was the standardized mathematical ratio of thickness, width, and length used for Harappan burnt bricks?', 'Notice the modular proportions used uniformly across thousands of miles.', 'Clue: The bricks followed a strict geometric proportion of 1 : 2 : 4.', '1 : 2 : 4', 'The length was four times the thickness, and the width was twice the thickness.', 'Harappan baked bricks uniformly maintained a 1 : 2 : 4 ratio across cities from Gujarat to Punjab, showing unprecedented civic standardization.', 'Hard', NULL, NULL, 11),
  ('ai_012', 'ancient-india-01', 'Ancient India', 'Pashupati Seal Motif', 'The famous ''Pashupati Seal'' from Mohenjo-daro depicts a seated horned figure surrounded by which four animals?', 'Inspect the engraved wildlife surrounding the seated yogic deity.', 'Clue: The four animals depicted around the central figure include an elephant, a tiger, a rhinoceros, and a buffalo.', 'Elephant, Tiger, Rhinoceros, and Buffalo', 'Two deers or ibexes are also depicted beneath the stool/throne.', 'The Pashupati Seal is considered by many historians as an early proto-Shiva representation, flanked by four iconic animals.', 'Hard', NULL, NULL, 12),
  ('ai_013', 'ancient-india-01', 'Ancient India', 'Mesopotamian Trade Records', 'In ancient Sumerian and Akkadian cuneiform inscriptions, which name is believed to refer to the Indus Valley region?', 'Trace maritime trade documents mentioning carnelian, lapis lazuli, and timber.', 'Clue: Mesopotamian King Sargon of Akkad boasted that ships from this land docked at his quays.', 'Meluhha', 'Dilmun was Bahrain, Magan was Oman, and this third land was the Indus realm.', 'Mesopotamian tablets refer to ''Meluhha'' as an eastern seafaring land that exported carnelian beads, ivory combs, and timber.', 'Hard', NULL, NULL, 13),
  ('ai_014', 'ancient-india-01', 'Ancient India', 'Pre-Harappan Agricultural Roots', 'Which archaeological site in Balochistan shows the earliest evidence of settled agriculture and cattle herding in South Asia (circa 7000 BCE)?', 'Examine the Neolithic mud-brick granaries and early wheat cultivation.', 'Clue: Located near the Bolan Pass, this site bridges the Stone Age to the Bronze Age.', 'Mehrgarh', 'Located on the Kachi plain near the Bolan Pass.', 'Mehrgarh provides unbroken evidence of early wheat farming, barley cultivation, and zebu cattle domestication starting around 7000 BCE.', 'Medium', NULL, NULL, 14),
  ('ai_015', 'ancient-india-01', 'Ancient India', 'Ancient Bead Workshop', 'Which small Harappan city was an exclusively specialized industrial centre for bead making, shell cutting, and seal carving without a citadel?', 'Notice the stone drills and furnace kilns for glazing carnelian.', 'Clue: Located 130 km south of Mohenjo-daro in Sindh.', 'Chanhudaro', 'Unlike other Harappan towns, it had no fortified upper citadel.', 'Chanhudaro was an industrial hub with specialized copper tools and furnaces used to craft microscopic steatite and carnelian beads.', 'Hard', NULL, NULL, 15),
  ('ai_016', 'ancient-india-01', 'Ancient India', 'Standardized Measurement System', 'The weights used by Harappan merchants for weighing precious commodities were made predominantly of which fine stone?', 'Inspect the polished cubic weights with precisely calibrated binary increments.', 'Clue: A hard, fine-grained sedimentary rock, often banded and silica-rich.', 'Chert', 'Quarried primarily from the Rohri Hills in Sindh.', 'Harappan chert weights were calibrated to a binary system (1, 2, 4, 8, 16, 32) at lower levels and decimal at higher levels.', 'Medium', NULL, NULL, 16),
  ('ai_017', 'ancient-india-01', 'Ancient India', 'Northernmost Frontier Post', 'Which Harappan trading post was established in northern Afghanistan to control trade in lapis lazuli gemstones?', 'Trace the Oxus (Amu Darya) river trading route to Central Asia.', 'Clue: Located near the Kokcha river valley, famed for deep blue lapis lazuli mines.', 'Shortugai', 'An isolated Harappan settlement far to the north on the Amu Darya.', 'Shortugai was founded directly adjacent to the Badakhshan lapis lazuli mines, complete with typical Harappan pottery and seals.', 'Hard', NULL, NULL, 17),
  ('ai_018', 'ancient-india-01', 'Ancient India', 'The Great Granary', 'The ''Great Granary'' complex, consisting of twelve circular brick platforms arranged in two rows, was excavated at which site?', 'Observe the raised air ducts beneath the storage rooms to prevent grain rot.', 'Clue: Located on the banks of the Ravi River in Punjab.', 'Harappa', 'This city was situated on the left bank of the Ravi river.', 'The granaries at Harappa were built on raised brick platforms with ventilation chambers to protect stored wheat and barley from moisture.', 'Medium', NULL, NULL, 18),
  ('ai_019', 'ancient-india-01', 'Ancient India', 'National Emblem Capital', 'The Lion Capital, which forms the National Emblem of India, was erected by Emperor Ashoka at which sacred site?', 'Notice the four Asiatic lions standing back to back above the Ashoka Chakra.', 'Clue: The site where Gautama Buddha delivered his first sermon (Dhammacakkappavattana Sutta).', 'Sarnath', 'Located near Varanasi, Uttar Pradesh, where the first turning of the Wheel of Dharma occurred.', 'Ashoka''s Lion Capital at Sarnath features four lions atop an abacus with a bull, horse, lion, and elephant separated by 24-spoke Dharmachakras.', 'Easy', NULL, NULL, 19),
  ('ai_020', 'ancient-india-01', 'Ancient India', 'Ancient University of Taxila', 'Which ancient centre of higher learning, located in the Gandhara region, educated Chanakya (Kautilya) and Chandragupta Maurya?', 'Examine the renowned university that attracted scholars from across Asia in medicine, military arts, and philosophy.', 'Clue: UNESCO World Heritage site situated in modern-day Rawalpindi district, Pakistan.', 'Takshashila (Taxila)', 'It flourished centuries before Nalanda and was visited by Alexander the Great.', 'Takshashila was an ancient learning hub where Panini compiled his Sanskrit grammar and Charaka advanced Ayurvedic medicine.', 'Medium', NULL, NULL, 20),
  ('ai_021', 'ancient-india-01', 'Ancient India', 'Earliest Rock-Cut Caves', 'The Barabar Hill Caves in Bihar, the oldest surviving rock-cut caves in India, were commissioned during which empire?', 'Study the mirror-like polished granite surfaces and bow-shaped roofs.', 'Clue: Commissioned by Emperor Ashoka and his grandson Dasharatha for the Ajivika ascetics.', 'Mauryan Empire', 'Commissioned in the 3rd century BCE by Ashoka the Great.', 'The Barabar Caves feature exquisite Mauryan glass-like wall polish (Mauryan polish) on hard granite bedrock.', 'Hard', NULL, NULL, 21),
  ('ai_022', 'ancient-india-01', 'Ancient India', 'Ancient Water Storage in Arid Lands', 'Which westernmost coastal Indus Valley outpost stood on the Makran coast near the Iranian border to monitor sea trade?', 'Analyze the fortified stone citadel built to safeguard maritime traders.', 'Clue: Located on the Dasht River near the Arabian Sea.', 'Sutkagan Dor', 'The westernmost recognized boundary post of the Harappan civilization.', 'Sutkagan Dor guarded the maritime trade gateway between the Indus Valley and the Persian Gulf civilizations.', 'Hard', NULL, NULL, 22),
  ('ri_001', 'explore-india-02', 'Indian Geography', 'Origin of the Sacred River', 'Which glacier in the Himalayas is the primary source of the Bhagirathi, the principal headstream of the River Ganga?', 'Observe the high-altitude Himalayan glaciology and headwater tributaries.', 'Clue: Located in Uttarkashi district of Uttarakhand, this terminus translates to ''Cow\''s Mouth''.', 'Gaumukh (Gangotri Glacier)', 'Located in the Garhwal Himalayas at over 4,000 meters elevation, feeding the Bhagirathi.', 'The River Ganga officially forms at Devprayag where the Bhagirathi (from Gaumukh) meets the Alaknanda.', 'Easy', NULL, NULL, 1),
  ('ri_002', 'explore-india-02', 'Indian Geography', 'The Trans-Himalayan Giant', 'Before entering Arunachal Pradesh, by what name is the Brahmaputra River known across the Tibetan Plateau?', 'Trace the east-flowing river traversing north of the Himalayas.', 'Clue: This Tibetan name literally translates to ''The Purifier'' and cuts through the world''s deepest canyon.', 'Yarlung Tsangpo', 'It originates from the Angsi Glacier near Mount Kailash before carving the Great Bend around Namcha Barwa.', 'The Brahmaputra flows 1,700 km as the Yarlung Tsangpo across southern Tibet before entering India as the Siang/Dihang.', 'Medium', NULL, NULL, 2),
  ('ri_003', 'explore-india-02', 'Indian Geography', 'Dakshin Ganga & Peninsular Drainage', 'Which river is the longest river in Peninsular India, popularly known as ''Dakshin Ganga''?', 'Analyze the east-flowing peninsular drainage basin originating in the Western Ghats.', 'Clue: Originating at Trimbakeshwar near Nashik, Maharashtra, this 1,465 km river flows into the Bay of Bengal.', 'Godavari', 'India''s second longest river after the Ganga, draining about 10% of India''s total land area.', 'The Godavari spans 1,465 km, originating at Trimbakeshwar in the Western Ghats and forming a fertile delta in Andhra Pradesh.', 'Easy', NULL, NULL, 3),
  ('ri_004', 'explore-india-02', 'Indian Geography', 'Rift Valley Drainage', 'Which major river flows westward through a tectonic rift valley between the Vindhya and Satpura mountain ranges?', 'Examine the west-flowing rivers that empty into the Gulf of Khambhat (Arabian Sea).', 'Clue: Famous for the Marble Rocks and Dhuandhar Falls near Jabalpur, Madhya Pradesh.', 'Narmada', 'Originates at Amarkantak plateau in Madhya Pradesh and forms the Sardar Sarovar Dam reservoir.', 'Unlike most peninsular rivers that flow east into the Bay of Bengal, the Narmada flows west through a fault rift valley.', 'Medium', NULL, NULL, 4),
  ('ri_005', 'explore-india-02', 'Indian Geography', 'Five Rivers of Punjab', 'Which five major rivers gave Punjab its historic name (''Land of Five Waters'')?', 'Trace the eastern tributaries of the Indus river system.', 'Clue: Jhelum, Chenab, Ravi, Beas, and Sutlej.', 'Jhelum, Chenab, Ravi, Beas, and Sutlej', 'All five rivers eventually converge into the Panjnad before joining the Indus River.', 'The Persian word ''Panj'' (five) and ''Aab'' (water) formed ''Punjab'', referring to these five Indus tributaries.', 'Easy', NULL, NULL, 5),
  ('ri_006', 'explore-india-02', 'Indian Geography', 'World''s Largest River Island', 'Majuli, recognized as the world''s largest inhabited freshwater river island, is formed by which mighty river in Assam?', 'Discover the cultural epicenter of Neo-Vaishnavite sattras and bio-diversity.', 'Clue: Formed where the Brahmaputra bifurcates and merges with the Kherkutia Xuti.', 'Brahmaputra', 'Located in Assam, it is also India''s first island district.', 'Majuli is the largest river island in the world, renowned for preserving 15th-century Assamese Neo-Vaishnavite monasteries.', 'Easy', NULL, NULL, 6),
  ('ri_007', 'explore-india-02', 'Indian Geography', 'Sacred River of Tamil Nadu', 'The Kaveri (Cauvery) River originates at Talakaveri in the Brahmagiri Hills of which district?', 'Trace the river that feeds the ancient Grand Anicut (Kallanai) dam.', 'Clue: Located in the Western Ghats of Kodagu (Coorg), Karnataka.', 'Kodagu (Coorg)', 'Famed as the coffee-growing district of Karnataka.', 'The Kaveri flows 800 km through Karnataka and Tamil Nadu before dividing into a fertile delta at Poompuhar.', 'Medium', NULL, NULL, 7),
  ('ri_008', 'explore-india-02', 'Indian Geography', 'Major Tributary of the Krishna', 'Which historic river is the chief tributary of the River Krishna, on whose banks the Vijayanagara Empire built its capital at Hampi?', 'Identify the river formed by the confluence of the Tunga and Bhadra streams.', 'Clue: Flowing through Karnataka and Andhra Pradesh, its ancient name was Pampa.', 'Tungabhadra', 'Formed at Koodli by the union of two streams, Tunga and Bhadra.', 'The ruins of the Vijayanagara Empire at Hampi stand directly on the southern bank of the Tungabhadra River.', 'Medium', NULL, NULL, 8),
  ('ri_009', 'explore-india-02', 'Indian Geography', 'Longest Earthen Dam River', 'The Hirakud Dam, one of the longest major earthen dams in the world, is built across which river in Odisha?', 'Analyze the river system that drains the Chhattisgarh basin into the Bay of Bengal.', 'Clue: Originating in the Sihawa highlands of Dhamtari district, Chhattisgarh.', 'Mahanadi', 'Its name literally translates to ''The Great River''.', 'The Hirakud Dam across the Mahanadi River spans over 25 km including dikes, constructed in 1957.', 'Medium', NULL, NULL, 9),
  ('ri_010', 'explore-india-02', 'Indian Geography', 'The Twin of the Narmada', 'Which west-flowing river originates near Multai in the Betul district of Madhya Pradesh and flows parallel to the Narmada?', 'Inspect the river that flows through Surat into the Gulf of Khambhat.', 'Clue: Often described as the ''daughter of the Sun god'' (Surya-putri).', 'Tapi (Tapti)', 'Flows for 724 km through Madhya Pradesh, Maharashtra, and Gujarat.', 'The Tapi and Narmada are the two major peninsular rivers that flow westward across India into the Arabian Sea.', 'Medium', NULL, NULL, 10),
  ('ri_011', 'explore-india-02', 'Indian Geography', 'World''s Largest Mangrove Delta', 'The Sundarbans delta, the largest mangrove forest ecosystem on Earth, is formed by the confluence of which rivers?', 'Examine the Bengal delta where the Royal Bengal tiger and Sundari trees thrive.', 'Clue: Formed by the Ganga, Brahmaputra, and Meghna rivers.', 'Ganga, Brahmaputra, and Meghna', 'A UNESCO World Heritage site shared between India and Bangladesh.', 'The Sundarbans spans over 10,000 square kilometers, named after the prolific mangrove species Heritiera fomes (Sundari).', 'Easy', NULL, NULL, 11),
  ('ri_012', 'explore-india-02', 'Indian Geography', 'The Sacred Triveni Sangam', 'At Prayagraj (Allahabad), the River Ganga is joined by its largest right-bank tributary, which originates at Yamunotri Glacier. Which river is this?', 'Trace the longest tributary river in India.', 'Clue: Originating on the Bandarpunch peak in Uttarakhand, it flows past Delhi and Agra.', 'Yamuna', 'Runs 1,376 km before meeting the Ganga at the sacred Triveni Sangam.', 'The Yamuna is the longest tributary river in India and second largest by discharge after the Ghaghara.', 'Easy', NULL, NULL, 12),
  ('ri_013', 'explore-india-02', 'Indian Geography', 'Lifeline of Sikkim', 'Which fast-flowing river originates from Tso Lhamo lake and cuts through dramatic gorges across Sikkim and West Bengal?', 'Inspect the major tributary of the Brahmaputra originating in high-altitude glaciers.', 'Clue: Known for whitewater rafting and forming the boundary between Darjeeling and Kalimpong.', 'Teesta', 'Carves through the Eastern Himalayas before joining the Brahmaputra (Jamuna) in Bangladesh.', 'The Teesta River flows 414 km from high glacial lakes in Sikkim, sustaining the Eastern Himalayan ecology.', 'Hard', NULL, NULL, 13),
  ('ri_014', 'explore-india-02', 'Indian Geography', 'River of the Thar Desert', 'Which is the largest river in the Thar Desert region of Rajasthan, known for its inland drainage ending in the Rann of Kutch?', 'Study the river that originates in the Pushkar valley of the Aravalli Range.', 'Clue: Its name derives from the Sanskrit word ''Lavanavati'' (Salt River) because its water turns brackish downstream.', 'Luni', 'Freshwater for the first 100 km, it becomes saline as it enters the desert flats.', 'The Luni is an endorheic river, meaning it does not drain into any sea but dissipates into the marshes of the Rann of Kutch.', 'Hard', NULL, NULL, 14),
  ('ri_015', 'explore-india-02', 'Indian Geography', 'Historic River of Gujarat', 'On the banks of which river did Mahatma Gandhi establish his famous Ashram in Ahmedabad in 1917?', 'Observe the river originating in the Dhebar lake in Udaipur, Rajasthan.', 'Clue: Flows south-west into the Gulf of Khambhat after passing Gandhinagar and Ahmedabad.', 'Sabarmati', 'From here, Gandhiji launched the historic Dandi Salt March in 1930.', 'The Sabarmati River was the focal point of India''s independence movement when Gandhi established the Sabarmati Satyagraha Ashram.', 'Easy', NULL, NULL, 15),
  ('ri_016', 'explore-india-02', 'Indian Geography', 'Source of the Indus', 'The Indus River (Sindhu) originates in Tibet in the vicinity of which sacred peak and lake?', 'Trace the 3,180 km trans-Himalayan river that gave India its historic name.', 'Clue: Originates at Bokhar Chu glacier near Lake Manasarovar and Mount Kailash.', 'Mount Kailash & Lake Manasarovar', 'Revered in Tibetan as ''Sengge Zangbo'' (Lion''s Mouth).', 'The Indus flows northwest through Ladakh, India, between the Ladakh and Zanskar mountain ranges before entering Pakistan.', 'Medium', NULL, NULL, 16),
  ('ct_001', 'culture-traditions-03', 'Culture & Traditions', 'Classical Dance of Kerala', 'Which classical dance form of Kerala is internationally famous for its elaborate facial makeup, billowing skirts, and dramatic story-telling?', 'Discover the vibrant performing art traditions of southern India.', 'Clue: Characters wear distinct green (paccha) makeup for noble heroes and red/black for demonic villains.', 'Kathakali', 'Combines dance, music, mime, and facial mudras to depict scenes from the Ramayana and Mahabharata.', 'Kathakali evolved during the 17th century in Kerala under the patronage of the Raja of Kottarakkara.', 'Easy', NULL, NULL, 1),
  ('ct_002', 'culture-traditions-03', 'Culture & Traditions', 'Ancient Treatise on Performing Arts', 'Which foundational Sanskrit treatise on dramaturgy, dance, and aesthetics is attributed to sage Bharata Muni?', 'Inspect the ancient text that codified the Navarasa (nine aesthetic emotions).', 'Clue: Known as the ''Fifth Veda'' of the performing arts.', 'Natya Shastra', 'Contains 36 chapters detailing theatrical stage design, musical scales, and emotional expression (rasa).', 'The Natya Shastra, compiled between 200 BCE and 200 CE, forms the common foundation for all Indian classical dance forms.', 'Medium', NULL, NULL, 2),
  ('ct_003', 'culture-traditions-03', 'Culture & Traditions', 'Mithila Folk Painting', 'Madhubani painting, celebrated for its intricate geometric patterns and natural dye pigments, originated in which region of Bihar?', 'Examine traditional domestic wall murals depicting nature and mythology.', 'Clue: Practiced traditionally by women in the ancient Mithila region.', 'Mithila', 'Historically painted on freshly plastered mud walls using fingers, twigs, and matchsticks.', 'Madhubani paintings are distinguished by eye-catching colors filled in double line borders without leaving empty spaces.', 'Easy', NULL, NULL, 3),
  ('ct_004', 'culture-traditions-03', 'Culture & Traditions', 'Dravidian Temple Tower', 'In Dravidian temple architecture, what is the monumental, highly ornamented entrance tower of a temple complex called?', 'Analyze the architectural anatomy of grand South Indian temples.', 'Clue: Rising above the temple boundary walls with hundreds of sculpted celestial figures.', 'Gopuram', 'The central tower over the sanctum is the Vimana, while this monumental gateway is the outer tower.', 'Gopurams grew to towering heights during the Vijayanagara and Nayaka periods, serving as civic landmarks.', 'Medium', NULL, NULL, 4),
  ('ct_005', 'culture-traditions-03', 'Culture & Traditions', 'Classical Dance of Tamil Nadu', 'Which ancient classical dance form originated in the temples of Tamil Nadu, previously known as Sadir Attam?', 'Observe the geometric precision of the Aramandi (half-sit) posture and rhythmic jathis.', 'Clue: Revived by Rukmini Devi Arundale and E. Krishna Iyer at Kalakshetra in the 1930s.', 'Bharatanatyam', 'Considered the oldest classical dance tradition of India, practiced by temple devadasis.', 'Bharatanatyam is noted for its sculptural postures, intricate footwork, and expressive eye and hand mudras.', 'Easy', NULL, NULL, 5),
  ('ct_006', 'culture-traditions-03', 'Culture & Traditions', 'New Year Festival of Assam', 'Which festive celebration marks the Assamese New Year and the onset of the spring seeding season in mid-April?', 'Listen to the rhythmic beats of the dhol, pepa horn, and graceful group dancing.', 'Clue: Also known as Rongali Bihu, celebrated with feasting and traditional pithas.', 'Bohag Bihu', 'The most important of the three Bihu festivals of Assam.', 'Rongali or Bohag Bihu celebrates fertility and new agricultural beginnings with seven days of music, dance, and gifting of gamosas.', 'Easy', NULL, NULL, 6),
  ('ct_007', 'culture-traditions-03', 'Culture & Traditions', 'Classical Dance of Northern India', 'Which classical dance form from Northern India derives its name from the Sanskrit word ''Katha'' (story) and is famous for lightning-fast pirouettes (chakkars)?', 'Notice the tatkar footwork synchronized with the beats of the tabla.', 'Clue: Developed across the Lucknow, Jaipur, and Banaras Gharanas.', 'Kathak', 'Storytellers who traveled between village temples before performing in Mughal courts.', 'Kathak uniquely blends Hindu temple devotional storytelling with elegant courtly subtleties developed in royal darbars.', 'Easy', NULL, NULL, 7),
  ('ct_008', 'culture-traditions-03', 'Culture & Traditions', 'Sun Temple Chariot Architecture', 'The Konark Sun Temple in Odisha is built in the monumental form of a celestial chariot with how many carved stone wheels?', 'Examine the 13th-century Kalinga architectural masterpiece built by King Narasimhadeva I.', 'Clue: It features 24 wheels symbolizing the 24 hours of the day or fortnights of the year.', '24 wheels', 'Each wheel functions as an accurate sundial to calculate the time of day from the shadow.', 'Konark''s 24 stone wheels are pulled by seven carved horses representing the seven days of the week or colors of sunlight.', 'Medium', NULL, NULL, 8),
  ('ct_009', 'culture-traditions-03', 'Culture & Traditions', 'Carnatic Music Trinity', 'Tyagaraja, Muthuswami Dikshitar, and Syama Sastri are reverently honored as the ''Trinity'' of which classical musical tradition?', 'Trace the 18th-century golden era of South Indian devotional ragas and krithis.', 'Clue: All three masters were born in the historic town of Thiruvarur, Tamil Nadu.', 'Carnatic Music', 'The classical music system prevalent in the southern Indian states.', 'The Musical Trinity of Carnatic music composed thousands of devotional krithis that established standard concert repertoires.', 'Medium', NULL, NULL, 9),
  ('ct_010', 'culture-traditions-03', 'Culture & Traditions', 'Tribal Art of Maharashtra', 'Which ancient tribal art form from the Sahyadri mountains of Maharashtra uses simple geometric shapes (circle, triangle, square) painted with white rice paste?', 'Look closely at the rhythmic spiral dance circles depicting communal harmony.', 'Clue: Named after the indigenous Warli tribe of Palghar and Thane districts.', 'Warli painting', 'The circle represents the sun and moon, the triangle depicts mountains, and the square signifies sacred human enclosures.', 'Warli paintings, traditionally created by women during weddings and harvest rites, use only natural white rice pigment on ochre mud walls.', 'Easy', NULL, NULL, 10),
  ('ct_011', 'culture-traditions-03', 'Culture & Traditions', 'Monolithic Rock Temple of Ellora', 'The colossal monolithic Kailasa Temple (Cave 16) at Ellora was carved top-down out of a single volcanic basalt cliff under which dynasty?', 'Marvel at the excavation that removed over 200,000 tonnes of rock without structural joins.', 'Clue: Commissioned by King Krishna I in the 8th century CE.', 'Rashtrakuta Dynasty', 'This dynasty ruled large parts of the Deccan from Manyakheta between the 6th and 10th centuries.', 'The Kailasa temple is the world''s largest monolithic rock-cut monument, carved vertically downward from the cliff apex.', 'Hard', NULL, NULL, 11),
  ('ct_012', 'culture-traditions-03', 'Culture & Traditions', 'Classical Monastic Dance of Assam', 'Which classical dance form was introduced in the 15th century by the saint-reformer Mahapurusha Srimanta Sankaradeva in the monasteries (sattras) of Assam?', 'Observe the devotional dance accompanied by the khol drum and cymbals.', 'Clue: Recognized as a classical dance form of India by Sangeet Natak Akademi in 2000.', 'Sattriya', 'Named after the ''sattras'' (monasteries) where it was preserved for centuries exclusively by celibate monks.', 'Sattriya dance emerged as an integral part of the Vaishnavite Bhakti movement in Assam, dramatizing mythological stories through song and gesture.', 'Hard', NULL, NULL, 12),
  ('ct_013', 'culture-traditions-03', 'Culture & Traditions', 'Traditional String Puppetry', 'What is the ancient string puppetry tradition of Rajasthan called, where master puppeteers manipulate wooden marionettes with whistling sound effects?', 'Watch the colorful wooden puppets clad in glittering traditional Rajasthani textiles.', 'Clue: The name literally translates to ''wooden doll'' (Kaath = wood, Putli = doll).', 'Kathputli', 'Practiced by the nomadic Bhatt community of Rajasthan to narrate historical tales of Amar Singh Rathore.', 'Kathputli puppeteers control the figures with two to five strings looped around their fingers while voicing dialogue with a bamboo reed whistle (boli).', 'Medium', NULL, NULL, 13),
  ('ct_014', 'culture-traditions-03', 'Culture & Traditions', 'Living Chola Temples', 'The Brihadisvara Temple at Thanjavur, celebrated for its 80-tonne monolithic granite dome apex, was built by which Chola emperor in 1010 CE?', 'Study the grand culmination of South Indian temple architecture.', 'Clue: One of the greatest conquerors and naval monarchs of the Chola Empire.', 'Rajaraja Chola I', 'Built to commemorate his imperial victories, popularly called the ''Big Temple''.', 'The Brihadisvara Temple''s 16-storey vimana rises 66 meters, topped by a single octagonal granite cupola estimated at 80 tonnes.', 'Medium', NULL, NULL, 14),
  ('ct_015', 'culture-traditions-03', 'Culture & Traditions', 'Buddhist Mural Paintings of Ajanta', 'The world-famous ancient fresco murals of the Ajanta Caves primarily depict stories from which Buddhist canonical literature?', 'Admire the compassionate Bodhisattva Padmapani holding a blue lotus in Cave 1.', 'Clue: Stories depicting the previous lives and incarnations of Gautama Buddha.', 'Jataka Tales', 'Parables illustrating virtues such as generosity, wisdom, and renunciation across human and animal forms.', 'Ajanta''s rock-cut caves preserve the finest masterworks of ancient Indian painting, dating between 2nd century BCE and 5th century CE.', 'Easy', NULL, NULL, 15),
  ('ct_016', 'culture-traditions-03', 'Culture & Traditions', 'Classical Odissi Posture', 'In classical Odissi dance, which signature tripartite body deflection posture breaks the body at the neck, torso, and knees?', 'Notice the graceful sculptural pose seen on temple friezes of Konark and Puri.', 'Clue: The term literally translates to ''three bends''.', 'Tribhanga', 'Complements the square, grounded ''Chowk'' posture representing Lord Jagannatha.', 'The Tribhanga posture creates a fluid S-curve silhouette that directly replicates the dancing celestial figures carved on Odishan stone temples.', 'Hard', NULL, NULL, 16),
  ('fm_001', 'freedom-movement-04', 'Freedom Movement', 'The 1857 Uprising', 'Which Indian sepoy fired the first historic shot against the British East India Company at Barrackpore on March 29, 1857?', 'Examine the historic revolt against the Enfield rifle cartridges.', 'Clue: A soldier in the 34th Bengal Native Infantry who became the first martyr of 1857.', 'Mangal Pandey', 'His bold defiance sparked the wider revolt across Meerut, Delhi, and Kanpur.', 'Mangal Pandey''s courageous resistance galvanized the Great Rebellion of 1857, often described as India''s First War of Independence.', 'Easy', NULL, NULL, 1),
  ('fm_002', 'freedom-movement-04', 'Freedom Movement', 'Gandhiji''s First Satyagraha', 'Mahatma Gandhi launched his first historic Satyagraha campaign on Indian soil in 1917 at which place to defend exploited indigo farmers?', 'Trace the early civil disobedience movement in northern Bihar.', 'Clue: Farmers were coerced under the oppressive ''Tinkathia'' system to plant indigo on 3/20ths of their lands.', 'Champaran', 'Invited to this Bihar district by local farmer Raj Kumar Shukla.', 'The Champaran Satyagraha of 1917 successfully abolished the exploitative Tinkathia system and established Gandhi''s leadership in India.', 'Easy', NULL, NULL, 2),
  ('fm_003', 'freedom-movement-04', 'Freedom Movement', 'The Historic Salt March', 'In 1930, Mahatma Gandhi marched 240 miles from Sabarmati Ashram to the coastal village of Dandi to defy which British tax law?', 'Witness the landmark Civil Disobedience campaign that ignited the nation.', 'Clue: A direct tax on an essential everyday mineral commodity required by every human being.', 'Salt Tax (Salt Law)', 'On April 6, 1930, Gandhi picked up a lump of natural salt from the beach to break the British monopoly.', 'The 24-day Dandi March galvanized nationwide civil disobedience, resulting in over 60,000 freedom fighters voluntarily courting arrest.', 'Easy', NULL, NULL, 3),
  ('fm_004', 'freedom-movement-04', 'Freedom Movement', 'Quit India Resolution', 'During which mass movement in August 1942 did Mahatma Gandhi issue the clarion call ''Do or Die'' (Karo ya Maro) from Gowalia Tank, Bombay?', 'Analyze the decisive nationwide movement demanding immediate British withdrawal.', 'Clue: Launched following the failure of the Cripps Mission during World War II.', 'Quit India Movement (August Kranti)', 'The historic Gowalia Tank Maidan in Mumbai is now commemorated as August Kranti Maidan.', 'The Quit India Movement of 1942 was the most intense mass uprising of the freedom struggle, paralyzing British administrative machinery.', 'Easy', NULL, NULL, 4),
  ('fm_005', 'freedom-movement-04', 'Freedom Movement', 'Tragedy of Jallianwala Bagh', 'The horrific Jallianwala Bagh massacre occurred on the festival day of Baisakhi in 1919 in which city?', 'Remember the unarmed citizens gathered to protest the arrest of Dr. Saifuddin Kitchlew and Dr. Satyapal.', 'Clue: Located near the Golden Temple in Punjab, where Brigadier General Reginald Dyer ordered troops to open fire.', 'Amritsar', 'Over a thousand peaceful men, women, and children were trapped inside the walled enclosure on April 13, 1919.', 'The massacre prompted Rabindranath Tagore to renounce his British Knighthood in moral protest against imperial brutality.', 'Easy', NULL, NULL, 5),
  ('fm_006', 'freedom-movement-04', 'Freedom Movement', 'Netaji & The Azad Hind Fauj', 'Netaji Subhas Chandra Bose revitalized the Indian National Army (INA) and gave the historic rallying cry ''Give me blood, and I shall give you freedom!'' from which country?', 'Trace the armed struggle for Indian liberation across Southeast Asia during World War II.', 'Clue: He established the Provisional Government of Free India (Arzi Hukumat-e-Azad Hind) in Singapore and Burma.', 'Burma (Myanmar) & Singapore', 'The INA advanced through Burma and unfurled the Tricolor at Moirang, Manipur in 1944.', 'Netaji''s Azad Hind Fauj included soldiers from all faiths as well as the revolutionary all-women Rani of Jhansi Regiment.', 'Medium', NULL, NULL, 6),
  ('fm_007', 'freedom-movement-04', 'Freedom Movement', 'Architect of the Constitution', 'Who served as the Chairman of the Drafting Committee of the Constituent Assembly of India and is revered as the Chief Architect of the Indian Constitution?', 'Honor the champion of social democracy and fundamental human rights.', 'Clue: Renowned jurist, economist, and social reformer who also served as Independent India''s first Law Minister.', 'Dr. B.R. Ambedkar', 'Born in Mhow, Madhya Pradesh, he dedicated his life to eradicating untouchability and social discrimination.', 'Dr. B.R. Ambedkar synthesized the world''s longest written constitution, guaranteeing fundamental rights and equality to every citizen.', 'Easy', NULL, NULL, 7),
  ('fm_008', 'freedom-movement-04', 'Freedom Movement', 'Integration of Princely States', 'Which leader, known as the ''Iron Man of India'' and ''Bismarck of India'', peacefully integrated over 560 princely states into the Indian Union?', 'Trace the heroic unification of the Indian republic following independence in 1947.', 'Clue: Served as the first Deputy Prime Minister and Home Minister of India.', 'Sardar Vallabhbhai Patel', 'Assisted by civil servant V.P. Menon, he negotiated the Instruments of Accession.', 'Sardar Patel''s diplomatic resolve unified a fragmented subcontinent into one sovereign democratic republic.', 'Easy', NULL, NULL, 8),
  ('fm_009', 'freedom-movement-04', 'Freedom Movement', 'Young Revolutionary Martyr', 'Which charismatic revolutionary socialist founded the Naujawan Bharat Sabha and was martyred at age 23 alongside Rajguru and Sukhdev in Lahore Jail?', 'Remember the visionary hero who coined the popular usage of ''Inquilab Zindabad!''', 'Clue: Threw non-lethal smoke bombs in the Central Legislative Assembly in 1929 to ''make the deaf hear''.', 'Bhagat Singh', 'Martyred on March 23, 1931, commemorated annually as Shaheed Diwas.', 'Bhagat Singh combined fearlessness with profound intellectual study, inspiring millions of Indian youth toward unconditional freedom.', 'Easy', NULL, NULL, 9),
  ('fm_010', 'freedom-movement-04', 'Freedom Movement', 'The Swadeshi Movement', 'The historic Swadeshi and Boycott Movement of 1905 was launched in direct protest against which imperial decision by Lord Curzon?', 'Analyze the mass protests promoting Indian-made goods and boycotting British textiles.', 'Clue: The controversial administrative division of Bengal on communal lines.', 'Partition of Bengal (1905)', 'Led by leaders like Bal Gangadhar Tilak, Bipin Chandra Pal, and Lala Lajpat Rai (Lal-Bal-Pal).', 'The Swadeshi Movement popularized the singing of Bankim Chandra''s ''Vande Mataram'' and ignited national pride in indigenous industries.', 'Medium', NULL, NULL, 10),
  ('fm_011', 'freedom-movement-04', 'Freedom Movement', 'Withdrawal of Non-Cooperation', 'Mahatma Gandhi abruptly called off the nationwide Non-Cooperation Movement in February 1922 following a violent incident at which town?', 'Examine Gandhi''s unyielding commitment to strict Ahimsa (non-violence).', 'Clue: A clash in Gorakhpur district, Uttar Pradesh, where a police station was set ablaze.', 'Chauri Chaura', 'Gandhi declared he would not allow a movement based on truth to turn violent at any cost.', 'Gandhi undertook a 5-day penitential fast and suspended the Non-Cooperation Movement because he refused to compromise on non-violence.', 'Medium', NULL, NULL, 11),
  ('fm_012', 'freedom-movement-04', 'Freedom Movement', 'Swaraj is My Birthright', 'Which nationalist leader declared the immortal slogan ''Swaraj is my birthright, and I shall have it!'' during the freedom struggle?', 'Celebrate the pioneer of the Home Rule movement and public Ganesh Utsav celebrations.', 'Clue: Revering him as ''The Father of the Indian Unrest'', the Indian public conferred on him the title ''Lokmanya''.', 'Bal Gangadhar Tilak', 'He founded the influential nationalist newspapers ''Kesari'' (in Marathi) and ''Mahratta'' (in English).', 'Lokmanya Tilak transformed the freedom struggle from an elite debate into a vibrant mass movement.', 'Easy', NULL, NULL, 12),
  ('fm_013', 'freedom-movement-04', 'Freedom Movement', 'Kakori Train Action', 'The historic Kakori Train Action of August 1925 was orchestrated by revolutionaries of which patriotic organization to fund their struggle?', 'Remember martyrs Ram Prasad Bismil, Ashfaqulla Khan, and Roshan Singh.', 'Clue: The Hindustan Republican Association (HRA), later reorganized by Chandrashekhar Azad.', 'Hindustan Republican Association (HRA)', 'Took place near Kakori, Lucknow, seizing British government treasury from a train.', 'Ram Prasad Bismil and Ashfaqulla Khan demonstrated supreme communal brotherhood in their joint sacrifice for Mother India.', 'Hard', NULL, NULL, 13),
  ('fm_014', 'freedom-movement-04', 'Freedom Movement', 'The Bardoli Satyagraha', 'Vallabhbhai Patel was formally bestowed the affectionate title ''Sardar'' (Leader) by the women of which region after his victorious peasant tax revolt in 1928?', 'Inspect the disciplined non-violent refusal to pay a 22% arbitrary land revenue hike.', 'Clue: A taluka in Surat district, Gujarat.', 'Bardoli', 'His masterful organization forced the British government to cancel the unjust land tax hikes.', 'The women of Bardoli bestowed the honorific ''Sardar'' upon Vallabhbhai Patel for his steadfast leadership.', 'Medium', NULL, NULL, 14),
  ('fm_015', 'freedom-movement-04', 'Freedom Movement', 'The Poona Pact of 1932', 'The historic Poona Pact of September 1932 was an agreement signed inside Yerwada Central Jail between which two eminent leaders?', 'Examine the agreement resolving political representation for Depressed Classes.', 'Clue: Replaced separate electorates with reserved seats in provincial legislatures.', 'Mahatma Gandhi and Dr. B.R. Ambedkar', 'Signed to end Mahatma Gandhi''s fast-unto-death in Yerwada Jail, Pune.', 'The Poona Pact nearly doubled reserved seats for Depressed Classes in provincial legislatures from 71 to 148.', 'Medium', NULL, NULL, 15),
  ('fm_016', 'freedom-movement-04', 'Freedom Movement', 'First President of Independent India', 'Who was unanimously elected as the first President of the Republic of India on January 24, 1950, by the Constituent Assembly?', 'Honor the veteran freedom fighter and scholar from Ziradei, Bihar.', 'Clue: He served as the President of the Constituent Assembly throughout the constitution-making process.', 'Dr. Rajendra Prasad', 'He is the only Indian President to have served two full terms in office (1950–1962).', 'Dr. Rajendra Prasad led the Constituent Assembly through 11 sessions spanning nearly 3 years to adopt India''s Constitution.', 'Easy', NULL, NULL, 16)
ON CONFLICT (id) DO UPDATE SET quest_id = EXCLUDED.quest_id, topic = EXCLUDED.topic, title = EXCLUDED.title, question = EXCLUDED.question, sub = EXCLUDED.sub, clue = EXCLUDED.clue, correct_answer = EXCLUDED.correct_answer, hint = EXCLUDED.hint, fact = EXCLUDED.fact, difficulty = EXCLUDED.difficulty, image_search_title = EXCLUDED.image_search_title, image_search_query = EXCLUDED.image_search_query;

-- 4. SEED QUESTION OPTIONS
-- First clean up existing options for idempotency
DELETE FROM public.question_options;

INSERT INTO public.question_options (question_id, option_text, is_correct, order_index)
VALUES
  ('ai_001', 'Indus Valley Civilization', TRUE, 0),
  ('ai_001', 'Mauryan Empire', FALSE, 1),
  ('ai_001', 'Gupta Empire', FALSE, 2),
  ('ai_001', 'Chola Dynasty', FALSE, 3),
  ('ai_002', 'Harappa', TRUE, 0),
  ('ai_002', 'Pataliputra', FALSE, 1),
  ('ai_002', 'Madurai', FALSE, 2),
  ('ai_002', 'Ujjain', FALSE, 3),
  ('ai_003', 'Advanced drainage systems', TRUE, 0),
  ('ai_003', 'Large stone temples', FALSE, 1),
  ('ai_003', 'Rock-cut caves', FALSE, 2),
  ('ai_003', 'Massive iron fortresses', FALSE, 3),
  ('ai_004', 'Indus script', TRUE, 0),
  ('ai_004', 'Brahmi', FALSE, 1),
  ('ai_004', 'Devanagari', FALSE, 2),
  ('ai_004', 'Persian', FALSE, 3),
  ('ai_005', 'Dholavira', TRUE, 0),
  ('ai_005', 'Nalanda', FALSE, 1),
  ('ai_005', 'Sanchi', FALSE, 2),
  ('ai_005', 'Ajanta', FALSE, 3),
  ('ai_006', 'Mohenjo-daro', TRUE, 0),
  ('ai_006', 'Kalibangan', FALSE, 1),
  ('ai_006', 'Banawali', FALSE, 2),
  ('ai_006', 'Ropar', FALSE, 3),
  ('ai_007', 'Lothal', TRUE, 0),
  ('ai_007', 'Alamgirpur', FALSE, 1),
  ('ai_007', 'Manda', FALSE, 2),
  ('ai_007', 'Chanhudaro', FALSE, 3),
  ('ai_008', 'Kalibangan', TRUE, 0),
  ('ai_008', 'Daimabad', FALSE, 1),
  ('ai_008', 'Kot Diji', FALSE, 2),
  ('ai_008', 'Amri', FALSE, 3),
  ('ai_009', 'Rakhigarhi', TRUE, 0),
  ('ai_009', 'Hastinapur', FALSE, 1),
  ('ai_009', 'Indraprastha', FALSE, 2),
  ('ai_009', 'Kurukshetra', FALSE, 3),
  ('ai_010', 'Lost-wax casting (Cire-perdue)', TRUE, 0),
  ('ai_010', 'Sand casting', FALSE, 1),
  ('ai_010', 'Hammered sheet repoussé', FALSE, 2),
  ('ai_010', 'Die punching', FALSE, 3),
  ('ai_011', '1 : 2 : 4', TRUE, 0),
  ('ai_011', '1 : 3 : 5', FALSE, 1),
  ('ai_011', '2 : 3 : 6', FALSE, 2),
  ('ai_011', '1 : 1 : 2', FALSE, 3),
  ('ai_012', 'Elephant, Tiger, Rhinoceros, and Buffalo', TRUE, 0),
  ('ai_012', 'Lion, Horse, Bull, and Camel', FALSE, 1),
  ('ai_012', 'Cow, Goat, Deer, and Leopard', FALSE, 2),
  ('ai_012', 'Peacock, Snake, Monkey, and Bear', FALSE, 3),
  ('ai_013', 'Meluhha', TRUE, 0),
  ('ai_013', 'Dilmun', FALSE, 1),
  ('ai_013', 'Magan', FALSE, 2),
  ('ai_013', 'Elam', FALSE, 3),
  ('ai_014', 'Mehrgarh', TRUE, 0),
  ('ai_014', 'Bhirrana', FALSE, 1),
  ('ai_014', 'Burzahom', FALSE, 2),
  ('ai_014', 'Koldihwa', FALSE, 3),
  ('ai_015', 'Chanhudaro', TRUE, 0),
  ('ai_015', 'Desalpur', FALSE, 1),
  ('ai_015', 'Kot Diji', FALSE, 2),
  ('ai_015', 'Rojdi', FALSE, 3),
  ('ai_016', 'Chert', TRUE, 0),
  ('ai_016', 'Sandstone', FALSE, 1),
  ('ai_016', 'Granite', FALSE, 2),
  ('ai_016', 'Limestone', FALSE, 3),
  ('ai_017', 'Shortugai', TRUE, 0),
  ('ai_017', 'Mundigak', FALSE, 1),
  ('ai_017', 'Altyn Depe', FALSE, 2),
  ('ai_017', 'Sarazm', FALSE, 3),
  ('ai_018', 'Harappa', TRUE, 0),
  ('ai_018', 'Kalibangan', FALSE, 1),
  ('ai_018', 'Sutkagan Dor', FALSE, 2),
  ('ai_018', 'Banawali', FALSE, 3),
  ('ai_019', 'Sarnath', TRUE, 0),
  ('ai_019', 'Bodh Gaya', FALSE, 1),
  ('ai_019', 'Kushinagar', FALSE, 2),
  ('ai_019', 'Lumbini', FALSE, 3),
  ('ai_020', 'Takshashila (Taxila)', TRUE, 0),
  ('ai_020', 'Nalanda', FALSE, 1),
  ('ai_020', 'Vikramashila', FALSE, 2),
  ('ai_020', 'Valabhi', FALSE, 3),
  ('ai_021', 'Mauryan Empire', TRUE, 0),
  ('ai_021', 'Gupta Empire', FALSE, 1),
  ('ai_021', 'Satavahana Empire', FALSE, 2),
  ('ai_021', 'Kushan Empire', FALSE, 3),
  ('ai_022', 'Sutkagan Dor', TRUE, 0),
  ('ai_022', 'Dholavira', FALSE, 1),
  ('ai_022', 'Manda', FALSE, 2),
  ('ai_022', 'Balakot', FALSE, 3),
  ('ri_001', 'Gaumukh (Gangotri Glacier)', TRUE, 0),
  ('ri_001', 'Siachen Glacier', FALSE, 1),
  ('ri_001', 'Pindari Glacier', FALSE, 2),
  ('ri_001', 'Zemu Glacier', FALSE, 3),
  ('ri_002', 'Yarlung Tsangpo', TRUE, 0),
  ('ri_002', 'Mekong', FALSE, 1),
  ('ri_002', 'Yangtze', FALSE, 2),
  ('ri_002', 'Salween', FALSE, 3),
  ('ri_003', 'Godavari', TRUE, 0),
  ('ri_003', 'Krishna', FALSE, 1),
  ('ri_003', 'Kaveri', FALSE, 2),
  ('ri_003', 'Mahanadi', FALSE, 3),
  ('ri_004', 'Narmada', TRUE, 0),
  ('ri_004', 'Godavari', FALSE, 1),
  ('ri_004', 'Chambal', FALSE, 2),
  ('ri_004', 'Betwa', FALSE, 3),
  ('ri_005', 'Jhelum, Chenab, Ravi, Beas, and Sutlej', TRUE, 0),
  ('ri_005', 'Ganga, Yamuna, Saraswati, Gomti, and Ghaghara', FALSE, 1),
  ('ri_005', 'Narmada, Tapi, Mahi, Sabarmati, and Luni', FALSE, 2),
  ('ri_005', 'Godavari, Krishna, Kaveri, Penna, and Vaigai', FALSE, 3),
  ('ri_006', 'Brahmaputra', TRUE, 0),
  ('ri_006', 'Ganga', FALSE, 1),
  ('ri_006', 'Mahanadi', FALSE, 2),
  ('ri_006', 'Godavari', FALSE, 3),
  ('ri_007', 'Kodagu (Coorg)', TRUE, 0),
  ('ri_007', 'Wayanad', FALSE, 1),
  ('ri_007', 'Chikmagalur', FALSE, 2),
  ('ri_007', 'Idukki', FALSE, 3),
  ('ri_008', 'Tungabhadra', TRUE, 0),
  ('ri_008', 'Bhima', FALSE, 1),
  ('ri_008', 'Koyna', FALSE, 2),
  ('ri_008', 'Ghataprabha', FALSE, 3),
  ('ri_009', 'Mahanadi', TRUE, 0),
  ('ri_009', 'Brahmani', FALSE, 1),
  ('ri_009', 'Baitarani', FALSE, 2),
  ('ri_009', 'Subarnarekha', FALSE, 3),
  ('ri_010', 'Tapi (Tapti)', TRUE, 0),
  ('ri_010', 'Sabarmati', FALSE, 1),
  ('ri_010', 'Mahi', FALSE, 2),
  ('ri_010', 'Sharavati', FALSE, 3),
  ('ri_011', 'Ganga, Brahmaputra, and Meghna', TRUE, 0),
  ('ri_011', 'Indus, Jhelum, and Chenab', FALSE, 1),
  ('ri_011', 'Godavari and Krishna', FALSE, 2),
  ('ri_011', 'Mahanadi and Baitarani', FALSE, 3),
  ('ri_012', 'Yamuna', TRUE, 0),
  ('ri_012', 'Ghaghara', FALSE, 1),
  ('ri_012', 'Gomti', FALSE, 2),
  ('ri_012', 'Kosi', FALSE, 3),
  ('ri_013', 'Teesta', TRUE, 0),
  ('ri_013', 'Rangeet', FALSE, 1),
  ('ri_013', 'Manas', FALSE, 2),
  ('ri_013', 'Subansiri', FALSE, 3),
  ('ri_014', 'Luni', TRUE, 0),
  ('ri_014', 'Ghaggar', FALSE, 1),
  ('ri_014', 'Sabarmati', FALSE, 2),
  ('ri_014', 'Banas', FALSE, 3),
  ('ri_015', 'Sabarmati', TRUE, 0),
  ('ri_015', 'Mahi', FALSE, 1),
  ('ri_015', 'Damanganga', FALSE, 2),
  ('ri_015', 'Shetrunji', FALSE, 3),
  ('ri_016', 'Mount Kailash & Lake Manasarovar', TRUE, 0),
  ('ri_016', 'Nanda Devi & Roopkund', FALSE, 1),
  ('ri_016', 'Kanchenjunga & Gurudongmar', FALSE, 2),
  ('ri_016', 'Annapurna & Tilicho', FALSE, 3),
  ('ct_001', 'Kathakali', TRUE, 0),
  ('ct_001', 'Mohiniyattam', FALSE, 1),
  ('ct_001', 'Koodiyattam', FALSE, 2),
  ('ct_001', 'Chakyar Koothu', FALSE, 3),
  ('ct_002', 'Natya Shastra', TRUE, 0),
  ('ct_002', 'Abhinaya Darpana', FALSE, 1),
  ('ct_002', 'Sangita Ratnakara', FALSE, 2),
  ('ct_002', 'Brihaddesi', FALSE, 3),
  ('ct_003', 'Mithila', TRUE, 0),
  ('ct_003', 'Magadha', FALSE, 1),
  ('ct_003', 'Anga', FALSE, 2),
  ('ct_003', 'Bhojpur', FALSE, 3),
  ('ct_004', 'Gopuram', TRUE, 0),
  ('ct_004', 'Vimana', FALSE, 1),
  ('ct_004', 'Shikhara', FALSE, 2),
  ('ct_004', 'Mandapa', FALSE, 3),
  ('ct_005', 'Bharatanatyam', TRUE, 0),
  ('ct_005', 'Kuchipudi', FALSE, 1),
  ('ct_005', 'Odissi', FALSE, 2),
  ('ct_005', 'Kathak', FALSE, 3),
  ('ct_006', 'Bohag Bihu', TRUE, 0),
  ('ct_006', 'Hornbill Festival', FALSE, 1),
  ('ct_006', 'Wangala', FALSE, 2),
  ('ct_006', 'Chapchar Kut', FALSE, 3),
  ('ct_007', 'Kathak', TRUE, 0),
  ('ct_007', 'Manipuri', FALSE, 1),
  ('ct_007', 'Sattriya', FALSE, 2),
  ('ct_007', 'Chhau', FALSE, 3),
  ('ct_008', '24 wheels', TRUE, 0),
  ('ct_008', '12 wheels', FALSE, 1),
  ('ct_008', '16 wheels', FALSE, 2),
  ('ct_008', '32 wheels', FALSE, 3),
  ('ct_009', 'Carnatic Music', TRUE, 0),
  ('ct_009', 'Hindustani Music', FALSE, 1),
  ('ct_009', 'Dhrupad', FALSE, 2),
  ('ct_009', 'Thumri', FALSE, 3),
  ('ct_010', 'Warli painting', TRUE, 0),
  ('ct_010', 'Gond art', FALSE, 1),
  ('ct_010', 'Pithora painting', FALSE, 2),
  ('ct_010', 'Cheriyal scroll', FALSE, 3),
  ('ct_011', 'Rashtrakuta Dynasty', TRUE, 0),
  ('ct_011', 'Chalukya Dynasty', FALSE, 1),
  ('ct_011', 'Pallava Dynasty', FALSE, 2),
  ('ct_011', 'Chola Dynasty', FALSE, 3),
  ('ct_012', 'Sattriya', TRUE, 0),
  ('ct_012', 'Manipuri', FALSE, 1),
  ('ct_012', 'Chhau', FALSE, 2),
  ('ct_012', 'Yakshagana', FALSE, 3),
  ('ct_013', 'Kathputli', TRUE, 0),
  ('ct_013', 'Tholu Bommalata', FALSE, 1),
  ('ct_013', 'Gombeyatta', FALSE, 2),
  ('ct_013', 'Bommalattam', FALSE, 3),
  ('ct_014', 'Rajaraja Chola I', TRUE, 0),
  ('ct_014', 'Rajendra Chola I', FALSE, 1),
  ('ct_014', 'Kulothunga Chola I', FALSE, 2),
  ('ct_014', 'Parantaka Chola I', FALSE, 3),
  ('ct_015', 'Jataka Tales', TRUE, 0),
  ('ct_015', 'Panchatantra', FALSE, 1),
  ('ct_015', 'Tripitaka', FALSE, 2),
  ('ct_015', 'Hitopadesha', FALSE, 3),
  ('ct_016', 'Tribhanga', TRUE, 0),
  ('ct_016', 'Chowk', FALSE, 1),
  ('ct_016', 'Samabhanga', FALSE, 2),
  ('ct_016', 'Abhanga', FALSE, 3),
  ('fm_001', 'Mangal Pandey', TRUE, 0),
  ('fm_001', 'Tatya Tope', FALSE, 1),
  ('fm_001', 'Kunwar Singh', FALSE, 2),
  ('fm_001', 'Bakht Khan', FALSE, 3),
  ('fm_002', 'Champaran', TRUE, 0),
  ('fm_002', 'Kheda', FALSE, 1),
  ('fm_002', 'Bardoli', FALSE, 2),
  ('fm_002', 'Ahmedabad', FALSE, 3),
  ('fm_003', 'Salt Tax (Salt Law)', TRUE, 0),
  ('fm_003', 'Land Revenue Tax', FALSE, 1),
  ('fm_003', 'Stamp Duty', FALSE, 2),
  ('fm_003', 'Cotton Import Duty', FALSE, 3),
  ('fm_004', 'Quit India Movement (August Kranti)', TRUE, 0),
  ('fm_004', 'Non-Cooperation Movement', FALSE, 1),
  ('fm_004', 'Civil Disobedience Movement', FALSE, 2),
  ('fm_004', 'Rowlatt Satyagraha', FALSE, 3),
  ('fm_005', 'Amritsar', TRUE, 0),
  ('fm_005', 'Lahore', FALSE, 1),
  ('fm_005', 'Ludhiana', FALSE, 2),
  ('fm_005', 'Jalandhar', FALSE, 3),
  ('fm_006', 'Burma (Myanmar) & Singapore', TRUE, 0),
  ('fm_006', 'Japan', FALSE, 1),
  ('fm_006', 'Germany', FALSE, 2),
  ('fm_006', 'Thailand', FALSE, 3),
  ('fm_007', 'Dr. B.R. Ambedkar', TRUE, 0),
  ('fm_007', 'Dr. Rajendra Prasad', FALSE, 1),
  ('fm_007', 'Jawaharlal Nehru', FALSE, 2),
  ('fm_007', 'Sardar Vallabhbhai Patel', FALSE, 3),
  ('fm_008', 'Sardar Vallabhbhai Patel', TRUE, 0),
  ('fm_008', 'C. Rajagopalachari', FALSE, 1),
  ('fm_008', 'Maulana Abul Kalam Azad', FALSE, 2),
  ('fm_008', 'Govind Ballabh Pant', FALSE, 3),
  ('fm_009', 'Bhagat Singh', TRUE, 0),
  ('fm_009', 'Chandrashekhar Azad', FALSE, 1),
  ('fm_009', 'Batukeshwar Dutt', FALSE, 2),
  ('fm_009', 'Ram Prasad Bismil', FALSE, 3),
  ('fm_010', 'Partition of Bengal (1905)', TRUE, 0),
  ('fm_010', 'Rowlatt Act', FALSE, 1),
  ('fm_010', 'Ilbert Bill', FALSE, 2),
  ('fm_010', 'Vernacular Press Act', FALSE, 3),
  ('fm_011', 'Chauri Chaura', TRUE, 0),
  ('fm_011', 'Kakori', FALSE, 1),
  ('fm_011', 'Meerut', FALSE, 2),
  ('fm_011', 'Jhansi', FALSE, 3),
  ('fm_012', 'Bal Gangadhar Tilak', TRUE, 0),
  ('fm_012', 'Gopal Krishna Gokhale', FALSE, 1),
  ('fm_012', 'Dadabhai Naoroji', FALSE, 2),
  ('fm_012', 'Subhas Chandra Bose', FALSE, 3),
  ('fm_013', 'Hindustan Republican Association (HRA)', TRUE, 0),
  ('fm_013', 'Ghadar Party', FALSE, 1),
  ('fm_013', 'Anushilan Samiti', FALSE, 2),
  ('fm_013', 'Abhinav Bharat', FALSE, 3),
  ('fm_014', 'Bardoli', TRUE, 0),
  ('fm_014', 'Kheda', FALSE, 1),
  ('fm_014', 'Dandi', FALSE, 2),
  ('fm_014', 'Anand', FALSE, 3),
  ('fm_015', 'Mahatma Gandhi and Dr. B.R. Ambedkar', TRUE, 0),
  ('fm_015', 'Jawaharlal Nehru and Subhas Chandra Bose', FALSE, 1),
  ('fm_015', 'Sardar Patel and Muhammad Ali Jinnah', FALSE, 2),
  ('fm_015', 'Lala Lajpat Rai and Bipin Chandra Pal', FALSE, 3),
  ('fm_016', 'Dr. Rajendra Prasad', TRUE, 0),
  ('fm_016', 'Dr. S. Radhakrishnan', FALSE, 1),
  ('fm_016', 'C. Rajagopalachari', FALSE, 2),
  ('fm_016', 'Dr. Zakir Husain', FALSE, 3);

