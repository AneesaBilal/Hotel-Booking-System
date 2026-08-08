import { addDays, differenceInCalendarDays, format, parseISO, subDays } from 'date-fns';
import type { Db, Hotel, RoomType, Room, Reservation, User, SessionUser, Promotion, Review, Notification, Payment, Favorite, Staff, HousekeepingTask, QuoteExtra } from '../types';

const DB_KEY = 'staysphere-db-v1';

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function isoDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function todayISO() {
  return isoDate(new Date());
}

export function addDaysISO(days: number) {
  return isoDate(addDays(new Date(), days));
}

export function formatMoney(cents: number) {
  return '$' + (cents / 100).toFixed(2);
}

export function formatDate(iso: string) {
  if (!iso) return '';
  return format(parseISO(iso.slice(0, 10)), 'MMM d, yyyy');
}

export function formatDateTime(iso: string) {
  if (!iso) return '';
  return format(new Date(iso), 'MMM d, yyyy h:mm a');
}

export function nightsBetween(checkIn: string, checkOut: string) {
  return differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn));
}

export function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function seed(): Db {
  const now = new Date().toISOString();
  const users: User[] = [
    { id: 'user-admin', email: 'admin@staysphere.demo', password: 'admin123', firstName: 'Ava', lastName: 'Stone', phone: '+1 555 0100', country: 'United States', role: 'admin', createdAt: now },
    { id: 'user-manager', email: 'manager@staysphere.demo', password: 'manager123', firstName: 'Noah', lastName: 'Carter', phone: '+1 555 0101', country: 'United States', role: 'manager', createdAt: now },
    { id: 'user-receptionist', email: 'frontdesk@staysphere.demo', password: 'frontdesk123', firstName: 'Mia', lastName: 'Patel', phone: '+1 555 0102', country: 'United States', role: 'receptionist', createdAt: now },
    { id: 'user-guest', email: 'guest@staysphere.demo', password: 'guest123', firstName: 'Ethan', lastName: 'Cole', phone: '+1 555 0103', country: 'United States', role: 'guest', createdAt: now }
  ];

  const amenities = ['Wi-Fi', 'Parking', 'Pool', 'Gym', 'Restaurant', 'Room service', 'Airport transfer', 'Spa', 'Air conditioning'];

  const hotels: Hotel[] = [
    {
      id: 'hotel-meridian',
      name: 'The Meridian Grand',
      slug: 'the-meridian-grand',
      description: 'A refined city hotel with panoramic views, refined dining, and a rooftop pool.',
      address: '12 Centaurus Boulevard',
      city: 'Islamabad',
      country: 'Pakistan',
      phone: '+92 51 555 0101',
      email: 'stay@meridiangrand.com',
      rating: 4.8,
      featured: true,
      active: true,
      amenities: amenities,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=60',
      policies: { checkIn: '15:00', checkOut: '11:00', cancellation: 'Free cancellation until 48 hours before check-in.', children: 'Children are welcome.', pets: 'Pets are not allowed.' },
      createdAt: now
    },
    {
      id: 'hotel-azure',
      name: 'Azure Bay Resort',
      slug: 'azure-bay-resort',
      description: 'A beachfront resort with private cabanas, spa suites, and sunset dining.',
      address: '8 Marina Crescent',
      city: 'Dubai',
      country: 'United Arab Emirates',
      phone: '+971 4 555 0102',
      email: 'stay@azurebay.com',
      rating: 4.7,
      featured: true,
      active: true,
      amenities: amenities,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=60',
      policies: { checkIn: '14:00', checkOut: '12:00', cancellation: 'Free cancellation until 72 hours before check-in.', children: 'Children are welcome.', pets: 'Pets are not allowed.' },
      createdAt: now
    },
    {
      id: 'hotel-kensington',
      name: 'The Kensington Royale',
      slug: 'the-kensington-royale',
      description: 'A classic London landmark with afternoon tea and elegant suites.',
      address: '24 Palace Gate',
      city: 'London',
      country: 'United Kingdom',
      phone: '+44 20 555 0103',
      email: 'stay@kensingtonroyale.com',
      rating: 4.6,
      featured: true,
      active: true,
      amenities: amenities,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=60',
      policies: { checkIn: '15:00', checkOut: '11:00', cancellation: 'Free cancellation until 48 hours before check-in.', children: 'Children are welcome.', pets: 'Pets are not allowed.' },
      createdAt: now
    },
    {
      id: 'hotel-alpine',
      name: 'Alpine Crest Lodge',
      slug: 'alpine-crest-lodge',
      description: 'A mountain lodge with ski storage, heated pools, and alpine dining.',
      address: '5 Summit Road',
      city: 'Zurich',
      country: 'Switzerland',
      phone: '+41 44 555 0104',
      email: 'stay@alpinecrest.com',
      rating: 4.5,
      featured: false,
      active: true,
      amenities: amenities,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=60',
      policies: { checkIn: '16:00', checkOut: '10:00', cancellation: 'Free cancellation until 72 hours before check-in.', children: 'Children are welcome.', pets: 'Pets are allowed on request.' },
      createdAt: now
    }
  ];

  const roomTypes: RoomType[] = [];
  const rooms: Room[] = [];
  const defs = [
    { name: 'Standard Room', description: 'A comfortable room for short stays.', basePrice: 18900, maxGuests: 2, bedType: 'Queen Bed', roomSize: '32 m²', breakfastIncluded: false },
    { name: 'Deluxe Room', description: 'A larger room with city views.', basePrice: 25900, maxGuests: 3, bedType: 'King Bed', roomSize: '42 m²', breakfastIncluded: true },
    { name: 'Executive Suite', description: 'A suite with lounge and workspace.', basePrice: 38900, maxGuests: 4, bedType: 'King Bed + Sofa', roomSize: '58 m²', breakfastIncluded: true },
    { name: 'Family Room', description: 'Space for families with connecting beds.', basePrice: 32900, maxGuests: 5, bedType: 'Two Queen Beds', roomSize: '55 m²', breakfastIncluded: false }
  ];

  hotels.forEach(function (hotel, hotelIndex) {
    defs.forEach(function (def, typeIndex) {
      const roomTypeId = hotel.id + '-rt-' + (typeIndex + 1);
      const roomType: RoomType = {
        id: roomTypeId,
        hotelId: hotel.id,
        name: def.name,
        description: def.description,
        basePrice: def.basePrice + hotelIndex * 2500,
        maxGuests: def.maxGuests,
        bedType: def.bedType,
        roomSize: def.roomSize,
        breakfastIncluded: def.breakfastIncluded,
        cancellationPolicy: 'Free cancellation until 48 hours before check-in.',
        active: true,
        image: hotel.image
      };
      roomTypes.push(roomType);
      for (let i = 1; i <= 6; i += 1) {
        rooms.push({
          id: roomTypeId + '-' + i,
          hotelId: hotel.id,
          roomTypeId: roomTypeId,
          roomNumber: String((typeIndex + 1) * 100 + i),
          floor: String(typeIndex + 1),
          status: i === 6 ? 'maintenance' : 'available',
          priceOverride: null,
          notes: ''
        });
      }
    });
  });

  const promotions: Promotion[] = [
    { id: uid(), code: 'WELCOME10', name: 'Welcome Offer', description: '10 percent off your first booking.', discountType: 'percent', discountValue: 10, minimumAmount: 10000, usageLimit: 100, usedCount: 12, startsAt: addDaysISO(-30), expiresAt: addDaysISO(90), status: 'active', createdAt: now },
    { id: uid(), code: 'STAY50', name: 'City Escape', description: '$50 off qualifying stays.', discountType: 'fixed', discountValue: 5000, minimumAmount: 50000, usageLimit: 50, usedCount: 3, startsAt: addDaysISO(-10), expiresAt: addDaysISO(60), status: 'active', createdAt: now }
  ];

  const reservations: Reservation[] = [];
  const payments: Payment[] = [];
  const reviews: Review[] = [];
  const favorites: Favorite[] = [];
  const notifications: Notification[] = [];
  const staff: Staff[] = [
    { id: uid(), name: 'Ava Stone', email: 'admin@staysphere.demo', role: 'Admin', hotelId: hotels[0].id, status: 'active', lastLogin: now, createdAt: now },
    { id: uid(), name: 'Noah Carter', email: 'manager@staysphere.demo', role: 'Hotel Manager', hotelId: hotels[0].id, status: 'active', lastLogin: now, createdAt: now },
    { id: uid(), name: 'Mia Patel', email: 'frontdesk@staysphere.demo', role: 'Receptionist', hotelId: hotels[0].id, status: 'active', lastLogin: now, createdAt: now },
    { id: uid(), name: 'Liam Brooks', email: 'housekeeping@staysphere.demo', role: 'Housekeeping', hotelId: hotels[0].id, status: 'active', lastLogin: now, createdAt: now }
  ];
  const housekeepingTasks: HousekeepingTask[] = [];
  const settings: Record<string, string> = {
    tax_percent: '13',
    service_fee_percent: '5',
    currency: 'USD',
    min_stay: '1',
    max_stay: '30',
    booking_notifications: 'true',
    payment_notifications: 'true',
    review_reminders: 'true'
  };

  function makeReservation(opts: any) {
    const nights = nightsBetween(opts.checkIn, opts.checkOut);
    const subtotal = opts.roomType.basePrice * nights;
    const taxes = Math.round(subtotal * 0.13);
    const serviceFee = Math.round(subtotal * 0.05);
    const discount = opts.discount || 0;
    const totalAmount = subtotal + taxes + serviceFee - discount;
    const id = uid();
    const createdAt = new Date(subDays(new Date(), opts.createdAtOffset || 0)).toISOString();
    const reservation: Reservation = {
      id: id,
      code: 'SS-' + id.slice(0, 6).toUpperCase(),
      userId: opts.user.id,
      hotelId: opts.roomType.hotelId,
      roomTypeId: opts.roomType.id,
      roomId: opts.room.id,
      checkIn: opts.checkIn,
      checkOut: opts.checkOut,
      adults: opts.adults,
      children: opts.children || 0,
      nights: nights,
      subtotal: subtotal,
      taxes: taxes,
      serviceFee: serviceFee,
      discount: discount,
      extrasTotal: 0,
      totalAmount: totalAmount,
      status: opts.status,
      paymentStatus: opts.paymentStatus,
      guestFirstName: opts.user.firstName,
      guestLastName: opts.user.lastName,
      guestEmail: opts.user.email,
      guestPhone: opts.user.phone,
      specialRequests: '',
      extras: [],
      promoCode: opts.promoCode || '',
      createdAt: createdAt
    };
    reservations.push(reservation);
    if (opts.paymentStatus === 'paid' || opts.paymentStatus === 'refunded') {
      payments.push({
        id: uid(),
        reservationId: reservation.id,
        amount: totalAmount,
        currency: 'USD',
        paymentMethod: 'card',
        transactionReference: 'TX-' + reservation.code,
        status: opts.paymentStatus === 'refunded' ? 'refunded' : 'paid',
        paidAt: createdAt,
        createdAt: createdAt
      });
    }
    return reservation;
  }

  const guestUser = users[3];
  const firstHotel = hotels[0];
  const firstTypes = roomTypes.filter(function (rt) { return rt.hotelId === firstHotel.id; });
  function firstRooms(roomTypeId: string) {
    return rooms.filter(function (r) { return r.roomTypeId === roomTypeId; });
  }

  const future = makeReservation({
    user: guestUser,
    roomType: firstTypes[0],
    room: firstRooms(firstTypes[0].id)[0],
    checkIn: addDaysISO(2),
    checkOut: addDaysISO(5),
    status: 'confirmed',
    paymentStatus: 'paid',
    adults: 2,
    children: 0,
    createdAtOffset: 1
  });

  const current = makeReservation({
    user: guestUser,
    roomType: firstTypes[1],
    room: firstRooms(firstTypes[1].id)[1],
    checkIn: todayISO(),
    checkOut: addDaysISO(3),
    status: 'checked_in',
    paymentStatus: 'paid',
    adults: 2,
    children: 1,
    createdAtOffset: 2
  });

  const past = makeReservation({
    user: guestUser,
    roomType: firstTypes[2],
    room: firstRooms(firstTypes[2].id)[2],
    checkIn: addDaysISO(-10),
    checkOut: addDaysISO(-7),
    status: 'checked_out',
    paymentStatus: 'paid',
    adults: 2,
    children: 0,
    createdAtOffset: 12
  });

  makeReservation({
    user: guestUser,
    roomType: firstTypes[3],
    room: firstRooms(firstTypes[3].id)[3],
    checkIn: addDaysISO(8),
    checkOut: addDaysISO(10),
    status: 'pending',
    paymentStatus: 'pending',
    adults: 2,
    children: 0,
    createdAtOffset: 0
  });

  const futureRoom = rooms.find(function (r) { return r.id === future.roomId; });
  if (futureRoom) futureRoom.status = 'reserved';
  const currentRoom = rooms.find(function (r) { return r.id === current.roomId; });
  if (currentRoom) currentRoom.status = 'occupied';
  const pastRoom = rooms.find(function (r) { return r.id === past.roomId; });
  if (pastRoom) pastRoom.status = 'cleaning';

  reviews.push({
    id: uid(),
    reservationId: past.id,
    userId: guestUser.id,
    hotelId: past.hotelId,
    rating: 5,
    cleanlinessRating: 5,
    comfortRating: 5,
    locationRating: 4,
    serviceRating: 5,
    valueRating: 4,
    comment: 'Exceptional stay with flawless service and a beautiful room.',
    status: 'visible',
    createdAt: now
  });

  favorites.push({ id: uid(), userId: guestUser.id, hotelId: firstHotel.id, createdAt: now });

  notifications.push(
    { id: uid(), userId: guestUser.id, title: 'Booking confirmed', message: 'Your reservation ' + future.code + ' is confirmed.', type: 'booking', readAt: null, createdAt: now },
    { id: uid(), userId: guestUser.id, title: 'Payment successful', message: 'Payment for reservation ' + current.code + ' was successful.', type: 'payment', readAt: null, createdAt: now },
    { id: uid(), userId: guestUser.id, title: 'Review reminder', message: 'How was your recent stay? Leave a review.', type: 'review', readAt: null, createdAt: now }
  );

  const cleaningRoom = rooms.find(function (r) { return r.status === 'cleaning'; });
  if (cleaningRoom) {
    housekeepingTasks.push({
      id: uid(),
      roomId: cleaningRoom.id,
      assignedTo: 'Housekeeping Team',
      status: 'dirty',
      priority: 'high',
      notes: 'Departure clean required.',
      completedAt: null,
      createdAt: now
    });
  }

  return {
    users: users,
    hotels: hotels,
    roomTypes: roomTypes,
    rooms: rooms,
    reservations: reservations,
    payments: payments,
    reviews: reviews,
    favorites: favorites,
    promotions: promotions,
    notifications: notifications,
    staff: staff,
    housekeepingTasks: housekeepingTasks,
    settings: settings
  };
}

