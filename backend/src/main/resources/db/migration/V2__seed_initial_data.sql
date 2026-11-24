-- ============================================================
-- V2__seed_initial_data.sql
-- Seed initial restaurant settings, weekly schedule, categories,
-- sample menu items, and initial admin account.
-- ============================================================

-- Initial Admin Account:
-- Email: admin@restaurant.com
-- Password: AdminPassword@123
-- BCrypt Hash: $2a$10$UKqrqmGn5SzoHrmzc2lG7um0QdDwiEyX3NytVDdnz3vJl5Y72ZD6a
INSERT INTO users (full_name, email, mobile_number, password, role, created_at, updated_at)
VALUES (
    'Head Administrator',
    'admin@restaurant.com',
    '+919876543210',
    '$2a$10$UKqrqmGn5SzoHrmzc2lG7um0QdDwiEyX3NytVDdnz3vJl5Y72ZD6a',
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Initial Restaurant Settings
INSERT INTO restaurant_settings (
    restaurant_name,
    restaurant_address,
    whatsapp_number,
    timezone,
    minimum_order_amount,
    manual_override,
    override_expiry,
    updated_at
) VALUES (
    'Royal Spice Kitchen',
    '88 Gourmet Boulevard, Indiranagar, Bengaluru, Karnataka 560038',
    '919876543210',
    'Asia/Kolkata',
    150.00,
    'AUTO',
    NULL,
    CURRENT_TIMESTAMP
);

-- Weekly Restaurant Schedule (11:00 AM to 11:30 PM daily)
INSERT INTO restaurant_schedules (day_of_week, opening_time, closing_time, closed) VALUES
('MONDAY', '11:00:00', '23:30:00', FALSE),
('TUESDAY', '11:00:00', '23:30:00', FALSE),
('WEDNESDAY', '11:00:00', '23:30:00', FALSE),
('THURSDAY', '11:00:00', '23:30:00', FALSE),
('FRIDAY', '11:00:00', '23:59:00', FALSE),
('SATURDAY', '11:00:00', '23:59:00', FALSE),
('SUNDAY', '11:00:00', '23:30:00', FALSE)
ON CONFLICT (day_of_week) DO NOTHING;

-- Food Categories
INSERT INTO food_categories (category_name, description, active, display_order) VALUES
('Starters & Appetizers', 'Crispy, flavorful starters and tandoori specials', TRUE, 1),
('Biryani & Rice Bowls', 'Aromatic dum biryanis and seasoned rice pots', TRUE, 2),
('Curries & Main Course', 'Rich gravies, traditional curries, and paneer delicacies', TRUE, 3),
('Fresh Breads', 'Tandoor-baked naans, rotis, and kulchas', TRUE, 4),
('Desserts & Drinks', 'Sweet treats, cold mocktails, and refreshing lassis', TRUE, 5)
ON CONFLICT (category_name) DO NOTHING;

-- Food Items
INSERT INTO food_items (name, description, price, image_url, category_id, veg, available, created_at, updated_at) VALUES
-- Starters
('Paneer Tikka Angaara', 'Succulent cottage cheese cubes marinated in spiced yogurt and grilled in clay tandoor', 260.00, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80', 1, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Murgh Malai Tikka', 'Tender chicken morsels drenched in cardamom-infused cream, cheese, and grilled to perfection', 320.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80', 1, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Crispy Corn Salt & Pepper', 'Sweet corn kernels tossed with crunchy spring onions, bell peppers, and crushed black pepper', 210.00, 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80', 1, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Amritsari Fish Fry', 'Fresh river fish coated with carom-flavored gram flour batter, deep fried till golden crispy', 350.00, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80', 1, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Biryani & Rice
('Royal Hyderabadi Dum Biryani (Chicken)', 'Fragrant basmati rice layered with marinated chicken, saffron, and fried onions, slow cooked in handi', 340.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', 2, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Awadhi Subz Dum Biryani', 'Seasonal garden vegetables and paneer cubes infused with whole spices and saffron steam', 280.00, 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&auto=format&fit=crop&q=80', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Jeera Basmati Rice', 'Long grain basmati rice tempered with roasted cumin seeds and desi ghee', 160.00, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80', 2, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Curries
('Butter Chicken Delhi Style', 'Smoked shredded chicken simmered in a velvety tomato, butter, and cashew nut gravy', 360.00, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80', 3, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Paneer Butter Masala', 'Fresh cottage cheese cubes in rich spiced tomato-makhani gravy with fenugreek aroma', 290.00, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80', 3, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Dal Makhani Bukhara', 'Slow simmered black lentils and kidney beans cooked overnight with butter and fresh cream', 240.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80', 3, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Breads
('Garlic Butter Naan', 'Leavened clay oven bread topped with minced garlic, fresh coriander, and melted butter', 60.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', 4, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Butter Tandoori Roti', 'Traditional whole wheat flatbread baked on tandoor walls and brushed with butter', 35.00, 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80', 4, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Desserts & Drinks
('Gulab Jamun (2 pcs)', 'Golden khoya dumplings soaked in warm rose and cardamom flavored sugar syrup', 90.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80', 5, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Kesaria Mango Lassi', 'Chilled churned yogurt drink sweetened and infused with Alphonso mango pulp and saffron', 110.00, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80', 5, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
