CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id     TEXT NOT NULL UNIQUE,
  handle        TEXT NOT NULL UNIQUE,
  display_name  TEXT NOT NULL,
  avatar_url    TEXT,
  email         TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE videos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  youtube_id    TEXT NOT NULL,
  url           TEXT NOT NULL,
  title         TEXT,
  thumbnail_url TEXT,
  channel_name  TEXT,
  duration_secs INTEGER,
  published_at  TIMESTAMPTZ,
  fetched_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, youtube_id)
);

CREATE TABLE follows (
  follower_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  followee_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id != followee_id)
);

CREATE TABLE feed_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  video_id      UUID NOT NULL REFERENCES videos (id) ON DELETE CASCADE,
  cursor_ts     TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_user_id, video_id)
);

CREATE INDEX idx_videos_user_id ON videos (user_id);
CREATE INDEX idx_follows_followee_id ON follows (followee_id);
CREATE INDEX idx_follows_follower_id ON follows (follower_id);
CREATE INDEX idx_feed_items_owner_cursor ON feed_items (owner_user_id, cursor_ts DESC, id DESC);
