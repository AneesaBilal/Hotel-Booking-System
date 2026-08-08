import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { BedDouble, Building2, Calendar, Check, CreditCard, Download, Eye, FileText, LogIn, LogOut, Pencil, Plus, Printer, Search, Settings as SettingsIcon, Sparkles, Star, Tag, Trash2, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import * as db from '../lib/db';
import { Badge, Button, Card, EmptyState, Input, Modal, Select, StatCard, StatusBadge, Textarea } from '../components/ui';

function PageHeader(props: any) {
  const { title, actions } = props;
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </div>
  );
}

function DataTable(props: any) {
  const { columns, rows, keyField } = props;
  if (!rows.length) return <EmptyState title="No records found" message="Adjust filters or create a new record." />;
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr>
            {columns.map(function (column: any) {
              return <th key={column.key} className="border-b border-slate-200 px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800">{column.label}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map(function (row: any, rowIndex: number) {
            return (
              <tr key={row[keyField] || rowIndex} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-900/40">
                {columns.map(function (column: any) {
                  return (
                    <td key={column.key} className="px-4 py-3">
                      {column.render ? column.render(row) : String(row[column.key] ?? '')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

export function AdminDashboard() {
  const stats = db.getAdminStats();
  const revenue = db.getRevenueSeries(14);
  const trends = db.getBookingTrends(14);
  const occupancy = db.getOccupancyData();
  const performance = db.getRoomPerformance();
  const recent = db.getReservations().slice(0, 6);
  const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" actions={<Link to="/admin/reservations"><Button><Plus className="h-4 w-4" /> Reservations</Button></Link>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total revenue" value={db.formatMoney(stats.totalRevenue)} icon={CreditCard} />
        <StatCard title="Today's revenue" value={db.formatMoney(stats.todayRevenue)} icon={Search} />
        <StatCard title="Occupancy rate" value={stats.occupancyRate + '%'} icon={BedDouble} />
        <StatCard title="Total reservations" value={stats.totalReservations} icon={Calendar} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Pending reservations" value={stats.pendingReservations} icon={Calendar} />
        <StatCard title="Available rooms" value={stats.availableRooms} icon={Building2} />
        <StatCard title="Checked-in guests" value={stats.checkedInGuests} icon={Users} />
        <StatCard title="Check-outs today" value={stats.checkoutsToday} icon={LogOut} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <h2 className="mb-4 font-semibold">Revenue overview</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Occupancy</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={occupancy} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {occupancy.map(function (entry, index) { return <Cell key={entry.name} fill={colors[index % colors.length]} />; })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <h2 className="mb-4 font-semibold">Booking trends</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="confirmed" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Room performance</h2>
          <div className="space-y-3">
            {performance.map(function (item: any) {
              return (
                <div key={item.name} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.bookings} bookings · {db.formatMoney(item.revenue * 100)}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold">Recent reservations</h2>
        <DataTable
          keyField="id"
          columns={[
            { key: 'code', label: 'Code' },
            { key: 'guest', label: 'Guest', render: function (row: any) { return row.guestFirstName + ' ' + row.guestLastName; } },
            { key: 'hotel', label: 'Hotel', render: function (row: any) { return row.hotel?.name; } },
            { key: 'checkIn', label: 'Check-in', render: function (row: any) { return db.formatDate(row.checkIn); } },
            { key: 'totalAmount', label: 'Total', render: function (row: any) { return db.formatMoney(row.totalAmount); } },
            { key: 'status', label: 'Status', render: function (row: any) { return <StatusBadge status={row.status} />; } },
            { key: 'view', label: 'Actions', render: function (row: any) { return <Link to={'/admin/reservations/' + row.id}><Button size="sm" variant="secondary"><Eye className="h-4 w-4" /></Button></Link>; } }
          ]}
          rows={recent}
        />
      </Card>
    </div>
  );
}

export function AdminHotels() {
  const [version, setVersion] = useState(0);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<any>(null);

  const hotels = db.getAllHotels().filter(function (h) {
    const q = query.toLowerCase();
    return !q || h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q);
  });

  const openNew = function () {
    setEditing({ name: '', city: '', country: '', address: '', phone: '', email: '', description: '', amenities: 'Wi-Fi,Parking,Restaurant', featured: false, active: true, rating: 4.5 });
  };

  const save = function () {
    if (!editing.name || !editing.city || !editing.country) {
      toast.error('Name, city, and country are required.');
      return;
    }
    const amenities = String(editing.amenities || '').split(',').map(function (a: string) { return a.trim(); }).filter(Boolean);
    db.saveHotel(Object.assign({}, editing, { amenities: amenities }));
    toast.success('Hotel saved.');
    setEditing(null);
    setVersion(version + 1);
  };

  return (
    <div>
      <PageHeader
        title="Hotels"
        actions={
          <>
            <Input placeholder="Search hotels" value={query} onChange={function (e: any) { setQuery(e.target.value); }} />
            <Button onClick={openNew}><Plus className="h-4 w-4" /> Add hotel</Button>
          </>
        }
      />

      <DataTable
        keyField="id"
        rows={hotels}
        columns={[
          { key: 'name', label: 'Hotel' },
          { key: 'city', label: 'City' },
          { key: 'country', label: 'Country' },
          { key: 'rating', label: 'Rating' },
          { key: 'featured', label: 'Featured', render: function (row: any) { return row.featured ? <Badge tone="blue">Featured</Badge> : <Badge>Standard</Badge>; } },
          { key: 'active', label: 'Status', render: function (row: any) { return <StatusBadge status={row.active ? 'active' : 'inactive'} />; } },
          {
            key: 'actions',
            label: 'Actions',
            render: function (row: any) {
              return (
                <div className="flex gap-2">
                  <Link to={'/admin/hotels/' + row.id}><Button size="sm" variant="secondary"><Eye className="h-4 w-4" /></Button></Link>
                  <Button size="sm" variant="secondary" onClick={function () { setEditing(Object.assign({}, row, { amenities: row.amenities.join(', ') })); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="secondary" onClick={function () { db.toggleHotelActive(row.id); toast.success('Hotel status updated.'); setVersion(version + 1); }}>{row.active ? 'Archive' : 'Activate'}</Button>
                </div>
              );
            }
          }
        ]}
      />

      <Modal
        open={Boolean(editing)}
        onClose={function () { setEditing(null); }}
        title={editing && editing.id ? 'Edit hotel' : 'Add hotel'}
        footer={
          <>
            <Button variant="secondary" onClick={function () { setEditing(null); }}>Cancel</Button>
            <Button onClick={save}>Save hotel</Button>
          </>
        }
      >
        {editing ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Name" value={editing.name} onChange={function (e: any) { setEditing(Object.assign({}, editing, { name: e.target.value })); }} />
            <Input label="City" value={editing.city} onChange={function (e: any) { setEditing(Object.assign({}, editing, { city: e.target.value })); }} />
            <Input label="Country" value={editing.country} onChange={function (e: any) { setEditing(Object.assign({}, editing, { country: e.target.value })); }} />
            <Input label="Address" value={editing.address} onChange={function (e: any) { setEditing(Object.assign({}, editing, { address: e.target.value })); }} />
            <Input label="Phone" value={editing.phone} onChange={function (e: any) { setEditing(Object.assign({}, editing, { phone: e.target.value })); }} />
            <Input label="Email" value={editing.email} onChange={function (e: any) { setEditing(Object.assign({}, editing, { email: e.target.value })); }} />
            <Input label="Rating" type="number" step="0.1" min="1" max="5" value={editing.rating} onChange={function (e: any) { setEditing(Object.assign({}, editing, { rating: e.target.value })); }} />
            <Input label="Amenities (comma separated)" value={editing.amenities} onChange={function (e: any) { setEditing(Object.assign({}, editing, { amenities: e.target.value })); }} />
            <div className="md:col-span-2">
              <Textarea label="Description" value={editing.description} onChange={function (e: any) { setEditing(Object.assign({}, editing, { description: e.target.value })); }} />
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(editing.featured)} onChange={function (e: any) { setEditing(Object.assign({}, editing, { featured: e.target.checked })); }} /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(editing.active)} onChange={function (e: any) { setEditing(Object.assign({}, editing, { active: e.target.checked })); }} /> Active</label>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export function AdminHotelDetail() {
  const { id } = useParams();
  const hotel = db.getHotelById(id || '');
  if (!hotel) return <EmptyState title="Hotel not found" />;

  const roomTypes = db.getRoomTypesByHotel(hotel.id);
  const rooms = db.getRooms({ hotelId: hotel.id });

  return (
    <div className="space-y-6">
      <PageHeader title={hotel.name} actions={<Link to="/admin/hotels"><Button variant="secondary">Back to hotels</Button></Link>} />
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="p-6">
          <h2 className="font-semibold">Hotel information</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-500">
            <p>{hotel.address}, {hotel.city}, {hotel.country}</p>
            <p>{hotel.phone}</p>
            <p>{hotel.email}</p>
            <p>Rating: {hotel.rating.toFixed(1)}</p>
            <p>Check-in: {hotel.policies.checkIn} · Check-out: {hotel.policies.checkOut}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">{hotel.amenities.map(function (amenity) { return <Badge key={amenity}>{amenity}</Badge>; })}</div>
        </Card>

        <Card className="p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Room types</h2>
            <Link to={'/admin/room-types?hotelId=' + hotel.id}><Button size="sm" variant="secondary">Manage room types</Button></Link>
          </div>
          <DataTable
            keyField="id"
            rows={roomTypes}
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'basePrice', label: 'Base price', render: function (row: any) { return db.formatMoney(row.basePrice); } },
              { key: 'maxGuests', label: 'Max guests' },
              { key: 'bedType', label: 'Bed type' },
              { key: 'active', label: 'Status', render: function (row: any) { return <StatusBadge status={row.active ? 'active' : 'inactive'} />; } }
            ]}
          />
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Rooms</h2>
          <Link to={'/admin/rooms?hotelId=' + hotel.id}><Button size="sm" variant="secondary">Manage rooms</Button></Link>
        </div>
        <DataTable
          keyField="id"
          rows={rooms}
          columns={[
            { key: 'roomNumber', label: 'Room' },
            { key: 'floor', label: 'Floor' },
            { key: 'roomType', label: 'Type', render: function (row: any) { return row.roomType?.name; } },
            { key: 'status', label: 'Status', render: function (row: any) { return <StatusBadge status={row.status} />; } }
          ]}
        />
      </Card>
    </div>
  );
}

export function AdminRoomTypes() {
  const [version, setVersion] = useState(0);
  const [searchParams] = useSearchParams();
  const [hotelFilter, setHotelFilter] = useState(searchParams.get('hotelId') || '');
  const [editing, setEditing] = useState<any>(null);
  const hotels = db.getAllHotels();

  const roomTypes = db.getAllRoomTypes().filter(function (rt) { return !hotelFilter || rt.hotelId === hotelFilter; }).map(function (rt) {
    return Object.assign({}, rt, { hotel: db.getHotelById(rt.hotelId) });
  });

  const openNew = function () {
    setEditing({ hotelId: hotels[0]?.id || '', name: '', description: '', basePrice: 199, maxGuests: 2, bedType: 'Queen Bed', roomSize: '', breakfastIncluded: false, active: true });
  };

  const save = function () {
    if (!editing.name || !editing.hotelId) {
      toast.error('Hotel and room type name are required.');
      return;
    }
    db.saveRoomType(editing);
    toast.success('Room type saved.');
    setEditing(null);
    setVersion(version + 1);
  };

  return (
    <div>
      <PageHeader
        title="Room Types"
        actions={
          <>
            <Select value={hotelFilter} onChange={function (e: any) { setHotelFilter(e.target.value); }}>
              <option value="">All hotels</option>
              {hotels.map(function (hotel) { return <option key={hotel.id} value={hotel.id}>{hotel.name}</option>; })}
            </Select>
            <Button onClick={openNew}><Plus className="h-4 w-4" /> Add room type</Button>
          </>
        }
      />

      <DataTable
        keyField="id"
        rows={roomTypes}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'hotel', label: 'Hotel', render: function (row: any) { return row.hotel?.name; } },
          { key: 'basePrice', label: 'Base price', render: function (row: any) { return db.formatMoney(row.basePrice); } },
          { key: 'maxGuests', label: 'Max guests' },
          { key: 'breakfastIncluded', label: 'Breakfast', render: function (row: any) { return row.breakfastIncluded ? 'Included' : 'Not included'; } },
          { key: 'active', label: 'Status', render: function (row: any) { return <StatusBadge status={row.active ? 'active' : 'inactive'} />; } },
          {
            key: 'actions',
            label: 'Actions',
            render: function (row: any) {
              return <Button size="sm" variant="secondary" onClick={function () { setEditing(Object.assign({}, row, { basePrice: row.basePrice / 100 })); }}><Pencil className="h-4 w-4" /></Button>;
            }
          }
        ]}
      />

      <Modal
        open={Boolean(editing)}
        onClose={function () { setEditing(null); }}
        title={editing && editing.id ? 'Edit room type' : 'Add room type'}
        footer={
          <>
            <Button variant="secondary" onClick={function () { setEditing(null); }}>Cancel</Button>
            <Button onClick={save}>Save room type</Button>
          </>
        }
      >
        {editing ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Hotel" value={editing.hotelId} onChange={function (e: any) { setEditing(Object.assign({}, editing, { hotelId: e.target.value })); }}>
              {hotels.map(function (hotel) { return <option key={hotel.id} value={hotel.id}>{hotel.name}</option>; })}
            </Select>
            <Input label="Name" value={editing.name} onChange={function (e: any) { setEditing(Object.assign({}, editing, { name: e.target.value })); }} />
            <Input label="Base price (USD)" type="number" value={editing.basePrice} onChange={function (e: any) { setEditing(Object.assign({}, editing, { basePrice: e.target.value })); }} />
            <Input label="Max guests" type="number" value={editing.maxGuests} onChange={function (e: any) { setEditing(Object.assign({}, editing, { maxGuests: e.target.value })); }} />
            <Input label="Bed type" value={editing.bedType} onChange={function (e: any) { setEditing(Object.assign({}, editing, { bedType: e.target.value })); }} />
            <Input label="Room size" value={editing.roomSize} onChange={function (e: any) { setEditing(Object.assign({}, editing, { roomSize: e.target.value })); }} />
            <div className="md:col-span-2">
              <Textarea label="Description" value={editing.description} onChange={function (e: any) { setEditing(Object.assign({}, editing, { description: e.target.value })); }} />
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(editing.breakfastIncluded)} onChange={function (e: any) { setEditing(Object.assign({}, editing, { breakfastIncluded: e.target.checked })); }} /> Breakfast included</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(editing.active)} onChange={function (e: any) { setEditing(Object.assign({}, editing, { active: e.target.checked })); }} /> Active</label>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export function AdminRooms() {
  const [version, setVersion] = useState(0);
  const [searchParams] = useSearchParams();
  const [hotelFilter, setHotelFilter] = useState(searchParams.get('hotelId') || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const hotels = db.getAllHotels();

  const rooms = db.getRooms({ hotelId: hotelFilter || undefined, status: statusFilter || undefined });

  const openNew = function () {
    const hotelId = hotels[0]?.id || '';
    const roomTypes = db.getRoomTypesByHotel(hotelId);
    setEditing({ hotelId: hotelId, roomTypeId: roomTypes[0]?.id || '', roomNumber: '', floor: '1', status: 'available', priceOverride: '', notes: '' });
  };

  const save = function () {
    if (!editing.roomNumber || !editing.hotelId || !editing.roomTypeId) {
      toast.error('Room number, hotel, and room type are required.');
      return;
    }
    db.saveRoom(editing);
    toast.success('Room saved.');
    setEditing(null);
    setVersion(version + 1);
  };

  const changeStatus = function (roomId: string, status: string) {
    try {
      db.updateRoomStatus(roomId, status);
      toast.success('Room status updated.');
      setVersion(version + 1);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Rooms"
        actions={
          <>
            <Select value={hotelFilter} onChange={function (e: any) { setHotelFilter(e.target.value); }}>
              <option value="">All hotels</option>
              {hotels.map(function (hotel) { return <option key={hotel.id} value={hotel.id}>{hotel.name}</option>; })}
            </Select>
            <Select value={statusFilter} onChange={function (e: any) { setStatusFilter(e.target.value); }}>
              <option value="">All statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
            </Select>
            <Button onClick={openNew}><Plus className="h-4 w-4" /> Add room</Button>
          </>
        }
      />

      <DataTable
        keyField="id"
        rows={rooms}
        columns={[
          { key: 'roomNumber', label: 'Room' },
          { key: 'hotel', label: 'Hotel', render: function (row: any) { return row.hotel?.name; } },
          { key: 'roomType', label: 'Type', render: function (row: any) { return row.roomType?.name; } },
          { key: 'floor', label: 'Floor' },
          {
            key: 'status',
            label: 'Status',
            render: function (row: any) {
              return (
                <select className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-900" value={row.status} onChange={function (e: any) { changeStatus(row.id, e.target.value); }}>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="out_of_service">Out of service</option>
                </select>
              );
            }
          },
          { key: 'priceOverride', label: 'Price override', render: function (row: any) { return row.priceOverride ? db.formatMoney(row.priceOverride) : 'Default'; } },
          {
            key: 'actions',
            label: 'Actions',
            render: function (row: any) {
              return <Button size="sm" variant="secondary" onClick={function () { setEditing(Object.assign({}, row, { priceOverride: row.priceOverride ? row.priceOverride / 100 : '' })); }}><Pencil className="h-4 w-4" /></Button>;
            }
          }
        ]}
      />

      <Modal
        open={Boolean(editing)}
        onClose={function () { setEditing(null); }}
        title={editing && editing.id ? 'Edit room' : 'Add room'}
        footer={
          <>
            <Button variant="secondary" onClick={function () { setEditing(null); }}>Cancel</Button>
            <Button onClick={save}>Save room</Button>
          </>
        }
      >
        {editing ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Hotel" value={editing.hotelId} onChange={function (e: any) {
              const roomTypes = db.getRoomTypesByHotel(e.target.value);
              setEditing(Object.assign({}, editing, { hotelId: e.target.value, roomTypeId: roomTypes[0]?.id || '' }));
            }}>
              {hotels.map(function (hotel) { return <option key={hotel.id} value={hotel.id}>{hotel.name}</option>; })}
            </Select>
            <Select label="Room type" value={editing.roomTypeId} onChange={function (e: any) { setEditing(Object.assign({}, editing, { roomTypeId: e.target.value })); }}>
              {db.getRoomTypesByHotel(editing.hotelId).map(function (rt) { return <option key={rt.id} value={rt.id}>{rt.name}</option>; })}
            </Select>
            <Input label="Room number" value={editing.roomNumber} onChange={function (e: any) { setEditing(Object.assign({}, editing, { roomNumber: e.target.value })); }} />
            <Input label="Floor" value={editing.floor} onChange={function (e: any) { setEditing(Object.assign({}, editing, { floor: e.target.value })); }} />
            <Select label="Status" value={editing.status} onChange={function (e: any) { setEditing(Object.assign({}, editing, { status: e.target.value })); }}>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
              <option value="out_of_service">Out of service</option>
            </Select>
            <Input label="Price override (USD, optional)" type="number" value={editing.priceOverride} onChange={function (e: any) { setEditing(Object.assign({}, editing, { priceOverride: e.target.value })); }} />
            <div className="md:col-span-2">
              <Textarea label="Notes" value={editing.notes} onChange={function (e: any) { setEditing(Object.assign({}, editing, { notes: e.target.value })); }} />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export function AdminReservations() {
  const [version, setVersion] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    query: searchParams.get('query') || '',
    status: '',
    paymentStatus: '',
    hotelId: ''
  });

  const hotels = db.getAllHotels();
  const reservations = db.getReservations(filters);

  const action = function (fn: any, id: string, message: string) {
    try {
      fn(id);
      toast.success(message);
      setVersion(version + 1);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Reservations"
        actions={
          <>
            <Input placeholder="Search reservations" value={filters.query} onChange={function (e: any) { setFilters(Object.assign({}, filters, { query: e.target.value })); }} />
            <Select value={filters.status} onChange={function (e: any) { setFilters(Object.assign({}, filters, { status: e.target.value })); }}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked in</option>
              <option value="checked_out">Checked out</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <Select value={filters.paymentStatus} onChange={function (e: any) { setFilters(Object.assign({}, filters, { paymentStatus: e.target.value })); }}>
              <option value="">All payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </Select>
            <Select value={filters.hotelId} onChange={function (e: any) { setFilters(Object.assign({}, filters, { hotelId: e.target.value })); }}>
              <option value="">All hotels</option>
              {hotels.map(function (hotel) { return <option key={hotel.id} value={hotel.id}>{hotel.name}</option>; })}
            </Select>
          </>
        }
      />

      <DataTable
        keyField="id"
        rows={reservations}
        columns={[
          { key: 'code', label: 'Code' },
          { key: 'guest', label: 'Guest', render: function (row: any) { return row.guestFirstName + ' ' + row.guestLastName; } },
          { key: 'hotel', label: 'Hotel', render: function (row: any) { return row.hotel?.name; } },
          { key: 'dates', label: 'Dates', render: function (row: any) { return db.formatDate(row.checkIn) + ' - ' + db.formatDate(row.checkOut); } },
          { key: 'totalAmount', label: 'Amount', render: function (row: any) { return db.formatMoney(row.totalAmount); } },
          { key: 'paymentStatus', label: 'Payment', render: function (row: any) { return <StatusBadge status={row.paymentStatus} />; } },
          { key: 'status', label: 'Status', render: function (row: any) { return <StatusBadge status={row.status} />; } },
          {
            key: 'actions',
            label: 'Actions',
            render: function (row: any) {
              return (
                <div className="flex flex-wrap gap-2">
                  <Link to={'/admin/reservations/' + row.id}><Button size="sm" variant="secondary"><Eye className="h-4 w-4" /></Button></Link>
                  {row.status === 'pending' ? <Button size="sm" onClick={function () { action(db.confirmReservation, row.id, 'Reservation confirmed.'); }}><Check className="h-4 w-4" /></Button> : null}
                  {row.status === 'confirmed' ? <Button size="sm" onClick={function () { action(db.checkInReservation, row.id, 'Guest checked in.'); }}><LogIn className="h-4 w-4" /></Button> : null}
                  {row.status === 'checked_in' ? <Button size="sm" onClick={function () { action(db.checkOutReservation, row.id, 'Guest checked out.'); }}><LogOut className="h-4 w-4" /></Button> : null}
                  {row.status === 'pending' || row.status === 'confirmed' ? <Button size="sm" variant="danger" onClick={function () { action(db.cancelReservation, row.id, 'Reservation cancelled.'); }}><X className="h-4 w-4" /></Button> : null}
                </div>
              );
            }
          }
        ]}
      />
    </div>
  );
}

export function AdminReservationDetails() {
  const { id } = useParams();
  const [version, setVersion] = useState(0);
  const reservation = db.getReservationById(id || '');
  if (!reservation) return <EmptyState title="Reservation not found" />;

  const action = function (fn: any, message: string) {
    try {
      fn(reservation.id);
      toast.success(message);
      setVersion(version + 1);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={'Reservation ' + reservation.code}
        actions={
          <>
            <Button variant="secondary" onClick={function () { window.print(); }}><Printer className="h-4 w-4" /> Print</Button>
            <Button variant="secondary" onClick={function () { db.downloadInvoice(reservation.id); }}><Download className="h-4 w-4" /> Invoice</Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="space-y-3 p-6">
          <h2 className="font-semibold">Stay</h2>
          <p className="text-sm text-slate-500">{reservation.hotel?.name}</p>
          <p className="text-sm text-slate-500">{reservation.roomType?.name}</p>
          <p className="text-sm text-slate-500">{db.formatDate(reservation.checkIn)} - {db.formatDate(reservation.checkOut)}</p>
          <p className="text-sm text-slate-500">{reservation.adults} adults, {reservation.children} children</p>
          <StatusBadge status={reservation.status} />
        </Card>

        <Card className="space-y-3 p-6">
          <h2 className="font-semibold">Guest</h2>
          <p className="text-sm text-slate-500">{reservation.guestFirstName} {reservation.guestLastName}</p>
          <p className="text-sm text-slate-500">{reservation.guestEmail}</p>
          <p className="text-sm text-slate-500">{reservation.guestPhone || 'No phone'}</p>
          <p className="text-sm text-slate-500">{reservation.specialRequests || 'No special requests'}</p>
        </Card>

        <Card className="space-y-3 p-6">
          <h2 className="font-semibold">Payment</h2>
          <StatusBadge status={reservation.paymentStatus} />
          <p className="text-sm text-slate-500">Total: {db.formatMoney(reservation.totalAmount)}</p>
          <p className="text-sm text-slate-500">Subtotal: {db.formatMoney(reservation.subtotal)}</p>
          <p className="text-sm text-slate-500">Taxes: {db.formatMoney(reservation.taxes)}</p>
          <p className="text-sm text-slate-500">Extras: {db.formatMoney(reservation.extrasTotal)}</p>
          <p className="text-sm text-slate-500">Discount: -{db.formatMoney(reservation.discount)}</p>
        </Card>
      </div>

      <Card className="flex flex-wrap gap-2 p-6">
        {reservation.status === 'pending' ? <Button onClick={function () { action(db.confirmReservation, 'Reservation confirmed.'); }}>Confirm</Button> : null}
        {reservation.status === 'confirmed' ? <Button onClick={function () { action(db.checkInReservation, 'Guest checked in.'); }}>Check in</Button> : null}
        {reservation.status === 'checked_in' ? <Button onClick={function () { action(db.checkOutReservation, 'Guest checked out.'); }}>Check out</Button> : null}
        {reservation.status === 'confirmed' ? <Button variant="secondary" onClick={function () { action(db.markNoShow, 'Marked as no-show.'); }}>Mark no-show</Button> : null}
        {reservation.status === 'pending' || reservation.status === 'confirmed' ? <Button variant="danger" onClick={function () { action(db.cancelReservation, 'Reservation cancelled.'); }}>Cancel</Button> : null}
      </Card>
    </div>
  );
}

export function AdminGuests() {
  const [query, setQuery] = useState('');
  const guests = db.getGuestDirectory().filter(function (item) {
    const q = query.toLowerCase();
    return !q || item.user.firstName.toLowerCase().includes(q) || item.user.lastName.toLowerCase().includes(q) || item.user.email.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader title="Guests" actions={<Input placeholder="Search guests" value={query} onChange={function (e: any) { setQuery(e.target.value); }} />} />
      <DataTable
        keyField="user.id"
        rows={guests}
        columns={[
          { key: 'name', label: 'Guest', render: function (row: any) { return row.user.firstName + ' ' + row.user.lastName; } },
          { key: 'email', label: 'Email', render: function (row: any) { return row.user.email; } },
          { key: 'country', label: 'Country', render: function (row: any) { return row.user.country || '—'; } },
          { key: 'totalBookings', label: 'Bookings' },
          { key: 'totalSpent', label: 'Total spent', render: function (row: any) { return db.formatMoney(row.totalSpent); } },
          { key: 'lastStay', label: 'Last stay', render: function (row: any) { return row.lastStay ? db.formatDate(row.lastStay.checkOut) : '—'; } },
          { key: 'upcoming', label: 'Upcoming', render: function (row: any) { return row.upcoming ? db.formatDate(row.upcoming.checkIn) : '—'; } }
        ]}
      />
    </div>
  );
}

export function AdminPayments() {
  const [statusFilter, setStatusFilter] = useState('');
  const payments = db.getPayments().filter(function (p) { return !statusFilter || p.status === statusFilter; });

  return (
    <div>
      <PageHeader title="Payments" actions={
        <Select value={statusFilter} onChange={function (e: any) { setStatusFilter(e.target.value); }}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
          <option value="failed">Failed</option>
        </Select>
      } />
      <DataTable
        keyField="id"
        rows={payments}
        columns={[
          { key: 'transactionReference', label: 'Reference' },
          { key: 'reservation', label: 'Booking', render: function (row: any) { return row.reservation?.code; } },
          { key: 'guest', label: 'Guest', render: function (row: any) { return row.guest ? row.guest.firstName + ' ' + row.guest.lastName : '—'; } },
          { key: 'amount', label: 'Amount', render: function (row: any) { return db.formatMoney(row.amount); } },
          { key: 'paymentMethod', label: 'Method' },
          { key: 'status', label: 'Status', render: function (row: any) { return <StatusBadge status={row.status} />; } },
          { key: 'paidAt', label: 'Date', render: function (row: any) { return row.paidAt ? db.formatDateTime(row.paidAt) : '—'; } }
        ]}
      />
    </div>
  );
}

export function AdminInvoices() {
  const reservations = db.getReservations();

  return (
    <div>
      <PageHeader title="Invoices" />
      <DataTable
        keyField="id"
        rows={reservations}
        columns={[
          { key: 'invoice', label: 'Invoice number', render: function (row: any) { return 'INV-' + row.code; } },
          { key: 'code', label: 'Booking' },
          { key: 'guest', label: 'Guest', render: function (row: any) { return row.guestFirstName + ' ' + row.guestLastName; } },
          { key: 'totalAmount', label: 'Total', render: function (row: any) { return db.formatMoney(row.totalAmount); } },
          { key: 'paymentStatus', label: 'Payment', render: function (row: any) { return <StatusBadge status={row.paymentStatus} />; } },
          { key: 'issued', label: 'Issued', render: function (row: any) { return db.formatDateTime(row.createdAt); } },
          {
            key: 'actions',
            label: 'Actions',
            render: function (row: any) {
              return (
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={function () { window.print(); }}><Printer className="h-4 w-4" /></Button>
                  <Button size="sm" variant="secondary" onClick={function () { db.downloadInvoice(row.id); }}><Download className="h-4 w-4" /></Button>
                </div>
              );
            }
          }
        ]}
      />
    </div>
  );
}

export function AdminReviews() {
  const [version, setVersion] = useState(0);
  const reviews = db.getAllReviews();

  const setStatus = function (id: string, status: 'visible' | 'hidden', message: string) {
    try {
      db.setReviewStatus(id, status);
      toast.success(message);
      setVersion(version + 1);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <PageHeader title="Reviews" />
      <DataTable
        keyField="id"
        rows={reviews}
        columns={[
          { key: 'hotel', label: 'Hotel', render: function (row: any) { return row.hotel?.name; } },
          { key: 'guest', label: 'Guest', render: function (row: any) { return row.guest?.firstName + ' ' + row.guest?.lastName; } },
          { key: 'rating', label: 'Rating', render: function (row: any) { return row.rating + '/5'; } },
          { key: 'comment', label: 'Comment', render: function (row: any) { return row.comment.slice(0, 60) + (row.comment.length > 60 ? '...' : ''); } },
          { key: 'status', label: 'Status', render: function (row: any) { return <StatusBadge status={row.status} />; } },
          {
            key: 'actions',
            label: 'Actions',
            render: function (row: any) {
              return row.status === 'visible' ? (
                <Button size="sm" variant="secondary" onClick={function () { setStatus(row.id, 'hidden', 'Review hidden.'); }}>Hide</Button>
              ) : (
                <Button size="sm" onClick={function () { setStatus(row.id, 'visible', 'Review restored.'); }}>Restore</Button>
              );
            }
          }
        ]}
      />
    </div>
  );
}

export function AdminPromotions() {
  const [version, setVersion] = useState(0);
  const [editing, setEditing] = useState<any>(null);
  const promotions = db.getPromotions();

  const openNew = function () {
    setEditing({ code: '', name: '', description: '', discountType: 'percent', discountValue: 10, minimumAmount: 100, usageLimit: 100, startsAt: db.todayISO(), expiresAt: db.addDaysISO(90), status: 'active' });
  };

  const save = function () {
    if (!editing.code || !editing.name) {
      toast.error('Code and name are required.');
      return;
    }
    db.savePromotion(editing);
    toast.success('Promotion saved.');
    setEditing(null);
    setVersion(version + 1);
  };

  return (
    <div>
      <PageHeader title="Promotions" actions={<Button onClick={openNew}><Plus className="h-4 w-4" /> Add promotion</Button>} />
      <DataTable
        keyField="id"
        rows={promotions}
        columns={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
          { key: 'discount', label: 'Discount', render: function (row: any) { return row.discountType === 'percent' ? row.discountValue + '%' : db.formatMoney(row.discountValue); } },
          { key: 'minimumAmount', label: 'Minimum', render: function (row: any) { return db.formatMoney(row.minimumAmount); } },
          { key: 'usage', label: 'Usage', render: function (row: any) { return row.usedCount + '/' + (row.usageLimit || '∞'); } },
          { key: 'expiresAt', label: 'Expires', render: function (row: any) { return db.formatDate(row.expiresAt); } },
          { key: 'status', label: 'Status', render: function (row: any) { return <StatusBadge status={row.status} />; } },
          {
            key: 'actions',
            label: 'Actions',
            render: function (row: any) {
              return <Button size="sm" variant="secondary" onClick={function () { setEditing(Object.assign({}, row, { discountValue: row.discountType === 'fixed' ? row.discountValue / 100 : row.discountValue, minimumAmount: row.minimumAmount / 100 })); }}><Pencil className="h-4 w-4" /></Button>;
            }
          }
        ]}
      />

      <Modal
        open={Boolean(editing)}
        onClose={function () { setEditing(null); }}
        title={editing && editing.id ? 'Edit promotion' : 'Add promotion'}
        footer={
          <>
            <Button variant="secondary" onClick={function () { setEditing(null); }}>Cancel</Button>
            <Button onClick={save}>Save promotion</Button>
          </>
        }
      >
        {editing ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Code" value={editing.code} onChange={function (e: any) { setEditing(Object.assign({}, editing, { code: e.target.value })); }} />
            <Input label="Name" value={editing.name} onChange={function (e: any) { setEditing(Object.assign({}, editing, { name: e.target.value })); }} />
            <Select label="Discount type" value={editing.discountType} onChange={function (e: any) { setEditing(Object.assign({}, editing, { discountType: e.target.value })); }}>
              <option value="percent">Percent</option>
              <option value="fixed">Fixed amount</option>
            </Select>
            <Input label={editing.discountType === 'fixed' ? 'Discount value (USD)' : 'Discount percent'} type="number" value={editing.discountValue} onChange={function (e: any) { setEditing(Object.assign({}, editing, { discountValue: e.target.value })); }} />
            <Input label="Minimum amount (USD)" type="number" value={editing.minimumAmount} onChange={function (e: any) { setEditing(Object.assign({}, editing, { minimumAmount: e.target.value })); }} />
            <Input label="Usage limit" type="number" value={editing.usageLimit} onChange={function (e: any) { setEditing(Object.assign({}, editing, { usageLimit: e.target.value })); }} />
            <Input label="Starts at" type="date" value={editing.startsAt} onChange={function (e: any) { setEditing(Object.assign({}, editing, { startsAt: e.target.value })); }} />
            <Input label="Expires at" type="date" value={editing.expiresAt} onChange={function (e: any) { setEditing(Object.assign({}, editing, { expiresAt: e.target.value })); }} />
            <Select label="Status" value={editing.status} onChange={function (e: any) { setEditing(Object.assign({}, editing, { status: e.target.value })); }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
            <div className="md:col-span-2">
              <Textarea label="Description" value={editing.description} onChange={function (e: any) { setEditing(Object.assign({}, editing, { description: e.target.value })); }} />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export function AdminStaff() {
  const [version, setVersion] = useState(0);
  const [editing, setEditing] = useState<any>(null);
  const staff = db.getStaff();
  const hotels = db.getAllHotels();

  const openNew = function () {
    setEditing({ name: '', email: '', role: 'Receptionist', hotelId: hotels[0]?.id || '', status: 'active' });
  };

  const save = function () {
    if (!editing.name || !editing.email) {
      toast.error('Name and email are required.');
      return;
    }
    db.saveStaff(editing);
    toast.success('Staff member saved.');
    setEditing(null);
    setVersion(version + 1);
  };

  const remove = function (id: string) {
    if (!window.confirm('Delete this staff member?')) return;
    db.deleteStaff(id);
    toast.success('Staff member removed.');
    setVersion(version + 1);
  };

  return (
    <div>
      <PageHeader title="Staff" actions={<Button onClick={openNew}><Plus className="h-4 w-4" /> Add staff</Button>} />
      <DataTable
        keyField="id"
        rows={staff}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' },
          { key: 'hotel', label: 'Hotel', render: function (row: any) { return row.hotel?.name || '—'; } },
          { key: 'status', label: 'Status', render: function (row: any) { return <StatusBadge status={row.status} />; } },
          { key: 'lastLogin', label: 'Last login', render: function (row: any) { return db.formatDateTime(row.lastLogin); } },
          {
            key: 'actions',
            label: 'Actions',
            render: function (row: any) {
              return (
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={function () { setEditing(row); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="danger" onClick={function () { remove(row.id); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              );
            }
          }
        ]}
      />

      <Modal
        open={Boolean(editing)}
        onClose={function () { setEditing(null); }}
        title={editing && editing.id ? 'Edit staff' : 'Add staff'}
        footer={
          <>
            <Button variant="secondary" onClick={function () { setEditing(null); }}>Cancel</Button>
            <Button onClick={save}>Save staff</Button>
          </>
        }
      >
        {editing ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Name" value={editing.name} onChange={function (e: any) { setEditing(Object.assign({}, editing, { name: e.target.value })); }} />
            <Input label="Email" value={editing.email} onChange={function (e: any) { setEditing(Object.assign({}, editing, { email: e.target.value })); }} />
            <Select label="Role" value={editing.role} onChange={function (e: any) { setEditing(Object.assign({}, editing, { role: e.target.value })); }}>
              <option value="Admin">Admin</option>
              <option value="Hotel Manager">Hotel Manager</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Housekeeping">Housekeeping</option>
            </Select>
            <Select label="Hotel" value={editing.hotelId} onChange={function (e: any) { setEditing(Object.assign({}, editing, { hotelId: e.target.value })); }}>
              {hotels.map(function (hotel) { return <option key={hotel.id} value={hotel.id}>{hotel.name}</option>; })}
            </Select>
            <Select label="Status" value={editing.status} onChange={function (e: any) { setEditing(Object.assign({}, editing, { status: e.target.value })); }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export function AdminHousekeeping() {
  const [version, setVersion] = useState(0);
  const [editing, setEditing] = useState<any>(null);
  const tasks = db.getHousekeepingTasks();
  const rooms = db.getRooms();

  const openNew = function () {
    setEditing({ roomId: rooms[0]?.id || '', assignedTo: 'Housekeeping Team', status: 'dirty', priority: 'medium', notes: '' });
  };

  const save = function () {
    if (!editing.roomId) {
      toast.error('Room is required.');
      return;
    }
    db.saveHousekeepingTask(editing);
    toast.success('Housekeeping task saved.');
    setEditing(null);
    setVersion(version + 1);
  };

  const changeStatus = function (id: string, status: string) {
    try {
      db.updateHousekeepingTask(id, { status: status });
      toast.success('Task updated.');
      setVersion(version + 1);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <PageHeader title="Housekeeping" actions={<Button onClick={openNew}><Plus className="h-4 w-4" /> Add task</Button>} />
      <DataTable
        keyField="id"
        rows={tasks}
        columns={[
          { key: 'room', label: 'Room', render: function (row: any) { return row.room?.roomNumber || '—'; } },
          { key: 'hotel', label: 'Hotel', render: function (row: any) { return row.hotel?.name || '—'; } },
          { key: 'assignedTo', label: 'Assigned to' },
          { key: 'priority', label: 'Priority', render: function (row: any) { return <Badge tone={row.priority === 'high' ? 'red' : row.priority === 'medium' ? 'amber' : 'default'}>{row.priority}</Badge>; } },
          { key: 'notes', label: 'Notes' },
          {
            key: 'status',
            label: 'Status',
            render: function (row: any) {
              return (
                <select className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-900" value={row.status} onChange={function (e: any) { changeStatus(row.id, e.target.value); }}>
                  <option value="dirty">Dirty</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="clean">Clean</option>
                  <option value="inspected">Inspected</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              );
            }
          }
        ]}
      />

      <Modal
        open={Boolean(editing)}
        onClose={function () { setEditing(null); }}
        title="Add housekeeping task"
        footer={
          <>
            <Button variant="secondary" onClick={function () { setEditing(null); }}>Cancel</Button>
            <Button onClick={save}>Save task</Button>
          </>
        }
      >
        {editing ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Room" value={editing.roomId} onChange={function (e: any) { setEditing(Object.assign({}, editing, { roomId: e.target.value })); }}>
              {rooms.map(function (room) { return <option key={room.id} value={room.id}>{room.hotel?.name} · Room {room.roomNumber}</option>; })}
            </Select>
            <Input label="Assigned to" value={editing.assignedTo} onChange={function (e: any) { setEditing(Object.assign({}, editing, { assignedTo: e.target.value })); }} />
            <Select label="Status" value={editing.status} onChange={function (e: any) { setEditing(Object.assign({}, editing, { status: e.target.value })); }}>
              <option value="dirty">Dirty</option>
              <option value="cleaning">Cleaning</option>
              <option value="clean">Clean</option>
              <option value="inspected">Inspected</option>
              <option value="maintenance">Maintenance</option>
            </Select>
            <Select label="Priority" value={editing.priority} onChange={function (e: any) { setEditing(Object.assign({}, editing, { priority: e.target.value })); }}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
            <div className="md:col-span-2">
              <Textarea label="Notes" value={editing.notes} onChange={function (e: any) { setEditing(Object.assign({}, editing, { notes: e.target.value })); }} />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export function AdminCheckIn() {
  const [version, setVersion] = useState(0);
  const today = db.todayISO();
  const arrivals = db.getReservations({ status: 'confirmed' }).filter(function (r) { return r.checkIn <= today; });

  const checkIn = function (id: string) {
    if (!window.confirm('Verify guest details and check in this reservation?')) return;
    try {
      db.checkInReservation(id);
      toast.success('Guest checked in.');
      setVersion(version + 1);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <PageHeader title="Check-in" />
      <DataTable
        keyField="id"
        rows={arrivals}
        columns={[
          { key: 'code', label: 'Booking' },
          { key: 'guest', label: 'Guest', render: function (row: any) { return row.guestFirstName + ' ' + row.guestLastName; } },
          { key: 'hotel', label: 'Hotel', render: function (row: any) { return row.hotel?.name; } },
          { key: 'room', label: 'Room', render: function (row: any) { return row.room?.roomNumber || '—'; } },
          { key: 'arrival', label: 'Arrival', render: function (row: any) { return db.formatDate(row.checkIn); } },
          { key: 'departure', label: 'Departure', render: function (row: any) { return db.formatDate(row.checkOut); } },
          { key: 'paymentStatus', label: 'Payment', render: function (row: any) { return <StatusBadge status={row.paymentStatus} />; } },
          { key: 'status', label: 'Status', render: function (row: any) { return <StatusBadge status={row.status} />; } },
          { key: 'actions', label: 'Actions', render: function (row: any) { return <Button size="sm" onClick={function () { checkIn(row.id); }}><LogIn className="h-4 w-4" /> Check in</Button>; } }
        ]}
      />
    </div>
  );
}

export function AdminCheckOut() {
  const [version, setVersion] = useState(0);
  const [selected, setSelected] = useState<any>(null);
  const [extraCharge, setExtraCharge] = useState('');
  const departures = db.getReservations({ status: 'checked_in' });

  const checkout = function () {
    if (!selected) return;
    try {
      const cents = extraCharge ? Math.round(Number(extraCharge) * 100) : 0;
      db.checkOutReservation(selected.id, cents);
      toast.success('Guest checked out.');
      setSelected(null);
      setExtraCharge('');
      setVersion(version + 1);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <PageHeader title="Check-out" />
      <DataTable
        keyField="id"
        rows={departures}
        columns={[
          { key: 'code', label: 'Booking' },
          { key: 'guest', label: 'Guest', render: function (row: any) { return row.guestFirstName + ' ' + row.guestLastName; } },
          { key: 'hotel', label: 'Hotel', render: function (row: any) { return row.hotel?.name; } },
          { key: 'room', label: 'Room', render: function (row: any) { return row.room?.roomNumber || '—'; } },
          { key: 'departure', label: 'Departure', render: function (row: any) { return db.formatDate(row.checkOut); } },
          { key: 'totalAmount', label: 'Current total', render: function (row: any) { return db.formatMoney(row.totalAmount); } },
          { key: 'actions', label: 'Actions', render: function (row: any) { return <Button size="sm" onClick={function () { setSelected(row); }}><LogOut className="h-4 w-4" /> Check out</Button>; } }
        ]}
      />

      <Modal
        open={Boolean(selected)}
        onClose={function () { setSelected(null); }}
        title="Review stay and check out"
        footer={
          <>
            <Button variant="secondary" onClick={function () { setSelected(null); }}>Cancel</Button>
            <Button onClick={checkout}>Confirm check-out</Button>
          </>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Booking {selected.code} · {selected.hotel?.name}</p>
            <p className="text-sm text-slate-500">Guest: {selected.guestFirstName} {selected.guestLastName}</p>
            <p className="text-sm text-slate-500">Current total: {db.formatMoney(selected.totalAmount)}</p>
            <Input label="Additional charges (USD, optional)" type="number" value={extraCharge} onChange={function (e: any) { setExtraCharge(e.target.value); }} />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export function AdminReports() {
  const [start, setStart] = useState(db.addDaysISO(-13));
  const [end, setEnd] = useState(db.todayISO());

  const reservations = db.getReservations().filter(function (r) { return r.checkIn >= start && r.checkIn <= end; });
  const payments = db.getPayments().filter(function (p) { return (p.paidAt || '').slice(0, 10) >= start && (p.paidAt || '').slice(0, 10) <= end && p.status === 'paid'; });
  const revenue = payments.reduce(function (sum, p) { return sum + p.amount; }, 0);
  const confirmed = reservations.filter(function (r) { return r.status !== 'cancelled' && r.status !== 'no_show'; }).length;
  const cancelled = reservations.filter(function (r) { return r.status === 'cancelled' || r.status === 'no_show'; }).length;
  const occupied = db.getRooms().filter(function (r) { return r.status === 'occupied'; }).length;
  const totalRooms = db.getRooms().length;
  const occupancy = totalRooms ? Math.round((occupied / totalRooms) * 100) : 0;

  const exportCsv = function () {
    const header = 'Code,Hotel,Check-in,Check-out,Status,Payment status,Amount';
    const rows = reservations.map(function (r) {
      return [r.code, r.hotel?.name || '', r.checkIn, r.checkOut, r.status, r.paymentStatus, (r.totalAmount / 100).toFixed(2)].join(',');
    });
    const csv = [header].concat(rows).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'staysphere-report.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('Report exported.');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" actions={<Button variant="secondary" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>} />
      <Card className="grid gap-3 p-4 md:grid-cols-3">
        <Input label="Start date" type="date" value={start} onChange={function (e: any) { setStart(e.target.value); }} />
        <Input label="End date" type="date" value={end} onChange={function (e: any) { setEnd(e.target.value); }} />
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Revenue" value={db.formatMoney(revenue)} icon={CreditCard} />
        <StatCard title="Reservations" value={reservations.length} icon={Calendar} />
        <StatCard title="Cancelled / no-show" value={cancelled} icon={X} />
        <StatCard title="Occupancy" value={occupancy + '%'} icon={BedDouble} />
      </div>
      <Card className="p-6">
        <h2 className="mb-4 font-semibold">Reservations in range</h2>
        <DataTable
          keyField="id"
          rows={reservations}
          columns={[
            { key: 'code', label: 'Code' },
            { key: 'hotel', label: 'Hotel', render: function (row: any) { return row.hotel?.name; } },
            { key: 'checkIn', label: 'Check-in', render: function (row: any) { return db.formatDate(row.checkIn); } },
            { key: 'checkOut', label: 'Check-out', render: function (row: any) { return db.formatDate(row.checkOut); } },
            { key: 'status', label: 'Status', render: function (row: any) { return <StatusBadge status={row.status} />; } },
            { key: 'totalAmount', label: 'Amount', render: function (row: any) { return db.formatMoney(row.totalAmount); } }
          ]}
        />
      </Card>
    </div>
  );
}

export function AdminSettings() {
  const [settings, setSettings] = useState<any>(db.getSettings());

  const save = function () {
    Object.keys(settings).forEach(function (key) {
      db.setSetting(key, String(settings[key]));
    });
    toast.success('Settings saved.');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" actions={<Button onClick={save}>Save settings</Button>} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4 p-6">
          <h2 className="font-semibold">Booking settings</h2>
          <Input label="Minimum stay (nights)" type="number" value={settings.min_stay} onChange={function (e: any) { setSettings(Object.assign({}, settings, { min_stay: e.target.value })); }} />
          <Input label="Maximum stay (nights)" type="number" value={settings.max_stay} onChange={function (e: any) { setSettings(Object.assign({}, settings, { max_stay: e.target.value })); }} />
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="font-semibold">Payment settings</h2>
          <Input label="Currency" value={settings.currency} onChange={function (e: any) { setSettings(Object.assign({}, settings, { currency: e.target.value })); }} />
          <Input label="Tax percent" type="number" value={settings.tax_percent} onChange={function (e: any) { setSettings(Object.assign({}, settings, { tax_percent: e.target.value })); }} />
          <Input label="Service fee percent" type="number" value={settings.service_fee_percent} onChange={function (e: any) { setSettings(Object.assign({}, settings, { service_fee_percent: e.target.value })); }} />
        </Card>

        <Card className="space-y-4 p-6 xl:col-span-2">
          <h2 className="font-semibold">Notification settings</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.booking_notifications === 'true'} onChange={function (e: any) { setSettings(Object.assign({}, settings, { booking_notifications: e.target.checked ? 'true' : 'false' })); }} />
            Booking notifications
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.payment_notifications === 'true'} onChange={function (e: any) { setSettings(Object.assign({}, settings, { payment_notifications: e.target.checked ? 'true' : 'false' })); }} />
            Payment notifications
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.review_reminders === 'true'} onChange={function (e: any) { setSettings(Object.assign({}, settings, { review_reminders: e.target.checked ? 'true' : 'false' })); }} />
            Review reminders
          </label>
        </Card>
      </div>
    </div>
  );
}
