/*
  # Add Trial Support to User Profiles

  1. Changes
    - Add `trial_ends_at` column to `user_profiles` table
      - Type: timestamptz (timestamp with timezone)
      - Nullable: true (users who haven't started a trial won't have this set)
      - Purpose: Track when the user's 7-day free trial expires
  
  2. Notes
    - If trial_ends_at is NULL, user has not started a trial
    - If trial_ends_at is set and current time < trial_ends_at, trial is active
    - If trial_ends_at is set and current time >= trial_ends_at, trial has expired
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'trial_ends_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN trial_ends_at timestamptz;
  END IF;
END $$;
