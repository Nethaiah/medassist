export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  reasoning: string;
}

export interface PhysiologicalImpact {
  parameter: string;
  baseline: number;
  predicted: number;
  unit: string;
  risk_direction: 'increase' | 'decrease' | 'stable';
}

export interface ClinicalResponse {
  summary: {
    primary_complaint: string;
    risk_level: 'Low' | 'Medium' | 'High';
    key_flags: string[];
    patient_friendly_explanation?: string;
    guideline_check?: string;
    confidence_score?: 'high' | 'medium' | 'low';
    fda_validated?: boolean;
  };
  treatment_plan: {
    recommended_medications: Medication[];
    lifestyle_recommendations: string[];
    alternative_options: string[];
  };
  safety_analysis: {
    drug_interactions: string[];
    contraindications: string[];
    allergy_warnings: string[];
    vital_sign_red_flags: string[];
    lifestyle_risk_factors: string[];
    dosage_concerns: string[];
    physiological_simulation?: PhysiologicalImpact[];
  };
  followup_instructions: {
    monitoring: string[];
    when_to_call_doctor: string[];
    when_to_refer_er: string[];
  };
}

export interface PatientData {
  age: string;
  gender: string;
  weight: string;
  complaint: string;
  history: string;
  medications: string;
  allergies: string;
  vitals: {
    bp: string;
    hr: string;
    temp: string;
  };
}

export type UserRole = 'patient' | 'doctor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ConsultationRecord {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: number;
  status: 'pending_payment' | 'paid' | 'completed';
  patientData: PatientData;
  aiAnalysis: ClinicalResponse;
}

export type ScheduleStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Doctor {
  id: string;
  fullName: string;
  email: string;
}

export interface ConsultationSchedule {
  id: string;
  analysisId: string;
  patientId: string;
  doctorId: string | null;
  doctorName?: string;
  doctorEmail?: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: ScheduleStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AuditAction = 
  | 'consultation_created'
  | 'consultation_viewed' 
  | 'consultation_edited'
  | 'consultation_approved'
  | 'payment_completed'
  | 'schedule_created'
  | 'schedule_modified'
  | 'schedule_cancelled';

export interface AuditLog {
  id: string;
  consultationId: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  action: AuditAction;
  actionDetails?: string;
  fieldChanged?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
