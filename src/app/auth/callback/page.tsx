'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Activity, CheckCircle, Loader2, XCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        const supabase = createClient();
        
        // Supabase automatically handles the email verification when the page loads
        // We just need to check if there's a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (session) {
          // Email verified successfully! Now sign out so user needs to sign in
          await supabase.auth.signOut();
          setStatus('success');
        } else {
          // No session means verification failed
          throw new Error('Unable to verify email. The link may have expired.');
        }
        
      } catch (error: any) {
        console.error('Email verification error:', error);
        setErrorMessage(error.message || 'Verification failed');
        setStatus('error');
      }
    };

    // Small delay to allow Supabase to process the URL hash
    const timer = setTimeout(handleEmailVerification, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      {/* Logo Header */}
      <div className="mb-8 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="bg-blue-600 rounded-lg p-2 shadow-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-700 to-indigo-700">
            MedAssist
          </h1>
        </div>
        <p className="text-slate-500">Clinical AI Decision Support System</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        {status === 'loading' && (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Verifying Your Email
            </h2>
            <p className="text-slate-600">Please wait while we confirm your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-8 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Email Verified Successfully! 🎉
            </h2>
            <div className="space-y-3 text-slate-600">
              <p className="text-lg">
                Your email has been confirmed.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-blue-800 font-medium">
                  You can now close this page and sign in to your account.
                </p>
              </div>
            </div>
            <button
              onClick={() => window.close()}
              className="mt-6 w-full py-3 rounded-lg font-bold text-white shadow-lg transition-transform transform active:scale-95 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Close This Page
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-8 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 rounded-full p-4">
                <XCircle className="w-16 h-16 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Verification Failed
            </h2>
            <p className="text-slate-600 mb-4">
              {errorMessage || 'We couldn\'t verify your email address.'}
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Please try signing up again or contact support if the problem persists.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
