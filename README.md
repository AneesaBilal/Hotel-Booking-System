🏨 StaySphere — Hotel Booking & Management System

StaySphere is a modern, full-stack **Hotel Booking and Management System** designed to provide a complete hotel reservation experience for customers while giving hotel administrators powerful tools to manage reservations, rooms, guests, payments, housekeeping, promotions, and hotel operations.

The platform combines a premium customer-facing hotel booking experience with a comprehensive administration dashboard, making it suitable for a real-world hotel reservation and management workflow.

---

## 📸 Screenshots

### 1. Homepage Hero View

The StaySphere homepage features a premium hero section with hotel search functionality, navigation, authentication actions, and a destination-based booking search widget.

![Homepage Hero View](./Screenshots/Screenshot%20%28534%29.png)

---

### 2. Hotel Listing & Search Results View

The hotel search page provides filtering, sorting, property cards, hotel ratings, amenities, pricing, and access to detailed hotel information.

![Hotel Listing & Search Results](./Screenshots/Screenshot%20%28535%29.png)

---

### 3. Admin Dashboard View

The admin dashboard provides hotel staff and administrators with operational metrics, reservation management, revenue analytics, occupancy insights, and access to the complete hotel management system.

![Admin Dashboard](./Screenshots/Screenshot%20%28536%29.png)

---

### 4. User Dashboard View

The customer dashboard allows users to manage bookings, favorites, reviews, profiles, notifications, upcoming stays, and account-related information.

![User Dashboard](./Screenshots/Screenshot%20%28537%29.png)

---

## 📌 Project Overview

StaySphere is built as a production-style hotel booking platform with two primary experiences:

### Customer Platform

Customers can:

- Search for hotels
- Search by destination
- Select check-in and check-out dates
- Specify guests
- Filter hotels
- Sort search results
- View hotel details
- Browse available rooms
- Check room availability
- Make reservations
- Apply promotional codes
- View booking details
- Manage upcoming and previous bookings
- Save favorite hotels
- Submit reviews
- Manage their profile
- View notifications
- Track pending payments

### Hotel Management Platform

Administrators and hotel staff can:

- Manage hotels
- Manage room types
- Manage rooms
- Manage reservations
- Manage guests
- Manage check-ins
- Manage check-outs
- Manage housekeeping
- Manage payments
- Manage invoices
- Manage reviews
- Manage promotions
- Monitor occupancy
- Track revenue
- View operational analytics

---

## ✨ Features

### 🏠 Customer Website

- Premium hotel booking homepage
- Hero search experience
- Destination search
- Date-based hotel search
- Guest selector
- Featured properties
- Hotel discovery
- Hotel details
- Room details
- Hotel amenities
- Hotel ratings
- Reviews
- Promotional offers
- Responsive navigation
- Light and dark mode

---

### 🔎 Hotel Search & Discovery

- Destination filtering
- Check-in date
- Check-out date
- Guest selection
- Price filtering
- Minimum rating filtering
- Amenity filtering
- Wi-Fi filter
- Parking filter
- Pool filter
- Gym filter
- Restaurant filter
- Spa filter
- Sorting
- Search result count
- Hotel cards
- Pricing per night
- Hotel rating
- Property location
- View details actions

---

### 🏨 Hotel Management

Administrators can manage:

- Hotels
- Hotel descriptions
- Hotel locations
- Hotel contact details
- Hotel images
- Hotel amenities
- Hotel facilities
- Hotel policies
- Featured hotels
- Hotel status

---

### 🛏️ Room Management

Manage:

- Room types
- Individual rooms
- Room numbers
- Floor information
- Room capacity
- Bed types
- Room size
- Room pricing
- Room amenities
- Breakfast availability
- Cancellation policies
- Room status

Room statuses can include:

- Available
- Reserved
- Occupied
- Cleaning
- Maintenance
- Out of Service

---

### 📅 Reservation Management

The booking system supports:

- Date-based availability
- Reservation creation
- Reservation updates
- Reservation cancellation
- Booking references
- Guest information
- Room selection
- Number of guests
- Number of nights
- Price calculation
- Taxes
- Service fees
- Discounts
- Extras
- Payment status
- Reservation status

The system prevents rooms from being double-booked by validating existing reservations against requested dates.

---

### 💳 Payment Management

Payment functionality includes:

- Payment tracking
- Payment status
- Transaction references
- Booking payment association
- Pending payments
- Successful payments
- Failed payments
- Refund-ready architecture
- Stripe-ready payment integration

Sensitive card information should never be stored directly in the application database.

---

### 🧾 Invoice Management

