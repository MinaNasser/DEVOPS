-- Initialize database schema
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data only if table is empty
INSERT INTO items (name)
SELECT 'Sample Item 1'
WHERE NOT EXISTS (SELECT 1 FROM items);

INSERT INTO items (name)
SELECT 'Sample Item 2'
WHERE NOT EXISTS (SELECT 1 FROM items WHERE name = 'Sample Item 2');

INSERT INTO items (name)
SELECT 'Sample Item 3'
WHERE NOT EXISTS (SELECT 1 FROM items WHERE name = 'Sample Item 3');

-- أو يمكنك استخدام طريقة أبسط:
-- INSERT INTO items (name)
-- VALUES 
--     ('Sample Item 1'),
--     ('Sample Item 2'),
--     ('Sample Item 3')
-- ON CONFLICT DO NOTHING;