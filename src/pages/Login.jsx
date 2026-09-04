import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { fetchMe, login } from '../api/auth'
import { ApiError } from '../api/client'
import Alert from '../components/form/Alert'
import Button from '../components/form/Button'
import Input from '../components/form/Input'
import Logo from '../components/Logo'
import { getDashboardPath } from '../config/dashboard'
import { useAuth } from '../context/useAuth'
import { isRequired } from '../utils/validators'

export default function Login() {
  const { t } = useTranslation()
  const { currentUser, setCurrentUser, isLoading: sessionLoading } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!sessionLoading && currentUser) {
    return <Navigate to={getDashboardPath(currentUser.role)} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const errors = {}
    if (!isRequired(username)) errors.username = t('pages.login.errors.required')
    if (!isRequired(password)) errors.password = t('pages.login.errors.required')
    setFieldErrors(errors)
    setFormError('')
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      await login(username.trim(), password)
      const user = await fetchMe()
      setCurrentUser(user)
      navigate(getDashboardPath(user.role))
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)
      } else {
        setFormError(t('pages.login.errors.network'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 p-4">
      <div className="w-full max-w-sm rounded-box border border-base-300 bg-base-100 p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo className="h-16 w-16" />
          <h1 className="mt-4 text-xl font-semibold text-base-content">{t('app.name')}</h1>
          <p className="mt-1 text-sm text-base-content/60">{t('pages.login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label={t('pages.login.username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={fieldErrors.username}
            disabled={isSubmitting}
            autoComplete="username"
          />
          <Input
            type="password"
            label={t('pages.login.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            disabled={isSubmitting}
            autoComplete="current-password"
          />

          <div className="-mt-2 flex justify-end">
            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              {t('pages.login.forgotPassword')}
            </Link>
          </div>

          {formError && <Alert variant="error">{formError}</Alert>}

          <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : t('pages.login.submit')}
          </Button>
        </form>
      </div>
    </div>
  )
}
