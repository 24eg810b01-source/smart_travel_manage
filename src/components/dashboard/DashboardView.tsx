import React from 'react';
import { Trip, Booking, Expense, User } from '../../types/travel';
import { 
  Calendar, 
  MapPin, 
  Plane, 
  Hotel, 
  CreditCard, 
  Users, 
  ArrowRight, 
  Clock, 
  Compass, 
  Plus, 
  SunMedium, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface DashboardViewProps {
  trips: Trip[];
  bookings: Booking[];
  expenses: Expense[];
  currentUser: User;
  onNavigate: (tab: string, contextId?: string) => void;
  onSimulateStatus: (bookingId: string) => void;
  onOpenNewTripModal: () => void;
  onOpenNewBookingModal: () => void;
  onOpenNewExpenseModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  trips,
  bookings,
  expenses,
  currentUser,
  onNavigate,
  onSimulateStatus,
  onOpenNewTripModal,
  onOpenNewBookingModal,
  onOpenNewExpenseModal,
}) => {
  // Aggregate stats
  const totalTripsCount = trips.length;
  const activeBookingsCount = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'IN_TRANSIT').length;
  
  const totalBudget = trips.reduce((acc, t) => acc + (t.totalBudget || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const budgetUtilization = totalBudget > 0 ? Math.min(100, Math.round((totalExpenses / totalBudget) * 100)) : 0;

  const totalCollaborators = trips.reduce((acc, t) => acc + (t.collaborators ? t.collaborators.length : 0), 0);

  // Primary upcoming trip
  const upcomingTrip = trips[0];

  // Category expense breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="text-emerald-700 font-semibold font-mono text-xs">CONFIRMED</span>;
      case 'IN_TRANSIT':
        return <span className="text-sky-700 font-semibold font-mono text-xs">IN TRANSIT</span>;
      case 'PENDING':
        return <span className="text-amber-700 font-semibold font-mono text-xs">PENDING VERIFICATION</span>;
      case 'COMPLETED':
        return <span className="text-slate-600 font-semibold font-mono text-xs">COMPLETED</span>;
      default:
        return <span className="text-slate-500 font-mono text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Smart travel management overview · Connected to MySQL 8.0 & Spring Boot REST Services
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewTripModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Plan New Trip
          </button>
          <button
            onClick={onOpenNewBookingModal}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plane className="w-4 h-4 text-slate-500" />
            New Booking
          </button>
          <button
            onClick={onOpenNewExpenseModal}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-slate-500" />
            Log Expense
          </button>
        </div>
      </div>

      {/* 4-Column KPI Metric Strip (Tabular Numerals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Planned Trips</span>
            <Compass className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalTripsCount}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-600 font-medium font-mono tabular-nums">2 Active</span>
            <span>·</span>
            <span>{trips.reduce((acc, t) => acc + t.days.length, 0)} Total Itinerary Days</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Live Reservations</span>
            <Plane className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {bookings.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-600 font-medium font-mono tabular-nums">{activeBookingsCount} Confirmed</span>
            <span>·</span>
            <span>Real-time status synced</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Budget Tracking</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ${totalExpenses.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span>of ${totalBudget.toLocaleString()}</span>
            <span>·</span>
            <span className="font-mono tabular-nums font-semibold text-slate-700">{budgetUtilization}% Utilized</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Collaborative Planners</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalCollaborators}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span>Across itineraries</span>
            <span>·</span>
            <span className="text-sky-600 font-medium">Shared links active</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Upcoming Trip Spotlight & Live Bookings Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Upcoming Trip Spotlight (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {upcomingTrip ? (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="relative h-56 sm:h-64 w-full bg-slate-900 overflow-hidden">
                <img
                  src={upcomingTrip.coverImage}
                  alt={upcomingTrip.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                
                {/* Weather & Destination pill */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <div className="bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-2 font-mono tabular-nums">
                    <SunMedium className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kyoto 18°C · Pleasant</span>
                  </div>
                </div>

                {/* Overlaid Title & Dates */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-xs uppercase tracking-wider text-sky-300 font-medium">
                    Next Featured Departure · {upcomingTrip.destinationName}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white text-balance">
                    {upcomingTrip.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-2 font-mono tabular-nums">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {upcomingTrip.startDate} to {upcomingTrip.endDate}
                    </span>
                    <span>·</span>
                    <span>{upcomingTrip.days.length} Itinerary Days</span>
                    <span>·</span>
                    <span>Budget: ${upcomingTrip.totalBudget.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Trip Highlights & Direct Links */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {upcomingTrip.notes}
                </p>

                <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-slate-500">
                      Collaborators:
                    </div>
                    <div className="flex -space-x-2">
                      {upcomingTrip.collaborators.map((c, i) => (
                        <div
                          key={i}
                          title={`${c.name} (${c.role})`}
                          className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-700"
                        >
                          {c.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('trips', upcomingTrip.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      Open Itinerary
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onNavigate('calendar')}
                      className="px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    >
                      Calendar View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
              <Compass className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No trips planned yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Start by creating your first trip itinerary or explore destinations.</p>
              <button
                onClick={onOpenNewTripModal}
                className="px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700"
              >
                Plan First Trip
              </button>
            </div>
          )}

          {/* Category Budget Allocation Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Expense Allocation Breakdown</h3>
                <p className="text-xs text-slate-500">Multi-category spending against overall travel budget</p>
              </div>
              <button
                onClick={() => onNavigate('expenses')}
                className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                View Full Ledger
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {['Flights', 'Lodging', 'Transit', 'Dining', 'Activities'].map((cat) => {
                const amount = categoryTotals[cat] || 0;
                const percentage = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{cat}</span>
                      <span className="font-mono tabular-nums text-slate-500">
                        ${amount.toLocaleString()} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Real-Time Bookings Feed & Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Real-Time Booking Status</h3>
                <p className="text-xs text-slate-500">Direct integration with carrier GDS & hotel systems</p>
              </div>
              <button
                onClick={() => onNavigate('bookings')}
                className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                All Bookings
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {bookings.slice(0, 4).map((bkg) => (
                <div key={bkg.id} className="py-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{bkg.confirmationCode}</span>
                        <span>·</span>
                        <span className="text-xs font-medium text-slate-600">{bkg.provider}</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 mt-0.5">{bkg.title}</div>
                    </div>
                    {getStatusBadge(bkg.status)}
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                    {bkg.seatOrRoom && <span>Seat/Room: {bkg.seatOrRoom} · </span>}
                    {bkg.terminalGate && <span>{bkg.terminalGate} · </span>}
                    <span>Cost: ${bkg.cost}</span>
                  </div>

                  {/* Latest Real-Time Update Message */}
                  {bkg.liveUpdates && bkg.liveUpdates.length > 0 && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700 flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="leading-tight">{bkg.liveUpdates[0].message}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{bkg.liveUpdates[0].timestamp}</div>
                      </div>
                    </div>
                  )}

                  {/* Interactive Status Simulation Trigger */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => onSimulateStatus(bkg.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-800 hover:bg-sky-50 px-2 py-1 rounded transition-colors font-medium cursor-pointer"
                      title="Trigger automated real-time status change"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Simulate Status Update
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={onOpenNewBookingModal}
                className="w-full py-2 px-3 text-xs font-medium text-center text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                + Add New Transportation or Hotel Reservation
              </button>
            </div>
          </div>

          {/* Collaborative Sharing Quick Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] text-sky-400 font-mono tracking-wider uppercase font-semibold">
                  Multi-User Collaboration
                </span>
                <h4 className="text-sm font-bold text-white mt-1">Share Itinerary with Co-Travelers</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Invite friends, family or colleagues with Editor or Viewer roles. Enable live activity voting and shared expense splits.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => onNavigate('trips')}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Manage Collaborators
              </button>
              <button
                onClick={() => onNavigate('calendar')}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Sync with Calendar
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
