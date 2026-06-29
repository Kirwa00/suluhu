import type { Locale } from '@suluhu/shared';

/**
 * Dictionary-based i18n (English + Swahili) — SDLC §11.4. Covers the app chrome
 * (nav, roles, common actions) and the landing page. Strings are co-located so
 * translators have one place to work; missing keys fall back to the key itself.
 */
export const dictionaries = {
  en: {
    'brand.name': 'Suluhu Therapy Center',
    'brand.tagline': 'Professional, compassionate mental health care for the Rift Valley.',

    // Landing
    'landing.heading': 'You are not alone. Help is within reach.',
    'landing.subheading':
      'Connect with CPB-licensed therapists in Eldoret and beyond. Secure video sessions, confidential support, and care in English or Swahili.',
    'landing.cta.start': 'Get started',
    'landing.cta.therapist': 'Join as a therapist',
    'landing.crisis': 'In crisis? Call Befrienders Kenya: 0800 723 253',
    'landing.feature.secure.title': 'Private & secure',
    'landing.feature.secure.body':
      'End-to-end protected sessions, encrypted records, and full Kenya Data Protection Act compliance.',
    'landing.feature.licensed.title': 'Licensed therapists',
    'landing.feature.licensed.body':
      'Every therapist is verified against the Counsellors & Psychologists Board register.',
    'landing.feature.access.title': 'Care that fits your life',
    'landing.feature.access.body':
      'Book around your schedule, pay with M-Pesa, and meet from anywhere — even on low bandwidth.',

    // Common
    'common.signIn': 'Log in',
    'common.signOut': 'Sign out',
    'common.crisisLine': 'Crisis line: 0800 723 253',
    'common.soon': 'Soon',

    // Roles
    'role.PATIENT': 'Patient',
    'role.THERAPIST': 'Therapist',
    'role.ADMIN': 'Administrator',
    'role.SUPER_ADMIN': 'Super Admin',

    // Nav
    'nav.dashboard': 'Dashboard',
    'nav.findTherapist': 'Find a therapist',
    'nav.sessions': 'My sessions',
    'nav.record': 'Health record',
    'nav.messages': 'Messages',
    'nav.mood': 'Mood journal',
    'nav.resources': 'Resources',
    'nav.settings': 'Settings',
    'nav.onboarding': 'Onboarding',
    'nav.schedule': 'Schedule',
    'nav.clients': 'Clients',
    'nav.earnings': 'Earnings',
    'nav.compliance': 'Compliance',
    'nav.alerts': 'Clinical alerts',
    'nav.content': 'Content',
    'nav.revenue': 'Revenue',
    'nav.payouts': 'Payouts',
    'nav.audit': 'Audit log',
  },
  sw: {
    'brand.name': 'Kituo cha Tiba cha Suluhu',
    'brand.tagline': 'Huduma ya afya ya akili kwa heshima na utaalamu katika Bonde la Ufa.',

    'landing.heading': 'Hauko peke yako. Msaada uko karibu.',
    'landing.subheading':
      'Ungana na watibabu walioidhinishwa na CPB Eldoret na kwingineko. Vikao salama vya video, msaada wa siri, na huduma kwa Kiingereza au Kiswahili.',
    'landing.cta.start': 'Anza sasa',
    'landing.cta.therapist': 'Jiunge kama mtibabu',
    'landing.crisis': 'Una dharura? Piga Befrienders Kenya: 0800 723 253',
    'landing.feature.secure.title': 'Faragha na usalama',
    'landing.feature.secure.body':
      'Vikao vilivyolindwa, rekodi zilizofichwa, na kufuata Sheria ya Ulinzi wa Data ya Kenya.',
    'landing.feature.licensed.title': 'Watibabu walioidhinishwa',
    'landing.feature.licensed.body':
      'Kila mtibabu amehakikiwa dhidi ya sajili ya Bodi ya Washauri na Wanasaikolojia.',
    'landing.feature.access.title': 'Huduma inayolingana na maisha yako',
    'landing.feature.access.body':
      'Weka miadi kulingana na ratiba yako, lipa kwa M-Pesa, na ungana popote — hata kwa mtandao dhaifu.',

    'common.signIn': 'Ingia',
    'common.signOut': 'Toka',
    'common.crisisLine': 'Simu ya dharura: 0800 723 253',
    'common.soon': 'Inakuja',

    'role.PATIENT': 'Mgonjwa',
    'role.THERAPIST': 'Mtibabu',
    'role.ADMIN': 'Msimamizi',
    'role.SUPER_ADMIN': 'Msimamizi Mkuu',

    'nav.dashboard': 'Dashibodi',
    'nav.findTherapist': 'Tafuta mtibabu',
    'nav.sessions': 'Vikao vyangu',
    'nav.record': 'Rekodi ya afya',
    'nav.messages': 'Ujumbe',
    'nav.mood': 'Jarida la hisia',
    'nav.resources': 'Rasilimali',
    'nav.settings': 'Mipangilio',
    'nav.onboarding': 'Usajili',
    'nav.schedule': 'Ratiba',
    'nav.clients': 'Wateja',
    'nav.earnings': 'Mapato',
    'nav.compliance': 'Uzingatiaji',
    'nav.alerts': 'Tahadhari za kiafya',
    'nav.content': 'Maudhui',
    'nav.revenue': 'Mapato',
    'nav.payouts': 'Malipo',
    'nav.audit': 'Kumbukumbu',
  },
} as const;

export type MessageKey = keyof (typeof dictionaries)['en'];

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries.en;
}
