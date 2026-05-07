const supabase = require('../config/supabase');

async function createVerification({ userId, type, paystackRef }) {
  const { data, error } = await supabase
    .from('verifications')
    .insert({ user_id: userId, type, paystack_ref: paystackRef })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getVerificationByUserId(userId) {
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

async function updateVerificationStatus(id, status) {
  const { data, error } = await supabase
    .from('verifications')
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getVerificationByPaystackRef(ref) {
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('paystack_ref', ref)
    .single();
  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

module.exports = {
  createVerification,
  getVerificationByUserId,
  updateVerificationStatus,
  getVerificationByPaystackRef,
};
