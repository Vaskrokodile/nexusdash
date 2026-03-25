export function formatCurrency(value) {
  if (value >= 1000000) {
    return '$' + (value / 1000000).toFixed(1) + 'M'
  }
  if (value >= 1000) {
    return '$' + (value / 1000).toFixed(0) + 'K'
  }
  return '$' + value.toLocaleString()
}

export function formatPercent(value) {
  return value + '%'
}

export function formatNumber(value) {
  return value.toLocaleString()
}

export function formatValue(value, format) {
  switch (format) {
    case 'currency':
      return formatCurrency(value)
    case 'percent':
      return formatPercent(value)
    case 'number':
      return formatNumber(value)
    default:
      return value
  }
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export function debounce(fn, delay) {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
