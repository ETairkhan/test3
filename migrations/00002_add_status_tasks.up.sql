
CREATE TYPE order_status AS ENUM ('not_started', 'in_progress', 'done');

ALTER TABLE tasks ADD COLUMN status order_status NOT NULL DEFAULT 'not_started';
ALTER TABLE tasks ADD COLUMN priority INT NOT NULL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN deadline TIMESTAMP;

