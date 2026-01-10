/*
  # Remove Anonymous Habit Access

  1. Changes
    - Remove RLS policies that allow anonymous users to access habits
    - Require authentication to create and manage habits
    - Clean up any existing anonymous habits (user_id IS NULL)
  
  2. Security
    - Only authenticated users can create, read, update, and delete habits
    - Habits will only persist when users are logged in
*/

-- Drop anonymous user policies for habits
DROP POLICY IF EXISTS "Anonymous users can view anonymous habits" ON habits;
DROP POLICY IF EXISTS "Anonymous users can insert anonymous habits" ON habits;
DROP POLICY IF EXISTS "Anonymous users can update anonymous habits" ON habits;
DROP POLICY IF EXISTS "Anonymous users can delete anonymous habits" ON habits;

-- Drop anonymous user policies for habit_completions
DROP POLICY IF EXISTS "Anonymous users can view anonymous completions" ON habit_completions;
DROP POLICY IF EXISTS "Anonymous users can insert anonymous completions" ON habit_completions;
DROP POLICY IF EXISTS "Anonymous users can update anonymous completions" ON habit_completions;
DROP POLICY IF EXISTS "Anonymous users can delete anonymous completions" ON habit_completions;

-- Clean up any existing anonymous habits
DELETE FROM habit_completions WHERE user_id IS NULL;
DELETE FROM habits WHERE user_id IS NULL;

-- Make user_id required again
ALTER TABLE habits ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE habit_completions ALTER COLUMN user_id SET NOT NULL;