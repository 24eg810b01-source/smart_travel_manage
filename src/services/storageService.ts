import { 
  Destination, 
  Trip, 
  Booking, 
  Expense, 
  User, 
  SystemAuditLog, 
  MysqlConfig,
  BookingStatus,
  ActivityItem,
  TripDay,
  Collaborator
} from '../types/travel';
import { 
  initialDestinations, 
  initialTrips, 
  initialBookings, 
  initialExpenses, 
  initialUsers, 
  initialAuditLogs, 
  initialMysqlConfig 
} from '../data/seedData';

const STORAGE_KEYS = {
  DESTINATIONS: 'stms_destinations_v1',
  TRIPS: 'stms_trips_v1',
  BOOKINGS: 'stms_bookings_v1',
  EXPENSES: 'stms_expenses_v1',
  USERS: 'stms_users_v1',
  AUDIT_LOGS: 'stms_audit_logs_v1',
  CURRENT_USER_ID: 'stms_current_user_id_v1',
  MYSQL_CONFIG: 'stms_mysql_config_v1',
};

// Safe JSON parser
function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Failed to read ${key} from storage:`, e);
    return fallback;
  }
}

function safeSet<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to write ${key} to storage:`, e);
  }
}

class StorageService {
  // Read state
  getDestinations(): Destination[] {
    return safeGet<Destination[]>(STORAGE_KEYS.DESTINATIONS, initialDestinations);
  }

  saveDestinations(destinations: Destination[]): void {
    safeSet(STORAGE_KEYS.DESTINATIONS, destinations);
  }

  getTrips(): Trip[] {
    return safeGet<Trip[]>(STORAGE_KEYS.TRIPS, initialTrips);
  }

  saveTrips(trips: Trip[]): void {
    safeSet(STORAGE_KEYS.TRIPS, trips);
  }

  getBookings(): Booking[] {
    return safeGet<Booking[]>(STORAGE_KEYS.BOOKINGS, initialBookings);
  }

  saveBookings(bookings: Booking[]): void {
    safeSet(STORAGE_KEYS.BOOKINGS, bookings);
  }

  getExpenses(): Expense[] {
    return safeGet<Expense[]>(STORAGE_KEYS.EXPENSES, initialExpenses);
  }

  saveExpenses(expenses: Expense[]): void {
    safeSet(STORAGE_KEYS.EXPENSES, expenses);
  }

  getUsers(): User[] {
    return safeGet<User[]>(STORAGE_KEYS.USERS, initialUsers);
  }

  saveUsers(users: User[]): void {
    safeSet(STORAGE_KEYS.USERS, users);
  }

  getAuditLogs(): SystemAuditLog[] {
    return safeGet<SystemAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
  }

