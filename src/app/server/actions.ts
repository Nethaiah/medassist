'use server';

import { GoogleGenAI } from "@google/genai";
import { PatientData, ClinicalResponse, ConsultationRecord, Doctor, ConsultationSchedule, AuditAction, AuditLog } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { checkDrugInteractions, checkContraindications, validateDosage } from "@/lib/openfda";

// Initialize Gemini Client
// WARNING: Ensure GEMINI_API_KEY is set in your .env file
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Save consultation to database
export async function saveConsultation(
  patientId: string,
  patientName: string,
  patientData: PatientData,
  aiAnalysis: ClinicalResponse
): Promise<{ id: string } | null> {
  try {
    const supabase = await createClient(cookies());
    
    const { data, error } = await supabase
      .from('analysis_records')
      .insert({
        patient_id: patientId,
        patient_name: patientName,
        patient_data: patientData,
        ai_analysis: aiAnalysis,
        status: 'pending_payment'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving consultation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in saveConsultation:', error);
    return null;
  }
}

// Fetch consultations for a patient
export async function fetchPatientConsultations(
  userId: string
): Promise<ConsultationRecord[]> {
  try {
    const supabase = await createClient(cookies());
    
    const { data, error } = await supabase
      .from('analysis_records')
      .select('*')
      .eq('patient_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching analysis records:', error);
      return [];
    }

    // Transform database records to ConsultationRecord format
    return data.map(record => ({
      id: record.id,
      patientId: record.patient_id,
      patientName: record.patient_name,
      timestamp: new Date(record.created_at).getTime(),
      status: record.status,
      patientData: record.patient_data,
      aiAnalysis: record.ai_analysis,
    }));
  } catch (error) {
    console.error('Error in fetchPatientConsultations:', error);
    return [];
  }
}

// Update consultation status
export async function updateConsultationStatus(
  consultationId: string,
  newStatus: 'pending_payment' | 'paid' | 'completed'
): Promise<boolean> {
  try {
    const supabase = await createClient(cookies());
    
    const { error } = await supabase
      .from('analysis_records')
      .update({ status: newStatus })
      .eq('id', consultationId);

    if (error) {
      console.error('Error updating consultation status:', error);
      return false;
    }

    // Log audit event when doctor approves (marks as completed)
    if (newStatus === 'completed') {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('role, full_name, email')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Error fetching user profile for audit (approve):', profileError);
          }

          const doctorName = userProfile?.full_name || user.email || 'Unknown Doctor';
          
          console.log('Creating audit log for approval:', {
            consultation_id: consultationId,
            user_id: user.id,
            action: 'analysis_approved'
          });

          const { error: auditError } = await supabase.from('audit_logs').insert({
            consultation_id: consultationId,
            user_id: user.id,
            user_email: user.email || userProfile?.email || 'unknown',
            user_role: userProfile?.role || 'doctor',
            action: 'consultation_approved',
            action_details: `Dr. ${doctorName} reviewed and approved the AI-generated treatment plan without modifications`,
            field_changed: 'status',
            old_value: { status: 'paid' },
            new_value: { status: 'completed' }
          });

          if (auditError) {
            console.error('!!! AUDIT LOG INSERT FAILED (APPROVE) !!!', auditError);
            console.error('Audit error details:', JSON.stringify(auditError, null, 2));
          } else {
            console.log('✅ Approval audit log created successfully');
          }
        } else {
          console.warn('No user found for audit logging (approve)');
        }
      } catch (auditException) {
        console.error('Exception while creating approval audit log:', auditException);
      }
    }

    return true;
  } catch (error) {
    console.error('Error in updateConsultationStatus:', error);
    return false;
  }
}

