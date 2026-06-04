'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Stethoscope,
  ChevronDown
} from 'lucide-react';
import type { Doctor } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (doctorId: string, scheduledAt: Date, notes: string) => void;
  doctors: Doctor[];
}

export const SchedulingModal: React.FC<Props> = ({ isOpen, onClose, onSchedule, doctors }) => {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
      setShowError(false);
    }
  }, [isOpen]);

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const timeSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    for (let minute of [0, 30]) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(time);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    const scheduledAt = new Date(`${selectedDate}T${selectedTime}`);
    onSchedule(selectedDoctor, scheduledAt, notes);
  };

  const selectedDoctorInfo = doctors.find(d => d.id === selectedDoctor);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Consultation" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-3">
          <div className="bg-linear-to-br from-indigo-600 to-purple-600 p-2.5 rounded-lg shadow-md">
            <Calendar className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">New Appointment</h2>
            <p className="text-xs text-slate-500">Select a provider and time slot</p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Error Alert */}
          {showError && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2 animate-in slide-in-from-top">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-800">Missing Required Fields</p>
                <p className="text-xs text-red-600">Please complete the form to continue.</p>
              </div>
            </div>
          )}

          {/* Doctor Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Stethoscope className="w-3.5 h-3.5 text-blue-500" /> Specialist
            </label>
            <div className="relative">
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                         bg-white text-sm text-slate-800 font-medium appearance-none cursor-pointer
                         transition-all"
                required
              >
                <option value="" className="text-slate-400">Select Doctor...</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.fullName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {selectedDoctorInfo && (
              <p className="text-xs text-blue-600 pl-1 pt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified Specialist
              </p>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                         bg-white text-sm text-slate-800 font-medium cursor-pointer transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Clock className="w-3.5 h-3.5 text-purple-500" /> Time
              </label>
              <div className="relative">
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                           bg-white text-sm text-slate-800 font-medium appearance-none cursor-pointer transition-all"
                  required
                >
                  <option value="">Select...</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <FileText className="w-3.5 h-3.5 text-indigo-500" /> Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                       bg-white text-sm text-slate-800 resize-none min-h-[80px]
                       placeholder:text-slate-400 transition-all"
              placeholder="Reason for consultation..."
            />
          </div>

          {/* Compact Summary Card */}
          {selectedDoctor && selectedDate && selectedTime && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 animate-in fade-in slide-in-from-bottom duration-300">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Booking Summary</h4>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Specialist</p>
                  <p className="text-sm font-bold text-slate-700 truncate">Dr. {selectedDoctorInfo?.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Schedule</p>
                  <p className="text-sm font-bold text-slate-700">
                    {new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {selectedTime}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 rounded-lg 
                       text-sm text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800
                       transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-linear-to-r from-blue-600 to-indigo-600 
                       text-white text-sm font-semibold rounded-lg 
                       hover:from-blue-700 hover:to-indigo-700 
                       shadow-md hover:shadow-lg
                       transition-all active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};