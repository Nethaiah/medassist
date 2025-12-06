'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Auth } from '@/app/auth/page'; 
import { DoctorDashboard } from '@/components/doctor-dashboard';
import { PatientDashboard } from '@/components/patient-dashboard';
import { PatientForm } from '@/components/patient-form';
import { TreatmentPlan } from '@/components/treatment-plan';
import { PaymentModal } from '@/components/payment-modal';
import { SchedulingModal } from '@/components/scheduling-modal';
import { Header } from '@/components/header';
import { Modal } from '@/components/ui/modal';
import { Loader2, Activity } from 'lucide-react';
import { useAutomaticReminders } from '@/hooks/useAutomaticReminders';
import { AlertDialog } from '@/components/ui/alert-dialog';
import type { PatientData, ClinicalResponse, ConsultationRecord, Doctor } from '@/lib/types';
import { 
  generateTreatmentPlan, 
  fetchPatientConsultations,
  updateConsultationStatus,
  fetchDoctorConsultations,
  updateConsultationAnalysis,
  fetchAvailableDoctors,
  createConsultationSchedule
} from '@/app/server/actions';

type DashboardView = 'loading' | 'auth' | 'doctor' | 'patient' | 'analysis_result';

export default function Home() {
  const supabase = createClient()
  
  // Enable automatic reminder checking (once per day)
  useAutomaticReminders();
  
  const [view, setView] = useState<DashboardView>('loading');
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'patient' | 'doctor'>('patient');
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [patientData, setPatientData] = useState<PatientData>({
    age: '',
    gender: '',
    weight: '',
    complaint: '',
    history: '',
    medications: '',
    allergies: '',
    vitals: { bp: '', hr: '', temp: '' }
  });

  const [analysisResult, setAnalysisResult] = useState<ClinicalResponse | null>(null);
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationRecord | null>(null);
  const [viewConsultationModal, setViewConsultationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [consultationToPay, setConsultationToPay] = useState<string | null>(null);
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning' | 'info'; title?: string; message: string }>({ isOpen: false, type: 'info', message: '' });
  const [doctorConsultations, setDoctorConsultations] = useState<ConsultationRecord[]>([]);
  
  // Scheduling state
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [scheduleData, setScheduleData] = useState<{
    doctorId: string;
    scheduledAt: Date;
    notes: string;
  } | null>(null);
  
  // Current consultation ID (for freshly generated analysis)
  const [currentConsultationId, setCurrentConsultationId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check active session on load
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        handleUserAuthenticated(session.user);
      } else {
        setView('auth');
      }
    };

    checkSession();

    // 2. Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleUserAuthenticated(session.user);
      } else {
        setView('auth');
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Logic to fetch role from DB and switch views
  const handleUserAuthenticated = async (authUser: any) => {
    setUser(authUser);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      setUserRole(data.role);
      if (data.role === 'doctor') {
        setView('doctor');
        // Load consultations for doctors
        await loadDoctorConsultations();
      } else {
        setView('patient');
        // Load consultations for patients
        await loadConsultations(authUser.id);
      }
    } catch (error) {
      console.error('Error fetching role:', error);
      // Fallback if role is missing
      setUserRole('patient');
      setView('patient'); 
    }
  };

  const loadConsultations = async (userId: string) => {
    const records = await fetchPatientConsultations(userId);
    setConsultations(records);
  };

  const loadDoctorConsultations = async () => {
    const records = await fetchDoctorConsultations();
    setDoctorConsultations(records);
  };

  const handleViewConsultation = (consultation: ConsultationRecord) => {
    setSelectedConsultation(consultation);
    setViewConsultationModal(true);
  };

  const handleShowPayment = async (consultationId: string) => {
    setConsultationToPay(consultationId);
    
    // Fetch available doctors
    const doctors = await fetchAvailableDoctors();
    setAvailableDoctors(doctors);
    
    // Show scheduling modal first
    setShowSchedulingModal(true);
  };

  const handleScheduleSelected = (doctorId: string, scheduledAt: Date, notes: string) => {
    // Store schedule data
    setScheduleData({ doctorId, scheduledAt, notes });
    
    // Close scheduling modal and show payment modal
    setShowSchedulingModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async () => {
    // Guard clause: ensure consultationToPay is not null
    if (!consultationToPay) {
      setAlertDialog({ isOpen: true, type: 'error', message: 'Invalid consultation ID.' });
      return;
    }
    
    // Update consultation status to 'paid'
    const success = await updateConsultationStatus(consultationToPay, 'paid');
    
    if (success && scheduleData) {
      // Create consultation schedule
      const scheduleId = await createConsultationSchedule(
        consultationToPay,
        user!.id,
        scheduleData.doctorId,
        scheduleData.scheduledAt,
        scheduleData.notes
      );
      
      if (scheduleId) {
        // Immediately update the selected consultation status in UI
        if (selectedConsultation && selectedConsultation.id === consultationToPay) {
          setSelectedConsultation({
            ...selectedConsultation,
            status: 'paid'
          });
        }
        
        // Reload consultations in background
        if (user) {
          await loadConsultations(user.id);
        }
        await loadDoctorConsultations();
        
        // Close payment modal (user can manually close consultation modal)
        setShowPaymentModal(false);
        setConsultationToPay('');
        setScheduleData(null);
      } else {
        setShowPaymentModal(false);
        setAlertDialog({ isOpen: true, type: 'error', message: 'Payment successful but scheduling failed. Please contact support.' });
      }
    } else {
      setShowPaymentModal(false);
      setAlertDialog({ isOpen: true, type: 'error', message: 'Payment update failed. Please try again.' });
    }
  };

  const handleSaveConsultation = async (consultationId: string, updatedData: ClinicalResponse) => {
    const success = await updateConsultationAnalysis(consultationId, updatedData);
    
    if (success) {
      // Reload consultations to get updated status
      if (userRole === 'doctor') {
        await loadDoctorConsultations();
      } else if (user) {
        await loadConsultations(user.id);
      }
      
      // Update the selected consultation with new status
      if (selectedConsultation) {
        setSelectedConsultation({
          ...selectedConsultation,
          aiAnalysis: updatedData,
          status: 'completed' // Mark as completed
        });
      }
      
      setAlertDialog({ isOpen: true, type: 'success', message: 'Analysis reviewed and marked as complete!' });
      // Don't close modal - let doctor see the completed status
    } else {
      setAlertDialog({ isOpen: true, type: 'error', message: 'Failed to update consultation. Please try again.' });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('auth');
    setAnalysisResult(null); // Reset analysis on logout
  };

  const handlePatientFormSubmit = async () => {
    setIsAnalyzing(true);
    try {
      const result = await generateTreatmentPlan(patientData, user.id, user.email);
      
      if (result) {
        setShowPatientForm(false);
        // Reload consultations
        await loadConsultations(user.id);
        
        // Auto-open the newly created consultation
        const newConsultation: ConsultationRecord = {
          id: result.consultationId,
          patientId: user.id,
          patientName: user.email || 'Patient',
          timestamp: Date.now(),
          status: 'pending_payment',
          patientData: patientData,
          aiAnalysis: result.analysis
        };
        
        setSelectedConsultation(newConsultation);
        setViewConsultationModal(true);
      } else {
        setAlertDialog({ isOpen: true, type: 'error', message: 'Failed to generate analysis. Please try again.' });
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      setAlertDialog({ isOpen: true, type: 'error', message: 'Error processing form. Please try again.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- RENDER LOGIC ---

  if (view === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl p-4 shadow-2xl inline-block mb-4 animate-pulse">
            <Activity className="w-12 h-12 text-white" />
          </div>
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-600 mt-3 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (view === 'doctor') {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-indigo-50">
        <Header 
          user={{ email: user?.email, role: userRole }} 
          onLogout={handleLogout} 
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DoctorDashboard 
            doctorName={user?.email || 'Doctor'}
            consultations={doctorConsultations} // You will connect real data later
            onViewCase={handleViewConsultation} 
            onLogout={handleLogout}
          />
        </main>

        {/* Consultation View Modal */}
        <Modal
          isOpen={viewConsultationModal}
          onClose={() => setViewConsultationModal(false)}
          title="Patient Consultation Review"
          maxWidth="max-w-7xl"
        >
          {selectedConsultation && (
            <TreatmentPlan
              data={selectedConsultation.aiAnalysis}
              onBack={() => setViewConsultationModal(false)}
              showConsultAction={false}
              consultationPaid={selectedConsultation.status === 'paid'}
              isDialogMode={true}
              isEditable={true}
              onSave={(updatedData) => handleSaveConsultation(selectedConsultation.id, updatedData)}
            />
          )}
        </Modal>
      </div>
    );
  }

  if (view === 'patient') {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
        <Header 
          user={{ email: user?.email, role: userRole }} 
          onLogout={handleLogout} 
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PatientDashboard 
            patientName={user?.email || 'Patient'}
            consultations={consultations} 
            onNewCase={() => setShowPatientForm(true)} 
            onViewCase={handleViewConsultation}
          />
        </main>
        
        {/* Patient Form Modal */}
        <Modal
          isOpen={showPatientForm}
          onClose={() => setShowPatientForm(false)}
          title="New Clinical Analysis"
          maxWidth="max-w-4xl"
        >
          <PatientForm
            data={patientData}
            onChange={setPatientData}
            onSubmit={handlePatientFormSubmit}
            loading={isAnalyzing}
          />
        </Modal>

        {/* Consultation View Modal */}
        <Modal
          isOpen={viewConsultationModal}
          onClose={() => setViewConsultationModal(false)}
          title="Consultation Details"
          maxWidth="max-w-7xl"
        >
          {selectedConsultation && (
            <>
              {console.log('Selected consultation:', selectedConsultation)}
              {console.log('Status:', selectedConsultation.status)}
              <TreatmentPlan
                data={selectedConsultation.aiAnalysis}
                onBack={() => setViewConsultationModal(false)}
                showConsultAction={selectedConsultation.status === 'pending_payment'}
                onConsult={() => handleShowPayment(selectedConsultation.id)}
                consultationPaid={selectedConsultation.status === 'paid'}
                isDialogMode={true}
                isEditable={userRole === 'doctor'}
                onSave={(updatedData) => handleSaveConsultation(selectedConsultation.id, updatedData)}
                consultation={{ id: selectedConsultation.id, status: selectedConsultation.status }}
              />
            </>
          )}
        </Modal>

        {/* Scheduling Modal */}
        <SchedulingModal
          isOpen={showSchedulingModal}
          onClose={() => {
            setShowSchedulingModal(false);
            setConsultationToPay('');
          }}
          onSchedule={handleScheduleSelected}
          doctors={availableDoctors}
        />

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
          consultationId={consultationToPay || ''}
        />
        
        {/* Custom Alert Dialog */}
        <AlertDialog
          isOpen={alertDialog.isOpen}
          onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
          type={alertDialog.type}
          title={alertDialog.title}
          message={alertDialog.message}
        />
      </div>
    );
  }

  if (view === 'analysis_result' && analysisResult) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
        <Header 
          user={{ email: user?.email, role: userRole }} 
          onLogout={handleLogout} 
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <TreatmentPlan 
            data={analysisResult} 
            onBack={() => setView('patient')}
            showConsultAction={true}
            onConsult={() => {
              // Find the consultation ID from recent consultations
              const recentConsultation = consultations.find(c => 
                JSON.stringify(c.aiAnalysis) === JSON.stringify(analysisResult)
              );
              if (recentConsultation) {
                handleShowPayment(recentConsultation.id);
              } else {
                setAlertDialog({ isOpen: true, type: 'error', message: 'Consultation ID not found' });
              }
            }}
          />
        </main>
      </div>
    );
  }

  // Default to Auth
  return (
    <Auth 
      onLogin={() => setView('loading')} // The useEffect listener handles the actual redirection
    />
  );
}