Generate and manage invoices containing:

- Invoice number
- Booking reference
- Hotel information
- Guest information
- Room information
- Stay dates
- Number of nights
- Room charges
- Extras
- Taxes
- Discounts
- Total amount
- Payment status

---

### 👤 Customer Dashboard

Customers receive a dedicated account dashboard containing:

- Welcome section
- Total bookings
- Completed stays
- Favorite hotels
- Pending payments
- Upcoming bookings
- Booking history
- Favorites
- Reviews
- Profile
- Notifications

---

### ⭐ Reviews & Ratings

Customers can submit reviews after eligible stays.

Review features include:

- Overall rating
- Cleanliness rating
- Comfort rating
- Location rating
- Service rating
- Value rating
- Written review
- Review moderation

Customers cannot review a hotel unless they have an eligible completed reservation.

---

### ❤️ Favorites

Customers can:

- Add hotels to favorites
- Remove hotels from favorites
- View saved hotels
- Quickly return to hotel details
- Start a booking from favorites

---

### 🧹 Housekeeping

Hotel staff can manage room cleaning operations.

Supported states include:

- Clean
- Dirty
- Cleaning
- Inspected
- Maintenance

Managers can assign housekeeping tasks and staff can update task status.

---

### 🛎️ Check-in & Check-out

#### Check-in

Receptionists can:

- View expected arrivals
- Verify reservation
- Verify guest details
- Assign room
- Confirm payment
- Check guests in
- Update room occupancy

#### Check-out

Staff can:

- View expected departures
- Review guest stay
- Add additional charges
- Calculate final amount
- Verify payment
- Complete checkout
- Generate invoice
- Mark room for cleaning

---

### 🎟️ Promotions

Administrators can create promotional offers with:

- Promo code
- Discount type
- Discount value
- Minimum booking amount
- Usage limit
- Start date
- Expiry date
- Active/inactive status

Promo codes are validated before being applied to a reservation.

---

### 📊 Admin Analytics

The admin dashboard provides operational insights such as:

- Total revenue
- Today's revenue
- Occupancy rate
- Total reservations
- Pending reservations
- Available rooms
- Checked-in guests
- Today's check-outs

Analytics can include:

- Revenue overview
- Occupancy breakdown
- Reservation trends
- Room performance
- Booking trends

---

## 👥 User Roles

StaySphere supports role-based access control.

### Guest

Can:

- Browse hotels
- Search properties
- Make bookings
- Manage personal reservations
- Manage favorites
- Write reviews
- Manage profile
- View notifications

### Receptionist

Can:

- View reservations
- Create reservations
- Manage guests
- Check guests in
- Check guests out
- View room availability

### Hotel Manager

Can:

- Manage rooms
- Manage room types
- Manage reservations
- Manage guests
- Manage housekeeping
- Manage staff
- View hotel analytics

### Admin

Can:

- Manage the complete platform
- Manage hotels
- Manage users
- Manage roles
- Manage reservations
- Manage payments
- Manage promotions
- Manage system settings
- Access system-wide reports

---

## 🛠️ Technologies

React, Vite, TypeScript, Tailwind CSS, React Router DOM, Supabase, PostgreSQL, Supabase Auth, Supabase Storage, Zustand, TanStack Query, React Hook Form, Zod, Recharts, Lucide React, date-fns, Stripe

---

Run locally

1. npm install
2. npm run dev
3. Open the printed local URL

The generated app ships with a local browser demo database so the full booking, account, and admin workflows can be exercised immediately without external services.

Supabase setup

1. Create a Supabase project.
2. Copy the project URL and anon key into .env.
3. Run the SQL files in supabase/migrations in order.
4. Run supabase/seed.sql if desired.

Environment variables

VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLISHABLE_KEY

Security notes

- Never commit real Supabase service-role keys.
- Never store raw card data.
- The payment form in this scaffold is Stripe-ready UI architecture only and does not store card details.

Database naming

All application tables use the required hotelbooking_ prefix, including:

hotelbooking_profiles
hotelbooking_hotels
hotelbooking_room_types
hotelbooking_rooms
hotelbooking_reservations
hotelbooking_payments
hotelbooking_reviews
hotelbooking_promotions
hotelbooking_notifications
hotelbooking_settings

📄 License

This project is intended for educational, portfolio, and development purposes.

Add an appropriate open-source or proprietary license before distributing the project commercially.

👨‍💻 Project

StaySphere — Hotel Booking & Management System

A production-style full-stack platform combining hotel discovery, real-time room availability, reservations, customer account management, payments, and complete hotel administration into one modern application.
