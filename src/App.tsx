import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppStore } from './lib/store';
import { AccountLayout, AdminLayout, PublicLayout } from './components/layout';
import {
  AboutPage,
  BookingPage,
  ContactPage,
  FaqPage,
  ForgotPasswordPage,
  HomePage,
  HotelDetailsPage,
  HotelsPage,
  LoginPage,
  NotFoundPage,
  PrivacyPage,
  RegisterPage,
  ResetPasswordPage,
  RoomDetailsPage,
  SearchPage,
  TermsPage
} from './pages/public';
import {
  AccountBookingDetails,
  AccountBookings,
  AccountDashboard,
  AccountFavorites,
  AccountNotifications,
  AccountProfile,
  AccountReviews
} from './pages/account';
import {
  AdminCheckIn,
  AdminCheckOut,
  AdminDashboard,
  AdminGuests,
  AdminHotelDetail,
  AdminHotels,
  AdminHousekeeping,
  AdminInvoices,
  AdminPayments,
  AdminPromotions,
  AdminReservationDetails,
  AdminReservations,
  AdminReviews,
  AdminRoomTypes,
  AdminReports,
  AdminRooms,
  AdminSettings,
  AdminStaff
} from './pages/admin';

function RequireUser(props: any) {
  const user = useAppStore(function (s) { return s.user; });
  if (!user) return <Navigate to="/login" replace />;
  return props.children;
}

function RequireStaff(props: any) {
  const user = useAppStore(function (s) { return s.user; });
  if (!user || user.role === 'guest') return <Navigate to="/login" replace />;
  return props.children;
}

export default function App() {
  const theme = useAppStore(function (s) { return s.theme; });

  useEffect(function () {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/hotels" element={<HotelsPage />} />
        <Route path="/hotels/:hotelId" element={<HotelDetailsPage />} />
        <Route path="/rooms/:roomId" element={<RoomDetailsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/booking/:hotelId" element={<BookingPage />} />
        <Route path="/booking/:hotelId/:roomTypeId" element={<BookingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/account" element={<RequireUser><AccountLayout /></RequireUser>}>
        <Route index element={<AccountDashboard />} />
        <Route path="bookings" element={<AccountBookings />} />
        <Route path="bookings/:id" element={<AccountBookingDetails />} />
        <Route path="favorites" element={<AccountFavorites />} />
        <Route path="reviews" element={<AccountReviews />} />
        <Route path="profile" element={<AccountProfile />} />
        <Route path="notifications" element={<AccountNotifications />} />
      </Route>

      <Route path="/admin" element={<RequireStaff><AdminLayout /></RequireStaff>}>
        <Route index element={<AdminDashboard />} />
        <Route path="hotels" element={<AdminHotels />} />
        <Route path="hotels/:id" element={<AdminHotelDetail />} />
        <Route path="room-types" element={<AdminRoomTypes />} />
        <Route path="rooms" element={<AdminRooms />} />
        <Route path="reservations" element={<AdminReservations />} />
        <Route path="reservations/:id" element={<AdminReservationDetails />} />
        <Route path="guests" element={<AdminGuests />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="invoices" element={<AdminInvoices />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="promotions" element={<AdminPromotions />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="housekeeping" element={<AdminHousekeeping />} />
        <Route path="check-in" element={<AdminCheckIn />} />
        <Route path="check-out" element={<AdminCheckOut />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
