import { addDays, formatDate, isTeachingDay, nextTeachingDay } from "./date-utils";
import type {
  CoursePlanInput,
  CoursePlanResult,
  EducationPlanInput,
  EducationPlanResult,
  SegmentPlanInput,
  SegmentPlanResult,
} from "./types";

function plannedDaysForWeeks(weeks: number, teachingDays: number[]) {
  return Math.max(0, weeks) * teachingDays.length;
}

function calculateSegment(
  segment: SegmentPlanInput,
  cursor: Date,
  teachingDays: number[],
  hoursPerDay: number,
): { result: SegmentPlanResult; nextCursor: Date } {
  const totalDays = plannedDaysForWeeks(segment.weeks, teachingDays);
  let daysCounted = 0;
  let current = nextTeachingDay(cursor, teachingDays);
  const start = current;
  let end = current;

  while (daysCounted < totalDays) {
    if (isTeachingDay(current, teachingDays)) {
      daysCounted += 1;
      end = current;
    }
    current = addDays(current, 1);
  }

  return {
    result: {
      ...segment,
      calculatedStart: start,
      calculatedEnd: end,
      calculatedDays: daysCounted,
      calculatedHours: Number((daysCounted * hoursPerDay).toFixed(2)),
    },
    nextCursor: current,
  };
}

function calculateCourse(
  course: CoursePlanInput,
  cursor: Date,
  teachingDays: number[],
  hoursPerDay: number,
): { result: CoursePlanResult; nextCursor: Date } {
  const warnings: string[] = [];
  const sortedSegments = [...course.segments].sort((a, b) => a.order - b.order);
  const segmentWeeks = sortedSegments.reduce((sum, segment) => sum + segment.weeks, 0);

  if (sortedSegments.length === 0) {
    warnings.push(`${course.name} saknar delperioder. Skapa en standarddelperiod av typen undervisning.`);
  }

  if (sortedSegments.length > 0 && segmentWeeks !== course.totalWeeks) {
    warnings.push(
      `${course.name}: delperioderna är ${segmentWeeks} veckor men kursen är ${course.totalWeeks} veckor.`,
    );
  }

  const calculatedSegments: SegmentPlanResult[] = [];
  let nextCursor = cursor;

  for (const segment of sortedSegments) {
    const calculation = calculateSegment(segment, nextCursor, teachingDays, hoursPerDay);
    calculatedSegments.push(calculation.result);
    nextCursor = calculation.nextCursor;
  }

  const calculatedStart = calculatedSegments[0]?.calculatedStart ?? null;
  const calculatedEnd = calculatedSegments.at(-1)?.calculatedEnd ?? null;
  const calculatedDays = calculatedSegments.reduce((sum, segment) => sum + segment.calculatedDays, 0);
  const calculatedHours = Number(
    calculatedSegments.reduce((sum, segment) => sum + segment.calculatedHours, 0).toFixed(2),
  );

  return {
    result: {
      ...course,
      calculatedStart,
      calculatedEnd,
      calculatedDays,
      calculatedHours,
      segments: calculatedSegments,
      warnings,
    },
    nextCursor,
  };
}

export function calculateEducationPlan(input: EducationPlanInput): EducationPlanResult {
  const teachingDays = input.teachingDays.length > 0 ? input.teachingDays : [1, 2, 3, 4, 5];
  const courses = [...input.courses].sort((a, b) => a.order - b.order);
  const calculatedCourses: CoursePlanResult[] = [];
  let cursor = nextTeachingDay(input.startDate, teachingDays);

  for (const course of courses) {
    const calculation = calculateCourse(course, cursor, teachingDays, input.hoursPerDay);
    calculatedCourses.push(calculation.result);
    cursor = calculation.nextCursor;
  }

  const calculatedStart = calculatedCourses[0]?.calculatedStart ?? null;
  const calculatedEnd = calculatedCourses.at(-1)?.calculatedEnd ?? null;
  const warnings = calculatedCourses.flatMap((course) => course.warnings);

  if (calculatedStart && calculatedStart.getTime() !== nextTeachingDay(input.startDate, teachingDays).getTime()) {
    warnings.push(`Planen startar ${formatDate(calculatedStart)} eftersom startdatumet inte är en undervisningsdag.`);
  }

  return {
    educationId: input.id,
    calculatedStart,
    calculatedEnd,
    courses: calculatedCourses,
    warnings,
  };
}
