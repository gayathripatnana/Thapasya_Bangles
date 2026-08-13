// utils/addressHelpers.js
export const EMPTY_ADDRESS = {
  doorNumber: '',
  apartment: '',
  street: '',
  village: '',
  landmark: '',
  district: '',
  state: '',
  pincode: ''
};

const REQUIRED_ADDRESS_FIELDS = ['doorNumber', 'street', 'village', 'district', 'state', 'pincode'];

/**
 * Normalize an address into the full structured shape.
 * Handles legacy plain-text addresses saved before this structure existed.
 */
export const normalizeAddress = (raw) => {
  if (!raw) return { ...EMPTY_ADDRESS };
  if (typeof raw === 'string') {
    // Legacy free-text address - keep it visible in the street field rather than losing it
    return { ...EMPTY_ADDRESS, street: raw };
  }
  return { ...EMPTY_ADDRESS, ...raw };
};

/**
 * True when all fields needed to actually deliver an order are filled in
 */
export const isAddressComplete = (raw) => {
  const address = normalizeAddress(raw);
  const hasRequiredFields = REQUIRED_ADDRESS_FIELDS.every(field => (address[field] || '').trim() !== '');
  const hasValidPincode = /^\d{6}$/.test((address.pincode || '').trim());
  return hasRequiredFields && hasValidPincode;
};

/**
 * Break an address into readable display lines, skipping empty parts
 */
export const getAddressLines = (raw) => {
  const address = normalizeAddress(raw);
  const lines = [
    [address.doorNumber, address.apartment].filter(Boolean).join(', '),
    [address.street, address.landmark].filter(Boolean).join(', '),
    [address.village, address.district].filter(Boolean).join(', '),
    [address.state, address.pincode].filter(Boolean).join(' - ')
  ].filter(line => line.trim() !== '');

  return lines;
};

/**
 * Full address as a single printable string (newline separated)
 */
export const formatAddress = (raw) => {
  const lines = getAddressLines(raw);
  return lines.length > 0 ? lines.join('\n') : 'Address not provided';
};
