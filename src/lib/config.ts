export const CONFIG = {
  CONTACT_EMAIL: "results@university.edu",
  CONTACT_PHONE: "+91-891-2844999",
  CAPTCHA_REFRESH_INTERVAL: 300000,
  MAX_LOGIN_ATTEMPTS: 3,
  APP_NAME: "Andhra University Results Portal",
  UNIVERSITY_NAME: "Andhra University",
  WEBSITE_URL: "https://www.andhrauniversity.edu.in",
  VERIFICATION_PREFIX: "AU",
  API_RATE_LIMIT: 10,
} as const

export const SUBSCRIPTION_CONFIG = {
  isActive: true,
} as const

export type AppConfig = typeof CONFIG