function load(): Db | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Db;
  } catch {
    return null;
  }
}

let db: Db = load() || seed();

export function saveDb() {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    return;
  }
}

export function resetDb() {
  db = seed();
  saveDb();
}

export function getDb() {
  return db;
}

export function getUsers() {
  return db.users;
}

export function getUserById(id: string) {
  return db.users.find(function (u) { return u.id === id; });
}

export function getUserByEmail(email: string) {
  return db.users.find(function (u) { return u.email.toLowerCase() === email.toLowerCase(); });
}

export function toSession(user: User): SessionUser {
  return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role };
}

export function login(email: string, password: string) {
  const user = getUserByEmail(email);
  if (!user || user.password !== password) throw new Error('Invalid email or password.');
  return toSession(user);
}

export function register(input: any) {
  if (getUserByEmail(input.email)) throw new Error('An account with that email already exists.');
  const user: User = {
    id: uid(),
    email: input.email,
    password: input.password,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone || '',
    country: input.country || '',
    role: 'guest',
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  saveDb();
  return toSession(user);
}

export function updateProfile(userId: string, patch: any) {
  const user = db.users.find(function (u) { return u.id === userId; });
  if (!user) throw new Error('Profile not found.');
  Object.assign(user, patch);
  saveDb();
  return toSession(user);
}

export function updatePassword(userId: string, newPassword: string) {
  const user = db.users.find(function (u) { return u.id === userId; });
  if (!user) throw new Error('Profile not found.');
  user.password = newPassword;
  saveDb();
}

export function resetPassword(email: string, newPassword: string) {
  const user = getUserByEmail(email);
  if (!user) throw new Error('No account found for that email.');
  user.password = newPassword;
  saveDb();
}

export function getHotels() {
  return db.hotels.filter(function (h) { return h.active; });
}

export function getAllHotels() {
  return db.hotels;
}

export function getHotelById(idOrSlug: string) {
  return db.hotels.find(function (h) { return h.id === idOrSlug || h.slug === idOrSlug; });
}

export function getMinPrice(hotelId: string) {
  const types = getRoomTypesByHotel(hotelId);
  if (!types.length) return 0;
  return Math.min.apply(null, types.map(function (t) { return t.basePrice; }));
}

export function getRoomTypesByHotel(hotelId: string) {
  return db.roomTypes.filter(function (rt) { return rt.hotelId === hotelId && rt.active; });
}

export function getAllRoomTypes() {
  return db.roomTypes;
}

export function getRoomTypeById(id: string) {
  return db.roomTypes.find(function (rt) { return rt.id === id; });
}

export function getRooms(filter?: any) {
  let result = db.rooms.slice();
  if (filter && filter.hotelId) result = result.filter(function (r) { return r.hotelId === filter.hotelId; });
  if (filter && filter.roomTypeId) result = result.filter(function (r) { return r.roomTypeId === filter.roomTypeId; });
  if (filter && filter.status) result = result.filter(function (r) { return r.status === filter.status; });
  return result.map(function (r) {
    return Object.assign({}, r, {
      roomType: getRoomTypeById(r.roomTypeId),
      hotel: getHotelById(r.hotelId)
    });
  });
}

export function getRoomById(id: string) {
  return db.rooms.find(function (r) { return r.id === id; });
}

export function datesOverlap(startA: string, endA: string, startB: string, endB: string) {
  return startA < endB && startB < endA;
}

export function findAvailableRoom(roomTypeId: string, checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut || checkOut <= checkIn) return null;
  const candidates = db.rooms.filter(function (r) {
    return r.roomTypeId === roomTypeId && r.status !== 'maintenance' && r.status !== 'out_of_service';
  });
  const conflicting = db.reservations.filter(function (res) {
    const active = res.status === 'pending' || res.status === 'confirmed' || res.status === 'checked_in';
    return res.roomTypeId === roomTypeId && active && datesOverlap(res.checkIn, res.checkOut, checkIn, checkOut);
  });
  const blockedRoomIds = new Set(conflicting.map(function (res) { return res.roomId; }));
  return candidates.find(function (room) { return !blockedRoomIds.has(room.id); }) || null;
}

