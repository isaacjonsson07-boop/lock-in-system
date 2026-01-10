/*
  # Add Linked Goal Support to Habits

  1. Changes
    - Add `linked_goal_id` column to `habits` table to support goal tracking
    - Column allows null values for habits without linked goals
  
  2. Details
    - `linked_goal_id` (text, optional) - References a goal ID to auto-update when habit is completed
    - No foreign key constraint as goals are stored in local storage for now
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'linked_goal_id'
  ) THEN
    ALTER TABLE habits ADD COLUMN linked_goal_id text;
  END IF;
END $$;