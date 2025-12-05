'use client'; // Required for Next.js App Router

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { 
  Activity, ShieldCheck, Stethoscope, UserCircle, Lock, Loader2, AlertCircle 
} from 'lucide-react';

// --- Types ---
export type UserRole = 'patient' | 'doctor';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthFormData = z.infer<typeof authSchema>;

interface Props {
  onLogin: () => void;
}

export const Auth: React.FC<Props> = ({ onLogin }) => {
  const supabase = createClient()
  const [role, setRole] = useState<UserRole>('patient');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        // --- SIGN UP ---
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: { role: role },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          },
        });
        
        if (signUpError) throw signUpError;
        
        // Create profile in database
        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: signUpData.user.id,
              email: data.email,
              role: role,
            });
          
          if (profileError) {
            console.error('Profile creation error:', profileError);
            throw new Error('Account created but profile setup failed. Please contact support.');
          }
        }
        
        alert('Account created! Check your email to confirm, then sign in.');
        setIsSignUp(false);
      } else {
        // --- SIGN IN ---
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        
        // Let parent know we succeeded
        onLogin();
      }
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      {/* Logo Header */}
      <div className="mb-8 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-2">
           <div className="bg-blue-600 rounded-lg p-2 shadow-lg">
               <Activity className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-700 to-indigo-700">
              MedAssist Pro
           </h1>
        </div>
        <p className="text-slate-500">Clinical AI Decision Support System</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        {/* Role Toggles - Only shown during sign-up */}
        {isSignUp && (
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2
                ${role === 'patient' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <UserCircle className="w-4 h-4" /> Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2
                ${role === 'doctor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Stethoscope className="w-4 h-4" /> Doctor
            </button>
          </div>
        )}

        {/* Error Alert */}
        {authError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              {...register('email')}
              type="email"
              className={`w-full p-3 bg-slate-50 border rounded-lg focus:ring-2 outline-none transition text-black
                ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500'}`}
              placeholder={role === 'patient' ? "patient@example.com" : "dr.smith@hospital.com"}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type="password"
                className={`w-full p-3 pl-10 bg-slate-50 border rounded-lg focus:ring-2 outline-none transition text-black
                  ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500'}`}
                placeholder="••••••••"
              />
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition-transform transform active:scale-95 flex justify-center items-center gap-2
              ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
              ${role === 'patient' 
                ? 'bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
                : 'bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700'}`
            }
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setAuthError(null); }}
            className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="mt-6 flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
           <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
           <p className="text-xs text-slate-500 leading-relaxed">
             <strong>Secure Login:</strong> Authentication is handled via Supabase. Passwords are encrypted.
           </p>
        </div>
      </div>
    </div>
  );
};