export interface SearchParams {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  maxPrice?: number;
  minRating?: number;
  amenities?: string[];
  sort?: string;
}

export function searchHotels(params: SearchParams) {
  let items = db.hotels.filter(function (h) { return h.active; }).map(function (h) {
    return { hotel: h, minPrice: getMinPrice(h.id), availableRoomTypes: getRoomTypesByHotel(h.id).length };
  });

  const q = (params.destination || '').toLowerCase();
  if (q) {
    items = items.filter(function (item) {
      return [item.hotel.name, item.hotel.city, item.hotel.country, item.hotel.address].some(function (value) {
        return value.toLowerCase().includes(q);
      });
    });
  }

  if (params.minRating) {
    items = items.filter(function (item) { return item.hotel.rating >= (params.minRating as number); });
  }

  if (params.amenities && params.amenities.length) {
    items = items.filter(function (item) {
      return (params.amenities as string[]).every(function (amenity) { return item.hotel.amenities.includes(amenity); });
    });
  }

  if (params.checkIn && params.checkOut) {
    items = items.map(function (item) {
      const availableTypes = getRoomTypesByHotel(item.hotel.id).filter(function (rt) {
        const guestOk = !params.guests || rt.maxGuests >= params.guests;
        return guestOk && Boolean(findAvailableRoom(rt.id, params.checkIn as string, params.checkOut as string));
      });
      return {
        hotel: item.hotel,
        minPrice: availableTypes.length ? Math.min.apply(null, availableTypes.map(function (t) { return t.basePrice; })) : item.minPrice,
        availableRoomTypes: availableTypes.length
      };
    }).filter(function (item) { return item.availableRoomTypes > 0; });
  } else if (params.guests) {
    items = items.filter(function (item) {
      return getRoomTypesByHotel(item.hotel.id).some(function (rt) { return rt.maxGuests >= (params.guests as number); });
    });
  }

  if (params.maxPrice) {
    items = items.filter(function (item) { return item.minPrice <= (params.maxPrice as number); });
  }

  if (params.sort === 'price_asc') items.sort(function (a, b) { return a.minPrice - b.minPrice; });
  if (params.sort === 'price_desc') items.sort(function (a, b) { return b.minPrice - a.minPrice; });
  if (params.sort === 'rating') items.sort(function (a, b) { return b.hotel.rating - a.hotel.rating; });
  if (params.sort === 'featured') items.sort(function (a, b) { return Number(b.hotel.featured) - Number(a.hotel.featured); });

  return items;
}

