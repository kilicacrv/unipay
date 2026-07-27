import { supabase } from './supabase';

/**
 * Log a system event to the system_logs table
 * @param {string} event_type - 'qr_scan_success', 'qr_scan_error', 'student_registered', 'business_approved', 'business_rejected', 'student_approved', 'student_rejected'
 * @param {string|null} user_id - The ID of the user triggering the action (can be null for guests)
 * @param {string|null} business_id - The ID of the business involved (if any)
 * @param {object} details - Additional contextual data (JSON)
 */
export const logSystemEvent = async (event_type, user_id = null, business_id = null, details = {}) => {
  try {
    await supabase.from('system_logs').insert({
      event_type,
      user_id,
      business_id,
      details
    });
  } catch (error) {
    console.error('Failed to log system event:', error);
  }
};
