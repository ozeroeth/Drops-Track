-- Add Twitter/X URL field to airdrops and whitelists
ALTER TABLE airdrops ADD COLUMN IF NOT EXISTS twitter_url text;
ALTER TABLE whitelists ADD COLUMN IF NOT EXISTS twitter_url text;