export function validatePromo(code: string, amount: number): { ok: boolean; error?: string; discount?: number; promotion?: Promotion } {
  const promo = db.promotions.find(function (p) { return p.code.toLowerCase() === code.toLowerCase(); });
  if (!promo) return { ok: false, error: 'Invalid promo code.' };
  if (promo.status !== 'active') return { ok: false, error: 'This promo code is inactive.' };
  const today = todayISO();
  if (promo.startsAt && promo.startsAt > today) return { ok: false, error: 'This promo code is not active yet.' };
  if (promo.expiresAt && promo.expiresAt < today) return { ok: false, error: 'This promo code has expired.' };
  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) return { ok: false, error: 'This promo code has reached its usage limit.' };
  if (amount < promo.minimumAmount) return { ok: false, error: 'Minimum booking amount not met.' };
  const discount = promo.discountType === 'percent' ? Math.round(amount * promo.discountValue / 100) : promo.discountValue;
  return { ok: true, discount: Math.min(discount, amount), promotion: promo };
}

export function getSetting(key: string, fallback: string) {
  return db.settings[key] !== undefined ? db.settings[key] : fallback;
}

export function setSetting(key: string, value: string) {
  db.settings[key] = value;
  saveDb();
}

export function getSettings() {
  return db.settings;
}

export function getQuote(input: any) {
  const base = {
    ok: false,
    error: '',
    roomType: undefined as any,
    room: undefined as any,
    nights: 0,
    rate: 0,
    subtotal: 0,
    extrasTotal: 0,
    taxes: 0,
    serviceFee: 0,
    discount: 0,
    total: 0
  };

  const roomType = getRoomTypeById(input.roomTypeId);
  if (!roomType) return Object.assign({}, base, { error: 'Room not found.' });
  if (!input.checkIn || !input.checkOut) return Object.assign({}, base, { roomType: roomType, error: 'Select stay dates.' });
  if (input.checkOut <= input.checkIn) return Object.assign({}, base, { roomType: roomType, error: 'Check-out must be after check-in.' });

  const nights = nightsBetween(input.checkIn, input.checkOut);
  const minStay = Number(getSetting('min_stay', '1'));
  const maxStay = Number(getSetting('max_stay', '30'));
  if (nights < minStay || nights > maxStay) {
    return Object.assign({}, base, { roomType: roomType, nights: nights, error: 'Stay length is outside allowed limits.' });
  }

  const guests = Number(input.adults || 0) + Number(input.children || 0);
  if (guests > roomType.maxGuests) {
    return Object.assign({}, base, { roomType: roomType, nights: nights, error: 'Guest count exceeds room capacity.' });
  }

  const room = findAvailableRoom(input.roomTypeId, input.checkIn, input.checkOut);
  const rate = room && room.priceOverride !== null ? room.priceOverride : roomType.basePrice;
  const subtotal = rate * nights;
  const extrasTotal = (input.extras || []).reduce(function (sum: number, extra: QuoteExtra) {
    return sum + extra.price * extra.quantity;
  }, 0);
  const taxPercent = Number(getSetting('tax_percent', '13'));
  const servicePercent = Number(getSetting('service_fee_percent', '5'));
  const taxes = Math.round((subtotal + extrasTotal) * taxPercent / 100);
  const serviceFee = Math.round(subtotal * servicePercent / 100);

  let discount = 0;
  let error = '';
  if (!room) error = 'This room is not available for the selected dates.';
  if (input.promoCode && !error) {
    const promo = validatePromo(input.promoCode, subtotal + extrasTotal);
    if (promo.ok) discount = promo.discount || 0;
    else error = promo.error || 'Invalid promo code.';
  }

  const total = Math.max(0, subtotal + taxes + serviceFee + extrasTotal - discount);
  return {
    ok: !error,
    error: error,
    roomType: roomType,
    room: room,
    nights: nights,
    rate: rate,
    subtotal: subtotal,
    extrasTotal: extrasTotal,
    taxes: taxes,
    serviceFee: serviceFee,
    discount: discount,
    total: total
  };
}

