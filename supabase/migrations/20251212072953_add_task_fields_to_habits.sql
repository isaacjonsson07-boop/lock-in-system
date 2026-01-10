/*
  # Add Task Fields to Habits

  1. Changes
    - Add `time` field to habits (default '09:00')
    - Add `description` field to habits (optional text)
    - Add `duration` field to habits (optional, for time-based habits)
    - Add `distance` field to habits (optional, for distance-based habits)
  
  2. Notes
    - These fields make habits consistent with scheduled tasks
    - Allows habits to have the same rich information as regular tasks
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'time'
  ) THEN
    ALTER TABLE habits ADD COLUMN time text NOT NULL DEFAULT '09:00';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'description'
  ) THEN
    ALTER TABLE habits ADD COLUMN description text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'duration'
  ) THEN
    ALTER TABLE habits ADD COLUMN duration text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'habits' AND column_name = 'distance'
  ) THEN
    ALTER TABLE habits ADD COLUMN distance text;
  END IF;
END $$;