import React, { useState } from 'react';
import { Destination, User, Booking, SystemAuditLog } from '../../types/travel';
import { 
  ShieldCheck, 
  MapPin, 
  Users, 
  Ticket, 
  History, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Database
} from 'lucide-react';

interface AdminViewProps {
  destinations: Destination[];
  users: User[];
  bookings: Booking[];
  auditLogs: SystemAuditLog[];
  onUpdateDestination: (dest: Destination) => void;
  onDeleteDestination: (destId: string) => void;
  onCreateDestination: (dest: Omit<Destination, 'id'>) => void;
  onUpdateUserRole: (userId: string, newRole: 'USER' | 'ADMIN' | 'CO_PLANNER') => void;
  onUpdateBookingStatus: (bookingId: string, status: any) => void;
  onOpenDatabaseModal: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  destinations,
  users,
  bookings,
  auditLogs,
  onUpdateDestination,
  onDeleteDestination,
  onCreateDestination,
  onUpdateUserRole,
  onUpdateBookingStatus,
  onOpenDatabaseModal,
}) => {
  const [adminTab, setAdminTab] = useState<'destinations' | 'users' | 'bookings' | 'audit'>('destinations');
  
  // Destination form modal state
  const [isEditingDest, setIsEditingDest] = useState<Destination | null>(null);
  const [isCreatingDest, setIsCreatingDest] = useState(false);
  const [destName, setDestName] = useState('');
  const [destCountry, setDestCountry] = useState('');
  const [destContinent, setDestContinent] = useState<'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania' | 'Africa'>('Europe');
  const [destCategory, setDestCategory] = useState<'Cultural' | 'Nature' | 'Relaxation' | 'Urban' | 'Adventure'>('Cultural');
  const [destAvgCost, setDestAvgCost] = useState('200');
  const [destRating, setDestRating] = useState('4.8');
  const [destCurrency, setDestCurrency] = useState('EUR (€)');
  const [destSeason, setDestSeason] = useState('May to October');
  const [destDesc, setDestDesc] = useState('');

  const handleStartCreateDest = () => {
    setDestName('');
    setDestCountry('');
    setDestContinent('Europe');
    setDestCategory('Cultural');
    setDestAvgCost('220');
    setDestRating('4.8');
    setDestCurrency('EUR (€)');
    setDestSeason('Summer & Autumn');
    setDestDesc('');
    setIsCreatingDest(true);
  };

  const handleSaveNewDest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destName.trim() || !destCountry.trim()) return;

    onCreateDestination({
      name: destName.trim(),
      country: destCountry.trim(),
      continent: destContinent,
      category: destCategory,
      image: '/src/assets/images/destination_santorini_greece_1793293340175.jpg',
      description: destDesc.trim() || 'Curated travel haven with scenic views and cultural landmarks.',
      budgetLevel: '$$$',
      bestSeason: destSeason,
      currency: destCurrency,
      avgDailyCost: parseFloat(destAvgCost) || 200,
      rating: parseFloat(destRating) || 4.8,
      popularAttractions: ['City Center', 'Historic Castle', 'Cathedral Square', 'Culinary Market'],
      travelTips: ['Book transit passes early', 'Carry valid travel documents'],
      status: 'ACTIVE',
    });

    setIsCreatingDest(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              System Administration Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Full control over destination catalog, user roles, system bookings, and MySQL audit logs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDatabaseModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-sky-600" />
            MySQL Schema & Config
          </button>
        </div>
      </div>

      {/* Admin KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Catalog Destinations</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">{destinations.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Registered Accounts</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">{users.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Global Bookings</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">{bookings.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Audit Log Records</div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">{auditLogs.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { id: 'destinations', label: 'Destinations Manager', icon: MapPin },
          { id: 'users', label: 'User Roles & RBAC', icon: Users },
          { id: 'bookings', label: 'Booking Oversight', icon: Ticket },
          { id: 'audit', label: 'System Audit Logs', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Destinations Management */}
      {adminTab === 'destinations' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Destination Directory</h3>
            <button
              onClick={handleStartCreateDest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Destination
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Country / Continent</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Avg Daily Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {destinations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{d.name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{d.description}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {d.country} · {d.continent}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {d.category}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-900 font-semibold">
                      ${d.avgDailyCost}/day
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete destination '${d.name}' from catalog?`)) {
                            onDeleteDestination(d.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: User Roles & RBAC */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">User Accounts & Roles</h3>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Member Since</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4 text-right">Modify Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                        <span className="font-bold text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                    <td className="py-3 px-4 text-slate-500">{u.department || 'N/A'}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-500">{u.memberSince}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' :
                        u.role === 'CO_PLANNER' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => onUpdateUserRole(u.id, e.target.value as any)}
                        className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                      >
                        <option value="USER">USER</option>
                        <option value="CO_PLANNER">CO_PLANNER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Global Bookings */}
      {adminTab === 'bookings' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">All System Bookings</h3>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">PNR / Ref</th>
                  <th className="py-3 px-4">Provider & Service</th>
                  <th className="py-3 px-4">Passenger</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Override Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{b.confirmationCode}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{b.provider}</div>
                      <div className="text-[11px] text-slate-500">{b.title}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{b.userName}</td>
                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900">${b.cost}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold">{b.status}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={b.status}
                        onChange={(e) => onUpdateBookingStatus(b.id, e.target.value)}
                        className="text-xs border border-slate-200 rounded px-2 py-1 bg-white font-mono"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="IN_TRANSIT">IN_TRANSIT</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {adminTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">System Transaction & Audit Trail</h3>
            <span className="text-xs text-slate-400 font-mono">Real-time ledger events</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">Actor</th>
                    <th className="py-2.5 px-4">Action</th>
                    <th className="py-2.5 px-4">Entity</th>
                    <th className="py-2.5 px-4">Details</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 text-slate-500 tabular-nums whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{log.actor}</td>
                      <td className="py-2.5 px-4 text-sky-700">{log.action}</td>
                      <td className="py-2.5 px-4 text-slate-600">{log.entity}</td>
                      <td className="py-2.5 px-4 text-slate-600 font-sans max-w-sm truncate">{log.details}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Destination Modal */}
      {isCreatingDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Curated Destination</h3>

            <form onSubmit={handleSaveNewDest} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amalfi Coast"
                    value={destName}
                    onChange={(e) => setDestName(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Italy"
                    value={destCountry}
                    onChange={(e) => setDestCountry(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Continent</label>
                  <select
                    value={destContinent}
                    onChange={(e) => setDestContinent(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="North America">North America</option>
                    <option value="South America">South America</option>
                    <option value="Oceania">Oceania</option>
                    <option value="Africa">Africa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={destCategory}
                    onChange={(e) => setDestCategory(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="Cultural">Cultural</option>
                    <option value="Nature">Nature</option>
                    <option value="Relaxation">Relaxation</option>
                    <option value="Urban">Urban</option>
                    <option value="Adventure">Adventure</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Avg Daily Cost ($)</label>
                  <input
                    type="number"
                    value={destAvgCost}
                    onChange={(e) => setDestAvgCost(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Best Season</label>
                  <input
                    type="text"
                    value={destSeason}
                    onChange={(e) => setDestSeason(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={destDesc}
                  onChange={(e) => setDestDesc(e.target.value)}
                  placeholder="Scenic highlights, activities, culinary traditions..."
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingDest(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                >
                  Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
