import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Calendar, CreditCard, Heart, Star, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../lib/store';
import {
  cancelReservation,
  createReview,
  downloadInvoice,
  formatDate,
  formatDateTime,
  formatMoney,
  getEligibleReviewReservations,
  getFavoriteHotels,
  getHotelById,
  getNotifications,
  getReservationById,
  getReservations,
  getRoomTypeById,
  getUserReviews,
  markAllNotificationsRead,
  markNotificationRead,
  todayISO,
  updatePassword,
  updateProfile
} from '../lib/db';
import { Badge, Button, Card, EmptyState, Input, Select, StatusBadge, Textarea } from '../components/ui';
import { HotelCard } from './public';

export function AccountDashboard() {
  const user = useAppStore(function (s) { return s.user; });
  if (!user) return null;

  const reservations = getReservations({ userId: user.id });
  const today = todayISO();
  const upcoming = reservations.filter(function (r) { return (r.status === 'confirmed' || r.status === 'pending') && r.checkIn >= today; })
    .sort(function (a, b) { return a.checkIn.localeCompare(b.checkIn); })[0];
  const completed = reservations.filter(function (r) { return r.status === 'checked_out'; }).length;
  const favorites = getFavoriteHotels(user.id).length;
  const pendingPayments = reservations.filter(function (r) { return r.paymentStatus === 'pending'; }).reduce(function (sum, r) { return sum + r.totalAmount; }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Welcome back, {user.firstName}</h1>
        <Link to="/search"><Button>Find a hotel</Button></Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5"><p className="text-sm text-slate-500">Total bookings</p><p className="mt-1 text-2xl font-semibold">{reservations.length}</p></Card>
        <Card className="p-5"><p className="text-sm text-slate-500">Completed stays</p><p className="mt-1 text-2xl font-semibold">{completed}</p></Card>
        <Card className="p-5"><p className="text-sm text-slate-500">Favorite hotels</p><p className="mt-1 text-2xl font-semibold">{favorites}</p></Card>
        <Card className="p-5"><p className="text-sm text-slate-500">Pending payments</p><p className="mt-1 text-2xl font-semibold">{formatMoney(pendingPayments)}</p></Card>
      </div>

      {upcoming ? (
        <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm text-slate-500">Upcoming booking</p>
            <h2 className="mt-1 text-lg font-semibold">{upcoming.hotel?.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{formatDate(upcoming.checkIn)} - {formatDate(upcoming.checkOut)} · {upcoming.roomType?.name}</p>
          </div>
          <Link to={'/account/bookings/' + upcoming.id}><Button variant="secondary">View booking</Button></Link>
        </Card>
      ) : (
        <EmptyState title="No upcoming bookings" message="Find a hotel and plan your next stay." action={<Link to="/search"><Button>Search hotels</Button></Link>} />
      )}
    </div>
  );
}

export function AccountBookings() {
  const user = useAppStore(function (s) { return s.user; });
  const [version, setVersion] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [query, setQuery] = useState('');
  if (!user) return null;

  const reservations = getReservations({ userId: user.id, status: statusFilter || undefined, query: query || undefined });

  const cancel = function (id: string) {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      cancelReservation(id, { byGuest: true });
      toast.success('Booking cancelled.');
      setVersion(version + 1);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Bookings</h1>
        <div className="flex flex-wrap gap-2">
          <Input placeholder="Search bookings" value={query} onChange={function (e: any) { setQuery(e.target.value); }} />
          <Select value={statusFilter} onChange={function (e: any) { setStatusFilter(e.target.value); }}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked in</option>
            <option value="checked_out">Checked out</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      {reservations.length === 0 ? (
        <EmptyState title="No bookings yet" message="Book your first stay to see it here." action={<Link to="/search"><Button>Search hotels</Button></Link>} />
      ) : (
        <div className="grid gap-4">
          {reservations.map(function (reservation) {
            return (
              <Card key={reservation.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{reservation.hotel?.name}</p>
                    <StatusBadge status={reservation.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{reservation.code} · {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}</p>
                  <p className="mt-1 text-sm text-slate-500">{reservation.roomType?.name} · {reservation.adults + reservation.children} guests</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-semibold">{formatMoney(reservation.totalAmount)}</p>
                  <StatusBadge status={reservation.paymentStatus} />
                  <Link to={'/account/bookings/' + reservation.id}><Button size="sm" variant="secondary">View</Button></Link>
                  {reservation.status === 'pending' || reservation.status === 'confirmed' ? (
                    <Button size="sm" variant="danger" onClick={function () { cancel(reservation.id); }}>Cancel</Button>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AccountBookingDetails() {
  const { id } = useParams();
  const user = useAppStore(function (s) { return s.user; });
  const [version, setVersion] = useState(0);
  const navigate = useNavigate();
  if (!user) return null;

  const reservation = getReservationById(id || '');
  if (!reservation || (reservation.userId !== user.id && user.role === 'guest')) {
    return <EmptyState title="Booking not found" message="This booking does not exist or you do not have access." action={<Link to="/account/bookings"><Button>Back to bookings</Button></Link>} />;
  }

  const hotel = getHotelById(reservation.hotelId);
  const roomType = getRoomTypeById(reservation.roomTypeId);
  const canCancel = reservation.status === 'pending' || reservation.status === 'confirmed';

  const cancel = function () {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      cancelReservation(reservation.id, { byGuest: true });
      toast.success('Booking cancelled.');
      setVersion(version + 1);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Booking {reservation.code}</h1>
          <p className="mt-1 text-sm text-slate-500">Created {formatDateTime(reservation.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={function () { window.print(); }}>Print invoice</Button>
          <Button variant="secondary" onClick={function () { downloadInvoice(reservation.id); }}>Download invoice</Button>
          {canCancel ? <Button variant="danger" onClick={cancel}>Cancel booking</Button> : null}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="space-y-3 p-6">
          <h2 className="font-semibold">Stay information</h2>
          <p className="text-sm text-slate-500">Hotel: {hotel?.name}</p>
          <p className="text-sm text-slate-500">Room: {roomType?.name}</p>
          <p className="text-sm text-slate-500">Check-in: {formatDate(reservation.checkIn)}</p>
          <p className="text-sm text-slate-500">Check-out: {formatDate(reservation.checkOut)}</p>
          <p className="text-sm text-slate-500">Nights: {reservation.nights}</p>
          <p className="text-sm text-slate-500">Guests: {reservation.adults} adults, {reservation.children} children</p>
          <StatusBadge status={reservation.status} />
        </Card>

        <Card className="space-y-3 p-6">
          <h2 className="font-semibold">Guest information</h2>
          <p className="text-sm text-slate-500">{reservation.guestFirstName} {reservation.guestLastName}</p>
          <p className="text-sm text-slate-500">{reservation.guestEmail}</p>
          <p className="text-sm text-slate-500">{reservation.guestPhone || 'No phone provided'}</p>
          <p className="text-sm text-slate-500">{reservation.specialRequests || 'No special requests'}</p>
        </Card>

        <Card className="space-y-3 p-6">
          <h2 className="font-semibold">Payment information</h2>
          <StatusBadge status={reservation.paymentStatus} />
          <p className="text-sm text-slate-500">Total: {formatMoney(reservation.totalAmount)}</p>
          <p className="text-sm text-slate-500">Subtotal: {formatMoney(reservation.subtotal)}</p>
          <p className="text-sm text-slate-500">Taxes: {formatMoney(reservation.taxes)}</p>
          <p className="text-sm text-slate-500">Service fee: {formatMoney(reservation.serviceFee)}</p>
          <p className="text-sm text-slate-500">Extras: {formatMoney(reservation.extrasTotal)}</p>
          <p className="text-sm text-slate-500">Discount: -{formatMoney(reservation.discount)}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold">Booking timeline</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-500">
          <p>Booking created: {formatDateTime(reservation.createdAt)}</p>
          <p>Payment status: {reservation.paymentStatus}</p>
          <p>Confirmation status: {reservation.status}</p>
          <p>Check-in date: {formatDate(reservation.checkIn)}</p>
          <p>Check-out date: {formatDate(reservation.checkOut)}</p>
        </div>
      </Card>

      {reservation.status === 'checked_out' ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-6">
          <div>
            <h2 className="font-semibold">Enjoyed your stay?</h2>
            <p className="mt-1 text-sm text-slate-500">Leave a review for {hotel?.name}.</p>
          </div>
          <Button onClick={function () { navigate('/account/reviews'); }}>Write review</Button>
        </Card>
      ) : null}
    </div>
  );
}

export function AccountFavorites() {
  const user = useAppStore(function (s) { return s.user; });
  const [version, setVersion] = useState(0);
  if (!user) return null;

  const favorites = getFavoriteHotels(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Favorite hotels</h1>
      {favorites.length === 0 ? (
        <EmptyState title="No favorite hotels" message="Save hotels you love and find them here." action={<Link to="/search"><Button>Browse hotels</Button></Link>} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {favorites.map(function (item) { return <HotelCard key={item.hotel.id} item={item} />; })}
        </div>
      )}
    </div>
  );
}

function ReviewForm(props: any) {
  const { reservation, onDone } = props;
  const [rating, setRating] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [comfort, setComfort] = useState(5);
  const [location, setLocation] = useState(5);
  const [service, setService] = useState(5);
  const [value, setValue] = useState(5);
  const [comment, setComment] = useState('');

  const submit = function () {
    try {
      createReview({
        reservationId: reservation.id,
        userId: reservation.userId,
        hotelId: reservation.hotelId,
        rating: Number(rating),
        cleanlinessRating: Number(cleanliness),
        comfortRating: Number(comfort),
        locationRating: Number(location),
        serviceRating: Number(service),
        valueRating: Number(value),
        comment: comment
      });
      toast.success('Review submitted.');
      onDone();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const options = [1, 2, 3, 4, 5];

  return (
    <Card className="space-y-4 p-5">
      <p className="font-medium">{reservation.hotel?.name} · {formatDate(reservation.checkIn)} to {formatDate(reservation.checkOut)}</p>
      <div className="grid gap-3 md:grid-cols-3">
        <Select label="Overall" value={rating} onChange={function (e: any) { setRating(Number(e.target.value)); }}>{options.map(function (n) { return <option key={n} value={n}>{n}</option>; })}</Select>
        <Select label="Cleanliness" value={cleanliness} onChange={function (e: any) { setCleanliness(Number(e.target.value)); }}>{options.map(function (n) { return <option key={n} value={n}>{n}</option>; })}</Select>
        <Select label="Comfort" value={comfort} onChange={function (e: any) { setComfort(Number(e.target.value)); }}>{options.map(function (n) { return <option key={n} value={n}>{n}</option>; })}</Select>
        <Select label="Location" value={location} onChange={function (e: any) { setLocation(Number(e.target.value)); }}>{options.map(function (n) { return <option key={n} value={n}>{n}</option>; })}</Select>
        <Select label="Service" value={service} onChange={function (e: any) { setService(Number(e.target.value)); }}>{options.map(function (n) { return <option key={n} value={n}>{n}</option>; })}</Select>
        <Select label="Value" value={value} onChange={function (e: any) { setValue(Number(e.target.value)); }}>{options.map(function (n) { return <option key={n} value={n}>{n}</option>; })}</Select>
      </div>
      <Textarea label="Written review" value={comment} onChange={function (e: any) { setComment(e.target.value); }} />
      <Button onClick={submit}>Submit review</Button>
    </Card>
  );
}

export function AccountReviews() {
  const user = useAppStore(function (s) { return s.user; });
  const [version, setVersion] = useState(0);
  if (!user) return null;

  const reviews = getUserReviews(user.id);
  const eligible = getEligibleReviewReservations(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reviews</h1>

      {eligible.length > 0 ? (
        <div className="space-y-4">
          <h2 className="font-semibold">Stays you can review</h2>
          {eligible.map(function (reservation) {
            return <ReviewForm key={reservation.id} reservation={reservation} onDone={function () { setVersion(version + 1); }} />;
          })}
        </div>
      ) : (
        <EmptyState title="No stays to review" message="Complete a stay to leave a review." />
      )}

      <div className="space-y-4">
        <h2 className="font-semibold">Your reviews</h2>
        {reviews.length === 0 ? <EmptyState title="No reviews yet" message="Your submitted reviews will appear here." /> : (
          <div className="grid gap-4">
            {reviews.map(function (review) {
              return (
                <Card key={review.id} className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{review.hotel?.name}</p>
                    <Badge>{review.rating}/5</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{review.comment}</p>
                  <p className="mt-2 text-xs text-slate-400">{formatDate(review.createdAt)}</p>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function AccountProfile() {
  const user = useAppStore(function (s) { return s.user; });
  const setUser = useAppStore(function (s) { return s.setUser; });
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: '',
    country: ''
  });
  const [password, setPassword] = useState('');
  if (!user) return null;

  const save = function (event: any) {
    event.preventDefault();
    try {
      const session = updateProfile(user.id, form);
      setUser(session);
      toast.success('Profile updated.');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const changePassword = function () {
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    updatePassword(user.id, password);
    setPassword('');
    toast.success('Password updated.');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-semibold">Account details</h2>
          <form className="mt-4 grid gap-4" onSubmit={save}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="First name" value={form.firstName} onChange={function (e: any) { setForm(Object.assign({}, form, { firstName: e.target.value })); }} />
              <Input label="Last name" value={form.lastName} onChange={function (e: any) { setForm(Object.assign({}, form, { lastName: e.target.value })); }} />
            </div>
            <Input label="Phone" value={form.phone} onChange={function (e: any) { setForm(Object.assign({}, form, { phone: e.target.value })); }} />
            <Input label="Country" value={form.country} onChange={function (e: any) { setForm(Object.assign({}, form, { country: e.target.value })); }} />
            <Button type="submit">Save changes</Button>
          </form>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold">Security</h2>
          <div className="mt-4 space-y-3">
            <Input label="New password" type="password" value={password} onChange={function (e: any) { setPassword(e.target.value); }} />
            <Button variant="secondary" onClick={changePassword}>Update password</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function AccountNotifications() {
  const user = useAppStore(function (s) { return s.user; });
  const [version, setVersion] = useState(0);
  if (!user) return null;

  const notifications = getNotifications(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <Button variant="secondary" onClick={function () { markAllNotificationsRead(user.id); setVersion(version + 1); toast.success('All notifications marked as read.'); }}>Mark all read</Button>
      </div>
      {notifications.length === 0 ? (
        <EmptyState title="No notifications" message="You're all caught up." />
      ) : (
        <div className="grid gap-3">
          {notifications.map(function (notification) {
            return (
              <button key={notification.id} onClick={function () { markNotificationRead(notification.id); setVersion(version + 1); }} className="text-left">
                <Card className={['p-5', notification.readAt ? '' : 'border-blue-200 bg-blue-50/30 dark:border-blue-500/20 dark:bg-blue-500/5'].join(' ')}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{notification.title}</p>
                    {!notification.readAt ? <Badge tone="blue">New</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{notification.message}</p>
                  <p className="mt-2 text-xs text-slate-400">{formatDateTime(notification.createdAt)}</p>
                </Card>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
