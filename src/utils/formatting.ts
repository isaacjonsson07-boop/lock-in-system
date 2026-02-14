import { Converter } from '../types';
import { UNIT_SHORT } from '../constants';
import { getFactor } from './parsing';
import type { UnitSystem } from '../hooks/useUnitSystem';

const KM_TO_MI = 0.621371;
const M_TO_MI = 0.000621371;
const KG_TO_LB = 2.20462;
const MI_TO_KM = 1.60934;
const LB_TO_KG = 1 / KG_TO_LB;

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

export function convertDistanceToMetric(input: string): string {
  if (!input) return input;
  const trimmed = input.trim();
  const num = parseFloat(trimmed);
  if (isNaN(num)) return input;
  if (trimmed === num.toString()) {
    return `${parseFloat((num * MI_TO_KM).toFixed(6))}km`;
  }
  const miMatch = /^([\d.]+)\s*(mi|miles?)$/i.exec(trimmed);
  if (miMatch) {
    return `${parseFloat((parseFloat(miMatch[1]) * MI_TO_KM).toFixed(6))}km`;
  }
  return input;
}

export function convertDistanceToImperial(stored: string): string {
  if (!stored) return '';
  const trimmed = stored.trim();
  const num = parseFloat(trimmed);
  if (isNaN(num)) return stored;
  if (trimmed === num.toString()) {
    return fmtNum(num * M_TO_MI);
  }
  const kmMatch = /^([\d.]+)\s*km$/i.exec(trimmed);
  if (kmMatch) {
    return fmtNum(parseFloat(kmMatch[1]) * KM_TO_MI);
  }
  const mMatch = /^([\d.]+)\s*m$/i.exec(trimmed);
  if (mMatch) {
    return fmtNum(parseFloat(mMatch[1]) * M_TO_MI);
  }
  const miMatch = /^([\d.]+)\s*(mi|miles?)$/i.exec(trimmed);
  if (miMatch) {
    return fmtNum(parseFloat(miMatch[1]));
  }
  return stored;
}

export function convertWeightToMetric(lbStr: string): string {
  if (!lbStr) return lbStr;
  const lb = parseFloat(lbStr);
  if (isNaN(lb)) return lbStr;
  return parseFloat((lb * LB_TO_KG).toFixed(6)).toString();
}

export function convertWeightToImperial(kgStr: string): string {
  if (!kgStr) return '';
  const kg = parseFloat(kgStr);
  if (isNaN(kg)) return kgStr;
  return fmtNum(kg * KG_TO_LB);
}

export function convertNumericToImperial(value: number, type: string): string {
  if (type === 'Distance') return fmtNum(value * KM_TO_MI);
  if (type === 'Weight') return fmtNum(value * KG_TO_LB);
  return value.toString();
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
