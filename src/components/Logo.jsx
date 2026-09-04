import { useTheme } from '../context/useTheme'

export default function Logo({ className = 'h-10 w-10' }) {
  const { isDark } = useTheme()
  const src = isDark ? '/new_logo_white_2026.png' : '/new_logo_blue_2026.png'

  return <img src={src} alt="KTRI" className={`${className} object-contain`} />
}
