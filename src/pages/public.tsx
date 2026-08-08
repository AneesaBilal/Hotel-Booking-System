import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, BedDouble, Calendar, ChevronLeft, ChevronRight, Clock, Heart, MapPin, Search, Shield, Sparkles, Star, Tag, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../lib/store';
import {
  addDaysISO,
  createReservation,
  downloadInvoice,
  findAvailableRoom,
  formatDate,
  formatMoney,
  getHotelById,
  getHotelReviews,
  getHotels,
  getMinPrice,
  getPromotions,
  getQuote,
  getReservationById,
  getRoomTypeById,
  getRoomTypesByHotel,
  getUserByEmail,
  isFavorite,
  login,
  nightsBetween,
  register,
  resetPassword,
  searchHotels,
  toggleFavorite,
  validatePromo
} from '../lib/db';
import { Badge, Button, Card, EmptyState, Input, Modal, RatingStars, Select, Skeleton, Textarea } from '../components/ui';
import type { QuoteExtra } from '../types';

export function HotelCard(props: any) {
  const { item } = props;
  const [version, setVersion] = useState(0);
  const user = useAppStore(function (s) { return s.user; });
  const navigate = useNavigate();
  const hotel = item.hotel;
  const favorite = user ? isFavorite(user.id, hotel.id) : false;

  const onFavorite = function (event: any) {
    event.preventDefault();
    if (!user) {
      toast.info('Sign in to save favorites.');
      navigate('/login');
      return;
    }
    toggleFavorite(user.id, hotel.id);
    setVersion(version + 1);
    toast.success('Favorites updated.');
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img src={hotel.image} alt={hotel.name} className="h-52 w-full object-cover" loading="lazy" />
        <button
          aria-label="Toggle favorite"
          onClick={onFavorite}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow dark:bg-slate-900/90"
        >
          <Heart className={favorite ? 'h-4 w-4 fill-red-500 text-red-500' : 'h-4 w-4'} />
        </button>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{hotel.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5" /> {hotel.city}, {hotel.country}
            </p>
          </div>
          <div className="text-right">
            <RatingStars rating={hotel.rating} />
            <p className="mt-1 text-xs text-slate-500">{hotel.rating.toFixed(1)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {hotel.amenities.slice(0, 3).map(function (amenity: string) {
            return <Badge key={amenity}>{amenity}</Badge>;
          })}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <div>
            <p className="text-xs text-slate-500">From</p>
            <p className="text-lg font-semibold">{formatMoney(item.minPrice)}<span className="text-xs font-normal text-slate-500"> / night</span></p>
          </div>
          <Link to={'/hotels/' + hotel.id}>
            <Button size="sm">View details</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

export function HomePage() {
  const storeSearch = useAppStore(function (s) { return s.search; });
  const setSearch = useAppStore(function (s) { return s.setSearch; });
  const navigate = useNavigate();

  const [destination, setDestination] = useState(storeSearch.destination);
  const [checkIn, setCheckIn] = useState(storeSearch.checkIn || addDaysISO(1));
  const [checkOut, setCheckOut] = useState(storeSearch.checkOut || addDaysISO(4));
  const [guests, setGuests] = useState(storeSearch.guests);
  const [rooms, setRooms] = useState(storeSearch.rooms);
  const [newsletter, setNewsletter] = useState('');

  const hotels = getHotels();
  const destinations = useMemo(function () {
    const map: any = {};
    hotels.forEach(function (h) {
      if (!map[h.city]) map[h.city] = { city: h.city, country: h.country, image: h.image, count: 0 };
      map[h.city].count += 1;
    });
    return Object.values(map);
  }, [hotels]);

  const featured = hotels.filter(function (h) { return h.featured; }).map(function (h) {
    return { hotel: h, minPrice: getMinPrice(h.id), availableRoomTypes: getRoomTypesByHotel(h.id).length };
  });

  const promotions = getPromotions().filter(function (p) { return p.status === 'active'; });

  const submit = function () {
    if (checkOut <= checkIn) {
      toast.error('Check-out must be after check-in.');
      return;
    }
    setSearch({ destination: destination, checkIn: checkIn, checkOut: checkOut, guests: Number(guests), rooms: Number(rooms) });
    navigate('/search?destination=' + encodeURIComponent(destination) + '&checkIn=' + checkIn + '&checkOut=' + checkOut + '&guests=' + String(guests));
  };

  return (
    <div>
      <section className="relative">
        <div className="absolute inset-0">
          <img src={hotels[0]?.image} alt="Luxury hotel" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/60" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold text-white md:text-5xl">Find a stay you'll love.</h1>
            <p className="mt-4 text-lg text-slate-200">Search premium hotels, compare rooms, and book with confidence using real-time availability and transparent pricing.</p>
          </div>
          <Card className="mt-8 grid gap-3 p-4 md:grid-cols-5">
            <Input label="Destination" placeholder="City, hotel, or country" value={destination} onChange={function (e: any) { setDestination(e.target.value); }} />
            <Input label="Check-in" type="date" value={checkIn} onChange={function (e: any) { setCheckIn(e.target.value); }} />
            <Input label="Check-out" type="date" value={checkOut} onChange={function (e: any) { setCheckOut(e.target.value); }} />
            <Select label="Guests" value={guests} onChange={function (e: any) { setGuests(Number(e.target.value)); }}>
              {[1, 2, 3, 4, 5, 6].map(function (n) { return <option key={n} value={n}>{n} guests</option>; })}
            </Select>
            <div className="flex items-end">
              <Button className="w-full" onClick={submit}><Search className="h-4 w-4" /> Search</Button>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Popular destinations</h2>
          <Link to="/search" className="text-sm text-blue-600">View all</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {destinations.map(function (destinationItem: any) {
            return (
              <Card key={destinationItem.city} className="overflow-hidden">
                <img src={destinationItem.image} alt={destinationItem.city} className="h-36 w-full object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold">{destinationItem.city}</h3>
                  <p className="text-sm text-slate-500">{destinationItem.country}</p>
                  <p className="mt-1 text-xs text-slate-400">{destinationItem.count} properties</p>
                  <Button size="sm" variant="secondary" className="mt-3" onClick={function () { navigate('/search?destination=' + encodeURIComponent(destinationItem.city)); }}>Explore</Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Featured hotels</h2>
          <Link to="/hotels" className="text-sm text-blue-600">Browse all hotels</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featured.map(function (item) { return <HotelCard key={item.hotel.id} item={item} />; })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-semibold">Why StaySphere</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Card className="p-5"><Shield className="mb-3 h-5 w-5 text-blue-600" /><h3 className="font-medium">Best Price Guarantee</h3><p className="mt-1 text-sm text-slate-500">Transparent rates with no hidden surprises.</p></Card>
            <Card className="p-5"><Star className="mb-3 h-5 w-5 text-blue-600" /><h3 className="font-medium">Verified Hotels</h3><p className="mt-1 text-sm text-slate-500">Every property is curated and quality checked.</p></Card>
            <Card className="p-5"><Tag className="mb-3 h-5 w-5 text-blue-600" /><h3 className="font-medium">Secure Booking</h3><p className="mt-1 text-sm text-slate-500">Stripe-ready payment architecture and protected data.</p></Card>
            <Card className="p-5"><Clock className="mb-3 h-5 w-5 text-blue-600" /><h3 className="font-medium">24/7 Support</h3><p className="mt-1 text-sm text-slate-500">Support before, during, and after your stay.</p></Card>
          </div>
        </div>
      </section>

      <section id="offers" className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-2xl font-semibold">Special offers</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {promotions.map(function (promo) {
            return (
              <Card key={promo.id} className="flex items-start justify-between gap-4 p-5">
                <div>
                  <Badge tone="blue">{promo.code}</Badge>
                  <h3 className="mt-2 font-semibold">{promo.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{promo.description}</p>
                  <p className="mt-2 text-xs text-slate-400">Valid until {formatDate(promo.expiresAt)}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={function () { navigator.clipboard.writeText(promo.code); toast.success('Promo code copied.'); }}>Copy code</Button>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <h2 className="text-2xl font-semibold">Testimonials</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="p-5"><p className="text-sm text-slate-600 dark:text-slate-300">The booking flow was effortless and the room was ready at check-in. This is how hotel booking should feel.</p><p className="mt-3 text-sm font-medium">Sophia R. — Guest</p></Card>
          <Card className="p-5"><p className="text-sm text-slate-600 dark:text-slate-300">Our front desk team manages arrivals, housekeeping, and invoices from one dashboard every day.</p><p className="mt-3 text-sm font-medium">Daniel M. — Hotel Manager</p></Card>
          <Card className="p-5"><p className="text-sm text-slate-600 dark:text-slate-300">Availability, pricing, and promotions are always accurate. It feels like a real commercial platform.</p><p className="mt-3 text-sm font-medium">Ayesha K. — Guest</p></Card>
        </div>
        <Card className="mt-8 flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
          <div>
            <h3 className="text-lg font-semibold">Subscribe to member offers</h3>
            <p className="mt-1 text-sm text-slate-500">Get seasonal deals and destination inspiration.</p>
          </div>
          <div className="flex w-full max-w-md gap-2">
            <Input placeholder="Email address" value={newsletter} onChange={function (e: any) { setNewsletter(e.target.value); }} />
            <Button onClick={function () { if (!newsletter.includes('@')) { toast.error('Enter a valid email.'); return; } setNewsletter(''); toast.success('Subscribed successfully.'); }}>Subscribe</Button>
          </div>
        </Card>
      </section>
    </div>
  );
}

export function HotelsPage() {
  const [query, setQuery] = useState('');
  const hotels = getHotels().filter(function (h) {
    const q = query.toLowerCase();
    return !q || h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q) || h.country.toLowerCase().includes(q);
  }).map(function (h) {
    return { hotel: h, minPrice: getMinPrice(h.id), availableRoomTypes: getRoomTypesByHotel(h.id).length };
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Hotels</h1>
        <div className="w-full max-w-sm"><Input placeholder="Search by hotel or city" value={query} onChange={function (e: any) { setQuery(e.target.value); }} /></div>
      </div>
      {hotels.length === 0 ? <EmptyState title="No hotels found" message="Try a different search term." action={<Link to="/search"><Button>Search hotels</Button></Link>} /> : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {hotels.map(function (item) { return <HotelCard key={item.hotel.id} item={item} />; })}
      </div>
    </div>
  );
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [maxPriceDollars, setMaxPriceDollars] = useState(1000);
  const [minRating, setMinRating] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sort, setSort] = useState('featured');

  const destination = searchParams.get('destination') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = Number(searchParams.get('guests') || 2);

  const amenityOptions = ['Wi-Fi', 'Parking', 'Pool', 'Gym', 'Restaurant', 'Spa', 'Airport transfer', 'Air conditioning'];

  useEffect(function () {
    setLoading(true);
    const timer = setTimeout(function () { setLoading(false); }, 250);
    return function () { clearTimeout(timer); };
  }, [destination, checkIn, checkOut, guests, maxPriceDollars, minRating, selectedAmenities, sort]);

  const results = searchHotels({
    destination: destination,
    checkIn: checkIn,
    checkOut: checkOut,
    guests: guests,
    maxPrice: maxPriceDollars ? maxPriceDollars * 100 : undefined,
    minRating: minRating || undefined,
    amenities: selectedAmenities,
    sort: sort
  });

  const pageSize = 6;
  const visible = results.slice(0, page * pageSize);

  const toggleAmenity = function (amenity: string) {
    setPage(1);
    setSelectedAmenities(function (current) {
      return current.includes(amenity) ? current.filter(function (a) { return a !== amenity; }) : current.concat([amenity]);
    });
  };

  const clearFilters = function () {
    setMaxPriceDollars(1000);
    setMinRating(0);
    setSelectedAmenities([]);
    setSort('featured');
    setPage(1);
  };

  const updateSearch = function (patch: any) {
    const params: any = {};
    if (destination) params.destination = destination;
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;
    if (guests) params.guests = String(guests);
    const next = Object.assign({}, params, patch);
    setSearchParams(next);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-5 dark:border-slate-800 dark:bg-slate-900">
        <Input label="Destination" value={destination} onChange={function (e: any) { updateSearch({ destination: e.target.value }); }} />
        <Input label="Check-in" type="date" value={checkIn} onChange={function (e: any) { updateSearch({ checkIn: e.target.value }); }} />
        <Input label="Check-out" type="date" value={checkOut} onChange={function (e: any) { updateSearch({ checkOut: e.target.value }); }} />
        <Select label="Guests" value={guests} onChange={function (e: any) { updateSearch({ guests: e.target.value }); }}>
          {[1, 2, 3, 4, 5, 6].map(function (n) { return <option key={n} value={n}>{n} guests</option>; })}
        </Select>
        <Select label="Sort" value={sort} onChange={function (e: any) { setSort(e.target.value); setPage(1); }}>
          <option value="featured">Recommended</option>
          <option value="price_asc">Price low to high</option>
          <option value="price_desc">Price high to low</option>
          <option value="rating">Highest rated</option>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <Card className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Filters</h2>
              <Button size="sm" variant="ghost" onClick={clearFilters}>Clear</Button>
            </div>
            <Input label="Max price per night" type="number" min={50} value={maxPriceDollars} onChange={function (e: any) { setMaxPriceDollars(Number(e.target.value)); setPage(1); }} />
            <Select label="Minimum rating" value={minRating} onChange={function (e: any) { setMinRating(Number(e.target.value)); setPage(1); }}>
              <option value={0}>Any rating</option>
              <option value={4}>4.0+</option>
              <option value={4.5}>4.5+</option>
            </Select>
            <div>
              <p className="mb-2 text-sm font-medium">Amenities</p>
              <div className="grid gap-2">
                {amenityOptions.map(function (amenity) {
                  return (
                    <label key={amenity} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={selectedAmenities.includes(amenity)} onChange={function () { toggleAmenity(amenity); }} />
                      {amenity}
                    </label>
                  );
                })}
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <p className="text-sm font-semibold">Active filters</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {destination ? <Badge>{destination}</Badge> : null}
              {checkIn && checkOut ? <Badge>{checkIn} to {checkOut}</Badge> : null}
              <Badge>{guests} guests</Badge>
              <Badge>{'Up to $' + maxPriceDollars}</Badge>
              {minRating > 0 ? <Badge>{minRating}+ stars</Badge> : null}
              {selectedAmenities.map(function (amenity) { return <Badge key={amenity}>{amenity}</Badge>; })}
            </div>
          </Card>
        </aside>

        <section className="space-y-4">
          <p className="text-sm text-slate-500">{results.length} properties found</p>
          {loading ? (
            <div className="grid gap-5 md:grid-cols-2">
              {[1, 2, 3, 4].map(function (i) { return <Skeleton key={i} className="h-72" />; })}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState title="No hotels match your filters" message="Try clearing filters or changing dates." action={<Button onClick={clearFilters}>Clear filters</Button>} />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {visible.map(function (item) { return <HotelCard key={item.hotel.id} item={item} />; })}
            </div>
          )}
          {!loading && visible.length < results.length ? (
            <div className="flex justify-center"><Button variant="secondary" onClick={function () { setPage(page + 1); }}>Load more</Button></div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export function HotelDetailsPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAppStore(function (s) { return s.user; });

  const hotel = getHotelById(params.hotelId || '');
  const [imageIndex, setImageIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || addDaysISO(1));
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || addDaysISO(3));
  const [adults, setAdults] = useState(Number(searchParams.get('guests') || 2));

  if (!hotel) return <NotFoundPage />;

  const roomTypes = getRoomTypesByHotel(hotel.id);
  const images = [hotel.image].concat(roomTypes.map(function (rt) { return rt.image; }));
  const reviews = getHotelReviews(hotel.id);
  const favorite = user ? isFavorite(user.id, hotel.id) : false;
  const nights = checkOut > checkIn ? nightsBetween(checkIn, checkOut) : 0;

  useEffect(function () {
    if (!fullscreen) return;
    const handler = function (event: any) {
      if (event.key === 'Escape') setFullscreen(false);
      if (event.key === 'ArrowRight') setImageIndex(function (i) { return (i + 1) % images.length; });
      if (event.key === 'ArrowLeft') setImageIndex(function (i) { return (i - 1 + images.length) % images.length; });
    };
    window.addEventListener('keydown', handler);
    return function () { window.removeEventListener('keydown', handler); };
  }, [fullscreen, images.length]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <button onClick={function () { setFullscreen(true); }} className="overflow-hidden rounded-xl">
          <img src={images[imageIndex]} alt={hotel.name} className="h-96 w-full object-cover" />
        </button>
        <div className="grid grid-cols-2 gap-2">
          {images.slice(0, 4).map(function (image, index) {
            return <img key={index} src={image} alt={hotel.name + ' image ' + index} className="h-44 w-full rounded-lg object-cover" onClick={function () { setImageIndex(index); }} />;
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{hotel.name}</h1>
          <p className="mt-2 flex items-center gap-1 text-slate-500"><MapPin className="h-4 w-4" /> {hotel.address}, {hotel.city}, {hotel.country}</p>
          <div className="mt-2 flex items-center gap-2"><RatingStars rating={hotel.rating} /><span className="text-sm text-slate-500">{hotel.rating.toFixed(1)} · {reviews.length} reviews</span></div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={function () {
            if (!user) { toast.info('Sign in to save favorites.'); navigate('/login'); return; }
            toggleFavorite(user.id, hotel.id);
            toast.success('Favorites updated.');
          }}>
            <Heart className={favorite ? 'h-4 w-4 fill-red-500 text-red-500' : 'h-4 w-4'} /> Favorite
          </Button>
          <Button variant="secondary" onClick={function () { navigator.clipboard.writeText(window.location.href); toast.success('Link copied.'); }}>Share</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold">Overview</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300">{hotel.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">{hotel.amenities.map(function (amenity) { return <Badge key={amenity}>{amenity}</Badge>; })}</div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold">Policies</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
              <p><span className="font-medium">Check-in:</span> {hotel.policies.checkIn}</p>
              <p><span className="font-medium">Check-out:</span> {hotel.policies.checkOut}</p>
              <p><span className="font-medium">Cancellation:</span> {hotel.policies.cancellation}</p>
              <p><span className="font-medium">Children:</span> {hotel.policies.children}</p>
              <p><span className="font-medium">Pets:</span> {hotel.policies.pets}</p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold">Location</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300">{hotel.address}, {hotel.city}, {hotel.country}</p>
            <div className="mt-4 flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-400 dark:border-slate-700">
              Map-ready UI
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold">Guest reviews</h2>
            {reviews.length === 0 ? <p className="mt-3 text-sm text-slate-500">No reviews yet.</p> : (
              <div className="mt-4 space-y-4">
                {reviews.map(function (review) {
                  return (
                    <div key={review.id} className="rounded-lg border border-slate-100 p-4 dark:border-slate-800">
                      <RatingStars rating={review.rating} />
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>
                      <p className="mt-2 text-xs text-slate-400">{formatDate(review.createdAt)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-3 p-5">
            <h2 className="font-semibold">Check availability</h2>
            <Input label="Check-in" type="date" value={checkIn} onChange={function (e: any) { setCheckIn(e.target.value); }} />
            <Input label="Check-out" type="date" value={checkOut} onChange={function (e: any) { setCheckOut(e.target.value); }} />
            <Select label="Guests" value={adults} onChange={function (e: any) { setAdults(Number(e.target.value)); }}>
              {[1, 2, 3, 4, 5, 6].map(function (n) { return <option key={n} value={n}>{n} guests</option>; })}
            </Select>
          </Card>

          <div className="space-y-4">
            {roomTypes.map(function (roomType) {
              const available = findAvailableRoom(roomType.id, checkIn, checkOut);
              const total = nights > 0 ? roomType.basePrice * nights : roomType.basePrice;
              return (
                <Card key={roomType.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{roomType.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{roomType.bedType} · Up to {roomType.maxGuests} guests · {roomType.roomSize}</p>
                      <p className="mt-1 text-xs text-slate-400">{roomType.breakfastIncluded ? 'Breakfast included' : 'Breakfast not included'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{formatMoney(total)}</p>
                      <p className="text-xs text-slate-400">{nights > 0 ? nights + ' nights' : 'per night'}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link to={'/rooms/' + roomType.id}><Button variant="secondary" size="sm">Details</Button></Link>
                    <Button
                      size="sm"
                      disabled={!available || checkOut <= checkIn}
                      onClick={function () {
                        navigate('/booking/' + hotel.id + '/' + roomType.id + '?checkIn=' + checkIn + '&checkOut=' + checkOut + '&adults=' + String(adults));
                      }}
                    >
                      {available ? 'Select room' : 'Unavailable'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <Modal open={fullscreen} onClose={function () { setFullscreen(false); }} title={hotel.name}>
        <div className="relative">
          <img src={images[imageIndex]} alt={hotel.name} className="h-[60vh] w-full rounded-lg object-cover" />
          <button aria-label="Previous image" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 dark:bg-slate-900/80" onClick={function () { setImageIndex(function (i) { return (i - 1 + images.length) % images.length; }); }}><ChevronLeft className="h-5 w-5" /></button>
          <button aria-label="Next image" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 dark:bg-slate-900/80" onClick={function () { setImageIndex(function (i) { return (i + 1) % images.length; }); }}><ChevronRight className="h-5 w-5" /></button>
        </div>
      </Modal>
    </div>
  );
}

export function RoomDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const roomType = getRoomTypeById(params.roomId || '');
  const hotel = roomType ? getHotelById(roomType.hotelId) : undefined;
  const [checkIn] = useState(addDaysISO(1));
  const [checkOut] = useState(addDaysISO(3));

  if (!roomType || !hotel) return <NotFoundPage />;

  const quote = getQuote({ roomTypeId: roomType.id, checkIn: checkIn, checkOut: checkOut, adults: 2, children: 0, extras: [] });

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <img src={roomType.image} alt={roomType.name} className="h-96 w-full rounded-2xl object-cover" />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">{roomType.name}</h1>
            <p className="mt-2 text-slate-500">{hotel.name} · {hotel.city}, {hotel.country}</p>
          </div>
          <Card className="grid gap-4 p-6 md:grid-cols-3">
            <div className="flex items-center gap-2 text-sm"><BedDouble className="h-4 w-4 text-blue-600" /> {roomType.bedType}</div>
            <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-blue-600" /> Up to {roomType.maxGuests} guests</div>
            <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-blue-600" /> {roomType.roomSize}</div>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-semibold">Room description</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300">{roomType.description}</p>
            <p className="mt-4 text-sm text-slate-500">Cancellation policy: {roomType.cancellationPolicy}</p>
          </Card>
        </div>
        <Card className="h-fit space-y-4 p-6">
          <h2 className="font-semibold">Price details</h2>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span>Nightly rate</span><span>{formatMoney(roomType.basePrice)}</span></p>
            <p className="flex justify-between"><span>Estimated taxes</span><span>{formatMoney(quote.taxes)}</span></p>
            <p className="flex justify-between"><span>Service fee</span><span>{formatMoney(quote.serviceFee)}</span></p>
            <p className="flex justify-between border-t border-slate-200 pt-2 font-semibold dark:border-slate-800"><span>Total estimate</span><span>{formatMoney(quote.total || roomType.basePrice)}</span></p>
          </div>
          <Button className="w-full" onClick={function () { navigate('/booking/' + hotel.id + '/' + roomType.id + '?checkIn=' + checkIn + '&checkOut=' + checkOut + '&adults=2'); }}>Reserve Room</Button>
        </Card>
      </div>
    </div>
  );
}

function BookingConfirmationView(props: any) {
  const { reservation } = props;
  const navigate = useNavigate();
  const hotel = getHotelById(reservation.hotelId);
  const roomType = getRoomTypeById(reservation.roomTypeId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Card className="space-y-6 p-8">
        <div className="text-center">
          <Sparkles className="mx-auto h-8 w-8 text-blue-600" />
          <h1 className="mt-3 text-2xl font-semibold">Booking confirmed</h1>
          <p className="mt-1 text-slate-500">Your booking reference is {reservation.code}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4"><p className="text-xs text-slate-400">Hotel</p><p className="mt-1 font-medium">{hotel?.name}</p></Card>
          <Card className="p-4"><p className="text-xs text-slate-400">Room</p><p className="mt-1 font-medium">{roomType?.name}</p></Card>
          <Card className="p-4"><p className="text-xs text-slate-400">Dates</p><p className="mt-1 font-medium">{formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}</p></Card>
          <Card className="p-4"><p className="text-xs text-slate-400">Guest</p><p className="mt-1 font-medium">{reservation.guestFirstName} {reservation.guestLastName}</p></Card>
          <Card className="p-4"><p className="text-xs text-slate-400">Payment status</p><p className="mt-1 font-medium capitalize">{reservation.paymentStatus}</p></Card>
          <Card className="p-4"><p className="text-xs text-slate-400">Total</p><p className="mt-1 font-medium">{formatMoney(reservation.totalAmount)}</p></Card>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={function () { navigate('/account/bookings/' + reservation.id); }}>View booking</Button>
          <Button variant="secondary" onClick={function () { window.print(); }}>Print invoice</Button>
          <Button variant="secondary" onClick={function () { downloadInvoice(reservation.id); }}>Download invoice</Button>
          <Button variant="ghost" onClick={function () { navigate('/'); }}>Return home</Button>
        </div>
      </Card>
    </div>
  );
}

export function BookingPage() {
  const params = useParams();
  const hotel = getHotelById(params.hotelId || '');
  const reservation = !hotel ? getReservationById(params.hotelId || '') : null;

  if (!hotel && reservation) return <BookingConfirmationView reservation={reservation} />;
  if (!hotel) return <NotFoundPage />;
  if (!params.roomTypeId) return <Navigate to={'/hotels/' + hotel.id} replace />;

  const roomType = getRoomTypeById(params.roomTypeId);
  if (!roomType) return <NotFoundPage />;

  return <BookingWizard hotel={hotel} roomType={roomType} roomTypeId={params.roomTypeId} />;
}

function BookingWizard(props: any) {
  const { hotel, roomType, roomTypeId } = props;
  const [searchParams] = useSearchParams();
  const user = useAppStore(function (s) { return s.user; });
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || addDaysISO(1));
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || addDaysISO(3));
  const [adults, setAdults] = useState(Number(searchParams.get('adults') || 2));
  const [children, setChildren] = useState(Number(searchParams.get('children') || 0));
  const [guest, setGuest] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    country: '',
    requests: ''
  });
  const [extras, setExtras] = useState<QuoteExtra[]>([]);
  const [promoInput, setPromoInput] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [payment, setPayment] = useState({ cardName: '', cardNumber: '', expiry: '', cvc: '' });
  const [confirmation, setConfirmation] = useState<any>(null);

  const nights = checkOut > checkIn ? nightsBetween(checkIn, checkOut) : 0;

  const extraOptions = [
    { name: 'Breakfast', price: 2500, quantity: nights || 1 },
    { name: 'Airport transfer', price: 5000, quantity: 1 },
    { name: 'Extra bed', price: 3000, quantity: nights || 1 },
    { name: 'Late checkout', price: 4000, quantity: 1 },
    { name: 'Room service package', price: 6000, quantity: 1 }
  ];

  const quote = getQuote({
    roomTypeId: roomTypeId,
    checkIn: checkIn,
    checkOut: checkOut,
    adults: Number(adults),
    children: Number(children),
    extras: extras,
    promoCode: promoCode
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-semibold">Sign in to continue</h1>
          <p className="mt-2 text-slate-500">You need an account to complete this booking.</p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/login"><Button>Login</Button></Link>
            <Link to="/register"><Button variant="secondary">Create account</Button></Link>
          </div>
        </Card>
      </div>
    );
  }

  if (confirmation) return <BookingConfirmationView reservation={confirmation} />;

  const toggleExtra = function (option: any) {
    setExtras(function (current) {
      const exists = current.find(function (e) { return e.name === option.name; });
      if (exists) return current.filter(function (e) { return e.name !== option.name; });
      return current.concat([{ name: option.name, price: option.price, quantity: option.quantity }]);
    });
  };

  const applyPromo = function () {
    const result = validatePromo(promoInput, quote.subtotal + quote.extrasTotal);
    if (!result.ok) {
      toast.error(result.error || 'Invalid promo code.');
      return;
    }
    setPromoCode(promoInput);
    toast.success('Promo code applied.');
  };

  const pay = function () {
    if (!guest.firstName || !guest.lastName || !guest.email) {
      toast.error('Guest details are required.');
      return;
    }
    if (!payment.cardName || payment.cardNumber.length < 12 || !payment.expiry || !payment.cvc) {
      toast.error('Enter complete payment details.');
      return;
    }
    try {
      const reservation = createReservation({
        userId: user.id,
        roomTypeId: roomTypeId,
        checkIn: checkIn,
        checkOut: checkOut,
        adults: Number(adults),
        children: Number(children),
        extras: extras,
        promoCode: promoCode,
        guestFirstName: guest.firstName,
        guestLastName: guest.lastName,
        guestEmail: guest.email,
        guestPhone: guest.phone,
        specialRequests: guest.requests,
        paid: true
      });
      setConfirmation(reservation);
      setStep(6);
      toast.success('Payment successful.');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const steps = ['Stay', 'Guest', 'Extras', 'Summary', 'Payment'];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-center gap-2">
        {steps.map(function (label, index) {
          const active = step === index + 1;
          const complete = step > index + 1;
          return (
            <span key={label} className={['rounded-full px-3 py-1 text-xs font-medium', active ? 'bg-blue-600 text-white' : complete ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'].join(' ')}>
              {index + 1}. {label}
            </span>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Stay details</h2>
              <p className="text-sm text-slate-500">{hotel.name} · {roomType.name}</p>
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="Check-in" type="date" value={checkIn} onChange={function (e: any) { setCheckIn(e.target.value); }} />
                <Input label="Check-out" type="date" value={checkOut} onChange={function (e: any) { setCheckOut(e.target.value); }} />
                <Select label="Adults" value={adults} onChange={function (e: any) { setAdults(Number(e.target.value)); }}>
                  {[1, 2, 3, 4, 5, 6].map(function (n) { return <option key={n} value={n}>{n}</option>; })}
                </Select>
                <Select label="Children" value={children} onChange={function (e: any) { setChildren(Number(e.target.value)); }}>
                  {[0, 1, 2, 3, 4].map(function (n) { return <option key={n} value={n}>{n}</option>; })}
                </Select>
              </div>
              {quote.error ? <p className="text-sm text-red-500">{quote.error}</p> : null}
              <div className="flex justify-end"><Button disabled={!quote.ok} onClick={function () { setStep(2); }}>Continue</Button></div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Guest details</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="First name" value={guest.firstName} onChange={function (e: any) { setGuest(Object.assign({}, guest, { firstName: e.target.value })); }} />
                <Input label="Last name" value={guest.lastName} onChange={function (e: any) { setGuest(Object.assign({}, guest, { lastName: e.target.value })); }} />
                <Input label="Email" type="email" value={guest.email} onChange={function (e: any) { setGuest(Object.assign({}, guest, { email: e.target.value })); }} />
                <Input label="Phone" value={guest.phone} onChange={function (e: any) { setGuest(Object.assign({}, guest, { phone: e.target.value })); }} />
                <Input label="Country" value={guest.country} onChange={function (e: any) { setGuest(Object.assign({}, guest, { country: e.target.value })); }} />
              </div>
              <Textarea label="Special requests" value={guest.requests} onChange={function (e: any) { setGuest(Object.assign({}, guest, { requests: e.target.value })); }} />
              <div className="flex justify-between"><Button variant="secondary" onClick={function () { setStep(1); }}>Back</Button><Button onClick={function () { setStep(3); }}>Continue</Button></div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Extras</h2>
              <div className="grid gap-3">
                {extraOptions.map(function (option) {
                  const selected = extras.some(function (e) { return e.name === option.name; });
                  return (
                    <label key={option.name} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
                      <span className="flex items-center gap-2">
                        <input type="checkbox" checked={selected} onChange={function () { toggleExtra(option); }} />
                        {option.name}
                      </span>
                      <span>{formatMoney(option.price)} x {option.quantity}</span>
                    </label>
                  );
                })}
              </div>
              <div className="flex justify-between"><Button variant="secondary" onClick={function () { setStep(2); }}>Back</Button><Button onClick={function () { setStep(4); }}>Continue</Button></div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Price summary</h2>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between"><span>Room price x {quote.nights} nights</span><span>{formatMoney(quote.subtotal)}</span></p>
                <p className="flex justify-between"><span>Extras</span><span>{formatMoney(quote.extrasTotal)}</span></p>
                <p className="flex justify-between"><span>Taxes</span><span>{formatMoney(quote.taxes)}</span></p>
                <p className="flex justify-between"><span>Service fee</span><span>{formatMoney(quote.serviceFee)}</span></p>
                <p className="flex justify-between"><span>Discount</span><span>-{formatMoney(quote.discount)}</span></p>
                <p className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold dark:border-slate-800"><span>Total</span><span>{formatMoney(quote.total)}</span></p>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Promo code" className="flex-1" value={promoInput} onChange={function (e: any) { setPromoInput(e.target.value); }} />
                <Button variant="secondary" onClick={applyPromo}>Apply</Button>
              </div>
              <div className="flex justify-between"><Button variant="secondary" onClick={function () { setStep(3); }}>Back</Button><Button onClick={function () { setStep(5); }}>Continue to payment</Button></div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Payment</h2>
              <p className="text-sm text-slate-500">This is a Stripe-ready checkout architecture. Raw card data is never stored.</p>
              <div className="grid gap-3 md:grid-cols-2">
                <Input label="Cardholder name" value={payment.cardName} onChange={function (e: any) { setPayment(Object.assign({}, payment, { cardName: e.target.value })); }} />
                <Input label="Card number" value={payment.cardNumber} onChange={function (e: any) { setPayment(Object.assign({}, payment, { cardNumber: e.target.value })); }} />
                <Input label="Expiry" placeholder="MM/YY" value={payment.expiry} onChange={function (e: any) { setPayment(Object.assign({}, payment, { expiry: e.target.value })); }} />
                <Input label="CVC" value={payment.cvc} onChange={function (e: any) { setPayment(Object.assign({}, payment, { cvc: e.target.value })); }} />
              </div>
              <div className="flex justify-between"><Button variant="secondary" onClick={function () { setStep(4); }}>Back</Button><Button onClick={pay}>Pay {formatMoney(quote.total)}</Button></div>
            </div>
          ) : null}
        </Card>

        <Card className="h-fit space-y-3 p-5">
          <h3 className="font-semibold">Your stay</h3>
          <p className="text-sm text-slate-500">{hotel.name}</p>
          <p className="text-sm text-slate-500">{roomType.name}</p>
          <p className="text-sm text-slate-500">{formatDate(checkIn)} - {formatDate(checkOut)}</p>
          <p className="text-sm text-slate-500">{adults + children} guests · {nights} nights</p>
          <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
            <p className="flex justify-between text-sm"><span>Total</span><span className="font-semibold">{formatMoney(quote.total)}</span></p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const setUser = useAppStore(function (s) { return s.setUser; });
  const navigate = useNavigate();

  const submit = function (event: any) {
    event.preventDefault();
    try {
      const session = login(email, password);
      setUser(session);
      toast.success('Welcome back.');
      navigate(session.role === 'guest' ? '/account' : '/admin');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const demoLogin = function (demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    try {
      const session = login(demoEmail, demoPassword);
      setUser(session);
      toast.success('Signed in as ' + session.role + '.');
      navigate(session.role === 'guest' ? '/account' : '/admin');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card className="p-8">
        <h1 className="text-2xl font-semibold">Login</h1>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <Input label="Email" type="email" value={email} onChange={function (e: any) { setEmail(e.target.value); }} required />
          <Input label="Password" type="password" value={password} onChange={function (e: any) { setPassword(e.target.value); }} required />
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
        <div className="mt-6 grid gap-2">
          <Button size="sm" variant="secondary" onClick={function () { demoLogin('guest@staysphere.demo', 'guest123'); }}>Demo guest</Button>
          <Button size="sm" variant="secondary" onClick={function () { demoLogin('frontdesk@staysphere.demo', 'frontdesk123'); }}>Demo receptionist</Button>
          <Button size="sm" variant="secondary" onClick={function () { demoLogin('manager@staysphere.demo', 'manager123'); }}>Demo manager</Button>
          <Button size="sm" variant="secondary" onClick={function () { demoLogin('admin@staysphere.demo', 'admin123'); }}>Demo admin</Button>
        </div>
        <div className="mt-6 flex items-center justify-between text-sm">
          <Link className="text-blue-600" to="/forgot-password">Forgot password?</Link>
          <Link className="text-blue-600" to="/register">Create account</Link>
        </div>
      </Card>
    </div>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', country: '', password: '', confirm: '' });
  const setUser = useAppStore(function (s) { return s.setUser; });
  const navigate = useNavigate();

  const submit = function (event: any) {
    event.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    try {
      const session = register(form);
      setUser(session);
      toast.success('Account created.');
      navigate('/account');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card className="p-8">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="First name" value={form.firstName} onChange={function (e: any) { setForm(Object.assign({}, form, { firstName: e.target.value })); }} required />
            <Input label="Last name" value={form.lastName} onChange={function (e: any) { setForm(Object.assign({}, form, { lastName: e.target.value })); }} required />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={function (e: any) { setForm(Object.assign({}, form, { email: e.target.value })); }} required />
          <Input label="Country" value={form.country} onChange={function (e: any) { setForm(Object.assign({}, form, { country: e.target.value })); }} />
          <Input label="Password" type="password" value={form.password} onChange={function (e: any) { setForm(Object.assign({}, form, { password: e.target.value })); }} required />
          <Input label="Confirm password" type="password" value={form.confirm} onChange={function (e: any) { setForm(Object.assign({}, form, { confirm: e.target.value })); }} required />
          <Button type="submit" className="w-full">Create account</Button>
        </form>
      </Card>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const submit = function (event: any) {
    event.preventDefault();
    const user = getUserByEmail(email);
    if (!user) {
      toast.error('No account found for that email.');
      return;
    }
    toast.success('Continue to reset your password.');
    navigate('/reset-password?email=' + encodeURIComponent(email));
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card className="p-8">
        <h1 className="text-2xl font-semibold">Forgot password</h1>
        <p className="mt-2 text-sm text-slate-500">Enter your account email to continue.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <Input label="Email" type="email" value={email} onChange={function (e: any) { setEmail(e.target.value); }} required />
          <Button type="submit" className="w-full">Continue</Button>
        </form>
      </Card>
    </div>
  );
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();

  const submit = function (event: any) {
    event.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    try {
      resetPassword(email, password);
      toast.success('Password updated. Please sign in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card className="p-8">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <p className="mt-2 text-sm text-slate-500">Resetting password for {email || 'unknown email'}.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <Input label="New password" type="password" value={password} onChange={function (e: any) { setPassword(e.target.value); }} required />
          <Input label="Confirm password" type="password" value={confirm} onChange={function (e: any) { setConfirm(e.target.value); }} required />
          <Button type="submit" className="w-full">Reset password</Button>
        </form>
      </Card>
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-14">
      <h1 className="text-3xl font-semibold">About StaySphere</h1>
      <Card className="space-y-4 p-8 text-slate-600 dark:text-slate-300">
        <p>StaySphere is a premium hotel booking and hotel management platform built for modern hospitality teams.</p>
        <p>Guests can search availability, compare rooms, apply promotions, and manage their stays. Hotel teams can manage reservations, rooms, housekeeping, payments, invoices, staff, and analytics from one dashboard.</p>
        <p>The platform is designed to feel like real commercial hotel software, with role-based access, operational workflows, and production-ready architecture.</p>
      </Card>
    </div>
  );
}

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const submit = function (event: any) {
    event.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('All fields are required.');
      return;
    }
    setForm({ name: '', email: '', message: '' });
    toast.success('Message sent. Our team will reply shortly.');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-3xl font-semibold">Contact us</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card className="space-y-4 p-6">
          <p className="text-sm text-slate-500">Support is available 24/7 for booking assistance and hotel partner inquiries.</p>
          <p className="text-sm"><span className="font-medium">Email:</span> support@staysphere.demo</p>
          <p className="text-sm"><span className="font-medium">Phone:</span> +1 555 010 9999</p>
        </Card>
        <Card className="p-6">
          <form className="grid gap-4" onSubmit={submit}>
            <Input label="Name" value={form.name} onChange={function (e: any) { setForm(Object.assign({}, form, { name: e.target.value })); }} />
            <Input label="Email" type="email" value={form.email} onChange={function (e: any) { setForm(Object.assign({}, form, { email: e.target.value })); }} />
            <Textarea label="Message" value={form.message} onChange={function (e: any) { setForm(Object.assign({}, form, { message: e.target.value })); }} />
            <Button type="submit">Send message</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export function FaqPage() {
  const faqs = [
    { q: 'Can I cancel my booking?', a: 'Yes. Eligible bookings can be cancelled from your account before the check-in date.' },
    { q: 'Do you support promo codes?', a: 'Yes. Promo codes can be applied during checkout and are validated for expiry, usage limits, and minimum amounts.' },
    { q: 'Can hotel staff create walk-in reservations?', a: 'Yes. Receptionists and managers can create reservations from the admin dashboard.' },
    { q: 'Is payment data stored?', a: 'No. The architecture is Stripe-ready and does not store raw card information.' }
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-14">
      <h1 className="text-3xl font-semibold">Frequently asked questions</h1>
      {faqs.map(function (faq) {
        return (
          <Card key={faq.q} className="p-5">
            <h2 className="font-semibold">{faq.q}</h2>
            <p className="mt-2 text-sm text-slate-500">{faq.a}</p>
          </Card>
        );
      })}
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-14">
      <h1 className="text-3xl font-semibold">Terms of Service</h1>
      <Card className="space-y-3 p-8 text-sm text-slate-600 dark:text-slate-300">
        <p>By using StaySphere, you agree to provide accurate guest information and comply with hotel policies.</p>
        <p>Reservations are subject to availability, and cancellation rules vary by property and rate plan.</p>
        <p>Promotions may have eligibility limits and can be modified by administrators.</p>
      </Card>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-14">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <Card className="space-y-3 p-8 text-sm text-slate-600 dark:text-slate-300">
        <p>StaySphere stores only the information needed to manage bookings, guest profiles, and hotel operations.</p>
        <p>Payment workflows are designed to avoid storing raw card details.</p>
        <p>Role-based access controls restrict administrative data to authorized staff.</p>
      </Card>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <EmptyState
        title="Page not found"
        message="The page you are looking for does not exist."
        action={<Link to="/"><Button>Return home</Button></Link>}
      />
    </div>
  );
}
