import React, { useState } from 'react';
import { ClinicalResponse } from '@/lib/types';
import { RiskBadge } from '@/components/ui/risk-badge';
import { PhysiologicalChart } from '@/components/ui/physiological-chart';
import { AlertTriangle, CheckCircle, Pill, ShieldAlert, FileText, ChevronRight, Activity, ToggleLeft, ToggleRight, ArrowLeft, Stethoscope, X, Edit, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  data: ClinicalResponse;
  onBack: () => void;
  // New props for consultation flow
  showConsultAction?: boolean;
  onConsult?: () => void;
  consultationPaid?: boolean;
  isDialogMode?: boolean; // New prop to style for dialog
  isEditable?: boolean; // New prop for doctor editing
  onSave?: (updatedData: ClinicalResponse) => void; // Callback when saving edits
}

export const TreatmentPlan: React.FC<Props> = ({ 
  data, 
  onBack, 
  showConsultAction = false, 
  onConsult,
  consultationPaid = false,
  isDialogMode = false,
  isEditable = false,
  onSave
}) => {
  const supabase = createClient();
  const [patientMode, setPatientMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<ClinicalResponse>(data);
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | null>(null);

  // Fetch user role on mount
  React.useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserRole(profile.role);
        }
      }
    };
    fetchUserRole();
  }, []);

  const handleSave = () => {
    if (onSave) {
      onSave(editedData);
    }
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditedData(data); // Reset to original
    setEditMode(false);
  };

  const displayData = editMode ? editedData : data;

  return (
    <div className={`space-y-6 animate-fade-in ${isDialogMode ? 'p-6' : 'pb-12'}`}>
      {/* Header Summary */}
      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${isDialogMode ? 'border-none shadow-none p-0' : ''}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
             {!isDialogMode && (
               <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition">
                  <ArrowLeft className="w-5 h-5 text-slate-500" />
               </button>
             )}
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Clinical Analysis</h1>
              <p className="text-slate-500">{displayData.summary.primary_complaint}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Edit/Save Button for Doctors */}
            {isEditable && (
              editMode ? (
                <div className="flex gap-2">
                  <button 
                    onClick={handleCancel}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 transition"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 text-sm font-medium text-white bg-green-600 px-3 py-1.5 rounded-lg border border-green-700 hover:bg-green-700 transition"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition"
                >
                  <Edit className="w-4 h-4" />
                  Edit Analysis
                </button>
              )
            )}
            {/* Patient Mode Toggle */}
            <button 
              onClick={() => setPatientMode(!patientMode)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
            >
              {patientMode ? <ToggleRight className="w-5 h-5 text-blue-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
              Explain to Patient
            </button>
            <RiskBadge level={displayData.summary.risk_level} />
          </div>
        </div>

        {/* Key Flags / Patient Friendly Summary */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 mb-4">
           {patientMode && data.summary.patient_friendly_explanation ? (
               <div className="flex gap-3">
                   <div className="mt-1"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                   <div>
                       <h4 className="font-semibold text-slate-800">Simplified Summary</h4>
                       <p className="text-slate-600 leading-relaxed">{data.summary.patient_friendly_explanation}</p>
                   </div>
               </div>
           ) : (
                <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-semibold text-slate-500 mr-2 self-center">Clinical Flags:</span>
                    {data.summary.key_flags.length > 0 ? (
                        data.summary.key_flags.map((flag, i) => (
                        <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 font-medium">
                            {flag}
                        </span>
                        ))
                    ) : (
                        <span className="text-sm text-slate-400 italic">No major flags detected</span>
                    )}
                </div>
           )}
        </div>

        {/* Call To Action: Consult Doctor */}
        {showConsultAction && !consultationPaid && userRole === 'patient' && (
           <div className="bg-linear-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                 <h3 className="text-lg font-bold flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" /> Professional Verification Recommended
                 </h3>
                 <p className="text-blue-100 text-sm mt-1 max-w-xl">
                    This AI analysis is a preliminary screening. Secure a paid consultation with a licensed specialist to verify these results and receive an official prescription.
                 </p>
              </div>
              <button 
                onClick={onConsult}
                className="whitespace-nowrap px-6 py-3 bg-white text-indigo-700 font-bold rounded-lg shadow-md hover:bg-blue-50 transition transform hover:scale-105"
              >
                Consult Doctor ($50)
              </button>
           </div>
        )}
        
        {/* Paid Confirmation State */}
        {consultationPaid && userRole === 'patient' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-center gap-3 text-green-800">
                <CheckCircle className="w-6 h-6" />
                <span className="font-semibold">Consultation Paid & Sent to Doctor Dashboard. Please await contact.</span>
            </div>
        )}
      </div>

      {/* CRITICAL RISK SUMMARY CARD - For Busy Doctors */}
      {(displayData.safety_analysis.drug_interactions.some(i => i.includes('major') || i.includes('[FDA]')) || 
        displayData.safety_analysis.contraindications.length > 0 ||
        displayData.summary.confidence_score === 'low') && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-1 shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-red-900 text-lg mb-3 flex items-center gap-2">
                ⚠️ Critical Safety Alerts - Review Required
                {displayData.summary.fda_validated && (
                  <span className="text-xs font-normal bg-red-200 px-2 py-0.5 rounded">FDA Validated</span>
                )}
              </h3>
              
              {/* Major Drug Interactions */}
              {displayData.safety_analysis.drug_interactions.filter(i => 
                i.includes('major') || i.includes('[FDA]')
              ).length > 0 && (
                <div className="mb-3 bg-white rounded-lg p-3 border border-red-200">
                  <p className="font-semibold text-red-800 text-sm mb-1 flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    Major Drug Interactions:
                  </p>
                  <ul className="list-disc list-inside text-sm text-red-900 space-y-1">
                    {displayData.safety_analysis.drug_interactions
                      .filter(i => i.includes('major') || i.includes('[FDA]'))
                      .map((item, i) => <li key={i} className="leading-relaxed">{item}</li>)}
                  </ul>
                </div>
              )}
              
              {/* Contraindications */}
              {displayData.safety_analysis.contraindications.length > 0 && (
                <div className="mb-3 bg-white rounded-lg p-3 border border-red-200">
                  <p className="font-semibold text-red-800 text-sm mb-1 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    Contraindications Detected:
                  </p>
                  <ul className="list-disc list-inside text-sm text-red-900 space-y-1">
                    {displayData.safety_analysis.contraindications.slice(0, 5).map((item, i) => 
                      <li key={i} className="leading-relaxed">{item}</li>
                    )}
                    {displayData.safety_analysis.contraindications.length > 5 && (
                      <li className="text-red-700 font-medium">
                        + {displayData.safety_analysis.contraindications.length - 5} more (see Safety Analysis below)
                      </li>
                    )}
                  </ul>
                </div>
              )}
              
              {/* Low Confidence Warning */}
              {displayData.summary.confidence_score === 'low' && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-3 mt-2">
                  <p className="text-sm font-bold text-yellow-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    ⚠️ LOW CONFIDENCE - Specialist consultation strongly recommended
                  </p>
                  <p className="text-xs text-yellow-800 mt-1">
                    Multiple safety concerns detected. Consider referring to specialist before finalizing treatment plan.
                  </p>
                </div>
              )}
              
              {/* Medium Confidence Info */}
              {displayData.summary.confidence_score === 'medium' && !displayData.summary.fda_validated && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 mt-2">
                  <p className="text-sm font-semibold text-amber-900">
                    ⚡ Moderate Confidence - FDA validation unavailable, proceed with caution
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Treatment Plan */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-600" /> Recommended Treatment
              </h3>
              {data.summary.guideline_check && (
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded flex items-center gap-1 border border-emerald-100">
                      <CheckCircle className="w-3 h-3" /> {data.summary.guideline_check}
                  </span>
              )}
            </div>
            <div className="p-4 space-y-4">
              {displayData.treatment_plan.recommended_medications.map((med, idx) => (
                <div key={idx} className="border border-slate-100 rounded-lg p-4 hover:shadow-md transition bg-white relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="flex justify-between items-start mb-2 pl-3">
                    {editMode ? (
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => {
                            const newMeds = [...editedData.treatment_plan.recommended_medications];
                            newMeds[idx] = { ...newMeds[idx], name: e.target.value };
                            setEditedData({ ...editedData, treatment_plan: { ...editedData.treatment_plan, recommended_medications: newMeds } });
                          }}
                          className="font-bold text-lg text-slate-800 w-full border-b-2 border-blue-500 px-2 py-1"
                          placeholder="Medication name"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => {
                              const newMeds = [...editedData.treatment_plan.recommended_medications];
                              newMeds[idx] = { ...newMeds[idx], dosage: e.target.value };
                              setEditedData({ ...editedData, treatment_plan: { ...editedData.treatment_plan, recommended_medications: newMeds } });
                            }}
                            className="text-sm text-slate-600 border border-slate-300 rounded px-2 py-1 flex-1"
                            placeholder="Dosage"
                          />
                          <input
                            type="text"
                            value={med.frequency}
                            onChange={(e) => {
                              const newMeds = [...editedData.treatment_plan.recommended_medications];
                              newMeds[idx] = { ...newMeds[idx], frequency: e.target.value };
                              setEditedData({ ...editedData, treatment_plan: { ...editedData.treatment_plan, recommended_medications: newMeds } });
                            }}
                            className="text-sm text-slate-600 border border-slate-300 rounded px-2 py-1 flex-1"
                            placeholder="Frequency"
                          />
                          <input
                            type="text"
                            value={med.duration}
                            onChange={(e) => {
                              const newMeds = [...editedData.treatment_plan.recommended_medications];
                              newMeds[idx] = { ...newMeds[idx], duration: e.target.value };
                              setEditedData({ ...editedData, treatment_plan: { ...editedData.treatment_plan, recommended_medications: newMeds } });
                            }}
                            className="text-sm text-slate-600 border border-slate-300 rounded px-2 py-1 flex-1"
                            placeholder="Duration"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-lg text-slate-800">{med.name}</h4>
                        <div className="text-sm text-slate-500 font-mono">
                          {med.dosage} • {med.frequency} • {med.duration}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pl-3 mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded">
                    {editMode ? (
                      <textarea
                        value={med.reasoning}
                        onChange={(e) => {
                          const newMeds = [...editedData.treatment_plan.recommended_medications];
                          newMeds[idx] = { ...newMeds[idx], reasoning: e.target.value };
                          setEditedData({ ...editedData, treatment_plan: { ...editedData.treatment_plan, recommended_medications: newMeds } });
                        }}
                        className="w-full border border-slate-300 rounded px-2 py-1"
                        rows={2}
                        placeholder="Clinical reasoning..."
                      />
                    ) : (
                      <>
                        <span className="font-semibold text-slate-700">Rationale: </span>
                        {patientMode 
                            ? "This medication helps treat your condition safely considering your history." 
                            : med.reasoning
                        }
                      </>
                    )}
                  </div>
                </div>
              ))}
              {displayData.treatment_plan.recommended_medications.length === 0 && (
                  <p className="text-slate-500 italic p-4 text-center">No pharmacotherapy recommended at this time.</p>
              )}
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="bg-slate-50 border-b border-slate-200 p-4">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Plan & Lifestyle
              </h3>
            </div>
            <div className="p-5 grid md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Lifestyle</h4>
                    {editMode ? (
                      <div className="space-y-2">
                        {editedData.treatment_plan.lifestyle_recommendations.map((rec, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={rec}
                              onChange={(e) => {
                                const newRecs = [...editedData.treatment_plan.lifestyle_recommendations];
                                newRecs[i] = e.target.value;
                                setEditedData({
                                  ...editedData,
                                  treatment_plan: { ...editedData.treatment_plan, lifestyle_recommendations: newRecs }
                                });
                              }}
                              className="flex-1 text-sm text-slate-700 border border-slate-300 rounded px-2 py-1"
                            />
                            <button
                              onClick={() => {
                                const newRecs = editedData.treatment_plan.lifestyle_recommendations.filter((_, idx) => idx !== i);
                                setEditedData({
                                  ...editedData,
                                  treatment_plan: { ...editedData.treatment_plan, lifestyle_recommendations: newRecs }
                                });
                              }}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newRecs = [...editedData.treatment_plan.lifestyle_recommendations, ''];
                            setEditedData({
                              ...editedData,
                              treatment_plan: { ...editedData.treatment_plan, lifestyle_recommendations: newRecs }
                            });
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          + Add Recommendation
                        </button>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                          {displayData.treatment_plan.lifestyle_recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                  <ChevronRight className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                                  {rec}
                              </li>
                          ))}
                      </ul>
                    )}
                </div>
                <div>
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Follow-up</h4>
                     {editMode ? (
                       <div className="space-y-2">
                         {editedData.followup_instructions.monitoring.map((item, i) => (
                           <div key={i} className="flex items-center gap-2">
                             <input
                               type="text"
                               value={item}
                               onChange={(e) => {
                                 const newMonitoring = [...editedData.followup_instructions.monitoring];
                                 newMonitoring[i] = e.target.value;
                                 setEditedData({
                                   ...editedData,
                                   followup_instructions: { ...editedData.followup_instructions, monitoring: newMonitoring }
                                 });
                               }}
                               className="flex-1 text-sm text-slate-700 border border-slate-300 rounded px-2 py-1"
                             />
                             <button
                               onClick={() => {
                                 const newMonitoring = editedData.followup_instructions.monitoring.filter((_, idx) => idx !== i);
                                 setEditedData({
                                   ...editedData,
                                   followup_instructions: { ...editedData.followup_instructions, monitoring: newMonitoring }
                                 });
                               }}
                               className="text-red-600 hover:text-red-700 text-sm"
                             >
                               ✕
                             </button>
                           </div>
                         ))}
                         <button
                           onClick={() => {
                             const newMonitoring = [...editedData.followup_instructions.monitoring, ''];
                             setEditedData({
                               ...editedData,
                               followup_instructions: { ...editedData.followup_instructions, monitoring: newMonitoring }
                             });
                           }}
                           className="text-sm text-blue-600 hover:text-blue-700"
                         >
                           + Add Monitoring
                         </button>
                       </div>
                     ) : (
                       <ul className="space-y-2">
                          {displayData.followup_instructions.monitoring.map((mon, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                  <Activity className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                                  {mon}
                              </li>
                          ))}
                      </ul>
                     )}
                </div>
            </div>
          </div>
        </div>

        {/* Right Column: Safety & Visualization */}
        <div className="space-y-6">
            
          {/* Unique Feature: Physiological Simulator */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <PhysiologicalChart data={data.safety_analysis.physiological_simulation} />
             <div className="bg-slate-50 p-3 text-xs text-center text-slate-500 border-t border-slate-100">
                Projected organ system load variance
             </div>
          </div>

          {/* Safety Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" /> Safety Analysis
              </h3>
            </div>
            <div className="p-4 space-y-4">
                {/* Drug Interactions */}
                {editMode || displayData.safety_analysis.drug_interactions.length > 0 ? (
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <h4 className="text-xs font-bold text-amber-800 uppercase mb-2">Interactions</h4>
                    {editMode ? (
                      <div className="space-y-2">
                        {editedData.safety_analysis.drug_interactions.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => {
                                const newItems = [...editedData.safety_analysis.drug_interactions];
                                newItems[i] = e.target.value;
                                setEditedData({ ...editedData, safety_analysis: { ...editedData.safety_analysis, drug_interactions: newItems } });
                              }}
                              className="flex-1 text-sm border border-amber-300 rounded px-2 py-1"
                            />
                            <button onClick={() => {
                              const newItems = editedData.safety_analysis.drug_interactions.filter((_, idx) => idx !== i);
                              setEditedData({ ...editedData, safety_analysis: { ...editedData.safety_analysis, drug_interactions: newItems } });
                            }} className="text-red-600 hover:text-red-700 text-sm">✕</button>
                          </div>
                        ))}
                        {editedData.safety_analysis.drug_interactions.length === 0 && <p className="text-xs text-green-600">None detected</p>}
                        <button onClick={() => {
                          const newItems = [...editedData.safety_analysis.drug_interactions, ''];
                          setEditedData({ ...editedData, safety_analysis: { ...editedData.safety_analysis, drug_interactions: newItems } });
                        }} className="text-xs text-blue-600 hover:text-blue-700">+ Add Interaction</button>
                      </div>
                    ) : (
                      <ul className="list-disc list-inside text-sm text-amber-900 space-y-1">
                        {displayData.safety_analysis.drug_interactions.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    )}
                  </div>
                ) : null}

                 {/* Contraindications */}
                 {editMode || displayData.safety_analysis.contraindications.length > 0 ? (
                  <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                    <h4 className="text-xs font-bold text-red-800 uppercase mb-2">Contraindications</h4>
                    {editMode ? (
                      <div className="space-y-2">
                        {editedData.safety_analysis.contraindications.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => {
                                const newItems = [...editedData.safety_analysis.contraindications];
                                newItems[i] = e.target.value;
                                setEditedData({ ...editedData, safety_analysis: { ...editedData.safety_analysis, contraindications: newItems } });
                              }}
                              className="flex-1 text-sm border border-red-300 rounded px-2 py-1"
                            />
                            <button onClick={() => {
                              const newItems = editedData.safety_analysis.contraindications.filter((_, idx) => idx !== i);
                              setEditedData({ ...editedData, safety_analysis: { ...editedData.safety_analysis, contraindications: newItems } });
                            }} className="text-red-600 hover:text-red-700 text-sm">✕</button>
                          </div>
                        ))}
                        {editedData.safety_analysis.contraindications.length === 0 && <p className="text-xs text-green-600">None detected</p>}
                        <button onClick={() => {
                          const newItems = [...editedData.safety_analysis.contraindications, ''];
                          setEditedData({ ...editedData, safety_analysis: { ...editedData.safety_analysis, contraindications: newItems } });
                        }} className="text-xs text-blue-600 hover:text-blue-700">+ Add Contraindication</button>
                      </div>
                    ) : (
                      <ul className="list-disc list-inside text-sm text-red-900 space-y-1">
                        {displayData.safety_analysis.contraindications.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    )}
                  </div>
                ) : null}
                
                {data.safety_analysis.drug_interactions.length === 0 && data.safety_analysis.contraindications.length === 0 && (
                     <div className="text-center py-4">
                        <CheckCircle className="w-12 h-12 text-green-100 mx-auto mb-2" />
                        <p className="text-sm text-green-600 font-medium">No major safety warnings</p>
                     </div>
                )}
            </div>
          </div>

          {/* Warning Signs */}
          {userRole === 'patient' && (
          <div className="bg-slate-800 rounded-xl shadow-sm overflow-hidden text-white">
            <div className="p-4 border-b border-slate-700">
                <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" /> Urgent Referral Triggers
                </h3>
            </div>
            <div className="p-4">
                <ul className="space-y-2 text-sm text-slate-300">
                    {data.followup_instructions.when_to_refer_er.length > 0 ? (
                        data.followup_instructions.when_to_refer_er.map((item, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="text-red-400 font-bold">•</span> {item}
                            </li>
                        ))
                    ) : (
                        <li className="italic opacity-50">None identified for this case.</li>
                    )}
                </ul>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};