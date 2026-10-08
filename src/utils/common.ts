/**
 * Formats a BuoyLocation object location string into usable latitude and longitude
 * e.g., 36.934 N 122.034 W (36°56'4\" N 122°2'2\" W) to 36.934, -122.034
 * @param locationStr 
 * @returns array of latitude and longitude as numbers
 */
export function formatLatLong(locationStr: string): [number, number] {
  const latLong = locationStr.trim().split('(')[0].split(' ')
  // Index 0 & 1 are latitude and direction, index 2 & 3 are longitude and direction
  if (latLong[1] === 'S') {
    latLong[0] = '-' + latLong[0]
  }
  if (latLong[3] === 'W') {
    latLong[2] = '-' + latLong[2]
  }
  latLong.splice(1, 1)
  latLong.splice(2, 1)
  latLong.splice(-1, 1)
  return [Number(latLong[0]), Number(latLong[1])]
}
