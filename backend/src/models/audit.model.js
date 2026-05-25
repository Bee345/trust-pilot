const supabase = require('../config/supabase');

async function createAuditLog({ userId, action, entity, entityId, ipAddress, userAgent, metadata }) {
  const { error } = await supabase.from('audit_logs').insert({
    user_id: userId || null,
    action,
    entity,
    entity_id: entityId || null,
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
    metadata: metadata || null,
  });

  if (error) {
    process.stderr.write(`[audit] Failed to write audit log: ${error.message}\n`);
  }
}

async function findRecentReportByIp(ipAddress, phone, windowMinutes) {
  if (!ipAddress || !phone) {return null;}
  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id')
    .eq('action', 'REPORT_SUBMITTED')
    .eq('ip_address', ipAddress)
    .eq('entity_id', phone)
    .gte('created_at', since)
    .limit(1)
    .maybeSingle();
  if (error) {
    process.stderr.write(`[audit] findRecentReportByIp error: ${error.message}\n`);
    return null;
  }
  return data;
}

module.exports = { createAuditLog, findRecentReportByIp };