export function addNotification(userId: string, title: string, message: string, type: string) {
  db.notifications.unshift({
    id: uid(),
    userId: userId,
    title: title,
    message: message,
    type: type,
    readAt: null,
    createdAt: new Date().toISOString()
  });
}

export function createReservation(input: any) {
  const quote = getQuote(input);
  if (!quote.ok) throw new Error(quote.error || 'Unable to create reservation.');
  const user = getUserById(input.userId);
  if (!user) throw new Error('Sign in to complete booking.');

  const id = uid();
  const createdAt = new Date().toISOString();
  const reservation: Reservation = {
    id: id,
    code: 'SS-' + id.slice(0, 6).toUpperCase(),
    userId: user.id,
    hotelId: quote.roomType.hotelId,
    roomTypeId: quote.roomType.id,
    roomId: quote.room.id,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: Number(input.adults || 1),
    children: Number(input.children || 0),
    nights: quote.nights,
    subtotal: quote.subtotal,
    taxes: quote.taxes,
    serviceFee: quote.serviceFee,
    discount: quote.discount,
    extrasTotal: quote.extrasTotal,
    totalAmount: quote.total,
    status: input.paid ? 'confirmed' : 'pending',
    paymentStatus: input.paid ? 'paid' : 'pending',
    guestFirstName: input.guestFirstName,
    guestLastName: input.guestLastName,
    guestEmail: input.guestEmail,
    guestPhone: input.guestPhone || '',
    specialRequests: input.specialRequests || '',
    extras: input.extras || [],
    promoCode: input.promoCode || '',
    createdAt: createdAt
  };

  db.reservations.push(reservation);

  if (input.paid) {
    db.payments.push({
      id: uid(),
      reservationId: reservation.id,
      amount: reservation.totalAmount,
      currency: 'USD',
      paymentMethod: input.paymentMethod || 'card',
      transactionReference: 'TX-' + reservation.code,
      status: 'paid',
      paidAt: createdAt,
      createdAt: createdAt
    });
  }

  if (input.promoCode) {
    const promo = db.promotions.find(function (p) { return p.code.toLowerCase() === input.promoCode.toLowerCase(); });
    if (promo) promo.usedCount += 1;
  }

  addNotification(user.id, 'Booking confirmed', 'Your reservation ' + reservation.code + ' at ' + (getHotelById(reservation.hotelId)?.name || 'StaySphere') + ' is confirmed.', 'booking');
  saveDb();
  return reservation;
}

export function getReservations(filter?: any) {
  let items = db.reservations.map(function (r) {
    return Object.assign({}, r, {
      hotel: getHotelById(r.hotelId),
      roomType: getRoomTypeById(r.roomTypeId),
      guest: getUserById(r.userId),
      room: getRoomById(r.roomId)
    });
  });

  if (filter && filter.userId) items = items.filter(function (r) { return r.userId === filter.userId; });
  if (filter && filter.hotelId) items = items.filter(function (r) { return r.hotelId === filter.hotelId; });
  if (filter && filter.status) items = items.filter(function (r) { return r.status === filter.status; });
  if (filter && filter.paymentStatus) items = items.filter(function (r) { return r.paymentStatus === filter.paymentStatus; });
  if (filter && filter.query) {
    const q = filter.query.toLowerCase();
    items = items.filter(function (r) {
      return [r.code, r.guestFirstName, r.guestLastName, r.guestEmail, r.hotel?.name, r.roomType?.name].some(function (value) {
        return String(value || '').toLowerCase().includes(q);
      });
    });
  }

  return items.sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });
}

export function getReservationById(id: string) {
  return getReservations().find(function (r) { return r.id === id || r.code === id; });
}

export function confirmReservation(id: string) {
  const reservation = db.reservations.find(function (r) { return r.id === id; });
  if (!reservation) throw new Error('Reservation not found.');
  if (reservation.status !== 'pending') throw new Error('Only pending reservations can be confirmed.');
  reservation.status = 'confirmed';
  addNotification(reservation.userId, 'Reservation confirmed', 'Reservation ' + reservation.code + ' has been confirmed.', 'booking');
  saveDb();
}

export function cancelReservation(id: string, options?: { byGuest?: boolean }) {
  const reservation = db.reservations.find(function (r) { return r.id === id; });
  if (!reservation) throw new Error('Reservation not found.');
  if (reservation.status !== 'pending' && reservation.status !== 'confirmed') {
    throw new Error('Only pending or confirmed reservations can be cancelled.');
  }
  if (options && options.byGuest && reservation.checkIn <= todayISO()) {
    throw new Error('Bookings cannot be cancelled on or after check-in date.');
  }
  reservation.status = 'cancelled';
  if (reservation.paymentStatus === 'paid') reservation.paymentStatus = 'refunded';
  const room = db.rooms.find(function (r) { return r.id === reservation.roomId; });
  if (room && room.status === 'reserved') room.status = 'available';
  addNotification(reservation.userId, 'Booking cancelled', 'Reservation ' + reservation.code + ' has been cancelled.', 'booking');
  saveDb();
}

export function markNoShow(id: string) {
  const reservation = db.reservations.find(function (r) { return r.id === id; });
  if (!reservation) throw new Error('Reservation not found.');
  if (reservation.status !== 'confirmed') throw new Error('Only confirmed reservations can be marked as no-show.');
  reservation.status = 'no_show';
  saveDb();
}

export function checkInReservation(id: string) {
  const reservation = db.reservations.find(function (r) { return r.id === id; });
  if (!reservation) throw new Error('Reservation not found.');
  if (reservation.status !== 'confirmed') throw new Error('Only confirmed reservations can be checked in.');
  reservation.status = 'checked_in';
  const room = db.rooms.find(function (r) { return r.id === reservation.roomId; });
  if (room) room.status = 'occupied';
  addNotification(reservation.userId, 'Check-in completed', 'Enjoy your stay. Reservation ' + reservation.code + ' is checked in.', 'stay');
  saveDb();
}

