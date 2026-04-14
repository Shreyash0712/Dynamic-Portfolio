-- Themes: Multiple themes/websites support
CREATE TABLE themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pages: Each theme has multiple pages
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(theme_id, slug)
);

-- Components: Bento box grid items
CREATE TABLE components_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,

    status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'published'
    is_visible BOOLEAN NOT NULL DEFAULT true,
    
    -- Bento grid positioning (CSS Grid style)
    row_start INTEGER NOT NULL DEFAULT 1,
    row_span INTEGER NOT NULL DEFAULT 1 CHECK (row_span >= 1 AND row_span <= 12),
    col_start INTEGER NOT NULL DEFAULT 1,
    col_span INTEGER NOT NULL DEFAULT 1 CHECK (col_span >= 1 AND col_span <= 12),
    
    -- Content: Rich text with inline styles
    content_html TEXT, -- HTML with inline CSS for colors/fonts
    
    -- Flexbox alignment within the card
    align_items TEXT DEFAULT 'center', -- 'start' | 'center' | 'end' | 'stretch'
    justify_content TEXT DEFAULT 'center', -- 'start' | 'center' | 'end' | 'between' | 'around'
    
    -- Layout
    bg_color TEXT, -- hex color
    padding INTEGER DEFAULT 24, -- padding in px
    border_radius TEXT DEFAULT 'medium', -- 'small' | 'medium' | 'large' | 'circle'
    
    -- Image specific fields (for image components)
    image_url TEXT,
    image_public_id TEXT,
    image_position TEXT DEFAULT 'none', -- 'left' | 'right' | 'center' | 'background' | 'none'
    image_opacity INTEGER CHECK (image_opacity >= 0 AND image_opacity <= 100),
    image_accent_color TEXT, -- overlay color
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin users (unchanged)
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_themes_active ON themes(is_active);
CREATE INDEX idx_pages_theme_id ON pages(theme_id);
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_components_page_id ON components_new(page_id);
CREATE INDEX idx_components_status ON components_new(status);
CREATE INDEX idx_components_type ON components_new(component_type);
CREATE INDEX idx_components_grid ON components_new(page_id, row_start, col_start);

-- Only one theme can be active at a time
CREATE UNIQUE INDEX idx_single_active_theme ON themes(is_active) WHERE is_active = true;

-- Trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_components_new_updated_at BEFORE UPDATE ON components_new
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

