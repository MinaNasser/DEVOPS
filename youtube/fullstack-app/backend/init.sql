-- Check if the table exists
IF NOT EXISTS (
    SELECT 1
FROM information_schema.tables
WHERE table_name = 'items'
)
BEGIN
    -- Create the table if it does not exist
    CREATE TABLE items
    (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
END
-- Insert some sample data
INSERT INTO items
    (name)
VALUES
    ('Sample Item 1'),
    ('Sample Item 2'),
    ('Sample Item 3');
