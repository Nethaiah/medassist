import React from 'react';
import { ConsultationRecord } from '@/lib/types';
import { RiskBadge } from './ui/risk-badge';
import { Clock, ChevronRight, Search, FileText, CheckCircle } from 'lucide-react';

interface Props {
  consultations: ConsultationRecord[];
  onViewCase: (record: ConsultationRecord) => void;
  onLogout: () => void;
  doctorName: string;
}

export const DoctorDashboard: React.FC<Props> = ({ consultations, onViewCase, onLogout, doctorName }) => {
  const paidConsultations = consultations.filter(c => c.status === 'paid' || c.status === 'completed');

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Doctor's Dashboard</h2>
           <p className="text-slate-500">Welcome back, Dr. {doctorName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Pending Reviews</div>
             <div className="text-3xl font-bold text-slate-800">{paidConsultations.filter(c => c.status === 'paid').length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Patients</div>
             <div className="text-3xl font-bold text-slate-800">{paidConsultations.length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">High Risk Cases</div>
             <div className="text-3xl font-bold text-red-600">
               {paidConsultations.filter(c => c.aiAnalysis.summary.risk_level === 'High').length}
             </div>
          </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Patient Queue
          </h3>
          <div className="relative">
             <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
             <input 
               type="text" 
               placeholder="Search patients..." 
               className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
             />
          </div>
        </div>

        {paidConsultations.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
             <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
             <p>No consultations awaiting review.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paidConsultations.map((record) => (
              <div 
                key={record.id} 
                onClick={() => onViewCase(record)}
                className="p-4 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      {record.patientName.charAt(0)}
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition">{record.patientName}</h4>
                        {record.status === 'completed' ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Reviewed</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">Pending</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                         <Clock className="w-3 h-3" />
                         {new Date(record.timestamp).toLocaleDateString()} {new Date(record.timestamp).toLocaleTimeString()}
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="text-right">
                       <div className="text-xs text-slate-400 mb-1">Chief Complaint</div>
                       <div className="text-sm text-slate-700 font-medium truncate max-w-[200px]">{record.patientData.complaint}</div>
                    </div>
                    
                    <RiskBadge level={record.aiAnalysis.summary.risk_level} />
                    
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};