  addAuditLog(action: string, entity: string, details: string, status: 'SUCCESS' | 'WARNING' | 'ERROR' = 'SUCCESS'): void {
    const logs = this.getAuditLogs();
    const currentUser = this.getCurrentUser();
    const newLog: SystemAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: currentUser ? currentUser.name : 'System',
      action,
      entity,
      details,
      status,
    };
    safeSet(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs].slice(0, 100));
  }

  getCurrentUserId(): string {
    return safeGet<string>(STORAGE_KEYS.CURRENT_USER_ID, 'usr-1');
  }

  setCurrentUserId(id: string): void {
    safeSet(STORAGE_KEYS.CURRENT_USER_ID, id);
    const user = this.getUsers().find(u => u.id === id);
    if (user) {
      this.addAuditLog('USER_AUTH_SWITCH', 'Auth Context', `Switched session to ${user.name} (${user.role})`);
    }
  }

  getCurrentUser(): User {
    const users = this.getUsers();
    const currentId = this.getCurrentUserId();
    return users.find(u => u.id === currentId) || users[0];
  }

  getMysqlConfig(): MysqlConfig {
    return safeGet<MysqlConfig>(STORAGE_KEYS.MYSQL_CONFIG, initialMysqlConfig);
  }

  saveMysqlConfig(config: MysqlConfig): void {
    safeSet(STORAGE_KEYS.MYSQL_CONFIG, config);
  }

  // --- Trips Operations ---
  createTrip(newTrip: Omit<Trip, 'id' | 'collaborators' | 'days'>): Trip {
    const trips = this.getTrips();
    const currentUser = this.getCurrentUser();
    
    // Auto-generate days between startDate and endDate
    const days: TripDay[] = [];
    const start = new Date(newTrip.startDate);
    const end = new Date(newTrip.endDate);
    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1);
    
    for (let i = 0; i < Math.min(diffDays, 14); i++) {
      const curDate = new Date(start);
      curDate.setDate(curDate.getDate() + i);
      days.push({
        id: `day-${Date.now()}-${i}`,
        dayNumber: i + 1,
        date: curDate.toISOString().split('T')[0],
        title: `Day ${i + 1} Exploring`,
        activities: [],
      });
    }

    const trip: Trip = {
      ...newTrip,
      id: `trip-${Date.now()}`,
      shareCode: `TRIP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      collaborators: [
        {
          id: `collab-${Date.now()}`,
          userId: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: 'EDITOR',
          status: 'ACTIVE',
          joinedDate: new Date().toISOString().split('T')[0],
        },
      ],
      days,
    };

    this.saveTrips([trip, ...trips]);
    this.addAuditLog('TRIP_CREATE', `Trip #${trip.id}`, `Created itinerary '${trip.title}' for ${trip.destinationName}`);
    return trip;
  }

  updateTrip(updatedTrip: Trip): void {
    const trips = this.getTrips();
    const idx = trips.findIndex(t => t.id === updatedTrip.id);
    if (idx !== -1) {
      trips[idx] = updatedTrip;
      this.saveTrips(trips);
      this.addAuditLog('TRIP_UPDATE', `Trip #${updatedTrip.id}`, `Updated itinerary '${updatedTrip.title}'`);
    }
  }

  deleteTrip(tripId: string): void {
    const trips = this.getTrips();
    const trip = trips.find(t => t.id === tripId);
    this.saveTrips(trips.filter(t => t.id !== tripId));
    if (trip) {
      this.addAuditLog('TRIP_DELETE', `Trip #${tripId}`, `Removed trip itinerary '${trip.title}'`, 'WARNING');
    }
  }

  addActivity(tripId: string, dayId: string, activity: Omit<ActivityItem, 'id' | 'dayId' | 'votes' | 'comments'>): void {
    const trips = this.getTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const day = trip.days.find(d => d.id === dayId);
    if (!day) return;

    const newAct: ActivityItem = {
      ...activity,
      id: `act-${Date.now()}`,
      dayId,
      votes: [{ userId: this.getCurrentUserId(), vote: 1 }],
      comments: [],
    };

    day.activities.push(newAct);
    this.updateTrip(trip);
    this.addAuditLog('ACTIVITY_ADD', `Trip #${tripId}`, `Scheduled '${activity.title}' on Day ${day.dayNumber}`);
  }

  voteActivity(tripId: string, dayId: string, activityId: string, voteVal: 1 | -1): void {
    const trips = this.getTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const day = trip.days.find(d => d.id === dayId);
    if (!day) return;
    const act = day.activities.find(a => a.id === activityId);
    if (!act) return;

    const currentUserId = this.getCurrentUserId();
    const existingIdx = act.votes.findIndex(v => v.userId === currentUserId);
    if (existingIdx !== -1) {
      if (act.votes[existingIdx].vote === voteVal) {
        // Toggle off
        act.votes.splice(existingIdx, 1);
      } else {
        act.votes[existingIdx].vote = voteVal;
      }
    } else {
      act.votes.push({ userId: currentUserId, vote: voteVal });
    }

    this.updateTrip(trip);
  }

  addActivityComment(tripId: string, dayId: string, activityId: string, text: string): void {
    const trips = this.getTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const day = trip.days.find(d => d.id === dayId);
    if (!day) return;
    const act = day.activities.find(a => a.id === activityId);
    if (!act) return;

    const currentUser = this.getCurrentUser();
    act.comments.push({
      id: `comm-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });

    this.updateTrip(trip);
  }

  // --- Real-time Bookings Operations ---
  createBooking(newBooking: Omit<Booking, 'id' | 'liveUpdates'>): Booking {
    const bookings = this.getBookings();
    const currentUser = this.getCurrentUser();
    const bkg: Booking = {
      ...newBooking,
      id: `bkg-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      liveUpdates: [
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: newBooking.status,
          message: `Booking created via Spring Boot REST API for ${newBooking.provider}.`,
        },
      ],
    };

    this.saveBookings([bkg, ...bookings]);
    this.addAuditLog('BOOKING_CREATE', `Booking #${bkg.id}`, `Reserved ${bkg.type} with ${bkg.provider} (PNR ${bkg.confirmationCode})`);
    return bkg;
  }

  updateBookingStatus(bookingId: string, newStatus: BookingStatus, customMessage?: string): Booking | null {
    const bookings = this.getBookings();
    const bkg = bookings.find(b => b.id === bookingId);
    if (!bkg) return null;

    bkg.status = newStatus;
    const defaultMessages: Record<BookingStatus, string> = {
      PENDING: 'Reservation queued. Awaiting provider confirmation.',
      CONFIRMED: 'Reservation confirmed by provider systems.',
      IN_TRANSIT: 'Live transit initiated. Passenger checked-in or en route.',
      COMPLETED: 'Service completed. Invoice finalized.',
      CANCELLED: 'Booking cancelled. Refund processing initiated.',
    };

    bkg.liveUpdates.unshift({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: newStatus,
      message: customMessage || defaultMessages[newStatus],
      locationOrGate: bkg.terminalGate,
    });

    this.saveBookings(bookings);
    this.addAuditLog('BOOKING_STATUS_CHANGE', `Booking #${bkg.id}`, `Status shifted to ${newStatus}`);
    return bkg;
  }

  deleteBooking(bookingId: string): void {
    const bookings = this.getBookings();
    this.saveBookings(bookings.filter(b => b.id !== bookingId));
    this.addAuditLog('BOOKING_DELETE', `Booking #${bookingId}`, 'Deleted booking entry', 'WARNING');
  }

  // --- Expenses Operations ---
  createExpense(expense: Omit<Expense, 'id'>): Expense {
    const expenses = this.getExpenses();
    const newExp: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
    };
    this.saveExpenses([newExp, ...expenses]);
    this.addAuditLog('EXPENSE_ADD', `Expense #${newExp.id}`, `Recorded ${newExp.amount} ${newExp.currency} for ${newExp.title}`);
    return newExp;
  }

  deleteExpense(expenseId: string): void {
    const expenses = this.getExpenses();
    this.saveExpenses(expenses.filter(e => e.id !== expenseId));
    this.addAuditLog('EXPENSE_DELETE', `Expense #${expenseId}`, 'Deleted expense record');
  }

  // --- Collaborator Management ---
  addCollaborator(tripId: string, collaborator: Omit<Collaborator, 'id' | 'joinedDate'>): void {
    const trips = this.getTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const newCollab: Collaborator = {
      ...collaborator,
      id: `collab-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    trip.collaborators.push(newCollab);
    this.updateTrip(trip);
    this.addAuditLog('COLLAB_INVITE', `Trip #${tripId}`, `Invited ${collaborator.name} (${collaborator.email}) as ${collaborator.role}`);
  }

  removeCollaborator(tripId: string, collabId: string): void {
    const trips = this.getTrips();
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    trip.collaborators = trip.collaborators.filter(c => c.id !== collabId);
    this.updateTrip(trip);
    this.addAuditLog('COLLAB_REMOVE', `Trip #${tripId}`, `Removed collaborator #${collabId}`);
  }

  // --- Admin Destination Management ---
  createDestination(dest: Omit<Destination, 'id'>): Destination {
    const destinations = this.getDestinations();
    const newDest: Destination = {
      ...dest,
      id: `dest-${Date.now()}`,
    };
    this.saveDestinations([newDest, ...destinations]);
    this.addAuditLog('DESTINATION_CREATE', `Destination #${newDest.id}`, `Admin added destination ${newDest.name}, ${newDest.country}`);
    return newDest;
  }

  updateDestination(dest: Destination): void {
    const destinations = this.getDestinations();
    const idx = destinations.findIndex(d => d.id === dest.id);
    if (idx !== -1) {
      destinations[idx] = dest;
      this.saveDestinations(destinations);
      this.addAuditLog('DESTINATION_UPDATE', `Destination #${dest.id}`, `Admin updated destination ${dest.name}`);
    }
  }

  deleteDestination(destId: string): void {
    const destinations = this.getDestinations();
    this.saveDestinations(destinations.filter(d => d.id !== destId));
    this.addAuditLog('DESTINATION_DELETE', `Destination #${destId}`, 'Admin removed destination catalog entry', 'WARNING');
  }

  // --- SQL Query Simulator ---
  executeSql(query: string): { columns: string[]; rows: (string | number)[][]; message: string } {
    const cleanQuery = query.trim().toUpperCase();
    this.addAuditLog('SQL_EXECUTE', 'MySQL Engine', `Executed: ${query.substring(0, 60)}...`);

    if (cleanQuery.includes('FROM BOOKINGS')) {
      const bookings = this.getBookings();
      return {
        columns: ['id', 'confirmation_code', 'provider', 'type', 'status', 'cost', 'trip_title'],
        rows: bookings.map(b => [b.id, b.confirmationCode, b.provider, b.type, b.status, `$${b.cost}`, b.tripTitle]),
        message: `${bookings.length} row(s) returned from table 'bookings'.`,
      };
    } else if (cleanQuery.includes('FROM TRIPS')) {
      const trips = this.getTrips();
      return {
        columns: ['id', 'title', 'destination_name', 'start_date', 'end_date', 'status', 'total_budget'],
        rows: trips.map(t => [t.id, t.title, t.destinationName, t.startDate, t.endDate, t.status, `$${t.totalBudget}`]),
        message: `${trips.length} row(s) returned from table 'trips'.`,
      };
    } else if (cleanQuery.includes('FROM EXPENSES')) {
      const expenses = this.getExpenses();
      return {
        columns: ['id', 'title', 'category', 'amount', 'currency', 'date', 'paid_by', 'status'],
        rows: expenses.map(e => [e.id, e.title, e.category, e.amount, e.currency, e.date, e.paidBy, e.status]),
        message: `${expenses.length} row(s) returned from table 'expenses'.`,
      };
    } else if (cleanQuery.includes('FROM USERS')) {
      const users = this.getUsers();
      return {
        columns: ['id', 'name', 'email', 'role', 'department', 'member_since'],
        rows: users.map(u => [u.id, u.name, u.email, u.role, u.department || 'N/A', u.memberSince]),
        message: `${users.length} row(s) returned from table 'users'.`,
      };
    } else if (cleanQuery.includes('FROM DESTINATIONS')) {
      const destinations = this.getDestinations();
      return {
        columns: ['id', 'name', 'country', 'continent', 'category', 'avg_daily_cost', 'rating'],
        rows: destinations.map(d => [d.id, d.name, d.country, d.continent, d.category, `$${d.avgDailyCost}`, d.rating]),
        message: `${destinations.length} row(s) returned from table 'destinations'.`,
      };
    } else {
      return {
        columns: ['status', 'message', 'mysql_version', 'database'],
        rows: [['OK', 'Query executed successfully against MySQL 8.0.35 InnoDB', '8.0.35-commercial', 'smart_travel_db']],
        message: '1 row returned. MySQL session: root@localhost:3306/smart_travel_db',
      };
    }
  }

  // Reset to factory seed data
  resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.DESTINATIONS);
    localStorage.removeItem(STORAGE_KEYS.TRIPS);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.MYSQL_CONFIG);
  }
}

export const storageService = new StorageService();
