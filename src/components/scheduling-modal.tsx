'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Calendar, Clock, User, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
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

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
      setShowError(false);
    }
  }, [isOpen]);

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Generate time slots (9 AM to 5 PM, 30-min intervals)
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
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Consultation" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        
        {/* Error Alert */}
        {showError && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3 animate-in slide-in-from-top">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Missing Required Fields</p>
              <p className="text-sm text-red-600 mt-1">Please fill in all required fields before continuing.</p>
            </div>
          </div>
        )}

        {/* Doctor Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            Select Doctor
          </label>
          <div className="relative">
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl 
                       focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                       transition-all duration-200 bg-white hover:border-slate-300
                       text-slate-800 font-medium appearance-none cursor-pointer"
              required
            >
              <option value="" className="text-slate-400">Choose a doctor...</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id} className="text-slate-800">
                  Dr. {doctor.fullName}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {selectedDoctorInfo && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-700 font-medium">{selectedDoctorInfo.email}</p>
            </div>
          )}
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            Consultation Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={getMinDate()}
            className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl 
                     focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 
                     transition-all duration-200 bg-white hover:border-slate-300
                     text-slate-800 font-medium cursor-pointer"
            required
          />
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            Consultation Time
          </label>
          <div className="relative">
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl 
                       focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 
                       transition-all duration-200 bg-white hover:border-slate-300
                       text-slate-800 font-medium appearance-none cursor-pointer"
              required
            >
              <option value="" className="text-slate-400">Choose a time...</option>
              {timeSlots.map(time => (
                <option key={time} value={time} className="text-slate-800">{time}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-100">
            <Clock className="w-4 h-4 text-purple-600" />
            <p className="text-sm text-purple-700 font-medium">Duration: 30 minutes</p>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            Additional Notes <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl 
                     focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 
                     transition-all duration-200 bg-white hover:border-slate-300
                     text-slate-800 resize-none"
            placeholder="Any specific concerns or questions for the doctor..."
          />
        </div>

        {/* Summary */}
        {selectedDoctor && selectedDate && selectedTime && (
          <div className="relative overflow-hidden bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 
                        border-2 border-blue-200 rounded-2xl p-6 shadow-lg animate-in fade-in slide-in-from-bottom">
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-lg bg-linear-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Consultation Summary
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-600 mb-1">Doctor</p>
                  <p className="text-sm font-bold text-slate-800">Dr. {selectedDoctorInfo?.fullName}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-600 mb-1">Date</p>
                  <p className="text-sm font-bold text-slate-800">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-purple-100">
                  <p className="text-xs font-semibold text-purple-600 mb-1">Time</p>
                  <p className="text-sm font-bold text-slate-800">{selectedTime}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-pink-100">
                  <p className="text-xs font-semibold text-pink-600 mb-1">Duration</p>
                  <p className="text-sm font-bold text-slate-800">30 minutes</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3.5 border-2 border-slate-300 rounded-xl 
                     text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-400
                     transition-all duration-200 active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 
                     text-white font-semibold rounded-xl 
                     hover:from-blue-700 hover:to-indigo-700 
                     shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
                     transition-all duration-200 active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Payment
          </button>
        </div>
      </form>
    </Modal>
  );
};
