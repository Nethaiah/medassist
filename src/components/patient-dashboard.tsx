import React, { useState } from 'react';
import { ConsultationRecord } from '@/lib/types';
import { RiskBadge } from '@/components/ui/risk-badge';
import { Plus, Clock, ChevronRight, FileText, Search, Activity, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  consultations: ConsultationRecord[];
  onNewCase: () => void;
  onViewCase: (record: ConsultationRecord) => void;
  patientName: string;
}

export const PatientDashboard: React.FC<Props> = ({ consultations, onNewCase, onViewCase, patientName }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    high: true,
    medium: true,
    low: true,
    completed: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Separate consultations by completion status
  const activeConsultations = consultations.filter(c => c.status === 'pending_payment' || c.status === 'paid');
  const completedConsultations = consultations.filter(c => c.status === 'completed');

  // Group active consultations by priority
  const highPriority = activeConsultations.filter(c => c.aiAnalysis.summary.risk_level === 'High');
  const mediumPriority = activeConsultations.filter(c => c.aiAnalysis.summary.risk_level === 'Medium');
  const lowPriority = activeConsultations.filter(c => c.aiAnalysis.summary.risk_level === 'Low');

  const getStatusBadge = (status: string) => {
    if (status === 'pending_payment') {
      return <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 text-xs font-medium">Draft</span>;
    } else if (status === 'paid') {
      return <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-700 text-xs font-medium">Paid</span>;
    } else {
      return <span className="bg-green-100 px-2 py-0.5 rounded text-green-700 text-xs font-medium">Reviewed</span>;
    }
  };

  const ConsultationCard = ({ record }: { record: ConsultationRecord }) => (
    <div 
      onClick={() => onViewCase(record)}
      className="p-4 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between group border-l-4 border-transparent hover:border-blue-400"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
          <FileText className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition truncate">
            {record.patientData.complaint || "General Checkup"}
          </h4>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(record.timestamp).toLocaleDateString()}
            </span>
            {getStatusBadge(record.status)}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden md:block text-right">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Treatment</div>
          <div className="text-sm font-medium text-slate-700">
            {record.aiAnalysis.treatment_plan.recommended_medications[0]?.name || "Lifestyle Only"}
          </div>
        </div>
        <RiskBadge level={record.aiAnalysis.summary.risk_level} />
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600" />
      </div>
    </div>
  );

  const PrioritySection = ({ 
    title, 
    records, 
    color, 
    icon: Icon, 
    sectionKey 
  }: { 
    title: string; 
    records: ConsultationRecord[]; 
    color: string; 
    icon: any; 
    sectionKey: string;
  }) => {
    const isExpanded = expandedSections[sectionKey];
    const colorClasses = {
      red: 'bg-red-50 border-red-200 text-red-700',
      amber: 'bg-amber-50 border-amber-200 text-amber-700',
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      green: 'bg-green-50 border-green-200 text-green-700'
    }[color];

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full p-4 flex items-center justify-between ${colorClasses} border-b-2 hover:opacity-90 transition`}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5" />
            <h3 className="font-bold text-lg">{title}</h3>
            <span className="px-2.5 py-1 bg-white/60 rounded-full text-sm font-bold">
              {records.length}
            </span>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {isExpanded && (
          <div className="divide-y divide-slate-100">
            {records.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No consultations in this category</p>
              </div>
            ) : (
              records.map(record => (
                <ConsultationCard key={record.id} record={record} />
              ))
            )}
          </div>
        )}
      </div>
    );
  };

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

      {consultations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
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
        </div>
      ) : (
        <>
          {/* Active Consultations */}
          {activeConsultations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-700">Active Consultations</h3>
                <div className="text-sm text-slate-500">{activeConsultations.length} active</div>
              </div>

              <PrioritySection
                title="High Priority"
                records={highPriority}
                color="red"
                icon={AlertTriangle}
                sectionKey="high"
              />

              <PrioritySection
                title="Medium Priority"
                records={mediumPriority}
                color="amber"
                icon={Activity}
                sectionKey="medium"
              />

              <PrioritySection
                title="Low Priority"
                records={lowPriority}
                color="blue"
                icon={FileText}
                sectionKey="low"
              />
            </div>
          )}

          {/* Completed Consultations */}
          {completedConsultations.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-700">Completed Reviews</h3>
                <div className="text-sm text-slate-500">{completedConsultations.length} completed</div>
              </div>

              <PrioritySection
                title="Completed Consultations"
                records={completedConsultations}
                color="green"
                icon={CheckCircle}
                sectionKey="completed"
              />
            </div>
          )}
        </>
      )}

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