// Fetch consultations for doctors (paid and completed only)
export async function fetchDoctorConsultations(): Promise<ConsultationRecord[]> {
  try {
    const supabase = await createClient(cookies());
    
    const { data, error } = await supabase
      .from('analysis_records')
      .select('*')
      .in('status', ['paid', 'completed'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching doctor analysis records:', error);
      return [];
    }

    // Transform database records to ConsultationRecord format
    return data.map(record => ({
      id: record.id,
      patientId: record.patient_id,
      patientName: record.patient_name,
      timestamp: new Date(record.created_at).getTime(),
      status: record.status,
      patientData: record.patient_data,
      aiAnalysis: record.ai_analysis,
    }));
  } catch (error) {
    console.error('Error in fetchDoctorConsultations:', error);
    return [];
  }
}

// Update consultation AI analysis (for doctor edits)
export async function updateConsultationAnalysis(
  consultationId: string,
  updatedAnalysis: ClinicalResponse
): Promise<boolean> {
  try {
    const supabase = await createClient(cookies());
    
    // Get current user and old analysis for audit trail
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: oldRecord } = await supabase
      .from('analysis_records')
      .select('ai_analysis')
      .eq('id', consultationId)
      .single();
    
    const { error } = await supabase
      .from('analysis_records')
      .update({ 
        ai_analysis: updatedAnalysis,
        status: 'completed' // Mark as completed after doctor review
      })
      .eq('id', consultationId);

    if (error) {
      console.error('Error updating consultation analysis:', error);
      return false;
    }

    // Log audit event for medical compliance
    if (user && oldRecord) {
      try {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name, email')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile for audit:', profileError);
        }

        const doctorName = userProfile?.full_name || user.email || 'Unknown Doctor';
        
        // Create summary of changes instead of storing entire objects
        const oldSummary = {
          primary_complaint: oldRecord.ai_analysis?.summary?.primary_complaint,
          risk_level: oldRecord.ai_analysis?.summary?.risk_level,
          medication_count: oldRecord.ai_analysis?.treatment_plan?.recommended_medications?.length || 0
        };

        const newSummary = {
          primary_complaint: updatedAnalysis?.summary?.primary_complaint,
          risk_level: updatedAnalysis?.summary?.risk_level,
          medication_count: updatedAnalysis?.treatment_plan?.recommended_medications?.length || 0
        };

        console.log('Creating audit log entry:', {
          consultation_id: consultationId,
          user_id: user.id,
          user_email: user.email || userProfile?.email || 'unknown',
          user_role: userProfile?.role || 'doctor',
          action: 'analysis_edited'
        });

        const { error: auditError } = await supabase.from('audit_logs').insert({
          consultation_id: consultationId,
          user_id: user.id,
          user_email: user.email || userProfile?.email || 'unknown',
          user_role: userProfile?.role || 'doctor',
          action: 'consultation_edited',
          action_details: `Dr. ${doctorName} reviewed and modified the treatment plan`,
          field_changed: 'ai_analysis',
          old_value: oldSummary,
          new_value: newSummary
        });

        if (auditError) {
          console.error('!!! AUDIT LOG INSERT FAILED !!!', auditError);
          console.error('Audit error details:', JSON.stringify(auditError, null, 2));
        } else {
          console.log('✅ Audit log created successfully');
        }
      } catch (auditException) {
        console.error('Exception while creating audit log:', auditException);
      }
    } else {
      console.warn('Cannot create audit log - missing user or oldRecord', { 
        hasUser: !!user, 
        hasOldRecord: !!oldRecord 
      });
    }

    return true;
  } catch (error) {
    console.error('Error in updateConsultationAnalysis:', error);
    return false;
  }
}

// Fetch available doctors
export async function fetchAvailableDoctors(): Promise<Doctor[]> {
  try {
    const supabase = await createClient(cookies());
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'doctor')
      .order('full_name');

    if (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }

    return data.map(doc => ({
      id: doc.id,
      fullName: doc.full_name || doc.email,
      email: doc.email
    }));
  } catch (error) {
    console.error('Error in fetchAvailableDoctors:', error);
    return [];
  }
}

