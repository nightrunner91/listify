import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ru from './locales/ru.json'
import ro from './locales/ro.json'

// Try to get saved language from localStorage
const getSavedLocale = () => {
  try {
    const saved = localStorage.getItem('ly_i18n_locale')
    if (saved) return saved
  } catch (e) {
    console.error('Error reading locale from localStorage', e)
  }
  return null
}

// Get browser language (e.g. "en-US" -> "en")
const getBrowserLocale = () => {
  const navigatorLocale = navigator.languages !== undefined ? navigator.languages[0] : navigator.language
  if (!navigatorLocale) return 'en'
  const trimmedLocale = navigatorLocale.trim().split(/-|_/)[0].toLowerCase()
  return trimmedLocale
}

const getStartingLocale = () => {
  const saved = getSavedLocale()
  if (saved && ['en', 'ru', 'ro'].includes(saved)) {
    return saved
  }
  const browser = getBrowserLocale()
  if (['en', 'ru', 'ro'].includes(browser)) {
    return browser
  }
  return 'en'
}

const startingLocale = getStartingLocale()

const i18n = createI18n({
  legacy: false, // use Composition API
  locale: startingLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    ru,
    ro
  }
})

// Add a hook to save locale changes
export const setI18nLanguage = (locale) => {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale
  } else {
    i18n.global.locale.value = locale
  }
  try {
    localStorage.setItem('ly_i18n_locale', locale)
  } catch (e) {
    console.error('Error saving locale to localStorage', e)
  }
}

export default i18n
