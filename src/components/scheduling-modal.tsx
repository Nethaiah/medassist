'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Calendar, Clock, User, FileText } from 'lucide-react';
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

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
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
      alert('Please fill in all required fields');
      return;
    }

    const scheduledAt = new Date(`${selectedDate}T${selectedTime}`);
    onSchedule(selectedDoctor, scheduledAt, notes);
  };

  const selectedDoctorInfo = doctors.find(d => d.id === selectedDoctor);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Consultation" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Doctor Selection */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            Select Doctor
          </label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Choose a doctor...</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                Dr. {doctor.fullName}
              </option>
            ))}
          </select>
          {selectedDoctorInfo && (
            <p className="text-xs text-slate-500 mt-1">{selectedDoctorInfo.email}</p>
          )}
        </div>

        {/* Date Selection */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Consultation Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={getMinDate()}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Time Selection */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Consultation Time
          </label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Choose a time...</option>
            {timeSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">Duration: 30 minutes</p>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any specific concerns or questions for the doctor..."
          />
        </div>

        {/* Summary */}
        {selectedDoctor && selectedDate && selectedTime && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Consultation Summary</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Doctor: Dr. {selectedDoctorInfo?.fullName}</li>
              <li>• Date: {new Date(selectedDate).toLocaleDateString()}</li>
              <li>• Time: {selectedTime}</li>
              <li>• Duration: 30 minutes</li>
            </ul>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Continue to Payment
          </button>
        </div>
      </form>
    </Modal>
  );
};
