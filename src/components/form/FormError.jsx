export default function FormError({ children }) {
  if (!children) return null

  return <p className="text-sm text-error">{children}</p>
}
