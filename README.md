# MedAssist

An intelligent, full-stack healthcare platform designed to bridge the gap between patients and medical professionals. By integrating AI-driven clinical analysis with the official FDA database, MedAssist streamlines the consultation process, enhances patient safety, and empowers doctors with data-driven insights.

## 🎯 Core Features

- **Role-Based Dashboards**: Distinct, secure interfaces for both Patients and Doctors to manage their health data and schedules.
- **AI-Powered Clinical Analysis**: Utilizes Google's Gemini AI to analyze patient intake forms (symptoms, vitals, medical history, allergies) and generate comprehensive preliminary treatment plans.
- **OpenFDA Integration for Patient Safety**: 
  - **Drug Interaction Checker**: Automatically flags potential interactions between newly prescribed medications and a patient's current drug regimen.
  - **Contraindication & Dosage Validation**: Checks for drug contraindications based on patient conditions and validates dosages using real-time OpenFDA data.
  - **Adverse Events Tracking**: Pulls historical adverse event reports for specific medications.
- **End-to-End Consultation Workflow**: Handles everything from patient symptom submission and AI analysis to doctor scheduling and secure payments.
- **Scheduling & Notifications**: Built-in scheduling system with automated email reminders to keep patients and doctors aligned on upcoming appointments.
- **Audit Trails & Security**: Maintains strict audit logs for any modifications made to a consultation or treatment plan.

## 💻 Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Lucide React, Recharts
- **Backend / API**: Next.js Server Actions
- **Database & Authentication**: Supabase (PostgreSQL, Row Level Security, SSR Auth)
- **AI Integration**: Google GenAI SDK
- **External APIs**: OpenFDA API
- **Forms & Validation**: React Hook Form, Zod
- **Email/Notifications**: MailerSend, Nodemailer

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase project (for Authentication and Database)
- Google Gemini API Key
- MailerSend API Key (optional, for email notifications)

### Installation

1. Clone the repository and navigate into the project directory.

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up your environment variables. Create a `.env` or `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   MAILERSEND_API_KEY=your_mailersend_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/) if you want to contribute.

## 📝 License

This project is licensed under the MIT License.
