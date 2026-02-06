export const TRANSACTION_TYPES = {
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT',
} as const;

export const TRANSACTION_TYPE_VALUES = Object.values(TRANSACTION_TYPES);

export const TRANSACTION_ERRORS = {
  INVALID_TYPE: `Type must be ${Object.values(TRANSACTION_TYPES).join(' or ')}`,
  INVALID_AMOUNT: 'Amount must be a positive integer',
  USER_NOT_FOUND: 'User Not Valid',
  AMOUNT_EXCEEDS_MAX: 'Amount exceeds maximum allowed value',
  MISSING_USER_ID: 'Missing user_id in request body',
  MISSING_USER_ID_QUERY: 'Missing user_id in query parameters',
  FAILED_TO_CREATE: 'Failed to create transaction',
  FAILED_TO_LIST: 'Failed to list transactions',
  FAILED_TO_CALCULATE: 'Failed to calculate balance',
} as const;

export const TRANSACTION_MAX_INT32 = Number.MAX_SAFE_INTEGER;
