import React, { useState } from 'react';
import { Destination, DestinationCategory, BudgetLevel, User } from '../../types/travel';
import { 
  Search, 
  MapPin, 
  Star, 
  Calendar, 
  DollarSign, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  X, 
  Info,
  CheckCircle2,
  Plus
} from 'lucide-react';

interface DestinationsViewProps {
  destinations: Destination[];
  currentUser: User;
  onPlanTripForDestination: (destination: Destination) => void;
  onOpenCreateDestination?: () => void;
}

export const DestinationsView: React.FC<DestinationsViewProps> = ({
  destinations,
  currentUser,
  onPlanTripForDestination,
  onOpenCreateDestination,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDestinationForModal, setSelectedDestinationForModal] = useState<Destination | null>(null);

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch = 
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.popularAttractions.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesContinent = selectedContinent === 'ALL' || dest.continent === selectedContinent;
    const matchesCategory = selectedCategory === 'ALL' || dest.category === selectedCategory;

    return matchesSearch && matchesContinent && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Curated Global Destinations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Explore world heritage sites, seasonal best times, daily cost indices, and travel tips
          </p>
        </div>

        {currentUser.role === 'ADMIN' && onOpenCreateDestination && (
          <button
            onClick={onOpenCreateDestination}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Destination (Admin)
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search destination, country, landmarks (e.g. Kyoto, Alps, Fushimi Inari)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Continent Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {['ALL', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'].map((cont) => (
              <button
                key={cont}
                onClick={() => setSelectedContinent(cont)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedContinent === cont
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cont === 'ALL' ? 'All Continents' : cont}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {['ALL', 'Cultural', 'Nature', 'Relaxation', 'Urban'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'ALL' ? 'All Styles' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Destination Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredDestinations.map((dest) => (
          <div
            key={dest.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all group flex flex-col justify-between"
          >
            {/* Image Thumbnail with measured scrim */}
            <div className="relative h-60 w-full bg-slate-900 overflow-hidden">
              <img
                src={dest.image}
                alt={dest.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md font-mono flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{dest.rating}</span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-xs uppercase tracking-wider text-sky-300 font-medium">
                  {dest.country} · {dest.continent}
                </div>
                <h3 className="text-xl font-bold mt-0.5 text-white">
                  {dest.name}
                </h3>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {dest.description}
                </p>

                {/* Unboxed Metadata (Zero-Pill Rule) */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
                  <span>Category: {dest.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>Avg: ${dest.avgDailyCost}/day</span>
                  <span aria-hidden="true">·</span>
                  <span>Currency: {dest.currency}</span>
                  <span aria-hidden="true">·</span>
                  <span>Budget: {dest.budgetLevel}</span>
                </div>

                {/* Popular Attractions */}
                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Key Highlights
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dest.popularAttractions.map((attr, idx) => (
                      <span
                        key={idx}
                        className="text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-medium"
                      >
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedDestinationForModal(dest)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  View Travel Guide
                </button>

                <button
                  onClick={() => onPlanTripForDestination(dest)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Plan Trip Here
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Destination Detail Guide Modal */}
      {selectedDestinationForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="relative h-56 w-full bg-slate-900">
              <img
                src={selectedDestinationForModal.image}
                alt={selectedDestinationForModal.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              
              <button
                onClick={() => setSelectedDestinationForModal(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <div className="text-xs uppercase tracking-wider text-sky-300">
                  {selectedDestinationForModal.country} · {selectedDestinationForModal.continent}
                </div>
                <h2 className="text-2xl font-bold mt-0.5">
                  {selectedDestinationForModal.name}
                </h2>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                {selectedDestinationForModal.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block font-sans text-[10px]">BEST SEASON</span>
                  <span className="font-semibold text-slate-800">{selectedDestinationForModal.bestSeason}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans text-[10px]">AVG COST</span>
                  <span className="font-semibold text-slate-800">${selectedDestinationForModal.avgDailyCost}/day</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans text-[10px]">LOCAL CURRENCY</span>
                  <span className="font-semibold text-slate-800">{selectedDestinationForModal.currency}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-sans text-[10px]">RATING</span>
                  <span className="font-semibold text-slate-800">{selectedDestinationForModal.rating} / 5.0</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Recommended Travel & Preparation Tips
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {selectedDestinationForModal.travelTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedDestinationForModal(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const target = selectedDestinationForModal;
                  setSelectedDestinationForModal(null);
                  onPlanTripForDestination(target);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
              >
                Start Itinerary For This Destination
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
