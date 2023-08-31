import { default as dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(tz)

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

export const formatDate = (date: number | string) => {
  const d = dayjs.utc(date)
  const timeZone = dayjs.tz.guess()
  return d.utc().tz(timeZone).local().format('MMMM D, YYYY h:mm A');
}

export function validateIsCurrent(observedAt: string | undefined) {
  if (!observedAt) return false
  const now = new Date()
  const observedAtDate = new Date(observedAt)
  const diff = now.getTime() - observedAtDate.getTime()
  const diffHours = Math.floor(diff / (1000 * 60 * 60))
  return diffHours < 1
}