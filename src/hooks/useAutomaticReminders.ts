'use client';

import { useEffect } from 'react';

const REMINDER_CHECK_KEY = 'last_reminder_check';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useAutomaticReminders() {
  useEffect(() => {
    const checkAndSendReminders = async () => {
      try {
        // Get last check time from localStorage
        const lastCheck = localStorage.getItem(REMINDER_CHECK_KEY);
        const now = Date.now();
        
        // Only check once per day
        if (lastCheck && (now - parseInt(lastCheck)) < CHECK_INTERVAL_MS) {
          return;
        }

        // Call the reminder endpoint
        const response = await fetch('/api/cron/check-reminders');
        
        if (response.ok) {
          const result = await response.json();
          console.log('Reminder check completed:', result);
          
          // Update last check time
          localStorage.setItem(REMINDER_CHECK_KEY, now.toString());
        }
      } catch (error) {
        console.error('Failed to check reminders:', error);
      }
    };

    // Run check on component mount
    checkAndSendReminders();
  }, []);
}
