import React, { useState } from 'react';
import { ConsultationRecord } from '@/lib/types';
import { RiskBadge } from './ui/risk-badge';
import { Clock, ChevronRight, Search, FileText, CheckCircle, ChevronDown, ChevronUp, AlertTriangle, Activity, ThumbsUp } from 'lucide-react';

interface Props {
  consultations: ConsultationRecord[];
  onViewCase: (record: ConsultationRecord) => void;
  onApproveCase: (consultationId: string) => void;
  onLogout: () => void;
  doctorName: string;
}

export const DoctorDashboard: React.FC<Props> = ({ consultations, onViewCase, onApproveCase, onLogout, doctorName }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    high: true,
    medium: true,
    low: true,
    completed: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Separate consultations by status
  const activeConsultations = consultations.filter(c => c.status === 'paid');
  const completedConsultations = consultations.filter(c => c.status === 'completed');

  // Group active consultations by priority
  const highPriority = activeConsultations.filter(c => c.aiAnalysis.summary.risk_level === 'High');
  const mediumPriority = activeConsultations.filter(c => c.aiAnalysis.summary.risk_level === 'Medium');
  const lowPriority = activeConsultations.filter(c => c.aiAnalysis.summary.risk_level === 'Low');

  const ConsultationCard = ({ record, isPriority = true }: { record: ConsultationRecord; isPriority?: boolean }) => (
    <div 
      className="p-4 hover:bg-slate-50 transition group border-l-4 border-transparent hover:border-indigo-400"
    >
      <div className="flex items-center justify-between">
        <div 
          onClick={() => onViewCase(record)}
          className="flex items-center gap-4 flex-1 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
            {record.patientName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition truncate">
                {record.patientName}
              </h4>
              {!isPriority && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium shrink-0">
                  Reviewed
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(record.timestamp).toLocaleDateString()}
              </span>
              <span className="truncate max-w-[200px]">{record.patientData.complaint}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          {isPriority && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApproveCase(record.id);
              }}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm flex items-center gap-1.5 transition shadow-sm hover:shadow-md active:scale-95"
              title="Approve analysis without editing"
            >
              <ThumbsUp className="w-4 h-4" />
              Approve
            </button>
          )}
          <RiskBadge level={record.aiAnalysis.summary.risk_level} />
          <button 
            onClick={() => onViewCase(record)}
            className="p-2 hover:bg-indigo-50 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600" />
          </button>
        </div>
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
                <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No cases in this category</p>
              </div>
            ) : (
              records.map(record => (
                <ConsultationCard key={record.id} record={record} isPriority={sectionKey !== 'completed'} />
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Doctor's Dashboard</h2>
          <p className="text-slate-500">Welcome back, Dr. {doctorName}</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-linear-to-br from-red-50 to-red-100 p-6 rounded-xl border-2 border-red-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-red-600 text-xs font-bold uppercase tracking-wider">High Priority</div>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-700">{highPriority.length}</div>
        </div>
        <div className="bg-linear-to-br from-amber-50 to-amber-100 p-6 rounded-xl border-2 border-amber-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-amber-600 text-xs font-bold uppercase tracking-wider">Medium Priority</div>
            <Activity className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-amber-700">{mediumPriority.length}</div>
        </div>
        <div className="bg-linear-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-blue-600 text-xs font-bold uppercase tracking-wider">Low Priority</div>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-700">{lowPriority.length}</div>
        </div>
        <div className="bg-linear-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-green-600 text-xs font-bold uppercase tracking-wider">Completed</div>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-700">{completedConsultations.length}</div>
        </div>
      </div>

      {/* Priority Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-700">Active Cases</h3>
          <div className="text-sm text-slate-500">{activeConsultations.length} pending review</div>
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

        {/* Completed Section */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-slate-700 mb-4">Completed Reviews</h3>
          <PrioritySection
            title="Completed Consultations"
            records={completedConsultations}
            color="green"
            icon={CheckCircle}
            sectionKey="completed"
          />
        </div>
      </div>
    </div>
  );
};