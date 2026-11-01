import React, { useState } from 'react';
import { Trip, Collaborator, User } from '../../types/travel';
import { 
  Share2, 
  Copy, 
  Check, 
  X, 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Eye, 
  Edit3, 
  Trash2,
  ExternalLink,
  Globe
} from 'lucide-react';

interface CollaborativeShareModalProps {
  trip: Trip;
  currentUser: User;
  onClose: () => void;
  onAddCollaborator: (tripId: string, collaborator: Omit<Collaborator, 'id' | 'joinedDate'>) => void;
  onRemoveCollaborator: (tripId: string, collabId: string) => void;
}

export const CollaborativeShareModal: React.FC<CollaborativeShareModalProps> = ({
  trip,
  currentUser,
  onClose,
  onAddCollaborator,
  onRemoveCollaborator,
}) => {
  const [copied, setCopied] = useState(false);
  const [collabName, setCollabName] = useState('');
  const [collabEmail, setCollabEmail] = useState('');
  const [collabRole, setCollabRole] = useState<'VIEWER' | 'EDITOR'>('EDITOR');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const shareUrl = `${window.location.origin}/trips/share/${trip.shareCode || 'TRIP-REF'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabEmail.trim()) return;

    onAddCollaborator(trip.id, {
      name: collabName.trim() || collabEmail.split('@')[0],
      email: collabEmail.trim(),
      role: collabRole,
      status: 'ACTIVE',
    });

    setCollabName('');
    setCollabEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">Collaborative Itinerary Sharing</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Share Link Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Unique Sharable Travel Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 truncate select-all">
                {shareUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Anyone with this link can view trip timelines, shared activities, and live updates.
            </p>
          </div>

          {/* Invite Form */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-sky-600" />
                Invite Co-Traveler
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Role-Based Access</span>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Full Name (optional)"
                  value={collabName}
                  onChange={(e) => setCollabName(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-500"
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address *"
                  value={collabEmail}
                  onChange={(e) => setCollabEmail(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-600 font-medium">Access Permission:</label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        checked={collabRole === 'EDITOR'}
                        onChange={() => setCollabRole('EDITOR')}
                        className="text-sky-600"
                      />
                      <span>Editor (Add & vote)</span>
                    </label>
                    <label className="flex items-center gap-1 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        checked={collabRole === 'VIEWER'}
                        onChange={() => setCollabRole('VIEWER')}
                        className="text-sky-600"
                      />
                      <span>Viewer (Read-only)</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>

          {/* Current Collaborators List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Current Planning Team ({trip.collaborators.length})
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">Real-time sync</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
              {trip.collaborators.map((c) => (
                <div key={c.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{c.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      c.role === 'EDITOR' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {c.role}
                    </span>

                    {c.userId !== currentUser.id && (
                      <button
                        onClick={() => onRemoveCollaborator(trip.id, c.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove collaborator"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Itinerary ID: <span className="font-mono text-slate-700 font-semibold">{trip.id}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
