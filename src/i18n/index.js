import { createI18n } from 'vue-i18n'
import moment from 'moment'
import 'moment/dist/locale/ru'
import 'moment/dist/locale/ro'
import 'moment/dist/locale/uk'
import 'moment/dist/locale/pl'
import 'moment/dist/locale/fr'
import 'moment/dist/locale/es'
import 'moment/dist/locale/de'
import en from './locales/en.json'
import ru from './locales/ru.json'
import ro from './locales/ro.json'
import uk from './locales/uk.json'
import pl from './locales/pl.json'
import fr from './locales/fr.json'
import es from './locales/es.json'
import de from './locales/de.json'

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
  const allowedLocales = ['en', 'ru', 'ro', 'uk', 'pl', 'fr', 'es', 'de']
  if (saved && allowedLocales.includes(saved)) {
    return saved
  }
  const browser = getBrowserLocale()
  if (allowedLocales.includes(browser)) {
    return browser
  }
  return 'en'
}

const startingLocale = getStartingLocale()

// Initialize moment locale
moment.locale(startingLocale)

const i18n = createI18n({
  legacy: false, // use Composition API
  locale: startingLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    ru,
    ro,
    uk,
    pl,
    fr,
    es,
    de
  }
})

// Add a hook to save locale changes
export const setI18nLanguage = (locale) => {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale
  } else {
    i18n.global.locale.value = locale
  }

  // Update moment locale
  moment.locale(locale)

  try {
    localStorage.setItem('ly_i18n_locale', locale)
  } catch (e) {
    console.error('Error saving locale to localStorage', e)
  }
}

export default i18n

