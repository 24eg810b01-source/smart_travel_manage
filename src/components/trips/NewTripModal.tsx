import React, { useState } from 'react';
import { Destination, Trip } from '../../types/travel';
import { X, Calendar, DollarSign, Compass } from 'lucide-react';

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinations: Destination[];
  preselectedDestination?: Destination | null;
  onCreateTrip: (tripData: Omit<Trip, 'id' | 'collaborators' | 'days'>) => void;
  currentUserId: string;
}

export const NewTripModal: React.FC<NewTripModalProps> = ({
  isOpen,
  onClose,
  destinations,
  preselectedDestination,
  onCreateTrip,
  currentUserId,
}) => {
  const initialDest = preselectedDestination || destinations[0];
  const [destinationId, setDestinationId] = useState(initialDest?.id || '');
  const [title, setTitle] = useState(initialDest ? `${initialDest.name} Adventure` : 'New Journey');
  const [startDate, setStartDate] = useState('2026-11-20');
  const [endDate, setEndDate] = useState('2026-11-26');
  const [totalBudget, setTotalBudget] = useState('3200');
  const [notes, setNotes] = useState('Explore top historic landmarks, local street foods, and scenic viewpoints.');

  if (!isOpen) return null;

  const handleDestinationChange = (id: string) => {
    setDestinationId(id);
    const dest = destinations.find(d => d.id === id);
    if (dest) {
      setTitle(`${dest.name} Discovery`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dest = destinations.find(d => d.id === destinationId) || destinations[0];
    onCreateTrip({
      userId: currentUserId,
      destinationId: dest.id,
      destinationName: dest.name,
      title: title.trim(),
      startDate,
      endDate,
      status: 'PLANNING',
      totalBudget: parseFloat(totalBudget) || 2500,
      coverImage: dest.image,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">Plan New Trip Itinerary</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Destination *</label>
            <select
              value={destinationId}
              onChange={(e) => handleDestinationChange(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white"
            >
              {destinations.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.country})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Itinerary Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Budget ($ USD)</label>
            <input
              type="number"
              min="0"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Trip Notes & Goals</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
              placeholder="Key photography spots, dining goals, transit requirements..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs cursor-pointer"
            >
              Generate Itinerary
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
