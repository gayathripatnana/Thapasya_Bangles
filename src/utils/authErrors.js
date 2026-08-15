// utils/authErrors.js
// Firebase Auth errors come back as raw SDK strings like
// "Firebase: Error (auth/email-already-in-use)." - translate the common ones into
// something a customer can actually act on.
const AUTH_ERROR_MESSAGES = {
  'auth/email-already-in-use': 'An account with this email already exists. Try logging in instead, or use "Forgot password" if you don\'t remember your password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/user-not-found': 'No account found with this email. Please register first.',
  'auth/invalid-credential': 'Incorrect email or password. Please try again.',
  'auth/user-disabled': 'This account has been disabled. Please contact us for help.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Please check your connection and try again.'
};

export const getAuthErrorMessage = (error) => {
  return AUTH_ERROR_MESSAGES[error?.code] || error?.message || 'Something went wrong. Please try again.';
};
