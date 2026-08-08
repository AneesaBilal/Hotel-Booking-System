create extension if not exists pgcrypto;

create table if not exists hotelbooking_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  first_name text not null default '',
  last_name text not null default '',
  email text not null,
  phone text not null default '',
  avatar_url text,
  country text not null default '',
  role text not null default 'guest',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists hotelbooking_hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  address text not null default '',
  city text not null default '',
  country text not null default '',
  phone text not null default '',
  email text not null default '',
  rating numeric(3,1) not null default 4.0,
  featured boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists hotelbooking_hotel_images (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotelbooking_hotels(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists hotelbooking_amenities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default '',
  category text not null default 'general',
  created_at timestamptz not null default now()
);

create table if not exists hotelbooking_hotel_amenities (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotelbooking_hotels(id) on delete cascade,
  amenity_id uuid not null references hotelbooking_amenities(id) on delete cascade,
  unique (hotel_id, amenity_id)
);

create table if not exists hotelbooking_room_types (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotelbooking_hotels(id) on delete cascade,
  name text not null,
  description text not null default '',
  base_price numeric(12,2) not null default 0,
  max_guests integer not null default 2,
  bed_type text not null default '',
  room_size text not null default '',
  breakfast_included boolean not null default false,
  cancellation_policy text not null default '',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists hotelbooking_room_images (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references hotelbooking_room_types(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  sort_order integer not null default 0
);

create table if not exists hotelbooking_rooms (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotelbooking_hotels(id) on delete cascade,
  room_type_id uuid not null references hotelbooking_room_types(id) on delete cascade,
  room_number text not null,
  floor text not null default '',
  status text not null default 'available',
  price_override numeric(12,2),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists hotelbooking_reservations (
  id uuid primary key default gen_random_uuid(),
  reservation_code text not null unique,
  guest_id uuid references hotelbooking_profiles(id),
  hotel_id uuid not null references hotelbooking_hotels(id),
  room_id uuid references hotelbooking_rooms(id),
  room_type_id uuid not null references hotelbooking_room_types(id),
  check_in date not null,
  check_out date not null,
  adults integer not null default 1,
  children integer not null default 0,
  nights integer not null default 1,
  subtotal numeric(12,2) not null default 0,
  taxes numeric(12,2) not null default 0,
  service_fee numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  extras_total numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  status text not null default 'pending',
  payment_status text not null default 'pending',
  special_requests text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists hotelbooking_reservation_guests (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references hotelbooking_reservations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null default '',
  country text not null default '',
  is_primary boolean not null default false
);

create table if not exists hotelbooking_reservation_extras (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references hotelbooking_reservations(id) on delete cascade,
  name text not null,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null default 0,
  total_price numeric(12,2) not null default 0
);

create table if not exists hotelbooking_payments (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references hotelbooking_reservations(id) on delete cascade,
  amount numeric(12,2) not null,
  currency text not null default 'USD',
  payment_method text not null default 'card',
  transaction_reference text not null default '',
  status text not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists hotelbooking_invoices (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references hotelbooking_reservations(id) on delete cascade,
  invoice_number text not null unique,
  subtotal numeric(12,2) not null default 0,
  taxes numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  status text not null default 'issued',
  issued_at timestamptz not null default now()
);

create table if not exists hotelbooking_reviews (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references hotelbooking_reservations(id),
  guest_id uuid references hotelbooking_profiles(id),
  hotel_id uuid not null references hotelbooking_hotels(id),
  rating integer not null default 5,
  cleanliness_rating integer not null default 5,
  comfort_rating integer not null default 5,
  location_rating integer not null default 5,
  service_rating integer not null default 5,
  value_rating integer not null default 5,
  comment text not null default '',
  status text not null default 'visible',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists hotelbooking_favorites (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references hotelbooking_profiles(id) on delete cascade,
  hotel_id uuid not null references hotelbooking_hotels(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (guest_id, hotel_id)
);

create table if not exists hotelbooking_promotions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null default '',
  discount_type text not null default 'percent',
  discount_value numeric(12,2) not null default 0,
  minimum_amount numeric(12,2) not null default 0,
  usage_limit integer not null default 0,
  used_count integer not null default 0,
  starts_at date,
  expires_at date,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists hotelbooking_promotion_usages (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references hotelbooking_promotions(id) on delete cascade,
  user_id uuid references hotelbooking_profiles(id),
  reservation_id uuid references hotelbooking_reservations(id),
  discount_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists hotelbooking_staff (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references hotelbooking_profiles(id),
  hotel_id uuid references hotelbooking_hotels(id),
  role text not null default 'Receptionist',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists hotelbooking_housekeeping_tasks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references hotelbooking_rooms(id) on delete cascade,
  assigned_to uuid references hotelbooking_profiles(id),
  status text not null default 'dirty',
  priority text not null default 'medium',
  notes text not null default '',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists hotelbooking_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references hotelbooking_profiles(id) on delete cascade,
  title text not null,
  message text not null default '',
  type text not null default 'general',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists hotelbooking_settings (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid references hotelbooking_hotels(id),
  setting_key text not null,
  setting_value text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_hotelbooking_hotels_city on hotelbooking_hotels(city);
create index if not exists idx_hotelbooking_room_types_hotel on hotelbooking_room_types(hotel_id);
create index if not exists idx_hotelbooking_rooms_hotel on hotelbooking_rooms(hotel_id);
create index if not exists idx_hotelbooking_rooms_room_type on hotelbooking_rooms(room_type_id);
create index if not exists idx_hotelbooking_reservations_hotel on hotelbooking_reservations(hotel_id);
create index if not exists idx_hotelbooking_reservations_room on hotelbooking_reservations(room_id);
create index if not exists idx_hotelbooking_reservations_guest on hotelbooking_reservations(guest_id);
create index if not exists idx_hotelbooking_reservations_code on hotelbooking_reservations(reservation_code);
create index if not exists idx_hotelbooking_reservations_dates on hotelbooking_reservations(check_in, check_out);
create index if not exists idx_hotelbooking_payments_reservation on hotelbooking_payments(reservation_id);
create index if not exists idx_hotelbooking_reviews_hotel on hotelbooking_reviews(hotel_id);
create index if not exists idx_hotelbooking_favorites_guest on hotelbooking_favorites(guest_id);
create index if not exists idx_hotelbooking_notifications_user on hotelbooking_notifications(user_id);

alter table hotelbooking_profiles enable row level security;
alter table hotelbooking_hotels enable row level security;
alter table hotelbooking_room_types enable row level security;
alter table hotelbooking_rooms enable row level security;
alter table hotelbooking_reservations enable row level security;
alter table hotelbooking_payments enable row level security;
alter table hotelbooking_reviews enable row level security;
alter table hotelbooking_favorites enable row level security;
alter table hotelbooking_promotions enable row level security;
alter table hotelbooking_notifications enable row level security;
alter table hotelbooking_settings enable row level security;

create or replace function hotelbooking_current_role()
returns text
language sql
stable
as $$
  select coalesce(
    (select role from hotelbooking_profiles where auth_user_id = auth.uid()),
    'guest'
  );
$$;

create policy public_read_active_hotels on hotelbooking_hotels
for select using (status = 'active');

create policy public_read_active_room_types on hotelbooking_room_types
for select using (status = 'active');

create policy profiles_select_own_or_staff on hotelbooking_profiles
for select using (
  auth_user_id = auth.uid()
  or hotelbooking_current_role() in ('admin', 'manager', 'receptionist')
);

create policy profiles_update_own_or_admin on hotelbooking_profiles
for update using (
  auth_user_id = auth.uid()
  or hotelbooking_current_role() = 'admin'
);

create policy reservations_select_own_or_staff on hotelbooking_reservations
for select using (
  guest_id in (select id from hotelbooking_profiles where auth_user_id = auth.uid())
  or hotelbooking_current_role() in ('admin', 'manager', 'receptionist')
);

create policy reservations_insert_authenticated on hotelbooking_reservations
for insert with check (auth.uid() is not null);

create policy reservations_update_staff on hotelbooking_reservations
for update using (
  hotelbooking_current_role() in ('admin', 'manager', 'receptionist')
);

create policy payments_select_own_or_staff on hotelbooking_payments
for select using (
  reservation_id in (
    select id from hotelbooking_reservations
    where guest_id in (select id from hotelbooking_profiles where auth_user_id = auth.uid())
  )
  or hotelbooking_current_role() in ('admin', 'manager', 'receptionist')
);

create policy reviews_public_read on hotelbooking_reviews
for select using (status = 'visible');

create policy reviews_insert_own on hotelbooking_reviews
for insert with check (
  guest_id in (select id from hotelbooking_profiles where auth_user_id = auth.uid())
);

create policy reviews_manage_staff on hotelbooking_reviews
for update using (
  hotelbooking_current_role() in ('admin', 'manager')
);

create policy favorites_own_all on hotelbooking_favorites
for all using (
  guest_id in (select id from hotelbooking_profiles where auth_user_id = auth.uid())
);

create policy promotions_public_read_active on hotelbooking_promotions
for select using (status = 'active');

create policy promotions_manage_admin on hotelbooking_promotions
for all using (hotelbooking_current_role() = 'admin');

create policy notifications_own_all on hotelbooking_notifications
for all using (
  user_id in (select id from hotelbooking_profiles where auth_user_id = auth.uid())
);

create policy settings_read_staff on hotelbooking_settings
for select using (
  hotelbooking_current_role() in ('admin', 'manager', 'receptionist')
);

create policy settings_write_admin on hotelbooking_settings
for all using (hotelbooking_current_role() = 'admin');
