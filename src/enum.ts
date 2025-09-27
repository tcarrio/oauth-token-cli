export type NonEmptyArray<T> = [T, ...T[]];

export type EnumValue<T extends Readonly<{ [key: string]: unknown }>> =
  T[keyof T];
export type EnumKey<T extends Readonly<{ [key: string]: unknown }>> = keyof T;

function isString(input: unknown): input is string {
  return typeof input === "string";
}

export function enumKeys<T extends Readonly<{ [key: string]: unknown }>>(
  enumObject: T,
): NonEmptyArray<keyof T> {
  return Object.keys(enumObject).filter(isString) as NonEmptyArray<keyof T>;
}

export function enumValues<T extends Readonly<{ [key: string]: unknown }>>(
  enumObject: T,
): NonEmptyArray<T[keyof T]> {
  return Object.values(enumObject) as NonEmptyArray<T[keyof T]>;
}
