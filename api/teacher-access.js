'use strict';
const crypto = require('node:crypto');
module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ok:false}); }
  const configured = process.env.TEACHER_ACCESS_CODE;
  if (!configured) return res.status(503).json({ok:false, error:'not_configured'});
  const provided = typeof req.body?.code === 'string' ? req.body.code : '';
  if (provided.length < 1 || provided.length > 128) return res.status(401).json({ok:false});
  const a = crypto.createHash('sha256').update(configured,'utf8').digest();
  const b = crypto.createHash('sha256').update(provided,'utf8').digest();
  const ok = crypto.timingSafeEqual(a,b);
  return res.status(ok ? 200 : 401).json({ok});
};