export function checkOutReservation(id: string, extraCharges = 0) {
  const reservation = db.reservations.find(function (r) { return r.id === id; });
  if (!reservation) throw new Error('Reservation not found.');
  if (reservation.status !== 'checked_in') throw new Error('Only checked-in reservations can be checked out.');
  if (extraCharges > 0) {
    reservation.extrasTotal += extraCharges;
    reservation.totalAmount += extraCharges;
    reservation.extras.push({ name: 'Additional charges', price: extraCharges, quantity: 1 });
  }
  reservation.status = 'checked_out';
  const room = db.rooms.find(function (r) { return r.id === reservation.roomId; });
  if (room) room.status = 'cleaning';
  db.housekeepingTasks.push({
    id: uid(),
    roomId: reservation.roomId,
    assignedTo: 'Housekeeping Team',
    status: 'dirty',
    priority: 'high',
    notes: 'Departure clean after check-out.',
    completedAt: null,
    createdAt: new Date().toISOString()
  });
  addNotification(reservation.userId, 'Check-out completed', 'Thank you for staying with us. Reservation ' + reservation.code + ' is checked out.', 'stay');
  saveDb();
}

export function getPayments() {
  return db.payments.map(function (p) {
    const reservation = getReservationById(p.reservationId);
    return Object.assign({}, p, {
      reservation: reservation,
      guest: reservation ? reservation.guest : undefined,
      hotel: reservation ? reservation.hotel : undefined
    });
  }).sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });
}

export function downloadInvoice(reservationId: string) {
  const reservation = getReservationById(reservationId);
  if (!reservation) return;
  const hotel = getHotelById(reservation.hotelId);
  const roomType = getRoomTypeById(reservation.roomTypeId);
  const lines = [
    'StaySphere Invoice',
    'Invoice number: INV-' + reservation.code,
    'Booking reference: ' + reservation.code,
    'Hotel: ' + (hotel ? hotel.name : ''),
    'Room: ' + (roomType ? roomType.name : ''),
    'Guest: ' + reservation.guestFirstName + ' ' + reservation.guestLastName,
    'Check-in: ' + reservation.checkIn,
    'Check-out: ' + reservation.checkOut,
    'Nights: ' + reservation.nights,
    'Subtotal: ' + formatMoney(reservation.subtotal),
    'Taxes: ' + formatMoney(reservation.taxes),
    'Service fee: ' + formatMoney(reservation.serviceFee),
    'Extras: ' + formatMoney(reservation.extrasTotal),
    'Discount: ' + formatMoney(reservation.discount),
    'Total: ' + formatMoney(reservation.totalAmount),
    'Payment status: ' + reservation.paymentStatus
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'invoice-' + reservation.code + '.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function isFavorite(userId: string, hotelId: string) {
  return db.favorites.some(function (f) { return f.userId === userId && f.hotelId === hotelId; });
}

export function toggleFavorite(userId: string, hotelId: string) {
  const existing = db.favorites.find(function (f) { return f.userId === userId && f.hotelId === hotelId; });
  if (existing) {
    db.favorites = db.favorites.filter(function (f) { return f.id !== existing.id; });
  } else {
    db.favorites.push({ id: uid(), userId: userId, hotelId: hotelId, createdAt: new Date().toISOString() });
  }
  saveDb();
}

export function getFavoriteHotels(userId: string) {
  return db.favorites.filter(function (f) { return f.userId === userId; }).map(function (f) {
    const hotel = getHotelById(f.hotelId);
    if (!hotel) return null;
    return { hotel: hotel, minPrice: getMinPrice(hotel.id), availableRoomTypes: getRoomTypesByHotel(hotel.id).length };
  }).filter(Boolean) as any[];
}

export function getHotelReviews(hotelId: string) {
  return db.reviews.filter(function (r) { return r.hotelId === hotelId && r.status === 'visible'; })
    .sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });
}

export function getAllReviews() {
  return db.reviews.map(function (r) {
    return Object.assign({}, r, {
      hotel: getHotelById(r.hotelId),
      guest: getUserById(r.userId),
      reservation: db.reservations.find(function (res) { return res.id === r.reservationId; })
    });
  }).sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });
}

export function getUserReviews(userId: string) {
  return db.reviews.filter(function (r) { return r.userId === userId; }).map(function (r) {
    return Object.assign({}, r, { hotel: getHotelById(r.hotelId) });
  }).sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });
}

export function getEligibleReviewReservations(userId: string) {
  return db.reservations.filter(function (r) {
    return r.userId === userId && r.status === 'checked_out' && !db.reviews.some(function (rv) { return rv.reservationId === r.id; });
  }).map(function (r) {
    return Object.assign({}, r, { hotel: getHotelById(r.hotelId), roomType: getRoomTypeById(r.roomTypeId) });
  });
}

export function createReview(input: any) {
  const reservation = db.reservations.find(function (r) { return r.id === input.reservationId; });
  if (!reservation) throw new Error('Reservation not found.');
  if (reservation.userId !== input.userId) throw new Error('You can only review your own stays.');
  if (reservation.status !== 'checked_out') throw new Error('Only completed stays can be reviewed.');
  if (db.reviews.some(function (rv) { return rv.reservationId === reservation.id; })) {
    throw new Error('You already reviewed this reservation.');
  }

  const review: Review = {
    id: uid(),
    reservationId: reservation.id,
    userId: input.userId,
    hotelId: reservation.hotelId,
    rating: Number(input.rating || 5),
    cleanlinessRating: Number(input.cleanlinessRating || 5),
    comfortRating: Number(input.comfortRating || 5),
    locationRating: Number(input.locationRating || 5),
    serviceRating: Number(input.serviceRating || 5),
    valueRating: Number(input.valueRating || 5),
    comment: input.comment || '',
    status: 'visible',
    createdAt: new Date().toISOString()
  };

  db.reviews.push(review);

  const hotelReviews = db.reviews.filter(function (r) { return r.hotelId === reservation.hotelId && r.status === 'visible'; });
  if (hotelReviews.length) {
    const average = hotelReviews.reduce(function (sum, r) { return sum + r.rating; }, 0) / hotelReviews.length;
    const hotel = getHotelById(reservation.hotelId);
    if (hotel) hotel.rating = Math.round(average * 10) / 10;
  }

  addNotification(reservation.userId, 'Review submitted', 'Thank you for sharing your stay experience.', 'review');
  saveDb();
  return review;
}

