
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

import { default as dayjs } from 'dayjs';

export const formatDate = (date: number | string) => dayjs(date).format('MMMM D, YYYY h:mm A');