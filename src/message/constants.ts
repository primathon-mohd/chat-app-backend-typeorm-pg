export const MINIMUM_LENGTH = 8;
export const MAXIMUM_LENGTH = 15;

export const MIN_NUM = 1;
export const MAX_NUM = 10;

export const MIN_STRING_LEN = 5;
export const MAX_STRING_LEN = 30;

export const HASH_VALUE = 10;

export function skipCount(page: number, limit: number) {
  return (page - 1) * limit;
}
