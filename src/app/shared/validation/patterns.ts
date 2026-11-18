/** 8 to 72 characters with at least one letter and one number. */
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;

/** Optional "+" followed by 9 to 15 digits. */
export const PHONE_PATTERN = /^\+?\d{9,15}$/;
