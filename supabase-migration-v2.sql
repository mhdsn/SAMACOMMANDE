-- ============================================================
-- SamaCommande — Migration V2
-- Ajoute: profiles, user_settings, politiques admin
-- A exécuter dans : Supabase > SQL Editor > New Query
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. TABLE : profiles
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       VARCHAR(255),
  full_name   VARCHAR(255) DEFAULT '',
  plan        VARCHAR(20) NOT NULL DEFAULT 'starter',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────
-- 2. TABLE : user_settings
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  settings    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────
-- 3. Trigger : créer un profil automatiquement à l'inscription
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà, puis le recréer
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ──────────────────────────────────────────────────────────────
-- 4. Remplir les profils pour les utilisateurs existants
-- ──────────────────────────────────────────────────────────────
INSERT INTO profiles (id, email, full_name)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', '')
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- 5. Trigger : mettre à jour updated_at
-- ──────────────────────────────────────────────────────────────
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 6. Row Level Security
-- ──────────────────────────────────────────────────────────────

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings  ENABLE ROW LEVEL SECURITY;

-- ── Profiles : chaque utilisateur voit/modifie son profil ──
CREATE POLICY "Utilisateur voit son profil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Utilisateur modifie son profil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── Admin voit TOUS les profils ──
CREATE POLICY "Admin voit tous les profils"
  ON profiles FOR SELECT
  USING (auth.jwt() ->> 'email' = 'senemouhamed27@gmail.com');

-- ── Admin voit TOUTES les commandes ──
CREATE POLICY "Admin voit toutes les commandes"
  ON orders FOR SELECT
  USING (auth.jwt() ->> 'email' = 'senemouhamed27@gmail.com');

CREATE POLICY "Admin voit tous les articles"
  ON order_items FOR SELECT
  USING (auth.jwt() ->> 'email' = 'senemouhamed27@gmail.com');

-- ── User Settings : chaque utilisateur gère ses paramètres ──
CREATE POLICY "Utilisateur voit ses paramètres"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateur crée ses paramètres"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateur modifie ses paramètres"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateur supprime ses paramètres"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);
