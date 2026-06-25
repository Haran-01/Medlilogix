export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}
