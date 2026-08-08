insert into hotelbooking_hotels (name, slug, description, address, city, country, phone, email, rating, featured, status)
values
('The Meridian Grand', 'the-meridian-grand', 'A refined city hotel with panoramic views.', '12 Centaurus Boulevard', 'Islamabad', 'Pakistan', '+92 51 555 0101', 'stay@meridiangrand.com', 4.8, true, 'active'),
('Azure Bay Resort', 'azure-bay-resort', 'A beachfront resort with private cabanas.', '8 Marina Crescent', 'Dubai', 'United Arab Emirates', '+971 4 555 0102', 'stay@azurebay.com', 4.7, true, 'active')
on conflict (slug) do nothing;

insert into hotelbooking_room_types (hotel_id, name, description, base_price, max_guests, bed_type, room_size, breakfast_included, cancellation_policy, status)
select h.id, 'Standard Room', 'A comfortable room for short stays.', 189.00, 2, 'Queen Bed', '32 m²', false, 'Free cancellation until 48 hours before check-in.', 'active'
from hotelbooking_hotels h
where h.slug = 'the-meridian-grand';

insert into hotelbooking_promotions (code, name, description, discount_type, discount_value, minimum_amount, usage_limit, used_count, starts_at, expires_at, status)
values
('WELCOME10', 'Welcome Offer', '10 percent off your first booking.', 'percent', 10, 100.00, 100, 0, current_date - 30, current_date + 90, 'active')
on conflict (code) do nothing;
