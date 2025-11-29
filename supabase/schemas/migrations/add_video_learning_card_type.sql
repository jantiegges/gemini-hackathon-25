-- Migration: Add video_learning card type to cards table
-- This migration adds support for the new video_learning card type

-- Drop the existing constraint
ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_type_check;

-- Add the new constraint with video_learning included
ALTER TABLE cards ADD CONSTRAINT cards_type_check 
    CHECK (type IN ('text', 'mc_question', 'fill_in_blank', 'infographic', 'video_learning'));

-- Add a comment for documentation
COMMENT ON COLUMN cards.type IS 'Card type: text, mc_question, fill_in_blank, infographic, or video_learning';

