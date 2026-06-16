/* Shared device-id cookie helper for api/*.js.
   Lives outside api/ so Vercel never mistakes it for a route. */

import { randomUUID } from 'node:crypto';

const COOKIE_NAME    = 'ss_device';
const COOKIE_MAX_AGE = 365 * 24 * 3600; // 1 year

export function getDeviceId(req) {
  const raw   = req.headers.cookie || '';
  const match = raw.match(/(?:^|;\s*)ss_device=([a-f0-9-]{36})/);
  return match ? match[1] : null;
}

export function setDeviceCookie(res, id) {
  res.setHeader('Set-Cookie',
    `${COOKIE_NAME}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`);
}

export function ensureDeviceId(req, res) {
  let id = getDeviceId(req);
  if (!id) { id = randomUUID(); setDeviceCookie(res, id); }
  return id;
}

export function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
}
