import React from 'react';
import { PatientData } from '@/lib/types';
import { 
  Stethoscope, 
  Activity, 
  FileText, 
  AlertCircle, 
  User, 
  Thermometer, 
  Scale, 
  Heart,
  ChevronDown
} from 'lucide-react';

interface Props {
  data: PatientData;
  onChange: (data: PatientData) => void;
  onSubmit: () => void;
  loading: boolean;
}

export const PatientForm: React.FC<Props> = ({ data, onChange, onSubmit, loading }) => {
  
  // -- Local state helpers --
  const [bpSys, bpDia] = (data.vitals.bp || '').split('/');
  
  const parseValueUnit = (str: string, defaultUnit: string) => {
    const match = str.match(/(\d*\.?\d+)\s*([a-zA-Z°]+)?/);
    return {
      val: match ? match[1] : '',
      unit: match && match[2] ? match[2] : defaultUnit
    };
  };

  const weightData = parseValueUnit(data.weight, 'kg');
  const tempData = parseValueUnit(data.vitals.temp, '°F');

  // -- Handlers --
  const handleChange = (field: keyof PatientData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleVitalChange = (field: keyof typeof data.vitals, value: string) => {
    onChange({ ...data, vitals: { ...data.vitals, [field]: value } });
  };

  const handleWeightChange = (val: string, unit: string) => {
    if(!val) handleChange('weight', '');
    else handleChange('weight', `${val} ${unit}`);
  };

  const handleTempChange = (val: string, unit: string) => {
    if(!val) handleVitalChange('temp', '');
    else handleVitalChange('temp', `${val}${unit}`);
  };

  const handleBPChange = (sys: string, dia: string) => {
    if (!sys && !dia) handleVitalChange('bp', '');
    else handleVitalChange('bp', `${sys}/${dia}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in">
      
      {/* Header - Reduced padding */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-3">
        <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-2.5 rounded-lg shadow-md">
          <User className="text-white w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Patient Intake</h2>
          <p className="text-xs text-slate-500">Complete clinical parameters for AI analysis</p>
        </div>
      </div>

      {/* Main Content - Reduced padding and spacing */}
      <div className="p-4 md:p-5 space-y-5">
        
        {/* Section 1: Demographics */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Demographics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Age */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Age</label>
              <input
                type="number"
                min="0"
                max="120"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm text-slate-900 placeholder:text-slate-400"
                placeholder="Yrs"
                value={data.age}
                onChange={(e) => handleChange('age', e.target.value)}
              />
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Gender</label>
              <div className="relative">
                <select
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm text-slate-900 appearance-none cursor-pointer"
                  value={data.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-400" /> Weight
              </label>
              <div className="flex rounded-lg shadow-sm">
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-white border border-slate-300 border-r-0 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm text-slate-900"
                  placeholder="0"
                  value={weightData.val}
                  onChange={(e) => handleWeightChange(e.target.value, weightData.unit)}
                />
                <select 
                  className="bg-slate-50 border border-slate-300 text-slate-600 text-xs rounded-r-lg px-2 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition"
                  value={weightData.unit}
                  onChange={(e) => handleWeightChange(weightData.val, e.target.value)}
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Section 2: Vitals */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Vital Signs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* BP */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-500" /> Blood Pressure
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    className="w-full px-2 py-2 text-center text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="120"
                    value={bpSys || ''}
                    onChange={(e) => handleBPChange(e.target.value, bpDia || '')}
                  />
                  <span className="absolute text-[8px] text-slate-400 bottom-0.5 left-0 right-0 text-center uppercase font-bold">Sys</span>
                </div>
                <span className="text-slate-300 text-lg">/</span>
                <div className="relative flex-1">
                  <input
                    type="number"
                    className="w-full px-2 py-2 text-center text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="80"
                    value={bpDia || ''}
                    onChange={(e) => handleBPChange(bpSys || '', e.target.value)}
                  />
                  <span className="absolute text-[8px] text-slate-400 bottom-0.5 left-0 right-0 text-center uppercase font-bold">Dia</span>
                </div>
              </div>
            </div>

            {/* Heart Rate */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> Heart Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full pl-3 pr-12 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm text-slate-900 placeholder:text-slate-300"
                  placeholder="72"
                  value={parseValueUnit(data.vitals.hr, 'bpm').val}
                  onChange={(e) => handleVitalChange('hr', `${e.target.value} bpm`)}
                />
                <div className="absolute right-0 top-0 bottom-0 flex items-center px-3 bg-slate-50 border-l border-slate-300 rounded-r-lg text-slate-500 text-xs font-medium select-none">
                  bpm
                </div>
              </div>
            </div>

            {/* Temp */}
            <div className="space-y-1">
               <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                 <Thermometer className="w-3.5 h-3.5 text-orange-500" /> Temp
              </label>
              <div className="flex rounded-lg shadow-sm">
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-white border border-slate-300 border-r-0 rounded-l-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm text-slate-900"
                  placeholder="98.6"
                  value={tempData.val}
                  onChange={(e) => handleTempChange(e.target.value, tempData.unit)}
                />
                <select 
                  className="bg-slate-50 border border-slate-300 text-slate-600 text-xs rounded-r-lg px-2 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition"
                  value={tempData.unit}
                  onChange={(e) => handleTempChange(tempData.val, e.target.value)}
                >
                  <option value="°F">°F</option>
                  <option value="°C">°C</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Section 3: Clinical Notes */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Clinical Notes
          </h3>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-indigo-500" /> Chief Complaint
            </label>
            <textarea
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition min-h-[60px] text-sm text-slate-800 resize-none shadow-sm placeholder:text-slate-400"
              placeholder="Reason for visit..."
              value={data.complaint}
              onChange={(e) => handleChange('complaint', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                 <Stethoscope className="w-3.5 h-3.5 text-indigo-500" /> Active Medications
              </label>
              <textarea
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition min-h-[80px] text-sm text-slate-800 resize-none shadow-sm"
                placeholder="Current meds..."
                value={data.medications}
                onChange={(e) => handleChange('medications', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                 <FileText className="w-3.5 h-3.5 text-indigo-500" /> History & Allergies
              </label>
              <textarea
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition min-h-[80px] text-sm text-slate-800 resize-none shadow-sm"
                placeholder="Allergies, conditions..."
                value={data.history}
                onChange={(e) => handleChange('history', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onSubmit}
            disabled={loading || !data.complaint}
            className={`w-full py-3 rounded-lg font-bold text-base shadow-md flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0
              ${loading 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:from-blue-700 hover:to-indigo-700'
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" /> Generate Plan
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};