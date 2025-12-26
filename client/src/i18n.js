// Simple i18n dictionary and helper
const dict = {
  en: {
    chooseLanguage: 'Choose your language',
    english: 'English',
    tamil: 'Tamil',
    signInRequired: 'Please sign in to continue',
    login: 'Login',
    signup: 'Sign Up'
  },
  ta: {
    chooseLanguage: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    english: 'ஆங்கிலம்',
    tamil: 'தமிழ்',
    signInRequired: 'தொடர உள்நுழைக',
    login: 'உள்நுழை',
    signup: 'பதிவு செய்'
  }
};

export function t(key, lang = 'en') {
  return dict[lang]?.[key] || dict.en[key] || key;
}

export const availableLangs = ['en', 'ta'];
