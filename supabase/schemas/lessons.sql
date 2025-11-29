-- Lessons table for storing learning path lessons
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    prev_lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    -- Chunk range this lesson covers
    start_chunk_index INTEGER NOT NULL DEFAULT 0,
    end_chunk_index INTEGER NOT NULL DEFAULT 0,
    -- Lesson status for card generation
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'ready')),
    -- Completion tracking
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    best_score INTEGER, -- percentage 0-100
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
