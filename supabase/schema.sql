-- Max & Mina's Ice Cream Flavor Drop App Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- FLAVORS TABLE
CREATE TABLE IF NOT EXISTS flavors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- fruity, creamy, nutty, chocolate, unique, savory, vegan
  tags TEXT[], -- ["vegan", "nut-free", "spicy", "asian-inspired"]
  first_appeared DATE NOT NULL,
  last_appeared DATE,
  total_appearances INTEGER DEFAULT 1,
  total_days_available INTEGER DEFAULT 0,
  rarity_score DECIMAL(3,1), -- 0-10 scale, calculated
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DAILY MENU TABLE (what's available today)
CREATE TABLE IF NOT EXISTS daily_menu (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flavor_id UUID REFERENCES flavors(id) ON DELETE CASCADE,
  menu_date DATE NOT NULL,
  appearance_number INTEGER, -- "This is the 23rd time ever"
  days_since_last INTEGER, -- "427 days since last appearance"
  sold_out_at TIMESTAMP WITH TIME ZONE,
  popularity_score INTEGER DEFAULT 0, -- track engagement
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(flavor_id, menu_date)
);

-- FLAVOR PHOTOS (owner uploads)
CREATE TABLE IF NOT EXISTS flavor_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  menu_date DATE NOT NULL,
  claude_response JSONB, -- raw AI extraction
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  phone TEXT,
  name TEXT,
  birthday DATE,
  notification_preferences JSONB DEFAULT '{"daily_drops": true, "watchlist": true, "sold_out": false}'::jsonb,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER WATCHLISTS
CREATE TABLE IF NOT EXISTS user_watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  flavor_id UUID REFERENCES flavors(id) ON DELETE CASCADE,
  alert_enabled BOOLEAN DEFAULT TRUE,
  missed_count INTEGER DEFAULT 0, -- appeared but didn't visit
  caught_count INTEGER DEFAULT 0, -- appeared and visited
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, flavor_id)
);

-- USER FLAVORS TRIED (check-ins)
CREATE TABLE IF NOT EXISTS user_flavors_tried (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  flavor_id UUID REFERENCES flavors(id) ON DELETE CASCADE,
  tried_date DATE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, flavor_id, tried_date)
);

-- FLAVOR SUGGESTIONS (customer voting)
CREATE TABLE IF NOT EXISTS flavor_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suggested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  flavor_name TEXT NOT NULL,
  description TEXT,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FLAVOR SUGGESTION VOTES
CREATE TABLE IF NOT EXISTS flavor_suggestion_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suggestion_id UUID REFERENCES flavor_suggestions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(suggestion_id, user_id)
);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_daily_menu_date ON daily_menu(menu_date);
CREATE INDEX IF NOT EXISTS idx_flavors_name ON flavors USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_flavors_rarity ON flavors(rarity_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_watchlists_user ON user_watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_flavor_suggestions_upvotes ON flavor_suggestions(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_daily_menu_flavor ON daily_menu(flavor_id);
CREATE INDEX IF NOT EXISTS idx_user_flavors_tried_user ON user_flavors_tried(user_id);

-- ROW LEVEL SECURITY (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE flavor_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_flavors_tried ENABLE ROW LEVEL SECURITY;
ALTER TABLE flavor_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flavor_suggestion_votes ENABLE ROW LEVEL SECURITY;

-- Flavors: Public read, admin write
CREATE POLICY "Flavors are viewable by everyone" ON flavors
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert flavors" ON flavors
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update flavors" ON flavors
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Daily Menu: Public read, admin write
CREATE POLICY "Daily menu is viewable by everyone" ON daily_menu
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage daily menu" ON daily_menu
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Flavor Photos: Admin only
CREATE POLICY "Admins can manage photos" ON flavor_photos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Users: Self read/write
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User Watchlists: Self only
CREATE POLICY "Users can view own watchlist" ON user_watchlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own watchlist" ON user_watchlists
  FOR ALL USING (auth.uid() = user_id);

-- User Flavors Tried: Self only
CREATE POLICY "Users can view own tried flavors" ON user_flavors_tried
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tried flavors" ON user_flavors_tried
  FOR ALL USING (auth.uid() = user_id);

-- Flavor Suggestions: Public read, authenticated write
CREATE POLICY "Suggestions are viewable by everyone" ON flavor_suggestions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create suggestions" ON flavor_suggestions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Suggestion Votes: Authenticated only
CREATE POLICY "Users can view own votes" ON flavor_suggestion_votes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own votes" ON flavor_suggestion_votes
  FOR ALL USING (auth.uid() = user_id);

-- Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for flavors updated_at
DROP TRIGGER IF EXISTS update_flavors_updated_at ON flavors;
CREATE TRIGGER update_flavors_updated_at
  BEFORE UPDATE ON flavors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable Realtime for daily_menu table (for sold out updates)
ALTER PUBLICATION supabase_realtime ADD TABLE daily_menu;

-- Sample seed data for testing
-- Uncomment to insert sample flavors

/*
INSERT INTO flavors (name, category, tags, first_appeared, total_appearances, rarity_score) VALUES
  ('Black Sesame', 'creamy', ARRAY['asian-inspired'], '2005-03-15', 45, 6.5),
  ('Ube Horchata', 'creamy', ARRAY['asian-inspired', 'vegan-option'], '2019-07-22', 8, 8.2),
  ('Mango Sticky Rice', 'fruity', ARRAY['asian-inspired', 'tropical'], '2018-06-01', 12, 7.8),
  ('Bacon Maple', 'savory', ARRAY['unique', 'savory'], '2012-11-10', 28, 7.0),
  ('Cookie Monster', 'creamy', ARRAY['chocolate', 'kids-favorite'], '2001-08-20', 156, 3.2),
  ('Wasabi', 'unique', ARRAY['spicy', 'asian-inspired'], '2008-04-05', 6, 8.8),
  ('Lavender Honey', 'floral', ARRAY['floral', 'local-honey'], '2016-05-15', 34, 6.8),
  ('Pumpkin Cheesecake', 'seasonal', ARRAY['fall', 'seasonal'], '2003-10-01', 89, 4.5),
  ('Birthday Cake', 'creamy', ARRAY['kids-favorite', 'classic'], '1999-01-15', 312, 1.8),
  ('Pistachio Rose', 'nutty', ARRAY['persian-inspired', 'floral'], '2020-02-14', 4, 9.2);
*/

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
