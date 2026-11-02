import { fill, INVITATION_MESSAGE, STAY_MESSAGE, vehicleLines, whatsappNumber } from '../messages';

describe('fill', () => {
  it('fills placeholders and drops lines whose values are empty', () => {
    const text = fill(INVITATION_MESSAGE, {
      name: 'Satyam',
      event: 'Haldi',
      date: 'Mon 26 Apr 2027',
      time: '',
      dress: '',
      details: null,
    });
    expect(text).toBe(
      'Namaste Satyam 🙏\nYou are warmly invited to the Haldi on Mon 26 Apr 2027.\nWe would love to have you with us!'
    );
  });

  it('keeps every filled line', () => {
    const text = fill(INVITATION_MESSAGE, {
      name: 'Satyam',
      event: 'Haldi',
      date: 'Mon 26 Apr 2027',
      time: 'at 10:00 AM',
      dress: 'Dress code: Yellow',
      details: 'Venue: Kalyana Mandapam & lawn',
    });
    expect(text.split('\n')).toEqual([
      'Namaste Satyam 🙏',
      'You are warmly invited to the Haldi on Mon 26 Apr 2027 at 10:00 AM.',
      'Dress code: Yellow',
      'Venue: Kalyana Mandapam & lawn',
      'We would love to have you with us!',
    ]);
  });

  it('drops labelled lines with no value', () => {
    const text = fill(STAY_MESSAGE, { name: 'Ravi', place: 'Hotel', map: 'https://maps', address: '', checkin: 'Thu 22 Apr', checkout: 'Sat 24 Apr', contact: '' });
    expect(text).not.toContain('Address:');
    expect(text).not.toContain('Contact:');
    expect(text).toContain('Check-in: Thu 22 Apr');
  });
});

describe('whatsappNumber', () => {
  it('adds 91 to 10-digit numbers', () => {
    expect(whatsappNumber('98765 43210')).toBe('919876543210');
    expect(whatsappNumber('098765 43210')).toBe('919876543210');
  });

  it('keeps numbers that already have a country code', () => {
    expect(whatsappNumber('+91 98765 43210')).toBe('919876543210');
    expect(whatsappNumber('0091 98765 43210')).toBe('919876543210');
    expect(whatsappNumber('+49 151 1234567')).toBe('491511234567');
  });

  it('returns nothing for an empty phone', () => {
    expect(whatsappNumber(null)).toBe('');
    expect(whatsappNumber('')).toBe('');
  });
});

describe('vehicleLines', () => {
  it('writes one block per vehicle and skips empty fields', () => {
    const text = vehicleLines([
      {
        id: '1',
        vehicle_name: 'Innova',
        vehicle_number: 'AP 09 AB 1234',
        seats: 7,
        driver_name: 'Ravi',
        driver_phone: '98765 43210',
        available_from: '2027-04-22',
        available_to: '2027-04-26',
        notes: 'AC',
      },
      {
        id: '2',
        vehicle_name: 'Tempo',
        vehicle_number: null,
        seats: null,
        driver_name: null,
        driver_phone: null,
        available_from: null,
        available_to: null,
        notes: null,
      },
    ]);
    expect(text).toBe(
      '🚗 Innova · AP 09 AB 1234\nDriver: Ravi 98765 43210\nAvailable: 22 Apr – 26 Apr\nNotes: AC\n\n🚗 Tempo'
    );
  });
});
