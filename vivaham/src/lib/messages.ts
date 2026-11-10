import { Linking, Platform, Share } from 'react-native';
import { APP_URL } from './config';
import { notify } from './dialog';
import { shortDate } from './format';

export const DEFAULT_COUNTRY_CODE = '91';

export const INVITATION_MESSAGE =
  'Namaste {name} 🙏\nYou are warmly invited to the {event} on {date} {time}.\n{dress}\n{details}\nWe would love to have you with us!';

export const STAY_MESSAGE =
  'Hello {name} 🙏\nHere are your stay details for the wedding:\n🏨 {place}\n📍 {map}\nAddress: {address}\nCheck-in: {checkin}\nCheck-out: {checkout}\nContact: {contact}';

export const TRANSPORT_MESSAGE =
  'Hello {name} 🙏\nVehicles available during the wedding:\n{vehicles}\nPlease contact the driver directly for pickups.';

export const TRANSPORT_GROUP_MESSAGE = 'Vehicles for {wedding} 🚗\n{vehicles}\nPlease contact the driver directly for pickups.';

export const JOIN_LINK_MESSAGE =
  "You're invited to help with {wedding} on Vivaham 🎉\n1. Open: {link}\n2. Enter your name, email and a password, then tap Join the wedding (the code is filled in for you)\n3. After joining: on iPhone, Share > Add to Home Screen. On Android, menu > Install app.\nInvite code (if asked): {code}";

export const JOIN_MESSAGE =
  "Join our wedding planner on Vivaham 💍\n1. Open the app\n2. Tap 'Have an invite code?'\n3. Enter code {code}";

export function fill(template: string, values: Record<string, string | null | undefined>) {
  return template
    .split('\n')
    .map((line) => {
      const keys = [...line.matchAll(/\{(\w+)\}/g)].map((match) => match[1]);
      if (keys.length > 0 && keys.every((key) => !values[key]?.trim())) {
        return '';
      }
      return line
        .replace(/\{(\w+)\}/g, (_, key: string) => values[key]?.trim() ?? '')
        .replace(/ {2,}/g, ' ')
        .replace(/ +([.,!])/g, '$1')
        .trim();
    })
    .filter((line) => line.length > 0)
    .join('\n');
}

export type Vehicle = {
  id: string;
  vehicle_name: string;
  vehicle_number: string | null;
  seats: number | null;
  driver_name: string | null;
  driver_phone: string | null;
  available_from: string | null;
  available_to: string | null;
  notes: string | null;
};

export function vehicleDates(vehicle: Vehicle) {
  const from = vehicle.available_from ? shortDate(vehicle.available_from.slice(0, 10)) : '';
  const to = vehicle.available_to ? shortDate(vehicle.available_to.slice(0, 10)) : '';
  return from && to ? `${from} – ${to}` : from || to;
}

export function vehicleBlock(vehicle: Vehicle) {
  const driver = [vehicle.driver_name, vehicle.driver_phone].filter(Boolean).join(' ');
  return [
    `🚗 ${[vehicle.vehicle_name, vehicle.vehicle_number].filter(Boolean).join(' · ')}`,
    driver ? `Driver: ${driver}` : '',
    vehicleDates(vehicle) ? `Available: ${vehicleDates(vehicle)}` : '',
    vehicle.notes ? `Notes: ${vehicle.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function vehicleLines(vehicles: Vehicle[]) {
  return vehicles.map(vehicleBlock).join('\n\n');
}

export function whatsappNumber(phone: string | null) {
  const digits = (phone ?? '').replace(/\D/g, '').replace(/^0+/, '');
  return digits.length === 10 ? `${DEFAULT_COUNTRY_CODE}${digits}` : digits;
}

export function openWhatsApp(text: string, phone?: string | null) {
  const number = phone ? whatsappNumber(phone) : '';
  return Linking.openURL(`https://wa.me/${number}?text=${encodeURIComponent(text)}`);
}

export function joinLink(code: string) {
  return APP_URL ? `${APP_URL}/join/${code}` : '';
}

export function joinMessage(code: string, wedding: string) {
  const link = joinLink(code);
  return link ? fill(JOIN_LINK_MESSAGE, { wedding, link, code }) : fill(JOIN_MESSAGE, { code });
}

export async function copyText(text: string) {
  if (Platform.OS === 'web') {
    try {
      await navigator.clipboard.writeText(text);
      notify('Copied', text);
    } catch {
      window.prompt('Copy this:', text);
    }
    return;
  }
  await Share.share({ message: text });
}
