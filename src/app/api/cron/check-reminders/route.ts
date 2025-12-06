import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { sendConsultationReminder } from '@/lib/mailersend';

export async function GET() {
  try {
    const supabase = await createClient(cookies());

    // Calculate date range: 1 to 2 days from now
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
    oneDayFromNow.setHours(0, 0, 0, 0);

    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    twoDaysFromNow.setHours(23, 59, 59, 999);

    // Query upcoming consultations
    const { data: schedules, error } = await supabase
      .from('consultation_schedules')
      .select(`
        id,
        scheduled_at,
        duration_minutes,
        status,
        analysis_id,
        patient:profiles!consultation_schedules_patient_id_fkey(id, email),
        doctor:profiles!consultation_schedules_doctor_id_fkey(id, email, full_name)
      `)
      .gte('scheduled_at', oneDayFromNow.toISOString())
      .lte('scheduled_at', twoDaysFromNow.toISOString())
      .in('status', ['confirmed', 'pending']);

    if (error) {
      console.error('Error fetching schedules:', error);
      return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
    }

    if (!schedules || schedules.length === 0) {
      return NextResponse.json({ 
        message: 'No upcoming consultations found',
        count: 0 
      });
    }

    // Send reminders
    const results = await Promise.allSettled(
      schedules.map(async (schedule: any) => {
        // Extract doctor name - try full_name first, then email username, then fallback
        let doctorName = 'Doctor';
        if (schedule.doctor?.full_name) {
          doctorName = schedule.doctor.full_name;
        } else if (schedule.doctor?.email) {
          // Extract name from email (e.g., "john.doe@example.com" -> "John Doe")
          const emailUsername = schedule.doctor.email.split('@')[0];
          doctorName = emailUsername
            .split(/[._-]/)
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }

        return sendConsultationReminder({
          patientEmail: schedule.patient.email,
          patientName: schedule.patient.email.split('@')[0], // Use email prefix as name
          doctorName: doctorName,
          doctorEmail: schedule.doctor?.email || 'doctor@medassist.com',
          scheduledAt: new Date(schedule.scheduled_at),
          durationMinutes: schedule.duration_minutes || 30,
          consultationId: schedule.id
        });
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      message: 'Reminder check completed',
      total: schedules.length,
      successful,
      failed,
      details: results.map((r, i) => ({
        schedule_id: schedules[i].id,
        status: r.status,
        error: r.status === 'rejected' ? r.reason : undefined
      }))
    });

  } catch (error) {
    console.error('Error in reminder cron:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
