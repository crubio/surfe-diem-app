import { default as dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(tz)

export const formatNumber = (value: number, n = 2) => {
  const number = Math.round(value * 100) / 100
  return number.toFixed(n)
}

/**
 * Get the current time and format it to ISO 8601 to the nearest next hour.
 * e.g., 2023-08-05T15:00
 * Forecasting times are in this format and we need to match it to get the correct forecast time index.
 * @returns 
 */
export const formatIsoNearestHour = () => {
  const now = new Date()
  return dayjs(now, "America/Los_Angeles").startOf('hour').format('YYYY-MM-DDTHH:mm');
}

export const formatDateTime = (date: string | undefined) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit'
  });
}

export const formatDateShortWeekday = (date: string | undefined) => {
  if (!date) return '';
  return dayjs(date).format('MMMM D');
}

export const getTodaysDate = (n = 0) => {
  const d = dayjs()
  if (n > 0) {
    const newDate = d.add(n, 'd')
    return newDate.format('YYYY-MM-DD')
  }
  return d.format('YYYY-MM-DD')
}

export const formatDateWeekday = (date: string | undefined) => {
  if (!date) return '';
  return dayjs(date).format('MMMM D, h:mm A');
}

export const formatDateHour = (date: string | undefined) => {
  if (!date) return '';
  return dayjs(date).format('h:mm A');
}

export const formatDate = (date: number | string) => {
  const d = dayjs.utc(date)
  const timeZone = dayjs.tz.guess()
  return d.utc().tz(timeZone).local().format('MMMM D, YYYY h:mm A');
}

export function validateIsCurrent(observedAt: string | undefined, nHours = 1): boolean {
  if (!observedAt) return false
  const now = new Date()
  const observedAtDate = new Date(observedAt)
  const diff = now.getTime() - observedAtDate.getTime()
  const diffHours = Math.floor(diff / (1000 * 60 * 60))
  return diffHours < nHours
}

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
