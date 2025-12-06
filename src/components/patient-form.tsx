import React from 'react';
import { PatientData } from '@/lib/types';
import { Stethoscope, Activity, FileText, AlertCircle, User, Thermometer } from 'lucide-react';

interface Props {
  data: PatientData;
  onChange: (data: PatientData) => void;
  onSubmit: () => void;
  loading: boolean;
}

export const PatientForm: React.FC<Props> = ({ data, onChange, onSubmit, loading }) => {
  const handleChange = (field: keyof PatientData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleVitalChange = (field: keyof typeof data.vitals, value: string) => {
    onChange({ ...data, vitals: { ...data.vitals, [field]: value } });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 p-2 rounded-lg">
          <User className="text-white w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Patient Intake</h2>
          <p className="text-sm text-slate-500">Enter clinical parameters for analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Age</label>
          <input
            type="number"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-black"
            placeholder="e.g. 45"
            value={data.age}
            onChange={(e) => handleChange('age', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Gender</label>
          <select
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-black"
            value={data.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
          >
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Weight (kg/lbs)</label>
          <input
            type="text"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-black"
            placeholder="e.g. 70kg"
            value={data.weight}
            onChange={(e) => handleChange('weight', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="space-y-2 relative">
          <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
            <Activity className="w-3 h-3" /> BP (mmHg)
          </label>
          <input
            type="text"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-black"
            placeholder="120/80"
            value={data.vitals.bp}
            onChange={(e) => handleVitalChange('bp', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
             <Activity className="w-3 h-3" /> Heart Rate
          </label>
          <input
            type="text"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-black"
            placeholder="72 bpm"
            value={data.vitals.hr}
            onChange={(e) => handleVitalChange('hr', e.target.value)}
          />
        </div>
        <div className="space-y-2">
           <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
             <Thermometer className="w-3 h-3" /> Temp
          </label>
          <input
            type="text"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-black"
            placeholder="98.6 F"
            value={data.vitals.temp}
            onChange={(e) => handleVitalChange('temp', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Chief Complaint
          </label>
          <textarea
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition min-h-[80px] text-black"
            placeholder="Primary reason for visit..."
            value={data.complaint}
            onChange={(e) => handleChange('complaint', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
               <Stethoscope className="w-3 h-3" /> Active Meds
            </label>
            <textarea
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition min-h-[80px] text-black"
              placeholder="List current medications..."
              value={data.medications}
              onChange={(e) => handleChange('medications', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
               <FileText className="w-3 h-3" /> Medical History & Allergies
            </label>
            <textarea
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition min-h-[80px] text-black"
              placeholder="History, comorbidities, known allergies..."
              value={data.history}
              onChange={(e) => handleChange('history', e.target.value)}
            />
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={loading || !data.complaint}
        className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99]
          ${loading 
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
            : 'bg-linear-to-r from-blue-600 to-indigo-700 text-white hover:shadow-xl'
          }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing Clinical Data...
          </>
        ) : (
          <>
            <Activity className="w-5 h-5" /> Generate Treatment Plan
          </>
        )}
      </button>
      <p className="text-center text-xs text-slate-400 mt-4">Protected by MedAssist Safety Protocol 2.0</p>
    </div>
  );
};
