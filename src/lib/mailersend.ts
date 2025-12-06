import nodemailer from 'nodemailer';

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailersend.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USERNAME || '',
    pass: process.env.SMTP_PASSWORD || '',
  },
});

interface ConsultationReminderData {
  patientEmail: string;
  patientName: string;
  doctorName: string;
  doctorEmail: string;
  scheduledAt: Date;
  durationMinutes: number;
  consultationId: string;
}

export async function sendConsultationReminder(data: ConsultationReminderData) {
  try {
    const scheduledDate = new Date(data.scheduledAt);
    const formattedDate = scheduledDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedTime = scheduledDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consultation Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🩺 Consultation Reminder
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Hello <strong>${data.patientName}</strong>,
              </p>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                This is a friendly reminder that you have an upcoming medical consultation scheduled with <strong>Dr. ${data.doctorName}</strong>.
              </p>

              <!-- Appointment Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: bold;">
                      📅 Appointment Details
                    </h2>
                    
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 140px;">
                          <strong>Date:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          ${formattedDate}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Time:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          ${formattedTime}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Duration:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          ${data.durationMinutes} minutes
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Doctor:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                          Dr. ${data.doctorName}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Consultation ID:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-family: monospace;">
                          ${data.consultationId.substring(0, 8)}...
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Important Notes -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 30px; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.6;">
                  <strong>⚠️ Important:</strong> Please be available at the scheduled time. If you need to reschedule or cancel, please contact us at least 24 hours in advance.
                </p>
              </div>

              <!-- Action Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${data.doctorEmail}" style="display: inline-block; padding: 14px 32px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      Contact Dr. ${data.doctorName}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6; text-align: center;">
                We look forward to seeing you!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; text-align: center;">
                This is an automated reminder from MedAssist
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                © ${new Date().getFullYear()} MedAssist. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const textContent = `
Hello ${data.patientName},

This is a reminder that you have an upcoming medical consultation scheduled with Dr. ${data.doctorName}.

APPOINTMENT DETAILS:
- Date: ${formattedDate}
- Time: ${formattedTime}
- Duration: ${data.durationMinutes} minutes
- Doctor: Dr. ${data.doctorName}
- Consultation ID: ${data.consultationId}

Please be available at the scheduled time. If you need to reschedule or cancel, please contact us at least 24 hours in advance.

Contact: ${data.doctorEmail}

Best regards,
MedAssist Team
    `;

    const fromName = process.env.SMTP_FROM_NAME || 'MedAssist';
    const fromEmail = process.env.SMTP_USERNAME || process.env.SMTP_FROM_EMAIL || '';

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: data.patientEmail,
      replyTo: `"Dr. ${data.doctorName}" <${data.doctorEmail}>`,
      subject: `Reminder: Consultation with Dr. ${data.doctorName} on ${formattedDate}`,
      text: textContent,
      html: htmlContent,
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error sending consultation reminder:', error);
    return { success: false, error };
  }
}
