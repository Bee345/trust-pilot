const supabase = require('../config/supabase');

async function createUser({ name, phone, passwordHash }) {
  const { data, error } = await supabase
    .from('users')
    .insert({ name, phone, password_hash: passwordHash })
    .select('id, name, phone, is_verified, trust_points, created_at')
    .single();
  if (error) {throw error;}
  return data;
}

async function findUserByPhone(phone) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();
  if (error && error.code === 'PGRST116') {return null;}
  if (error) {throw error;}
  return data;
}

async function findUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, phone, is_verified, verification_type, trust_points, created_at')
    .eq('id', id)
    .single();
  if (error) {throw error;}
  return data;
}

async function updateUser(id, fields) {
  const { data, error } = await supabase
    .from('users')
    .update(fields)
    .eq('id', id)
    .select('id, name, phone, is_verified, trust_points')
    .single();
  if (error) {throw error;}
  return data;
}

async function incrementTrustPoints(id, points) {
  const { error } = await supabase.rpc('increment_trust_points', {
    user_id: id,
    points,
  });
  if (error) {throw error;}
}

module.exports = { createUser, findUserByPhone, findUserById, updateUser, incrementTrustPoints };
