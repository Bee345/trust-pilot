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

module.exports = { createAuditLog };
