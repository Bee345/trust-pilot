const NIGERIAN_PHONE_RE = /^(0[7-9][0-1]\d{8})$/;

export function isValidPhone(phone) {
  return NIGERIAN_PHONE_RE.test(phone);
}

export function isValidPassword(pw) {
  return typeof pw === 'string' && pw.length >= 8;
}
