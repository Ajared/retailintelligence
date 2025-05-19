/**
 * Recursively converts object keys from camelCase to snake_case
 * Works with nested objects and arrays
 */
function camelToSnake<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake) as unknown as T;
  } else if (
    obj !== null &&
    typeof obj === 'object' &&
    obj.constructor === Object
  ) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(),
        camelToSnake(value),
      ]),
    ) as unknown as T;
  }
  return obj;
}

export default camelToSnake;
