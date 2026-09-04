const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isRequired(value) {
  return value != null && String(value).trim().length > 0
}

export function isValidEmail(value) {
  return EMAIL_RE.test(String(value).trim())
}

export function isValidPhone(value) {
  const digits = String(value).replace(/\D/g, '')
  return digits.length >= 9
}
