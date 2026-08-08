export type Role = 'guest' | 'receptionist' | 'manager' | 'admin';

export type ReservationStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type RoomStatus = 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance' | 'out_of_service';

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  role: Role;
  createdAt: string;
}

export interface HotelPolicy {
  checkIn: string;
  checkOut: string;
  cancellation: string;
  children: string;
  pets: string;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  rating: number;
  featured: boolean;
  active: boolean;
  amenities: string[];
  image: string;
  policies: HotelPolicy;
  createdAt: string;
}

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  bedType: string;
  roomSize: string;
  breakfastIncluded: boolean;
  cancellationPolicy: string;
  active: boolean;
  image: string;
}

export interface Room {
  id: string;
  hotelId: string;
  roomTypeId: string;
  roomNumber: string;
  floor: string;
  status: RoomStatus;
  priceOverride: number | null;
  notes: string;
}

export interface QuoteExtra {
  name: string;
  price: number;
  quantity: number;
}

export interface ReservationExtra {
  name: string;
  price: number;
  quantity: number;
}

export interface Reservation {
  id: string;
  code: string;
  userId: string;
  hotelId: string;
  roomTypeId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  nights: number;
  subtotal: number;
  taxes: number;
  serviceFee: number;
  discount: number;
  extrasTotal: number;
  totalAmount: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests: string;
  extras: ReservationExtra[];
  promoCode: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionReference: string;
  status: PaymentStatus;
  paidAt: string;
  createdAt: string;
}

export interface Review {
  id: string;
  reservationId: string;
  userId: string;
  hotelId: string;
  rating: number;
  cleanlinessRating: number;
  comfortRating: number;
  locationRating: number;
  serviceRating: number;
  valueRating: number;
  comment: string;
  status: 'visible' | 'hidden';
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  hotelId: string;
  createdAt: string;
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minimumAmount: number;
  usageLimit: number;
  usedCount: number;
  startsAt: string;
  expiresAt: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  readAt: string | null;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  hotelId: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  assignedTo: string;
  status: 'dirty' | 'cleaning' | 'clean' | 'inspected' | 'maintenance';
  priority: 'low' | 'medium' | 'high';
  notes: string;
  completedAt: string | null;
  createdAt: string;
}

export interface Db {
  users: User[];
  hotels: Hotel[];
  roomTypes: RoomType[];
  rooms: Room[];
  reservations: Reservation[];
  payments: Payment[];
  reviews: Review[];
  favorites: Favorite[];
  promotions: Promotion[];
  notifications: Notification[];
  staff: Staff[];
  housekeepingTasks: HousekeepingTask[];
  settings: Record<string, string>;
}
