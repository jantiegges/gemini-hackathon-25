-- Cards table for storing lesson cards
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('text', 'mc_question', 'fill_in_blank', 'infographic', 'video_learning')),
    order_index INTEGER NOT NULL DEFAULT 0,
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
