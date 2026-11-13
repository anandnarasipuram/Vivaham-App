// English text is the key. Telugu covers the core labels; anything missing falls back to English.
// NOTE: Telugu strings need review by a native speaker before going live.
const te = {
  'Home': 'హోమ్', 'Profile': 'ప్రొఫైల్', 'Materials': 'సామగ్రి', 'To-do': 'పనులు',
  'Events': 'కార్యక్రమాలు', 'Shopping': 'షాపింగ్', 'Budget': 'బడ్జెట్', 'Stays': 'బస', 'Guests': 'అతిథులు',
  'Food': 'భోజనం', 'Transport': 'వాహనాలు', 'Vendors': 'సేవా సంస్థలు',
  'Log in': 'లాగిన్', 'Sign up': 'సైన్ అప్', 'Log out': 'లాగ్ అవుట్', 'Email': 'ఈమెయిల్', 'Password': 'పాస్‌వర్డ్',
  'Your name': 'మీ పేరు', 'Save': 'సేవ్', 'Cancel': 'రద్దు', 'Delete': 'తొలగించు', 'Edit': 'మార్చు', 'Add': 'చేర్చు',
  'Language': 'భాష', 'Name': 'పేరు', 'Date': 'తేదీ', 'Time': 'సమయం', 'Venue': 'వేదిక', 'Price': 'ధర',
  'Paid': 'చెల్లించారు', 'Advance': 'అడ్వాన్స్', 'Not paid': 'చెల్లించలేదు', 'Still to pay': 'ఇంకా చెల్లించాలి',
  'Total budget': 'మొత్తం బడ్జెట్', 'Coming': 'వస్తున్నారు', 'Not coming': 'రావడం లేదు', 'Pending': 'పెండింగ్',
  'days to go': 'రోజులు మిగిలి ఉన్నాయి', 'Bride side': 'వధువు వైపు', 'Groom side': 'వరుడు వైపు',
  'Family': 'కుటుంబం', 'Helper': 'సహాయకులు', 'Admin': 'అడ్మిన్', 'Invite code': 'ఆహ్వాన కోడ్',
  'Mobile number': 'మొబైల్ నంబర్', 'Send code': 'కోడ్ పంపండి', 'Code': 'కోడ్', 'Send again': 'మళ్ళీ పంపండి', 'Change number': 'నంబర్ మార్చండి',
  'Continue': 'కొనసాగండి', 'Welcome': 'స్వాగతం', 'Invite your family': 'మీ కుటుంబాన్ని ఆహ్వానించండి', 'Add person': 'వ్యక్తిని చేర్చండి',
  'Go to Home': 'హోమ్‌కు వెళ్ళండి', 'Role': 'పాత్ర',
  'Install': 'ఇన్‌స్టాల్ చేయండి', 'Later': 'తర్వాత', 'Put Vivaham on your phone': 'వివాహం యాప్‌ను మీ ఫోన్‌లో పెట్టుకోండి',
  'Privacy notice': 'గోప్యతా నోటీసు', 'Back': 'వెనుకకు', 'OK': 'సరే', 'No thanks': 'వద్దు',
  'Join a wedding': 'పెళ్లిలో చేరండి', 'Create wedding': 'పెళ్లి సృష్టించండి', 'Open': 'తెరవండి', 'Done': 'అయింది',
};
let lang = localStorage.getItem('lang') || 'en';
export const getLang = () => lang;
export const setLang = (l) => { lang = l; localStorage.setItem('lang', l); document.documentElement.lang = l; };
export const t = (s) => (lang === 'te' && te[s]) || s;