export function setReviewStatus(id: string, status: 'visible' | 'hidden') {
  const review = db.reviews.find(function (r) { return r.id === id; });
  if (!review) throw new Error('Review not found.');
  review.status = status;
  saveDb();
}

export function getNotifications(userId: string) {
  return db.notifications.filter(function (n) { return n.userId === userId; })
    .sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });
}

export function markNotificationRead(id: string) {
  const notification = db.notifications.find(function (n) { return n.id === id; });
  if (notification) notification.readAt = new Date().toISOString();
  saveDb();
}

export function markAllNotificationsRead(userId: string) {
  db.notifications.forEach(function (n) {
    if (n.userId === userId && !n.readAt) n.readAt = new Date().toISOString();
  });
  saveDb();
}

export function saveHotel(input: any) {
  const id = input.id || uid();
  const existing = db.hotels.find(function (h) { return h.id === id; });
  const hotel: Hotel = {
    id: id,
    name: input.name,
    slug: slugify(input.name),
    description: input.description || '',
    address: input.address || '',
    city: input.city || '',
    country: input.country || '',
    phone: input.phone || '',
    email: input.email || '',
    rating: Number(input.rating || 4),
    featured: Boolean(input.featured),
    active: input.active !== false,
    amenities: input.amenities || [],
    image: input.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=60',
    policies: input.policies || {
      checkIn: '15:00',
      checkOut: '11:00',
      cancellation: 'Free cancellation until 48 hours before check-in.',
      children: 'Children are welcome.',
      pets: 'Pets are not allowed.'
    },
    createdAt: existing ? existing.createdAt : new Date().toISOString()
  };

  if (existing) {
    db.hotels = db.hotels.map(function (h) { return h.id === id ? hotel : h; });
  } else {
    db.hotels.push(hotel);
  }
  saveDb();
  return hotel;
}

export function toggleHotelActive(id: string) {
  const hotel = db.hotels.find(function (h) { return h.id === id; });
  if (!hotel) throw new Error('Hotel not found.');
  hotel.active = !hotel.active;
  saveDb();
}

export function saveRoomType(input: any) {
  const id = input.id || uid();
  const existing = db.roomTypes.find(function (rt) { return rt.id === id; });
  const roomType: RoomType = {
    id: id,
    hotelId: input.hotelId,
    name: input.name,
    description: input.description || '',
    basePrice: Math.round(Number(input.basePrice || 0) * 100),
    maxGuests: Number(input.maxGuests || 2),
    bedType: input.bedType || 'Queen Bed',
    roomSize: input.roomSize || '',
    breakfastIncluded: Boolean(input.breakfastIncluded),
    cancellationPolicy: input.cancellationPolicy || 'Free cancellation until 48 hours before check-in.',
    active: input.active !== false,
    image: input.image || (input.hotelId ? (getHotelById(input.hotelId)?.image || '') : '')
  };

  if (existing) {
    db.roomTypes = db.roomTypes.map(function (rt) { return rt.id === id ? roomType : rt; });
  } else {
    db.roomTypes.push(roomType);
  }
  saveDb();
  return roomType;
}

export function saveRoom(input: any) {
  const id = input.id || uid();
  const existing = db.rooms.find(function (r) { return r.id === id; });
  const room: Room = {
    id: id,
    hotelId: input.hotelId,
    roomTypeId: input.roomTypeId,
    roomNumber: String(input.roomNumber),
    floor: String(input.floor || ''),
    status: input.status || 'available',
    priceOverride: input.priceOverride === '' || input.priceOverride === null || input.priceOverride === undefined ? null : Math.round(Number(input.priceOverride) * 100),
    notes: input.notes || ''
  };

  if (existing) {
    db.rooms = db.rooms.map(function (r) { return r.id === id ? room : r; });
  } else {
    db.rooms.push(room);
  }
  saveDb();
  return room;
}

export function updateRoomStatus(roomId: string, status: string) {
  const room = db.rooms.find(function (r) { return r.id === roomId; });
  if (!room) throw new Error('Room not found.');
  if (room.status === 'occupied' && status === 'available') {
    throw new Error('Occupied rooms cannot be marked available without checkout.');
  }
  room.status = status as Room['status'];
  saveDb();
}

export function getPromotions() {
  return db.promotions;
}

export function savePromotion(input: any) {
  const id = input.id || uid();
  const existing = db.promotions.find(function (p) { return p.id === id; });
  const promotion: Promotion = {
    id: id,
    code: String(input.code || '').toUpperCase(),
    name: input.name || '',
    description: input.description || '',
    discountType: input.discountType || 'percent',
    discountValue: input.discountType === 'fixed' ? Math.round(Number(input.discountValue || 0) * 100) : Number(input.discountValue || 0),
    minimumAmount: Math.round(Number(input.minimumAmount || 0) * 100),
    usageLimit: Number(input.usageLimit || 0),
    usedCount: existing ? existing.usedCount : 0,
    startsAt: input.startsAt || todayISO(),
    expiresAt: input.expiresAt || addDaysISO(90),
    status: input.status || 'active',
    createdAt: existing ? existing.createdAt : new Date().toISOString()
  };

  if (existing) {
    db.promotions = db.promotions.map(function (p) { return p.id === id ? promotion : p; });
  } else {
    db.promotions.push(promotion);
  }
  saveDb();
  return promotion;
}

export function getStaff() {
  return db.staff.map(function (s) {
    return Object.assign({}, s, { hotel: getHotelById(s.hotelId) });
  });
}

export function saveStaff(input: any) {
  const id = input.id || uid();
  const existing = db.staff.find(function (s) { return s.id === id; });
  const staffMember: Staff = {
    id: id,
    name: input.name || '',
    email: input.email || '',
    role: input.role || 'Receptionist',
    hotelId: input.hotelId || '',
    status: input.status || 'active',
    lastLogin: existing ? existing.lastLogin : new Date().toISOString(),
    createdAt: existing ? existing.createdAt : new Date().toISOString()
  };

  if (existing) {
    db.staff = db.staff.map(function (s) { return s.id === id ? staffMember : s; });
  } else {
    db.staff.push(staffMember);
  }
  saveDb();
  return staffMember;
}

