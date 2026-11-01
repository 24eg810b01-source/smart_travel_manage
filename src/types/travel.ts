/**
 * Core type definitions for Smart Travel Management System
 * Representing Spring Boot Entities and MySQL schemas
 */

export type UserRole = 'USER' | 'ADMIN' | 'CO_PLANNER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  department?: string;
  memberSince: string;
}

export type DestinationCategory = 'Cultural' | 'Adventure' | 'Relaxation' | 'Urban' | 'Nature';
export type BudgetLevel = '$' | '$$' | '$$$' | '$$$$';

export interface Destination {
  id: string;
  name: string;
  country: string;
  continent: 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania' | 'Africa';
  image: string;
  description: string;
  category: DestinationCategory;
  budgetLevel: BudgetLevel;
  bestSeason: string;
  currency: string;
  avgDailyCost: number;
  rating: number;
  popularAttractions: string[];
  travelTips: string[];
  status: 'ACTIVE' | 'FEATURED' | 'ARCHIVED';
}

export type TripStatus = 'PLANNING' | 'CONFIRMED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface ActivityComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: string;
}

export interface ActivityItem {
  id: string;
  dayId: string;
  time: string;
  title: string;
  location: string;
  cost: number;
  category: 'Sightseeing' | 'Dining' | 'Transport' | 'Leisure' | 'Tour';
  notes?: string;
  votes: { userId: string; vote: 1 | -1 }[];
  comments: ActivityComment[];
}

export interface TripDay {
  id: string;
  dayNumber: number;
  date: string;
  title: string;
  activities: ActivityItem[];
}

export interface Collaborator {
  id: string;
  userId?: string;
  name: string;
  email: string;
  role: 'VIEWER' | 'EDITOR';
  status: 'ACTIVE' | 'INVITED';
  joinedDate: string;
}

export interface Trip {
  id: string;
  userId: string;
  destinationId: string;
  destinationName: string;
  title: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  totalBudget: number;
  coverImage: string;
  notes?: string;
  collaborators: Collaborator[];
  days: TripDay[];
  shareCode?: string;
}

export type BookingType = 'FLIGHT' | 'HOTEL' | 'TRAIN' | 'ACTIVITY' | 'CAR_RENTAL';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export interface BookingUpdate {
  timestamp: string;
  status: BookingStatus;
  message: string;
  locationOrGate?: string;
}

export interface Booking {
  id: string;
  tripId: string;
  tripTitle: string;
  userId: string;
  userName: string;
  type: BookingType;
  provider: string;
  confirmationCode: string;
  referenceNo: string;
  title: string;
  details: string;
  startDateTime: string;
  endDateTime: string;
  cost: number;
  currency: string;
  status: BookingStatus;
  seatOrRoom?: string;
  terminalGate?: string;
  liveUpdates: BookingUpdate[];
}

export type ExpenseCategory = 'Flights' | 'Lodging' | 'Dining' | 'Transit' | 'Activities' | 'Shopping' | 'Misc';

export interface Expense {
  id: string;
  tripId: string;
  userId: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  date: string;
  paidBy: string;
  splitWith: string[];
  receiptRef?: string;
  status: 'PAID' | 'PENDING' | 'REIMBURSED' | 'SPLIT';
  notes?: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entity: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
}

export interface MysqlConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  status: 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';
  poolSize: number;
  activeConnections: number;
}
