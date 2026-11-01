import React, { useState } from 'react';
import { Trip, TripDay, ActivityItem, User } from '../../types/travel';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Trash2, 
  Compass,
  CheckCircle,
  Users,
  ChevronDown,
  ChevronUp,
  FileText,
  Printer
} from 'lucide-react';

interface TripPlannerViewProps {
  trips: Trip[];
  activeTripId?: string;
  currentUser: User;
  onSelectTrip: (tripId: string) => void;
  onOpenNewTripModal: () => void;
  onOpenShareModal: (trip: Trip) => void;
  onAddActivity: (tripId: string, dayId: string, activity: Omit<ActivityItem, 'id' | 'dayId' | 'votes' | 'comments'>) => void;
  onVoteActivity: (tripId: string, dayId: string, activityId: string, vote: 1 | -1) => void;
  onAddComment: (tripId: string, dayId: string, activityId: string, text: string) => void;
  onDeleteTrip: (tripId: string) => void;
}

export const TripPlannerView: React.FC<TripPlannerViewProps> = ({
  trips,
  activeTripId,
  currentUser,
  onSelectTrip,
  onOpenNewTripModal,
  onOpenShareModal,
  onAddActivity,
  onVoteActivity,
  onAddComment,
  onDeleteTrip,
}) => {
  const currentTrip = trips.find(t => t.id === activeTripId) || trips[0];
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  // New activity modal state
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [targetDayId, setTargetDayId] = useState<string>('');
  const [actTitle, setActTitle] = useState('');
  const [actTime, setActTime] = useState('09:00');
  const [actLocation, setActLocation] = useState('');
  const [actCost, setActCost] = useState('0');
  const [actCategory, setActCategory] = useState<'Sightseeing' | 'Dining' | 'Transport' | 'Leisure' | 'Tour'>('Sightseeing');
  const [actNotes, setActNotes] = useState('');

  // Comment expansion state
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  if (!currentTrip) {
    return (
      <div className="bg-white p-12 rounded-xl border border-slate-200 text-center max-w-xl mx-auto my-12">
        <Compass className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">No Travel Plans Found</h3>
        <p className="text-sm text-slate-500 mt-1 mb-6">Create your first itinerary to start planning multi-day activities.</p>
        <button
          onClick={onOpenNewTripModal}
          className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700"
        >
          Create New Trip
        </button>
      </div>
    );
  }

  const toggleComments = (actId: string) => {
    setExpandedComments(prev => ({ ...prev, [actId]: !prev[actId] }));
  };

  const handlePostComment = (dayId: string, actId: string) => {
    const text = commentInputs[actId]?.trim();
    if (!text) return;
    onAddComment(currentTrip.id, dayId, actId, text);
    setCommentInputs(prev => ({ ...prev, [actId]: '' }));
  };

  const handleOpenAddActivity = (dayId: string) => {
    setTargetDayId(dayId);
    setActTitle('');
    setActTime('10:00');
    setActLocation('');
    setActCost('0');
    setActNotes('');
    setIsAddingActivity(true);
  };

  const handleSubmitActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim()) return;
    onAddActivity(currentTrip.id, targetDayId, {
      title: actTitle.trim(),
      time: actTime,
      location: actLocation.trim() || 'Central',
      cost: parseFloat(actCost) || 0,
      category: actCategory,
      notes: actNotes.trim(),
    });
    setIsAddingActivity(false);
  };

  const totalActivitiesCount = currentTrip.days.reduce((acc, d) => acc + d.activities.length, 0);
  const estimatedActivitiesCost = currentTrip.days.reduce(
    (acc, d) => acc + d.activities.reduce((sum, a) => sum + (a.cost || 0), 0),
    0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Top Bar: Trip Selector & Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Trip:</label>
          <select
            value={currentTrip.id}
            onChange={(e) => onSelectTrip(e.target.value)}
            className="text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {trips.map(t => (
              <option key={t.id} value={t.id}>{t.title} ({t.destinationName})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenShareModal(currentTrip)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-sky-600" />
            Share & Collaborators ({currentTrip.collaborators?.length || 1})
          </button>
          <button
            onClick={onOpenNewTripModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Trip
          </button>
        </div>
      </div>

      {/* Hero Banner for Current Trip */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="relative h-60 w-full bg-slate-900">
          <img
            src={currentTrip.coverImage}
            alt={currentTrip.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
          
          <div className="absolute bottom-5 left-6 right-6 text-white flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-sky-300">
                {currentTrip.destinationName} · {currentTrip.status}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mt-1 text-white">
                {currentTrip.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-300 mt-2 font-mono tabular-nums">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {currentTrip.startDate} → {currentTrip.endDate}
                </span>
                <span>·</span>
                <span>{currentTrip.days.length} Total Days</span>
                <span>·</span>
                <span>Total Budget: ${currentTrip.totalBudget.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-mono tabular-nums">
                Est. Activities: ${estimatedActivitiesCost}
              </span>
            </div>
          </div>
        </div>

        {/* Trip Description & Collaborators Bar */}
        <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            {currentTrip.notes || 'No trip summary provided.'}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500">Planning Team:</span>
            <div className="flex -space-x-1.5">
              {currentTrip.collaborators.map((c, i) => (
                <div
                  key={i}
                  title={`${c.name} (${c.role})`}
                  className="w-6 h-6 rounded-full bg-sky-100 border border-white text-sky-800 text-[10px] font-bold flex items-center justify-center"
                >
                  {c.name.charAt(0)}
                </div>
              ))}
            </div>
            <button
              onClick={() => onOpenShareModal(currentTrip)}
              className="text-xs text-sky-600 hover:text-sky-800 font-medium ml-1"
            >
              + Invite
            </button>
          </div>
        </div>
      </div>

      {/* Days & Daily Activities Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Daily Itinerary Breakdown ({currentTrip.days.length} Days, {totalActivitiesCount} Activities)
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Shared in real-time with team
          </span>
        </div>

        <div className="space-y-6">
          {currentTrip.days.map((day) => (
            <div key={day.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              
              {/* Day Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                    D{day.dayNumber}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{day.title}</h3>
                    <div className="text-xs text-slate-500 font-mono tabular-nums">{day.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    {day.activities.length} activities · ${day.activities.reduce((s, a) => s + (a.cost || 0), 0)}
                  </span>
                  <button
                    onClick={() => handleOpenAddActivity(day.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Activity
                  </button>
                </div>
              </div>

              {/* Day Activities List */}
              <div className="p-4 space-y-3">
                {day.activities.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No activities scheduled for this day yet. Click "+ Add Activity" to plan visits, dining, or transfers.
                  </div>
                ) : (
                  day.activities.map((act) => {
                    const upvotesCount = act.votes?.filter(v => v.vote === 1).length || 0;
                    const hasUserVoted = act.votes?.some(v => v.userId === currentUser.id && v.vote === 1);
                    const commentsCount = act.comments?.length || 0;
                    const isCommentsOpen = !!expandedComments[act.id];

                    return (
                      <div
                        key={act.id}
                        className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-sky-700 tabular-nums">
                                {act.time}
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                {act.title}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                · {act.category}
                              </span>
                            </div>

                            <div className="text-xs text-slate-600 flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{act.location}</span>
                              {act.cost > 0 && (
                                <>
                                  <span>·</span>
                                  <span className="font-mono tabular-nums text-slate-700 font-medium">
                                    ${act.cost}
                                  </span>
                                </>
                              )}
                            </div>

                            {act.notes && (
                              <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                                {act.notes}
                              </p>
                            )}
                          </div>

                          {/* Activity Interaction: Votes & Comments */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Vote Button */}
                            <button
                              onClick={() => onVoteActivity(currentTrip.id, day.id, act.id, 1)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                                hasUserVoted
                                  ? 'bg-sky-100 text-sky-800 font-bold border border-sky-300'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              }`}
                              title="Upvote activity for collaborative plan"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span className="font-mono tabular-nums">{upvotesCount}</span>
                            </button>

                            {/* Comment Toggle Button */}
                            <button
                              onClick={() => toggleComments(act.id)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded text-xs transition-colors cursor-pointer"
                              title="View and write co-planner comments"
                            >
                              <MessageSquare className="w-3 h-3 text-slate-500" />
                              <span className="font-mono tabular-nums">{commentsCount}</span>
                              {isCommentsOpen ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Comment Thread */}
                        {isCommentsOpen && (
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 bg-slate-50/70 p-3 rounded-lg">
                            <div className="text-xs font-semibold text-slate-700 mb-2">
                              Collaborator Notes & Discussion ({commentsCount})
                            </div>

                            {act.comments && act.comments.length > 0 ? (
                              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {act.comments.map((comm) => (
                                  <div key={comm.id} className="text-xs bg-white p-2.5 rounded border border-slate-200">
                                    <div className="flex items-center justify-between text-slate-500 mb-1">
                                      <span className="font-semibold text-slate-800">{comm.userName}</span>
                                      <span className="font-mono text-[10px] tabular-nums">{comm.timestamp}</span>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed">{comm.text}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400 italic">No notes yet. Be the first to add feedback!</div>
                            )}

                            {/* Add comment input */}
                            <div className="flex items-center gap-2 pt-2">
                              <input
                                type="text"
                                value={commentInputs[act.id] || ''}
                                onChange={(e) => setCommentInputs({ ...commentInputs, [act.id]: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handlePostComment(day.id, act.id);
                                }}
                                placeholder="Add suggestions, tickets info, timings..."
                                className="flex-1 text-xs bg-white border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
                              />
                              <button
                                onClick={() => handlePostComment(day.id, act.id)}
                                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium rounded-md transition-colors cursor-pointer"
                              >
                                Post
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Activity Modal */}
      {isAddingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Itinerary Activity</h3>

            <form onSubmit={handleSubmitActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Guided Bamboo Grove Walk"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time (24h)</label>
                  <input
                    type="time"
                    value={actTime}
                    onChange={(e) => setActTime(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={actCategory}
                    onChange={(e) => setActCategory(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Dining">Dining</option>
                    <option value="Transport">Transport</option>
                    <option value="Leisure">Leisure</option>
                    <option value="Tour">Tour</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Higashiyama Ward"
                    value={actLocation}
                    onChange={(e) => setActLocation(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={actCost}
                    onChange={(e) => setActCost(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Ticket instructions, meeting spot, transit tips..."
                  value={actNotes}
                  onChange={(e) => setActNotes(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingActivity(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
