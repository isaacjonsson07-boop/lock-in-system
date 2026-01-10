/*
  # Add Missing Columns to Goals Table

  1. Changes
    - Add missing columns to goals table to match Goal type definition
    - description (text, optional) - Goal description
    - category (text, optional) - Goal category
    - target_date (timestamptz, optional) - Target completion date
    - goal_type (text, optional) - Type of goal (task, time, distance)
    - duration (text, optional) - For time-based goals
    - distance (text, optional) - For distance-based goals

  2. Details
    - All new columns are nullable to maintain backward compatibility
    - Existing goals will have NULL values for these fields
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'description'
  ) THEN
    ALTER TABLE goals ADD COLUMN description text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'category'
  ) THEN
    ALTER TABLE goals ADD COLUMN category text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'target_date'
  ) THEN
    ALTER TABLE goals ADD COLUMN target_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'goal_type'
  ) THEN
    ALTER TABLE goals ADD COLUMN goal_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'duration'
  ) THEN
    ALTER TABLE goals ADD COLUMN duration text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'distance'
  ) THEN
    ALTER TABLE goals ADD COLUMN distance text;
  END IF;
END $$;