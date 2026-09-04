import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { confirmPasswordReset, requestPasswordReset } from '../api/auth'
import { ApiError } from '../api/client'
import Alert from '../components/form/Alert'
import Button from '../components/form/Button'
import Input from '../components/form/Input'
import Icon from '../components/Icon'
import Logo from '../components/Logo'
import { isRequired, isValidEmail } from '../utils/validators'

const TOTAL_STEPS = 3

function StepIndicator({ step }) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
        <div
          key={n}
          className={[
            'h-1.5 flex-1 rounded-full transition-colors duration-300',
            n <= step ? 'bg-primary' : 'bg-base-300',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

export default function ForgotPassword() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStep1 = async (event) => {
    event.preventDefault()
    if (!isRequired(email)) {
      setErrors({ email: t('pages.forgotPassword.errors.required') })
      return
    }
    if (!isValidEmail(email)) {
      setErrors({ email: t('pages.forgotPassword.errors.invalidEmail') })
      return
    }
    setErrors({})
    setFormError('')
    setIsSubmitting(true)
    try {
      await requestPasswordReset(email.trim())
      setStep(2)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : t('pages.login.errors.network'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStep2 = (event) => {
    event.preventDefault()
    if (!isRequired(code)) {
      setErrors({ code: t('pages.forgotPassword.errors.required') })
      return
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setErrors({ code: t('pages.forgotPassword.errors.codeLength') })
      return
    }
    setErrors({})
    setStep(3)
  }

  const handleStep3 = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!isRequired(newPassword)) {
      nextErrors.newPassword = t('pages.forgotPassword.errors.required')
    } else if (newPassword.length < 6) {
      nextErrors.newPassword = t('pages.forgotPassword.errors.passwordMin')
    }
    if (!isRequired(confirmPassword)) {
      nextErrors.confirmPassword = t('pages.forgotPassword.errors.required')
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = t('pages.forgotPassword.errors.passwordMismatch')
    }
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await confirmPasswordReset({ email: email.trim(), code: code.trim(), newPassword })
      setStep(4)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : t('pages.login.errors.network'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 p-4">
      <div className="w-full max-w-sm rounded-box border border-base-300 bg-base-100 p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo className="h-14 w-14" />
          <h1 className="mt-3 text-lg font-semibold text-base-content">
            {t('pages.forgotPassword.title')}
          </h1>
        </div>

        {step <= TOTAL_STEPS && <StepIndicator step={step} />}

        {step === 1 && (
          <form onSubmit={handleStep1} className="flex flex-col gap-4" noValidate>
            <Input
              type="email"
              label={t('pages.forgotPassword.step1.label')}
              placeholder={t('pages.forgotPassword.step1.placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              disabled={isSubmitting}
              autoComplete="email"
            />
            {formError && <Alert variant="error">{formError}</Alert>}
            <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                t('pages.forgotPassword.step1.submit')
              )}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2} className="flex flex-col gap-4" noValidate>
            <p className="text-sm text-base-content/60">
              {t('pages.forgotPassword.step2.description', { email })}
            </p>
            <Input
              label={t('pages.forgotPassword.step2.label')}
              placeholder={t('pages.forgotPassword.step2.placeholder')}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              error={errors.code}
              inputMode="numeric"
              className="tracking-[0.5em]"
            />
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                <Icon name="arrowLeft" className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
              </Button>
              <Button type="submit" className="flex-1">
                {t('pages.forgotPassword.step2.submit')}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3} className="flex flex-col gap-4" noValidate>
            <Input
              type="password"
              label={t('pages.forgotPassword.step3.label')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
              autoComplete="new-password"
            />
            <Input
              type="password"
              label={t('pages.forgotPassword.step3.confirmLabel')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
            {formError && <Alert variant="error">{formError}</Alert>}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setStep(2)} disabled={isSubmitting}>
                <Icon name="arrowLeft" className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  t('pages.forgotPassword.step3.submit')
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
              <Icon name="badgeCheck" className="size-8" />
            </span>
            <h2 className="text-base font-semibold text-base-content">
              {t('pages.forgotPassword.success.title')}
            </h2>
            <p className="text-sm text-base-content/60">
              {t('pages.forgotPassword.success.description')}
            </p>
            <Button className="mt-2 w-full" onClick={() => navigate('/login')}>
              {t('pages.forgotPassword.success.submit')}
            </Button>
          </div>
        )}

        {step < 4 && (
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-medium text-primary hover:underline">
              {t('pages.forgotPassword.backToLogin')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
