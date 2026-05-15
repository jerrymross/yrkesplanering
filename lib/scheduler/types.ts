export type SegmentKind = "teaching" | "apl" | "break" | "exam";

export type EducationPlanInput = {
  id: string;
  name: string;
  startDate: Date;
  teachingDays: number[];
  hoursPerDay: number;
  courses: CoursePlanInput[];
};

export type CoursePlanInput = {
  id: string;
  name: string;
  totalWeeks: number;
  order: number;
  segments: SegmentPlanInput[];
};

export type SegmentPlanInput = {
  id: string;
  name: string;
  type: SegmentKind;
  order: number;
  weeks: number;
  requiredHours?: number | null;
};

export type SegmentPlanResult = SegmentPlanInput & {
  calculatedStart: Date;
  calculatedEnd: Date;
  calculatedDays: number;
  calculatedHours: number;
};

export type CoursePlanResult = CoursePlanInput & {
  calculatedStart: Date | null;
  calculatedEnd: Date | null;
  calculatedDays: number;
  calculatedHours: number;
  segments: SegmentPlanResult[];
  warnings: string[];
};

export type EducationPlanResult = {
  educationId: string;
  calculatedStart: Date | null;
  calculatedEnd: Date | null;
  courses: CoursePlanResult[];
  warnings: string[];
};
