import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import uz from './locales/uz.json'

// Hozircha faqat o'zbek tili (lotin) qo'llab-quvvatlanadi.
// Yangi til qo'shish uchun `locales/` ichiga fayl qo'shib,
// `resources` obyektiga kiritish kifoya (mas: ru, en).
export const SUPPORTED_LANGUAGES = [{ code: 'uz', label: "O'zbekcha" }]

i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
  },
  lng: 'uz',
  fallbackLng: 'uz',
  interpolation: { escapeValue: false },
})

export default i18n