export function deleteStaff(id: string) {
  db.staff = db.staff.filter(function (s) { return s.id !== id; });
  saveDb();
}

export function getHousekeepingTasks() {
  return db.housekeepingTasks.map(function (task) {
    const room = getRoomById(task.roomId);
    return Object.assign({}, task, {
      room: room,
      hotel: room ? getHotelById(room.hotelId) : undefined
    });
  }).sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });
}

export function saveHousekeepingTask(input: any) {
  const id = input.id || uid();
  const existing = db.housekeepingTasks.find(function (t) { return t.id === id; });
  const task: HousekeepingTask = {
    id: id,
    roomId: input.roomId,
    assignedTo: input.assignedTo || 'Housekeeping Team',
    status: input.status || 'dirty',
    priority: input.priority || 'medium',
    notes: input.notes || '',
    completedAt: input.status === 'clean' || input.status === 'inspected' ? (existing ? existing.completedAt : new Date().toISOString()) : null,
    createdAt: existing ? existing.createdAt : new Date().toISOString()
  };

  if (existing) {
    db.housekeepingTasks = db.housekeepingTasks.map(function (t) { return t.id === id ? task : t; });
  } else {
    db.housekeepingTasks.push(task);
  }
  saveDb();
  return task;
}

export function updateHousekeepingTask(id: string, patch: any) {
  const task = db.housekeepingTasks.find(function (t) { return t.id === id; });
  if (!task) throw new Error('Task not found.');
  Object.assign(task, patch);
  if (patch.status === 'clean' || patch.status === 'inspected') {
    if (!task.completedAt) task.completedAt = new Date().toISOString();
  } else if (patch.status) {
    task.completedAt = null;
  }
  saveDb();
}

export function getGuestDirectory() {
  return db.users.filter(function (u) { return u.role === 'guest'; }).map(function (user) {
    const reservations = db.reservations.filter(function (r) { return r.userId === user.id; });
    const totalSpent = reservations.filter(function (r) { return r.paymentStatus === 'paid'; }).reduce(function (sum, r) { return sum + r.totalAmount; }, 0);
    const lastStay = reservations.filter(function (r) { return r.status === 'checked_out'; }).sort(function (a, b) { return b.checkOut.localeCompare(a.checkOut); })[0];
    const upcoming = reservations.filter(function (r) { return (r.status === 'confirmed' || r.status === 'pending') && r.checkIn >= todayISO(); }).sort(function (a, b) { return a.checkIn.localeCompare(b.checkIn); })[0];
    return {
      user: user,
      totalBookings: reservations.length,
      totalSpent: totalSpent,
      lastStay: lastStay,
      upcoming: upcoming
    };
  });
}

export function getAdminStats() {
  const rooms = db.rooms;
  const occupied = rooms.filter(function (r) { return r.status === 'occupied'; }).length;
  const available = rooms.filter(function (r) { return r.status === 'available'; }).length;
  const totalRevenue = db.payments.filter(function (p) { return p.status === 'paid'; }).reduce(function (sum, p) { return sum + p.amount; }, 0);
  const today = todayISO();
  const todayRevenue = db.payments.filter(function (p) { return p.status === 'paid' && (p.paidAt || '').slice(0, 10) === today; }).reduce(function (sum, p) { return sum + p.amount; }, 0);
  const totalReservations = db.reservations.length;
  const pendingReservations = db.reservations.filter(function (r) { return r.status === 'pending'; }).length;
  const checkedInGuests = db.reservations.filter(function (r) { return r.status === 'checked_in'; }).length;
  const checkoutsToday = db.reservations.filter(function (r) { return r.status === 'checked_in' && r.checkOut === today; }).length;
  const occupancyRate = rooms.length ? Math.round((occupied / rooms.length) * 100) : 0;

  return {
    totalRevenue: totalRevenue,
    todayRevenue: todayRevenue,
    occupancyRate: occupancyRate,
    totalReservations: totalReservations,
    pendingReservations: pendingReservations,
    availableRooms: available,
    checkedInGuests: checkedInGuests,
    checkoutsToday: checkoutsToday
  };
}

export function getRevenueSeries(days = 14) {
  const result: any[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = isoDate(subDays(new Date(), i));
    const label = format(parseISO(date), 'MMM d');
    const revenue = db.payments.filter(function (p) {
      return p.status === 'paid' && (p.paidAt || '').slice(0, 10) === date;
    }).reduce(function (sum, p) { return sum + p.amount; }, 0);
    result.push({ date: label, revenue: revenue / 100 });
  }
  return result;
}

export function getBookingTrends(days = 14) {
  const result: any[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = isoDate(subDays(new Date(), i));
    const label = format(parseISO(date), 'MMM d');
    const dayReservations = db.reservations.filter(function (r) { return r.createdAt.slice(0, 10) === date; });
    result.push({
      date: label,
      confirmed: dayReservations.filter(function (r) { return r.status !== 'cancelled' && r.status !== 'no_show'; }).length,
      cancelled: dayReservations.filter(function (r) { return r.status === 'cancelled' || r.status === 'no_show'; }).length
    });
  }
  return result;
}

export function getOccupancyData() {
  const occupied = db.rooms.filter(function (r) { return r.status === 'occupied'; }).length;
  const available = db.rooms.filter(function (r) { return r.status === 'available'; }).length;
  const cleaning = db.rooms.filter(function (r) { return r.status === 'cleaning'; }).length;
  const maintenance = db.rooms.filter(function (r) { return r.status === 'maintenance' || r.status === 'out_of_service'; }).length;
  return [
    { name: 'Occupied', value: occupied },
    { name: 'Available', value: available },
    { name: 'Cleaning', value: cleaning },
    { name: 'Maintenance', value: maintenance }
  ];
}

export function getRoomPerformance() {
  const map: any = {};
  db.reservations.forEach(function (r) {
    const key = r.roomTypeId;
    if (!map[key]) {
      map[key] = { name: getRoomTypeById(key)?.name || 'Room', bookings: 0, revenue: 0 };
    }
    if (r.status !== 'cancelled' && r.status !== 'no_show') {
      map[key].bookings += 1;
      map[key].revenue += r.totalAmount;
    }
  });
  return Object.values(map).sort(function (a: any, b: any) { return b.revenue - a.revenue; }).slice(0, 5).map(function (item: any) {
    return { name: item.name, bookings: item.bookings, revenue: item.revenue / 100 };
  });
}
