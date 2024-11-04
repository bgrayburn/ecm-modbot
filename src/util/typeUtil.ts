export function getEnumValues<T>(e: any): T[] {
  return Object.keys(e).map(key => e[key])
}