// Create consultation schedule
export async function createConsultationSchedule(
  analysisId: string,
  patientId: string,
  doctorId: string,
  scheduledAt: Date,
  notes?: string
): Promise<string | null> {
  try {
    const supabase = await createClient(cookies());
    
    const { data, error } = await supabase
      .from('consultation_schedules')
      .insert({
        analysis_id: analysisId,
        patient_id: patientId,
        doctor_id: doctorId,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: 30,
        status: 'pending',
        notes: notes || null
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating consultation schedule:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error in createConsultationSchedule:', error);
    return null;
  }
}

// =============================================
// AUDIT LOGGING SYSTEM
// =============================================

export async function logAuditEvent(
  consultationId: string,
  userId: string,
  userEmail: string,
  userRole: 'patient' | 'doctor',
  action: AuditAction,
  details?: {
    actionDetails?: string;
    fieldChanged?: string;
    oldValue?: any;
    newValue?: any;
  }
): Promise<boolean> {
  try {
    const supabase = await createClient(cookies());
    
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        consultation_id: consultationId,
        user_id: userId,
        user_email: userEmail,
        user_role: userRole,
        action: action,
        action_details: details?.actionDetails || null,
        field_changed: details?.fieldChanged || null,
        old_value: details?.oldValue || null,
        new_value: details?.newValue || null
      });

    if (error) {
      console.error('Error logging audit event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in logAuditEvent:', error);
    return false;
  }
}

export async function getAuditTrail(consultationId: string): Promise<AuditLog[]> {
  try {
    const supabase = await createClient(cookies());
    
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('consultation_id', consultationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audit trail:', error);
      return [];
    }

    return (data || []).map(log => ({
      id: log.id,
      consultationId: log.consultation_id,
      userId: log.user_id,
      userEmail: log.user_email,
      userRole: log.user_role,
      action: log.action,
      actionDetails: log.action_details,
      fieldChanged: log.field_changed,
      oldValue: log.old_value,
      newValue: log.new_value,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      createdAt: new Date(log.created_at)
    }));
  } catch (error) {
    console.error('Error in getAuditTrail:', error);
    return [];
  }
}

// Generate treatment plan and save to database
export async function generateTreatmentPlan(
  patientData: PatientData,
  userId: string,
  userEmail: string
): Promise<{ analysis: ClinicalResponse; consultationId: string } | null> {
  try {
    const prompt = `
You are an expert AI medical assistant following evidence-based medicine guidelines. Analyze the following patient case and provide a detailed clinical response in strict JSON format.

MEDICAL SAFETY PROTOCOLS TO FOLLOW:

1. DRUG INTERACTION RULES:
   - Check ALL current medications against recommendations
   - Flag combinations: NSAIDs + Anticoagulants, SSRIs + MAOIs, Multiple CNS depressants
   - Flag QT-prolonging drug combinations (macrolides + antiarrhythmics)
   - Consider CYP450 enzyme interactions
   
2. CONTRAINDICATION CHECKS:
   - Pregnancy/breastfeeding contraindications (FDA categories)
   - Renal impairment (adjust doses if CrCl <60 mL/min)
   - Hepatic impairment (Child-Pugh classification)
   - Age-based: Beers Criteria for geriatric (≥65), pediatric safety (<18)
   - Known allergies and cross-reactivity (e.g., penicillin → cephalosporins)
   
3. DOSAGE VALIDATION:
   - Adult standard ranges from FDA-approved labeling
   - Maximum daily doses must not be exceeded
   - Renal/hepatic dose adjustments when indicated
   - Duration appropriateness (antibiotics 7-14 days, not prolonged unnecessarily)
   - Weight-based dosing for pediatrics
   
4. RED FLAGS REQUIRING IMMEDIATE REFERRAL:
   - Chest pain with cardiac risk factors → ER
   - Severe vital sign abnormalities (BP >180/120, HR >120, Temp >39.4°C)  
   - Altered mental status, seizures, stroke symptoms
   - Acute abdomen, severe trauma, major bleeding
   - Suicidal ideation or violent behavior
   
5. CLINICAL GUIDELINES TO REFERENCE:
   - AHA/ACC for cardiovascular conditions
   - IDSA for infectious diseases  
   - JNC-8 for hypertension management
   - ADA for diabetes management
   - NHLBI for asthma/COPD

Patient Data:
${JSON.stringify(patientData, null, 2)}

Required Output Format (JSON only):
{
  "summary": {
    "primary_complaint": "string",
    "risk_level": "Low" | "Medium" | "High",
    "key_flags": ["string"],
    "patient_friendly_explanation": "string",
    "guideline_check": "string (cite which guideline was referenced)"
  },
  "treatment_plan": {
    "recommended_medications": [
      {
        "name": "string (generic name preferred)",
        "dosage": "string (with units)",
        "frequency": "string",
        "duration": "string",
        "reasoning": "string (must explain why this specific drug/dose, cite guideline if applicable)"
      }
    ],
    "lifestyle_recommendations": ["string"],
    "alternative_options": ["string"]
  },
  "safety_analysis": {
    "drug_interactions": ["string (specify drug pairs and severity)"],
    "contraindications": ["string (explain why contraindicated)"],
    "allergy_warnings": ["string"],
    "vital_sign_red_flags": ["string (identify abnormal vitals)"],
    "lifestyle_risk_factors": ["string"],
    "dosage_concerns": ["string (explain any dose adjustments needed)"],
    "physiological_simulation": [
      {
        "parameter": "string (e.g. Cardiac Load, Liver Metabolism, Kidney Function, CNS Activity)",
        "baseline": number (0-100 normalized),
        "predicted": number (0-100 normalized),
        "unit": "string",
        "risk_direction": "increase" | "decrease" | "stable"
      }
    ]
  },
  "followup_instructions": {
    "monitoring": ["string (what to monitor and when)"],
    "when_to_call_doctor": ["string (specific symptoms)"],
    "when_to_refer_er": ["string (emergency warning signs)"]
  }
}

CRITICAL: Ensure all drug interactions are identified. Check current medications against each recommended medication. Be conservative with risk assessment. When in doubt, recommend specialist consultation.
    `;

    // Using gemini-1.5-flash as the standard fast model. 
    // If you have access to gemini-2.0-flash-exp, you can change the model name.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro", 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });



    if (response && response.text) {
        // Clean up markdown code blocks if present (e.g. ```json ... ```)
        const cleanText = response.text.replace(/```json|```/g, '').trim();
        const jsonResponse = JSON.parse(cleanText);
        let analysis = jsonResponse as ClinicalResponse;
        
        // ========================================
        // FDA VALIDATION LAYER
        // ========================================
        try {
          const medicationNames = analysis.treatment_plan.recommended_medications.map(m => m.name);
          
          // 1. Check drug interactions with OpenFDA
          const fdaInteractions = await checkDrugInteractions(
            medicationNames,
            patientData.medications
          );
          
          // Merge FDA findings with LLM findings
          const fdaInteractionStrings = fdaInteractions.map(
            i => `[FDA] ${i.drug1} + ${i.drug2}: ${i.description} (Severity: ${i.severity})`
          );
          analysis.safety_analysis.drug_interactions = [
            ...analysis.safety_analysis.drug_interactions,
            ...fdaInteractionStrings
          ];
          
          // 2. Check contraindications from patient history
          const patientConditions = patientData.history
            .split(/[,;.]/)
            .map(c => c.trim())
            .filter(c => c.length > 0);
          
          for (const med of medicationNames) {
            const fdaContraindications = await checkContraindications(med, patientConditions);
            analysis.safety_analysis.contraindications = [
              ...analysis.safety_analysis.contraindications,
              ...fdaContraindications
            ];
          }
          
          // 3. Validate dosages
          const patientAge = parseInt(patientData.age) || undefined;
          for (const med of analysis.treatment_plan.recommended_medications) {
            const dosageValidation = await validateDosage(med.name, med.dosage, patientAge);
            if (!dosageValidation.valid) {
              analysis.safety_analysis.dosage_concerns = [
                ...analysis.safety_analysis.dosage_concerns,
                ...dosageValidation.warnings.map(w => `[FDA] ${med.name}: ${w}`)
              ];
            }
          }
        } catch (fdaError) {
          console.warn('FDA validation failed, continuing with LLM data only:', fdaError);
          // Continue without FDA validation if API fails
          analysis.summary.fda_validated = false;
          analysis.summary.confidence_score = 'medium'; // Lower confidence without FDA validation
        }
        
        // Calculate overall confidence score if FDA validation succeeded
        if (analysis.summary.fda_validated !== false) {
          analysis.summary.fda_validated = true;
          
          // Determine confidence based on safety findings
          const hasMajorInteractions = analysis.safety_analysis.drug_interactions.some(
            i => i.includes('major') || i.includes('contraindicated')
          );
          const hasContraindications = analysis.safety_analysis.contraindications.length > 0;
          const hasDosageConcerns = analysis.safety_analysis.dosage_concerns.length > 0;
          
          if (hasMajorInteractions || (hasContraindications && hasDosageConcerns)) {
            analysis.summary.confidence_score = 'low'; // Requires specialist review
          } else if (hasContraindications || hasDosageConcerns) {
            analysis.summary.confidence_score = 'medium'; // Proceed with caution
          } else {
            analysis.summary.confidence_score = 'high'; // Safe to proceed
          }
        }
        
        // Save to database
        const saved = await saveConsultation(userId, userEmail, patientData, analysis);
        
        if (saved) {
          return { analysis, consultationId: saved.id };
        }
        
        // Return analysis even if save fails (for demo purposes)
        console.warn('Analysis generated but not saved to database');
        return { analysis, consultationId: 'temp-' + Date.now() };
    }
    
    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("AI Generation Error:", error);
    // Return mock data ONLY if API fails (for development continuity if key is missing)
    // In production you might want to return null to show error
    if (process.env.NODE_ENV === 'development') {
        console.warn("Falling back to mock data due to API error (likely missing key)");
        const mockAnalysis = getMockClinicalResponse();
        
        // Try to save mock data too
        const saved = await saveConsultation(userId, userEmail, patientData, mockAnalysis);
        
        return { 
          analysis: mockAnalysis, 
          consultationId: saved?.id || 'mock-' + Date.now() 
        };
    }
    return null;
  }
}

function getMockClinicalResponse(): ClinicalResponse {
    return {
        summary: {
            primary_complaint: "Sample Complaint (Mock Data)",
            risk_level: "Medium",
            key_flags: ["Mock Flag 1", "Mock Flag 2"],
            patient_friendly_explanation: "This is a mock response because the API call failed or is not configured.",
            guideline_check: "Mock Guideline Check"
        },
        treatment_plan: {
            recommended_medications: [
                { name: "Mock Med A", dosage: "10mg", frequency: "Daily", duration: "7 days", reasoning: "Mock reasoning" }
            ],
            lifestyle_recommendations: ["Rest", "Drink water"],
            alternative_options: ["Mock Alternative"]
        },
        safety_analysis: {
            drug_interactions: [],
            contraindications: [],
            allergy_warnings: [],
            vital_sign_red_flags: [],
            lifestyle_risk_factors: [],
            dosage_concerns: [],
            physiological_simulation: [
                { parameter: "Cardiac Load", baseline: 80, predicted: 85, unit: "%", risk_direction: "increase" },
                { parameter: "Liver Function", baseline: 90, predicted: 90, unit: "%", risk_direction: "stable" }
            ]
        },
        followup_instructions: {
            monitoring: ["Mock Monitor"],
            when_to_call_doctor: ["Worsening symptoms"],
            when_to_refer_er: ["Severe pain"]
        }
    };
}
