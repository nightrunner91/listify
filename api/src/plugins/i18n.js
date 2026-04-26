import fp from 'fastify-plugin'
import accepts from '@fastify/accepts'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load translations synchronously (happens once on startup)
const loadTranslations = () => {
  const localesPath = path.join(__dirname, '../i18n/locales')
  const translations = {}
  
  if (!fs.existsSync(localesPath)) return translations;
  
  const files = fs.readdirSync(localesPath)
  for (const file of files) {
    if (file.endsWith('.json')) {
      const lang = file.replace('.json', '')
      const content = fs.readFileSync(path.join(localesPath, file), 'utf-8')
      try {
        translations[lang] = JSON.parse(content)
      } catch (e) {
        console.error(`Failed to parse i18n file: ${file}`, e)
      }
    }
  }
  return translations
}

const getNestedProperty = (obj, pathString) => {
  if (!obj || !pathString) return undefined
  const parts = pathString.split('.')
  let current = obj
  for (const part of parts) {
    if (current === undefined || current === null) return undefined
    current = current[part]
  }
  return current
}

export default fp(async (fastify, opts) => {
  await fastify.register(accepts)

  const translations = loadTranslations()
  const supportedLanguages = Object.keys(translations)
  if (supportedLanguages.length === 0) supportedLanguages.push('en')

  fastify.decorateRequest('t', function (key, params = {}) {
    // request context
    const req = this
    
    // determine language
    let lang = 'en'
    
    // Check Accept-Language
    if (req.accepts && typeof req.accepts().languages === 'function') {
      const langs = req.accepts().languages()
      
      // find first supported language
      for (const reqLang of langs) {
        const shortLang = reqLang.split('-')[0].toLowerCase()
        if (supportedLanguages.includes(shortLang)) {
          lang = shortLang
          break
        }
      }
    }

    // fallback to default if lang not found
    let translated = getNestedProperty(translations[lang], key)
    
    if (translated === undefined && lang !== 'en') {
      translated = getNestedProperty(translations['en'], key)
    }

    if (translated === undefined) {
      return key
    }

    // simple interpolation: "Hello {name}" -> params: { name: "World" }
    return translated.replace(/\{(\w+)\}/g, (match, paramName) => {
      return params[paramName] !== undefined ? params[paramName] : match
    })
  })
})
