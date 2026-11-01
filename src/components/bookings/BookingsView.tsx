import React, { useState } from 'react';
import { Booking, BookingStatus, BookingType, Trip, User } from '../../types/travel';
import { 
  Plane, 
  Hotel, 
  Train, 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  Printer, 
  X, 
  QrCode, 
  MapPin, 
  Calendar,
  Sparkles,
  Search
} from 'lucide-react';

interface BookingsViewProps {
  bookings: Booking[];
  trips: Trip[];
  currentUser: User;
  onUpdateStatus: (bookingId: string, status: BookingStatus, customMessage?: string) => void;
  onCreateBooking: (booking: Omit<Booking, 'id' | 'liveUpdates'>) => void;
  onDeleteBooking: (bookingId: string) => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  trips,
  currentUser,
  onUpdateStatus,
  onCreateBooking,
  onDeleteBooking,
}) => {
  const [selectedType, setSelectedType] = useState<'ALL' | BookingType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingForVoucher, setSelectedBookingForVoucher] = useState<Booking | null>(null);
  
  // Status simulation modal state
  const [simulatingBooking, setSimulatingBooking] = useState<Booking | null>(null);
  const [simNewStatus, setSimNewStatus] = useState<BookingStatus>('IN_TRANSIT');
  const [simCustomMessage, setSimCustomMessage] = useState('');

  // New Booking modal state
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [newTripId, setNewTripId] = useState(trips[0]?.id || '');
  const [newType, setNewType] = useState<BookingType>('FLIGHT');
  const [newProvider, setNewProvider] = useState('Japan Airlines (JAL)');
  const [newTitle, setNewTitle] = useState('JL001: HND -> SFO');
  const [newDetails, setNewDetails] = useState('Boeing 777-300ER · Economy Extra');
  const [newStartDate, setNewStartDate] = useState('2026-11-18T18:00');
  const [newEndDate, setNewEndDate] = useState('2026-11-18T11:30');
  const [newCost, setNewCost] = useState('850');
  const [newSeatOrRoom, setNewSeatOrRoom] = useState('24K');
  const [newGate, setNewGate] = useState('Gate 112');

  const filteredBookings = bookings.filter((b) => {
    const matchesType = selectedType === 'ALL' || b.type === selectedType;
    const matchesQuery = 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.confirmationCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  const getStatusDisplay = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="text-emerald-700 font-mono text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            CONFIRMED
          </span>
        );
      case 'IN_TRANSIT':
        return (
          <span className="text-sky-700 font-mono text-xs font-semibold flex items-center gap-1">
            <Plane className="w-3.5 h-3.5 text-sky-600" />
            IN TRANSIT / ACTIVE
          </span>
        );
      case 'PENDING':
        return (
          <span className="text-amber-700 font-mono text-xs font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            PENDING VERIFICATION
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="text-slate-600 font-mono text-xs font-semibold">
            COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="text-rose-600 font-mono text-xs font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            CANCELLED
          </span>
        );
    }
  };

  const getTypeIcon = (type: BookingType) => {
    switch (type) {
      case 'FLIGHT':
        return <Plane className="w-4 h-4 text-sky-600" />;
      case 'HOTEL':
        return <Hotel className="w-4 h-4 text-amber-600" />;
      case 'TRAIN':
        return <Train className="w-4 h-4 text-emerald-600" />;
      default:
        return <Ticket className="w-4 h-4 text-purple-600" />;
    }
  };

  const handleOpenSimulator = (bkg: Booking) => {
    setSimulatingBooking(bkg);
    // Suggest next logical status
    if (bkg.status === 'PENDING') {
      setSimNewStatus('CONFIRMED');
      setSimCustomMessage('Provider confirmed reservation. Confirmation PNR issued.');
    } else if (bkg.status === 'CONFIRMED') {
      setSimNewStatus('IN_TRANSIT');
      setSimCustomMessage('Boarding gate opened. Passenger check-in verified.');
    } else if (bkg.status === 'IN_TRANSIT') {
      setSimNewStatus('COMPLETED');
      setSimCustomMessage('Transit concluded. Arrived at destination on schedule.');
    } else {
      setSimNewStatus('CONFIRMED');
      setSimCustomMessage('Status re-verified with central GDS provider.');
    }
  };

  const handleExecuteSimulation = () => {
    if (!simulatingBooking) return;
    onUpdateStatus(simulatingBooking.id, simNewStatus, simCustomMessage);
    setSimulatingBooking(null);
  };

  const handleCreateBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trip = trips.find(t => t.id === newTripId);
    const pnrCode = `${newProvider.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    onCreateBooking({
      tripId: newTripId,
      tripTitle: trip?.title || 'Custom Trip',
      userId: currentUser.id,
      userName: currentUser.name,
      type: newType,
      provider: newProvider,
      confirmationCode: pnrCode,
      referenceNo: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      title: newTitle,
      details: newDetails,
      startDateTime: newStartDate,
      endDateTime: newEndDate,
      cost: parseFloat(newCost) || 0,
      currency: 'USD',
      status: 'CONFIRMED',
      seatOrRoom: newSeatOrRoom,
      terminalGate: newGate,
    });

    setIsCreatingBooking(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Real-Time Booking Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Live carrier reservations, boarding passes, confirmation codes, and status updates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreatingBooking(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Reservation
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {(['ALL', 'FLIGHT', 'HOTEL', 'TRAIN', 'ACTIVITY'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedType === type
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type === 'ALL' ? 'All Bookings' : type === 'FLIGHT' ? 'Flights' : type === 'HOTEL' ? 'Hotels' : type === 'TRAIN' ? 'Rail/Transit' : 'Activities'}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search provider, PNR, flight #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Bookings List Cards */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
            <Plane className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No matching reservations found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Try clearing filters or add a new travel booking.</p>
            <button
              onClick={() => setIsCreatingBooking(true)}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700"
            >
              Add Reservation
            </button>
          </div>
        ) : (
          filteredBookings.map((bkg) => (
            <div
              key={bkg.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getTypeIcon(bkg.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {bkg.confirmationCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {bkg.provider}
                      </span>
                      <span className="text-[11px] text-slate-400">· {bkg.tripTitle}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {bkg.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {bkg.details}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col sm:items-end justify-between sm:justify-start gap-2">
                  {getStatusDisplay(bkg.status)}
                  <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                    ${bkg.cost.toLocaleString()} {bkg.currency}
                  </div>
                </div>
              </div>

              {/* Meta strip: Dates, Seat, Terminal */}
              <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600 font-mono tabular-nums">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Departs: {bkg.startDateTime.replace('T', ' ')}</span>
                </div>
                {bkg.seatOrRoom && (
                  <div>
                    <span className="text-slate-400">Seat/Room: </span>
                    <span className="font-semibold text-slate-800">{bkg.seatOrRoom}</span>
                  </div>
                )}
                {bkg.terminalGate && (
                  <div>
                    <span className="text-slate-400">Gate: </span>
                    <span className="font-semibold text-slate-800">{bkg.terminalGate}</span>
                  </div>
                )}
                <div className="text-slate-400">
                  Ref: #{bkg.referenceNo}
                </div>
              </div>

              {/* Real-Time Live Status Updates History */}
              {bkg.liveUpdates && bkg.liveUpdates.length > 0 && (
                <div className="bg-slate-50/75 rounded-lg p-3 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      Real-Time Carrier Status Log
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Auto-synced via Spring Boot
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {bkg.liveUpdates.slice(0, 2).map((upd, idx) => (
                      <div key={idx} className="text-xs text-slate-600 flex items-start justify-between gap-4">
                        <span className="leading-snug">{upd.message}</span>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0 tabular-nums">
                          {upd.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Actions */}
              <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedBookingForVoucher(bkg)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    View E-Ticket / Voucher
                  </button>
                  <button
                    onClick={() => handleOpenSimulator(bkg)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md transition-colors cursor-pointer"
                    title="Simulate flight boarding, delay, gate change or check-in"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Simulate Status Event
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Cancel reservation for ${bkg.title}?`)) {
                      onUpdateStatus(bkg.id, 'CANCELLED', 'Reservation cancelled by passenger.');
                    }
                  }}
                  disabled={bkg.status === 'CANCELLED'}
                  className="text-xs text-rose-600 hover:text-rose-800 disabled:text-slate-300 font-medium cursor-pointer"
                >
                  Cancel Booking
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Real-time Status Simulator Modal */}
      {simulatingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Live Status Simulation Dispatch</h3>
              </div>
              <button onClick={() => setSimulatingBooking(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="font-bold text-slate-800">{simulatingBooking.provider} · {simulatingBooking.title}</div>
              <div className="text-slate-500 font-mono mt-0.5">Confirmation PNR: {simulatingBooking.confirmationCode}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select New Status</label>
              <select
                value={simNewStatus}
                onChange={(e) => setSimNewStatus(e.target.value as any)}
                className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2 bg-white"
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="IN_TRANSIT">IN_TRANSIT (Boarding / En Route)</option>
                <option value="COMPLETED">COMPLETED (Arrived / Checked Out)</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Live Telemetry Message</label>
              <textarea
                rows={2}
                value={simCustomMessage}
                onChange={(e) => setSimCustomMessage(e.target.value)}
                placeholder="e.g. Flight boarding now at Gate G94, group 2."
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSimulatingBooking(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSimulation}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md shadow-xs cursor-pointer"
              >
                Dispatch Real-Time Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E-Ticket / Voucher Modal */}
      {selectedBookingForVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-mono text-sky-600 font-bold uppercase tracking-wider">
                  Official Travel Document
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Electronic Voucher & Boarding Pass
                </h3>
              </div>
              <button
                onClick={() => setSelectedBookingForVoucher(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Card Aesthetic */}
            <div className="border border-slate-300 rounded-lg p-5 bg-gradient-to-b from-white to-slate-50 space-y-4 shadow-xs relative">
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-300">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-mono">Carrier Provider</div>
                  <div className="text-sm font-bold text-slate-900">{selectedBookingForVoucher.provider}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 uppercase font-mono">Confirmation PNR</div>
                  <div className="text-sm font-bold font-mono text-sky-700">{selectedBookingForVoucher.confirmationCode}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400 uppercase font-mono">Service</div>
                <div className="text-sm font-bold text-slate-900">{selectedBookingForVoucher.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{selectedBookingForVoucher.details}</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block font-sans text-[10px]">PASSENGER</span>
                  <span className="font-bold text-slate-800">{selectedBookingForVoucher.userName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans text-[10px]">SEAT / ROOM</span>
                  <span className="font-bold text-slate-800">{selectedBookingForVoucher.seatOrRoom || 'ASSIGNED AT GATE'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans text-[10px]">TERMINAL / GATE</span>
                  <span className="font-bold text-slate-800">{selectedBookingForVoucher.terminalGate || 'MAIN TERMINAL'}</span>
                </div>
              </div>

              {/* QR Code Graphic Simulation */}
              <div className="pt-3 border-t border-dashed border-slate-300 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Scan At Kiosk / Gate</div>
                  <div className="text-xs font-mono text-slate-600">HASH: {selectedBookingForVoucher.referenceNo}</div>
                </div>
                <div className="w-12 h-12 bg-slate-900 rounded p-1 text-white flex items-center justify-center">
                  <QrCode className="w-10 h-10" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Validated through MySQL schema `bookings`
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Pass
                </button>
                <button
                  onClick={() => setSelectedBookingForVoucher(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      {isCreatingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Travel Booking</h3>

            <form onSubmit={handleCreateBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Associated Trip *</label>
                <select
                  value={newTripId}
                  onChange={(e) => setNewTripId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white"
                >
                  {trips.map(t => (
                    <option key={t.id} value={t.id}>{t.title} ({t.destinationName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Booking Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="FLIGHT">Flight</option>
                    <option value="HOTEL">Hotel</option>
                    <option value="TRAIN">Train / Rail</option>
                    <option value="ACTIVITY">Activity / Tour</option>
                    <option value="CAR_RENTAL">Car Rental</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Provider *</label>
                  <input
                    type="text"
                    required
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title / Flight / Room *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Details & Amenities</label>
                <input
                  type="text"
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Departure / Check-in</label>
                  <input
                    type="datetime-local"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Arrival / Check-out</label>
                  <input
                    type="datetime-local"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Seat / Room</label>
                  <input
                    type="text"
                    value={newSeatOrRoom}
                    onChange={(e) => setNewSeatOrRoom(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gate / Terminal</label>
                  <input
                    type="text"
                    value={newGate}
                    onChange={(e) => setNewGate(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingBooking(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                >
                  Confirm & Reserve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
