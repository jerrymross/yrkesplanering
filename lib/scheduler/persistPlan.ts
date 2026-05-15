import type { Prisma, PrismaClient } from "@prisma/client";
import { calculateEducationPlan } from "./calculateEducationPlan";
import { parseTeachingDays } from "./date-utils";

type Db = PrismaClient | Prisma.TransactionClient;

export async function recalculateEducationPlan(db: Db, educationId: string) {
  const education = await db.education.findUnique({
    where: { id: educationId },
    include: {
      courses: {
        include: { segments: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!education) {
    throw new Error("Utbildningen kunde inte hittas.");
  }

  const result = calculateEducationPlan({
    id: education.id,
    name: education.name,
    startDate: education.startDate,
    teachingDays: parseTeachingDays(education.teachingDays),
    hoursPerDay: education.hoursPerDay,
    courses: education.courses.map((course) => ({
      id: course.id,
      name: course.name,
      totalWeeks: course.totalWeeks,
      order: course.order,
      segments: course.segments.map((segment) => ({
        id: segment.id,
        name: segment.name,
        type: segment.type,
        order: segment.order,
        weeks: segment.weeks,
        requiredHours: segment.requiredHours,
      })),
    })),
  });

  await db.education.update({
    where: { id: educationId },
    data: {
      calculatedStart: result.calculatedStart,
      calculatedEnd: result.calculatedEnd,
      status: result.warnings.length > 0 ? "draft" : "planned",
    },
  });

  for (const course of result.courses) {
    await db.educationCourse.update({
      where: { id: course.id },
      data: {
        calculatedStart: course.calculatedStart,
        calculatedEnd: course.calculatedEnd,
        calculatedDays: course.calculatedDays,
        calculatedHours: course.calculatedHours,
      },
    });

    for (const segment of course.segments) {
      await db.courseSegment.update({
        where: { id: segment.id },
        data: {
          calculatedStart: segment.calculatedStart,
          calculatedEnd: segment.calculatedEnd,
          calculatedDays: segment.calculatedDays,
          calculatedHours: segment.calculatedHours,
        },
      });
    }
  }

  return result;
}
