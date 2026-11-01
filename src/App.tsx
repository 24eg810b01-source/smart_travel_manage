/**
 * Smart Travel Management System
 * React.js + Spring Boot REST APIs + MySQL 8.0 Architecture
 */

import React, { useState, useEffect } from 'react';
import { storageService } from './services/storageService';
import { Header } from './components/common/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { TripPlannerView } from './components/trips/TripPlannerView';
import { TripCalendarView } from './components/calendar/TripCalendarView';
import { BookingsView } from './components/bookings/BookingsView';
import { ExpenseTrackerView } from './components/expenses/ExpenseTrackerView';
import { DestinationsView } from './components/destinations/DestinationsView';
import { AdminView } from './components/admin/AdminView';
import { CollaborativeShareModal } from './components/collab/CollaborativeShareModal';
import { MysqlArchitectureModal } from './components/database/MysqlArchitectureModal';
import { NewTripModal } from './components/trips/NewTripModal';
import { Trip, Destination, Booking, Expense, BookingStatus } from './types/travel';
import { 
  Compass, 
  Calendar as CalendarIcon, 
  Plane, 
  CreditCard, 
  MapPin, 
  ShieldCheck, 
  Database,
  LayoutDashboard
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Storage states
  const [currentUser, setCurrentUser] = useState(storageService.getCurrentUser());
  const [trips, setTrips] = useState<Trip[]>(storageService.getTrips());
  const [bookings, setBookings] = useState<Booking[]>(storageService.getBookings());
  const [expenses, setExpenses] = useState<Expense[]>(storageService.getExpenses());
  const [destinations, setDestinations] = useState<Destination[]>(storageService.getDestinations());
  const [users, setUsers] = useState(storageService.getUsers());
  const [auditLogs, setAuditLogs] = useState(storageService.getAuditLogs());

  // Active Trip ID for planner
  const [activeTripId, setActiveTripId] = useState<string>(trips[0]?.id || '');

  // Modals
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [preselectedDest, setPreselectedDest] = useState<Destination | null>(null);
  const [shareTripTarget, setShareTripTarget] = useState<Trip | null>(null);

  // Synchronize state from storageService
  const syncState = () => {
    setCurrentUser(storageService.getCurrentUser());
    setTrips(storageService.getTrips());
    setBookings(storageService.getBookings());
    setExpenses(storageService.getExpenses());
    setDestinations(storageService.getDestinations());
    setUsers(storageService.getUsers());
    setAuditLogs(storageService.getAuditLogs());
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    syncState();
  }, []);

  // Handlers
  const handleUserChanged = () => {
    syncState();
  };

  const handleSimulateStatus = (bookingId: string) => {
    const bkg = bookings.find(b => b.id === bookingId);
    if (!bkg) return;

    let nextStatus: BookingStatus = 'CONFIRMED';
    let msg = 'Confirmed by airline reservation system.';

    if (bkg.status === 'PENDING') {
      nextStatus = 'CONFIRMED';
      msg = 'Reservation confirmed by provider systems.';
    } else if (bkg.status === 'CONFIRMED') {
      nextStatus = 'IN_TRANSIT';
      msg = 'Passenger checked-in. Boarding commenced at Gate.';
    } else if (bkg.status === 'IN_TRANSIT') {
      nextStatus = 'COMPLETED';
      msg = 'Journey completed successfully on time.';
    } else {
      nextStatus = 'CONFIRMED';
      msg = 'Flight schedule re-verified with central GDS.';
    }

    storageService.updateBookingStatus(bookingId, nextStatus, msg);
    syncState();
  };

  const handleCreateTrip = (tripData: Omit<Trip, 'id' | 'collaborators' | 'days'>) => {
    const created = storageService.createTrip(tripData);
    syncState();
    setActiveTripId(created.id);
    setCurrentTab('trips');
  };

  const handlePlanTripForDestination = (dest: Destination) => {
    setPreselectedDest(dest);
    setIsNewTripModalOpen(true);
  };

  const handleAddActivity = (tripId: string, dayId: string, activity: any) => {
    storageService.addActivity(tripId, dayId, activity);
    syncState();
  };

  const handleVoteActivity = (tripId: string, dayId: string, activityId: string, vote: 1 | -1) => {
    storageService.voteActivity(tripId, dayId, activityId, vote);
    syncState();
  };

  const handleAddComment = (tripId: string, dayId: string, activityId: string, text: string) => {
    storageService.addActivityComment(tripId, dayId, activityId, text);
    syncState();
  };

  const handleDeleteTrip = (tripId: string) => {
    storageService.deleteTrip(tripId);
    syncState();
    if (activeTripId === tripId) {
      const remaining = storageService.getTrips();
      setActiveTripId(remaining[0]?.id || '');
    }
  };

  const handleAddCollaborator = (tripId: string, collab: any) => {
    storageService.addCollaborator(tripId, collab);
    syncState();
  };

  const handleRemoveCollaborator = (tripId: string, collabId: string) => {
    storageService.removeCollaborator(tripId, collabId);
    syncState();
  };

  const handleUpdateBookingStatus = (bookingId: string, status: BookingStatus, customMessage?: string) => {
    storageService.updateBookingStatus(bookingId, status, customMessage);
    syncState();
  };

  const handleCreateBooking = (bookingData: any) => {
    storageService.createBooking(bookingData);
    syncState();
  };

  const handleDeleteBooking = (bookingId: string) => {
    storageService.deleteBooking(bookingId);
    syncState();
  };

  const handleCreateExpense = (expData: any) => {
    storageService.createExpense(expData);
    syncState();
  };

  const handleDeleteExpense = (expId: string) => {
    storageService.deleteExpense(expId);
    syncState();
  };

  const handleCreateDestination = (destData: any) => {
    storageService.createDestination(destData);
    syncState();
  };

  const handleUpdateDestination = (dest: Destination) => {
    storageService.updateDestination(dest);
    syncState();
  };

  const handleDeleteDestination = (destId: string) => {
    storageService.deleteDestination(destId);
    syncState();
  };

  const handleUpdateUserRole = (userId: string, newRole: any) => {
    const allUsers = storageService.getUsers();
    const u = allUsers.find(x => x.id === userId);
    if (u) {
      u.role = newRole;
      storageService.saveUsers(allUsers);
      storageService.addAuditLog('USER_ROLE_CHANGE', `User #${userId}`, `Admin updated role to ${newRole}`);
      syncState();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      
      {/* Strict 3-zone Header Contract */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onUserChanged={handleUserChanged}
        onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6 max-w-7xl mx-auto w-full">
        {currentTab === 'dashboard' && (
          <DashboardView
            trips={trips}
            bookings={bookings}
            expenses={expenses}
            currentUser={currentUser}
            onNavigate={(tab, contextId) => {
              if (contextId) setActiveTripId(contextId);
              setCurrentTab(tab);
            }}
            onSimulateStatus={handleSimulateStatus}
            onOpenNewTripModal={() => {
              setPreselectedDest(null);
              setIsNewTripModalOpen(true);
            }}
            onOpenNewBookingModal={() => setCurrentTab('bookings')}
            onOpenNewExpenseModal={() => setCurrentTab('expenses')}
          />
        )}

        {currentTab === 'trips' && (
          <TripPlannerView
            trips={trips}
            activeTripId={activeTripId}
            currentUser={currentUser}
            onSelectTrip={setActiveTripId}
            onOpenNewTripModal={() => {
              setPreselectedDest(null);
              setIsNewTripModalOpen(true);
            }}
            onOpenShareModal={(trip) => setShareTripTarget(trip)}
            onAddActivity={handleAddActivity}
            onVoteActivity={handleVoteActivity}
            onAddComment={handleAddComment}
            onDeleteTrip={handleDeleteTrip}
          />
        )}

        {currentTab === 'calendar' && (
          <TripCalendarView
            trips={trips}
            bookings={bookings}
            onSelectTrip={(id) => {
              setActiveTripId(id);
              setCurrentTab('trips');
            }}
          />
        )}

        {currentTab === 'bookings' && (
          <BookingsView
            bookings={bookings}
            trips={trips}
            currentUser={currentUser}
            onUpdateStatus={handleUpdateBookingStatus}
            onCreateBooking={handleCreateBooking}
            onDeleteBooking={handleDeleteBooking}
          />
        )}

        {currentTab === 'expenses' && (
          <ExpenseTrackerView
            expenses={expenses}
            trips={trips}
            currentUser={currentUser}
            onCreateExpense={handleCreateExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {currentTab === 'destinations' && (
          <DestinationsView
            destinations={destinations}
            currentUser={currentUser}
            onPlanTripForDestination={handlePlanTripForDestination}
            onOpenCreateDestination={() => setCurrentTab('admin')}
          />
        )}

        {currentTab === 'admin' && (
          <AdminView
            destinations={destinations}
            users={users}
            bookings={bookings}
            auditLogs={auditLogs}
            onUpdateDestination={handleUpdateDestination}
            onDeleteDestination={handleDeleteDestination}
            onCreateDestination={handleCreateDestination}
            onUpdateUserRole={handleUpdateUserRole}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (15% Viewport Cap) */}
      <nav className="md:hidden sticky bottom-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around text-[10px] font-medium text-slate-600">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 p-1 ${currentTab === 'dashboard' ? 'text-sky-600 font-bold' : ''}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setCurrentTab('trips')}
          className={`flex flex-col items-center gap-0.5 p-1 ${currentTab === 'trips' ? 'text-sky-600 font-bold' : ''}`}
        >
          <Compass className="w-4 h-4" />
          <span>Trips</span>
        </button>
        <button
          onClick={() => setCurrentTab('calendar')}
          className={`flex flex-col items-center gap-0.5 p-1 ${currentTab === 'calendar' ? 'text-sky-600 font-bold' : ''}`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Calendar</span>
        </button>
        <button
          onClick={() => setCurrentTab('bookings')}
          className={`flex flex-col items-center gap-0.5 p-1 ${currentTab === 'bookings' ? 'text-sky-600 font-bold' : ''}`}
        >
          <Plane className="w-4 h-4" />
          <span>Bookings</span>
        </button>
        <button
          onClick={() => setCurrentTab('expenses')}
          className={`flex flex-col items-center gap-0.5 p-1 ${currentTab === 'expenses' ? 'text-sky-600 font-bold' : ''}`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Expenses</span>
        </button>
      </nav>

      {/* Spring Boot & MySQL Architecture Modal */}
      <MysqlArchitectureModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
        onDataChanged={syncState}
      />

      {/* Plan New Trip Modal */}
      <NewTripModal
        isOpen={isNewTripModalOpen}
        onClose={() => {
          setIsNewTripModalOpen(false);
          setPreselectedDest(null);
        }}
        destinations={destinations}
        preselectedDestination={preselectedDest}
        onCreateTrip={handleCreateTrip}
        currentUserId={currentUser.id}
      />

      {/* Collaborative Share Modal */}
      {shareTripTarget && (
        <CollaborativeShareModal
          trip={shareTripTarget}
          currentUser={currentUser}
          onClose={() => setShareTripTarget(null)}
          onAddCollaborator={handleAddCollaborator}
          onRemoveCollaborator={handleRemoveCollaborator}
        />
      )}

    </div>
  );
}
