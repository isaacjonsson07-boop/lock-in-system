import { Converter } from '../types';
import { UNIT_SHORT } from '../constants';
import { getFactor } from './parsing';
import type { UnitSystem } from '../hooks/useUnitSystem';

const KM_TO_MI = 0.621371;
const M_TO_MI = 0.000621371;
const KG_TO_LB = 2.20462;

function fmtNum(val: number): string {
  return parseFloat(val.toFixed(2)).toString();
}

export function humanizeTime(hours: number): string {
  if (hours == null || isNaN(hours)) return "";
  if (hours === 0) return "0 min";

  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;

  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function humanizeDistance(km: number, unitSystem: UnitSystem = 'metric'): string {
  if (km == null || isNaN(km)) return "";
  if (unitSystem === 'imperial') {
    return `${fmtNum(km * KM_TO_MI)} mi`;
  }
  const totalM = Math.round(km * 1000);
  const k = Math.floor(totalM / 1000);
  const m = totalM % 1000;
  return k === 0 ? `${m} m` : `${k} km ${m} m`;
}

export function formatSingleUnit(type: string, valueInBase: number, unit: string, converters: Converter[], unitSystem: UnitSystem = 'metric'): string {
  if (type === 'Time') {
    return humanizeTime(valueInBase);
  }

  if (type === 'Distance') {
    if (unitSystem === 'imperial') {
      return `${fmtNum(valueInBase * KM_TO_MI)} mi`;
    }
    const factor = getFactor(converters, type, unit) || 1;
    const amount = valueInBase / factor;
    const label = UNIT_SHORT[unit as keyof typeof UNIT_SHORT] || unit;
    return `${Math.round(amount * 100) / 100} ${label}`;
  }

  if (type === 'Weight') {
    if (unitSystem === 'imperial') {
      return `${fmtNum(valueInBase * KG_TO_LB)} lb`;
    }
    return `${Math.round(valueInBase * 100) / 100} kg`;
  }

  if (type === 'Count') {
    const factor = getFactor(converters, type, unit) || 1;
    const amount = valueInBase / factor;
    const n = Math.round(amount);
    return `${n} ${n === 1 ? 'time' : 'times'}`;
  }

  const factor = getFactor(converters, type, unit) || 1;
  const amount = valueInBase / factor;
  const label = UNIT_SHORT[unit as keyof typeof UNIT_SHORT] || unit;
  return `${amount} ${label}`;
}

export function formatDistanceDisplay(value: string, unitSystem: UnitSystem = 'metric'): string {
  if (!value) return value;
  const trimmed = value.trim();
  const numericValue = parseFloat(trimmed);
  if (isNaN(numericValue)) return value;

  if (unitSystem === 'imperial') {
    if (trimmed === numericValue.toString()) {
      return `${fmtNum(numericValue * M_TO_MI)} mi`;
    }
    const kmMatch = /^([\d.]+)\s*km$/i.exec(trimmed);
    if (kmMatch) {
      return `${fmtNum(parseFloat(kmMatch[1]) * KM_TO_MI)} mi`;
    }
    const mMatch = /^([\d.]+)\s*m$/i.exec(trimmed);
    if (mMatch) {
      return `${fmtNum(parseFloat(mMatch[1]) * M_TO_MI)} mi`;
    }
    return value;
  }

  if (trimmed === numericValue.toString()) {
    if (numericValue >= 1000) {
      return `${numericValue / 1000}km`;
    } else {
      return `${numericValue}m`;
    }
  }

  return value;
}

export function formatWeightDisplay(value: string, unitSystem: UnitSystem = 'metric'): string {
  if (!value) return value;
  const trimmed = value.trim();
  const numericValue = parseFloat(trimmed);
  if (isNaN(numericValue)) return value;
  if (unitSystem === 'imperial') {
    return `${fmtNum(numericValue * KG_TO_LB)} lb`;
  }
  return `${Math.round(numericValue * 100) / 100}kg`;
}

export function formatDurationDisplay(value: string): string {
  if (!value) return value;

  const trimmed = value.trim();
  const numericValue = parseFloat(trimmed);

  if (isNaN(numericValue)) {
    return value;
  }

  if (trimmed === numericValue.toString()) {
    const totalMinutes = numericValue;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  }

  return value;
}
