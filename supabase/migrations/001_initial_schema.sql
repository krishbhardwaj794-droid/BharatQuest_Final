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
