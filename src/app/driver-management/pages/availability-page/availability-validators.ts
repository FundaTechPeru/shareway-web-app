import {AbstractControl, FormArray, ValidationErrors, ValidatorFn} from '@angular/forms';

interface TimeRange {
  startTime: string;
  endTime: string;
}

/** "HH:mm" strings compare correctly as text. */
function isValidRange(range: TimeRange): boolean {
  return !!range.startTime && !!range.endTime && range.startTime < range.endTime;
}

/** Slot group validator: the end time must be after the start time. */
export const timeRangeValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const range = control.value as TimeRange;
  if (!range.startTime || !range.endTime) {
    return null;
  }
  return isValidRange(range) ? null : {timeRange: true};
};

/** True when any two valid ranges of the list overlap. */
export function hasOverlap(ranges: readonly TimeRange[]): boolean {
  const sorted = ranges.filter(isValidRange).sort((a, b) => a.startTime.localeCompare(b.startTime));
  return sorted.some((range, i) => i > 0 && range.startTime < sorted[i - 1].endTime);
}

/** Day validator: the slots of one day must not overlap. */
export const noOverlapValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const ranges = (control as FormArray).getRawValue() as TimeRange[];
  return hasOverlap(ranges) ? {overlap: true} : null;
};
