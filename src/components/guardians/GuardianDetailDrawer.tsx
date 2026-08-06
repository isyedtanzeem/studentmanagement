import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  DollarSign,
  Calendar,
  Building,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { Guardian } from '../../types/guardian';

interface GuardianDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  guardian: Guardian | null;
  onEdit?: (guardian: Guardian) => void;
}

export const GuardianDetailDrawer: React.FC<GuardianDetailDrawerProps> = ({
  isOpen,
  onClose,
  guardian,
  onEdit
}) => {
  if (!isOpen || !guardian) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200"
        >
          {/* Top Banner Header */}
          <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Users className="w-48 h-48 text-indigo-400" />
            </div>

            <div className="flex items-center justify-between relative z-10 mb-4">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {guardian.guardianId}
              </span>

              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(guardian)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{guardian.guardianName}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    guardian.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {guardian.status}
                </span>
              </div>
              <p className="text-xs text-indigo-200 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Relationship: <strong className="text-white">{guardian.relationship}</strong>
                {guardian.occupation && ` • ${guardian.occupation}`}
              </p>
            </div>
          </div>

          {/* Quick Actions Strip */}
          <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-3 flex items-center justify-around text-xs">
            <a
              href={`tel:${guardian.primaryPhone}`}
              className="flex items-center gap-1.5 text-indigo-700 font-semibold hover:underline"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              {guardian.primaryPhone}
            </a>
            {guardian.email && (
              <a
                href={`mailto:${guardian.email}`}
                className="flex items-center gap-1.5 text-indigo-700 font-semibold hover:underline"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                {guardian.email}
              </a>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Parent Profiles Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                Parent Profiles
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {/* Father Box */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-indigo-600 tracking-wider">
                      Father's Details
                    </span>
                    {guardian.fatherOccupation && (
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {guardian.fatherOccupation}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-bold text-slate-900">{guardian.fatherName}</p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                    {guardian.fatherPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {guardian.fatherPhone}
                      </span>
                    )}
                    {guardian.fatherEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {guardian.fatherEmail}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mother Box */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-purple-600 tracking-wider">
                      Mother's Details
                    </span>
                    {guardian.motherOccupation && (
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {guardian.motherOccupation}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-bold text-slate-900">{guardian.motherName}</p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                    {guardian.motherPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {guardian.motherPhone}
                      </span>
                    )}
                    {guardian.motherEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {guardian.motherEmail}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Emergency Hotline Contact
              </h3>

              <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-900">
                      {guardian.emergencyContactName}
                    </p>
                    <p className="text-[11px] text-amber-700">
                      Relationship: {guardian.emergencyRelationship}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-200 text-amber-900">
                    Emergency Hotline
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-amber-200/60">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Primary Emergency Phone</span>
                    <a
                      href={`tel:${guardian.emergencyContactPhone}`}
                      className="font-bold text-amber-900 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-amber-600" />
                      {guardian.emergencyContactPhone}
                    </a>
                  </div>

                  {guardian.emergencyContactAltPhone && (
                    <div>
                      <span className="text-slate-500 text-[10px] block">Alternate Emergency Phone</span>
                      <a
                        href={`tel:${guardian.emergencyContactAltPhone}`}
                        className="font-semibold text-amber-900 hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-amber-600" />
                        {guardian.emergencyContactAltPhone}
                      </a>
                    </div>
                  )}
                </div>

                {guardian.emergencyAddress && (
                  <div className="text-xs pt-1 border-t border-amber-200/60 text-amber-800">
                    <span className="text-[10px] text-slate-500 block">Emergency Station Address</span>
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                      {guardian.emergencyAddress}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Permanent Residence Address */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Permanent Residence Address
              </h3>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <p className="font-semibold text-slate-800">{guardian.residentialAddress}</p>
                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block">City & State</span>
                    <span className="font-bold text-slate-800">
                      {guardian.city}, {guardian.state}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Zip Code & Country</span>
                    <span className="font-bold text-slate-800">
                      {guardian.zipCode || 'N/A'}, {guardian.country}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapped Enrolled Students */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  Mapped Enrolled Students
                </span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">
                  {guardian.mappedStudents ? guardian.mappedStudents.length : 0} Linked
                </span>
              </h3>

              <div className="space-y-2">
                {guardian.mappedStudents && guardian.mappedStudents.length > 0 ? (
                  guardian.mappedStudents.map(std => (
                    <div
                      key={std.id}
                      className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{std.fullName}</p>
                        <p className="text-[11px] text-purple-700 font-mono">
                          ID: {std.studentId} • {std.department}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-200 text-purple-900">
                        {std.status || 'Active'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl text-center">
                    No active student profiles currently mapped to this guardian.
                  </p>
                )}
              </div>
            </div>

            {/* Income & Metadata */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Annual Family Income</span>
                <span className="font-bold text-slate-800">
                  {guardian.annualIncome
                    ? `₹${guardian.annualIncome.toLocaleString('en-IN')} / year`
                    : 'Not Specified'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Registered Date</span>
                <span className="font-bold text-slate-800">
                  {new Date(guardian.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
            >
              Close Drawer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
