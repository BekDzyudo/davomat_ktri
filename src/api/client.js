const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.100.10'

const ACCESS_KEY = 'davomat-access-token'
const REFRESH_KEY = 'davomat-refresh-token'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export class ApiError extends Error {
  constructor(status, data) {
    super(extractErrorMessage(data) || "So'rovda xatolik yuz berdi")
    this.status = status
    this.data = data
  }
}

const FIELD_LABELS = {
  username: 'Login',
  password: 'Parol',
  full_name: 'F.I.Sh',
  phone: 'Telefon',
  role: 'Rol',
  name: 'Nomi',
  code: 'Kod',
  external_id: 'ID raqam',
  institution_name: "Ta'lim muassasasi",
  group: 'Guruh',
  faculty: 'Fakultet',
  non_field_errors: '',
}

function extractErrorMessage(data) {
  if (!data || typeof data !== 'object') return null

  const parts = []
  for (const [key, value] of Object.entries(data)) {
    if (key === 'detail') continue
    const messages = Array.isArray(value) ? value : [value]
    const label = key in FIELD_LABELS ? FIELD_LABELS[key] : null
    for (const msg of messages) {
      if (typeof msg !== 'string') continue
      parts.push(label ? `${label}: ${msg}` : msg)
    }
  }
  if (parts.length > 0) return parts.join(' ')

  return typeof data.detail === 'string' ? data.detail : null
}

async function safeJson(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

let refreshPromise = null

async function refreshAccessToken() {
  const refresh = getRefreshToken()
  if (!refresh) throw new ApiError(401, { detail: 'Sessiya tugagan' })

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/api/accounts/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
      .then(async (res) => {
        if (!res.ok) throw new ApiError(res.status, await safeJson(res))
        const data = await res.json()
        setTokens(data)
        return data.access
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

/**
 * @param {string} path - masalan '/api/groups/'
 * @param {object} opts
 * @param {string} [opts.method]
 * @param {object} [opts.body] - JSON tanasi
 * @param {FormData} [opts.formData] - fayl yuklash uchun (Content-Type qo'lda qo'yilmaydi)
 * @param {object} [opts.params] - query-string parametrlari
 * @param {boolean} [opts.skipAuth] - Authorization header qo'shilmasin (login kabi)
 * @param {'json'|'blob'} [opts.responseType]
 */
export async function apiFetch(
  path,
  { method = 'GET', body, formData, params, skipAuth = false, responseType = 'json', _isRetry = false } = {},
) {
  let url = `${API_BASE_URL}${path}`
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => [k, String(v)]),
    ).toString()
    if (qs) url += `?${qs}`
  }

  const headers = {}
  const token = getAccessToken()
  if (token && !skipAuth) headers.Authorization = `Bearer ${token}`

  let requestBody
  if (formData) {
    requestBody = formData
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    requestBody = JSON.stringify(body)
  }

  const res = await fetch(url, { method, headers, body: requestBody, cache: 'no-store' })

  if (res.status === 401 && !skipAuth && !_isRetry && getRefreshToken()) {
    try {
      await refreshAccessToken()
      return apiFetch(path, { method, body, formData, params, skipAuth, responseType, _isRetry: true })
    } catch {
      clearTokens()
      window.dispatchEvent(new Event('davomat:session-expired'))
      throw new ApiError(401, { detail: 'Sessiya tugagan, qaytadan kiring' })
    }
  }

  if (res.status === 204) return null

  if (!res.ok) {
    const data = await safeJson(res)
    throw new ApiError(res.status, data)
  }

  if (responseType === 'blob') return res.blob()
  return safeJson(res)
}

/**
 * DRF sahifalangan ro'yxat endpointining barcha sahifalarini yig'ib qaytaradi
 * ({count, next, previous, results} shaklidagi javob uchun).
 */
export async function fetchAllPages(path, params = {}) {
  const results = []
  let page = 1
  for (;;) {
    const data = await apiFetch(path, { params: { ...params, page } })
    results.push(...(data?.results ?? []))
    if (!data?.next) break
    page += 1
  }
  return results
}
