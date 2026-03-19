import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTodayStr() {
  // Returns YYYY-MM-DD in Asia/Jakarta (WIB) timezone for consistent 00:00 reset
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

export function getYesterdayStr() {
  // Returns YYYY-MM-DD for exactly 24h ago in Asia/Jakarta (WIB) timezone
  const yesterday = new Date(Date.now() - (24 * 60 * 60 * 1000));
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(yesterday);
}
