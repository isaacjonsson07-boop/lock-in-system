/*
  # Allow Anonymous Habit Management

  1. Changes
    - Make user_id nullable in habits and habit_completions tables
    - Add RLS policies for anonymous users
    - Allow anonymous users to read/write habits where user_id is NULL
  
  2. Security
    - Anonymous users can only access habits with NULL user_id
    - Authenticated users can still access their own habits
*/

-- Make user_id nullable
ALTER TABLE habits ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE habit_completions ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own habits" ON habits;
DROP POLICY IF EXISTS "Users can insert own habits" ON habits;
DROP POLICY IF EXISTS "Users can update own habits" ON habits;
DROP POLICY IF EXISTS "Users can delete own habits" ON habits;

DROP POLICY IF EXISTS "Users can view own completions" ON habit_completions;
DROP POLICY IF EXISTS "Users can insert own completions" ON habit_completions;
DROP POLICY IF EXISTS "Users can update own completions" ON habit_completions;
DROP POLICY IF EXISTS "Users can delete own completions" ON habit_completions;

-- Habits policies for authenticated users
CREATE POLICY "Authenticated users can view own habits"
  ON habits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own habits"
  ON habits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own habits"
  ON habits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own habits"
  ON habits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Habits policies for anonymous users
CREATE POLICY "Anonymous users can view anonymous habits"
  ON habits FOR SELECT
  TO anon
  USING (user_id IS NULL);

CREATE POLICY "Anonymous users can insert anonymous habits"
  ON habits FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Anonymous users can update anonymous habits"
  ON habits FOR UPDATE
  TO anon
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Anonymous users can delete anonymous habits"
  ON habits FOR DELETE
  TO anon
  USING (user_id IS NULL);

-- Habit completions policies for authenticated users
CREATE POLICY "Authenticated users can view own completions"
  ON habit_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own completions"
  ON habit_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own completions"
  ON habit_completions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own completions"
  ON habit_completions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Habit completions policies for anonymous users
CREATE POLICY "Anonymous users can view anonymous completions"
  ON habit_completions FOR SELECT
  TO anon
  USING (user_id IS NULL);

CREATE POLICY "Anonymous users can insert anonymous completions"
  ON habit_completions FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Anonymous users can update anonymous completions"
  ON habit_completions FOR UPDATE
  TO anon
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Anonymous users can delete anonymous completions"
  ON habit_completions FOR DELETE
  TO anon
  USING (user_id IS NULL);