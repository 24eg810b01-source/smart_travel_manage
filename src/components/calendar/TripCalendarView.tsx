import React, { useState } from 'react';
import { Trip, Booking } from '../../types/travel';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Plane, 
  Hotel, 
  Compass, 
  Clock, 
  MapPin,
  Tag
} from 'lucide-react';

interface TripCalendarViewProps {
  trips: Trip[];
  bookings: Booking[];
  onSelectTrip: (tripId: string) => void;
}

export const TripCalendarView: React.FC<TripCalendarViewProps> = ({
  trips,
  bookings,
  onSelectTrip,
}) => {
  // Calendar month state (defaults to November 2026 where seed trips take place)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // Nov 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-11-12');
  const [filterType, setFilterType] = useState<'ALL' | 'FLIGHTS' | 'HOTELS' | 'ACTIVITIES'>('ALL');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to format date YYYY-MM-DD
  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Compute calendar grid days
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 10, 1)); // Nov 2026
    setSelectedDateStr('2026-11-12');
  };

  // Aggregate all events for any date
  const getEventsForDate = (dateStr: string) => {
    const events: Array<{
      id: string;
      title: string;
      type: 'TRIP_SPAN' | 'FLIGHT' | 'HOTEL' | 'ACTIVITY' | 'TRANSIT';
      time?: string;
      tripId?: string;
      details?: string;
    }> = [];

    // Trips spanning this date
    trips.forEach(t => {
      if (dateStr >= t.startDate && dateStr <= t.endDate) {
        events.push({
          id: `trip-span-${t.id}-${dateStr}`,
          title: `${t.destinationName}: ${t.title}`,
          type: 'TRIP_SPAN',
          tripId: t.id,
          details: `Day of trip in ${t.destinationName}`,
        });
      }
    });

    // Bookings on this date
    bookings.forEach(b => {
      const bkgStart = b.startDateTime.split('T')[0];
      const bkgEnd = b.endDateTime.split('T')[0];
      if (dateStr === bkgStart) {
        events.push({
          id: `bkg-${b.id}`,
          title: `${b.provider}: ${b.title}`,
          type: b.type === 'FLIGHT' ? 'FLIGHT' : b.type === 'HOTEL' ? 'HOTEL' : 'TRANSIT',
          time: b.startDateTime.split('T')[1]?.substring(0, 5) || 'All Day',
          tripId: b.tripId,
          details: `${b.confirmationCode} · ${b.status}`,
        });
      } else if (b.type === 'HOTEL' && dateStr > bkgStart && dateStr <= bkgEnd) {
        events.push({
          id: `bkg-stay-${b.id}-${dateStr}`,
          title: `Stay: ${b.provider}`,
          type: 'HOTEL',
          tripId: b.tripId,
          details: `Room ${b.seatOrRoom || 'Reserved'}`,
        });
      }
    });

    // Daily activities on this date
    trips.forEach(t => {
      t.days.forEach(d => {
        if (d.date === dateStr) {
          d.activities.forEach(a => {
            events.push({
              id: a.id,
              title: a.title,
              type: 'ACTIVITY',
              time: a.time,
              tripId: t.id,
              details: `${a.category} · ${a.location}`,
            });
          });
        }
      });
    });

    // Apply filter
    if (filterType === 'FLIGHTS') return events.filter(e => e.type === 'FLIGHT' || e.type === 'TRANSIT');
    if (filterType === 'HOTELS') return events.filter(e => e.type === 'HOTEL');
    if (filterType === 'ACTIVITIES') return events.filter(e => e.type === 'ACTIVITY');
    return events;
  };

  // Export .ICS calendar file
  const handleExportIcs = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Smart Travel Management System//NONSGML v1.0//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    trips.forEach(t => {
      t.days.forEach(d => {
        d.activities.forEach(a => {
          const cleanDate = d.date.replace(/-/g, '');
          const cleanTime = (a.time || '10:00').replace(':', '') + '00';
          icsContent.push('BEGIN:VEVENT');
          icsContent.push(`UID:stms-${a.id}@smarttravel.io`);
          icsContent.push(`DTSTAMP:${cleanDate}T${cleanTime}Z`);
          icsContent.push(`DTSTART:${cleanDate}T${cleanTime}Z`);
          icsContent.push(`SUMMARY:${a.title}`);
          icsContent.push(`DESCRIPTION:${a.category} - ${a.notes || ''}`);
          icsContent.push(`LOCATION:${a.location}`);
          icsContent.push('END:VEVENT');
        });
      });
    });

    bookings.forEach(b => {
      const dt = b.startDateTime.replace(/[-:]/g, '');
      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:stms-bkg-${b.id}@smarttravel.io`);
      icsContent.push(`DTSTAMP:${dt}Z`);
      icsContent.push(`DTSTART:${dt}Z`);
      icsContent.push(`SUMMARY:${b.provider} - ${b.title}`);
      icsContent.push(`DESCRIPTION:PNR: ${b.confirmationCode} - Status: ${b.status}`);
      icsContent.push(`LOCATION:${b.terminalGate || b.seatOrRoom || 'Airport/Hotel'}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'smart-travel-itinerary.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectedDateEvents = getEventsForDate(selectedDateStr);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Trip Calendar & Departure Timeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Centralized schedule of flights, lodging dates, and scheduled day activities
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['ALL', 'FLIGHTS', 'HOTELS', 'ACTIVITIES'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterType(mode)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  filterType === mode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'ALL' ? 'All' : mode === 'FLIGHTS' ? 'Flights' : mode === 'HOTELS' ? 'Stays' : 'Tours'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportIcs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Download .ICS file for Apple / Google Calendar"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            Export .ICS
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar Month Grid (8 cols) & Day Agenda (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Month Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">
                {monthNames[month]} {year}
              </h2>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
              >
                Nov 2026
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs text-slate-400 pb-2 border-b border-slate-100">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {/* Empty slots before month start */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 sm:h-24 p-1.5 bg-slate-50/50 rounded-lg text-slate-300 text-xs font-mono" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = formatDateStr(year, month, dayNum);
              const events = getEventsForDate(dateStr);
              const isSelected = selectedDateStr === dateStr;
              const hasTripSpan = events.some(e => e.type === 'TRIP_SPAN');
              const hasFlight = events.some(e => e.type === 'FLIGHT' || e.type === 'TRANSIT');
              const hasHotel = events.some(e => e.type === 'HOTEL');

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-20 sm:h-24 p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/50 shadow-xs'
                      : hasTripSpan
                      ? 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono tabular-nums font-bold ${
                      isSelected ? 'text-sky-700' : 'text-slate-700'
                    }`}>
                      {dayNum}
                    </span>

                    {/* Small category indicator icons */}
                    <div className="flex items-center gap-1">
                      {hasFlight && <Plane className="w-2.5 h-2.5 text-sky-600" />}
                      {hasHotel && <Hotel className="w-2.5 h-2.5 text-amber-600" />}
                    </div>
                  </div>

                  {/* Tiny event tags preview */}
                  <div className="space-y-0.5 overflow-hidden">
                    {events.slice(0, 2).map((ev, evIdx) => (
                      <div
                        key={evIdx}
                        className={`text-[9px] truncate px-1 py-0.5 rounded leading-tight font-medium ${
                          ev.type === 'FLIGHT'
                            ? 'bg-sky-100 text-sky-800'
                            : ev.type === 'HOTEL'
                            ? 'bg-amber-100 text-amber-800'
                            : ev.type === 'ACTIVITY'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-[9px] text-slate-400 font-mono pl-1">
                        +{events.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Selected Day Agenda & Details (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Selected Agenda
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {selectedDateStr}
            </h3>
            <div className="text-xs text-slate-500 font-mono tabular-nums">
              {selectedDateEvents.length} event(s) scheduled
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {selectedDateEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No events or reservations on this day. Select another date on the calendar.
              </div>
            ) : (
              selectedDateEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded uppercase ${
                      ev.type === 'FLIGHT' ? 'bg-sky-100 text-sky-800' :
                      ev.type === 'HOTEL' ? 'bg-amber-100 text-amber-800' :
                      ev.type === 'ACTIVITY' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {ev.type}
                    </span>
                    {ev.time && (
                      <span className="font-mono text-slate-500 tabular-nums flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {ev.time}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {ev.title}
                  </h4>

                  {ev.details && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span>{ev.details}</span>
                    </div>
                  )}

                  {ev.tripId && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => onSelectTrip(ev.tripId!)}
                        className="text-[11px] text-sky-600 hover:text-sky-800 font-medium"
                      >
                        Jump to Itinerary →
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
