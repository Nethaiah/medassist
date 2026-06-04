import React from 'react';
import { AuditLog } from '@/lib/types';
import { 
  CheckCircle, 
  FileEdit, 
  User, 
  Clock, 
  Shield 
} from 'lucide-react';

interface AuditTrailProps {
  logs: AuditLog[];
  className?: string;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ logs, className }) => {
  if (!logs || logs.length === 0) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-2">
        <Shield className="w-4 h-4 text-slate-500" />
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Compliance Audit Trail</h3>
      </div>
      
      <div className="p-6">
        <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
          {logs.map((log) => (
            <div key={log.id} className="relative ml-8">
              {/* Timeline Dot */}
              <div className={`absolute -left-[43px] top-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center
                ${log.action === 'consultation_approved' 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : 'bg-blue-50 text-blue-600'}`}>
                {log.action === 'consultation_approved' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <FileEdit className="w-4 h-4" />
                )}
              </div>

              {/* Content Card */}
              <div className="bg-slate-50/50 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-slate-700">
                    {log.actionDetails}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 bg-white px-2 py-1 rounded border border-slate-100 shadow-sm">
                    <Clock className="w-3 h-3" />
                    {formatDate(log.createdAt)}
                  </span>
                </div>

                {log.fieldChanged && (
                  <div className="mb-3">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">Modified: </span>
                    <span className="text-xs font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {log.fieldChanged}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 mt-1">
                  <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                    <User className="w-3 h-3 text-slate-500" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {log.userEmail}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};