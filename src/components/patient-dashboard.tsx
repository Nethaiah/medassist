import React from 'react';
import { ConsultationRecord } from '@/lib/types';
import { RiskBadge } from '@/components/ui/risk-badge';
import { Plus, Clock, ChevronRight, FileText, Search, Activity } from 'lucide-react';

interface Props {
  consultations: ConsultationRecord[];
  onNewCase: () => void;
  onViewCase: (record: ConsultationRecord) => void;
  patientName: string;
}

export const PatientDashboard: React.FC<Props> = ({ consultations, onNewCase, onViewCase, patientName }) => {
  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Health History</h1>
          <p className="text-slate-500">Welcome back, {patientName}</p>
        </div>
        <button 
          onClick={onNewCase}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-200 transition flex items-center gap-2 transform active:scale-95"
        >
          <Plus className="w-5 h-5" /> New Analysis
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" /> Previous Consultations
          </h3>
          <div className="relative hidden md:block">
             <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
             <input 
               type="text" 
               placeholder="Search history..." 
               className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
             />
          </div>
        </div>

        {consultations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-slate-400 p-8 text-center">
             <div className="bg-slate-50 p-4 rounded-full mb-4">
               <FileText className="w-8 h-8 opacity-50" />
             </div>
             <h4 className="text-slate-600 font-medium mb-1">No Analysis Records</h4>
             <p className="text-sm max-w-xs mb-6">You haven't generated any treatment plans yet. Click the button below to start.</p>
             <button 
                onClick={onNewCase}
                className="text-blue-600 font-bold text-sm hover:underline"
             >
                Start New Analysis
             </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {consultations.map((record) => (
              <div 
                key={record.id} 
                onClick={() => onViewCase(record)}
                className="p-4 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <FileText className="w-6 h-6" />
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition">
                        {record.patientData.complaint || "General Checkup"}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                         <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(record.timestamp).toLocaleDateString()}</span>
                         {record.status === 'pending_payment' ? (
                           <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">Draft</span>
                         ) : record.status === 'paid' ? (
                           <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-700">Paid</span>
                         ) : (
                           <span className="bg-green-100 px-2 py-0.5 rounded text-green-700">Reviewed by Doctor</span>
                         )}
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-4 md:gap-8">
                    <div className="hidden md:block text-right">
                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Recommendation</div>
                        <div className="text-sm font-medium text-slate-700">
                            {record.aiAnalysis.treatment_plan.recommended_medications[0]?.name || "Lifestyle Only"}
                        </div>
                    </div>
                    
                    <RiskBadge level={record.aiAnalysis.summary.risk_level} />
                    
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button (Mobile) */}
      <button 
        onClick={onNewCase}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center z-40 hover:bg-blue-700 transition active:scale-95"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
};