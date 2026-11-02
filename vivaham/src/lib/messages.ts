import { Linking } from 'react-native';
import { shortDate } from './format';

export const DEFAULT_COUNTRY_CODE = '91';

export const INVITATION_MESSAGE =
  'Namaste {name} 🙏\nYou are warmly invited to the {event} on {date} {time}.\n{dress}\n{details}\nWe would love to have you with us!';

export const STAY_MESSAGE =
  'Hello {name} 🙏\nHere are your stay details for the wedding:\n🏨 {place}\n📍 {map}\nAddress: {address}\nCheck-in: {checkin}\nCheck-out: {checkout}\nContact: {contact}';

export const TRANSPORT_MESSAGE =
  'Hello {name} 🙏\nVehicles available during the wedding:\n{vehicles}\nPlease contact the driver directly for pickups.';

export const TRANSPORT_GROUP_MESSAGE = 'Vehicles for {wedding} 🚗\n{vehicles}\nPlease contact the driver directly for pickups.';

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

export function vehicleLines(vehicles: Vehicle[]) {
  return vehicles
    .map((vehicle) => {
      const driver = [vehicle.driver_name, vehicle.driver_phone].filter(Boolean).join(' ');
      return `• ${[
        [vehicle.vehicle_name, vehicle.vehicle_number].filter(Boolean).join(' '),
        driver ? `Driver ${driver}` : '',
        vehicleDates(vehicle),
      ]
        .filter(Boolean)
        .join(' · ')}`;
    })
    .join('\n');
}

export function whatsappNumber(phone: string | null) {
  const digits = (phone ?? '').replace(/\D/g, '').replace(/^0+/, '');
  return digits.length === 10 ? `${DEFAULT_COUNTRY_CODE}${digits}` : digits;
}

export function openWhatsApp(text: string, phone?: string | null) {
  const number = phone ? whatsappNumber(phone) : '';
  return Linking.openURL(`https://wa.me/${number}?text=${encodeURIComponent(text)}`);
}
