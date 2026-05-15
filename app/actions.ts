"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { recalculateEducationPlan } from "@/lib/scheduler/persistPlan";

function requiredString(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) {
    throw new Error(`${key} saknas.`);
  }
  return value;
}

function optionalString(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function numberValue(formData: FormData, key: string, fallback: number) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

export async function createEducation(formData: FormData) {
  const name = requiredString(formData, "name");
  const startDate = requiredString(formData, "startDate");
  const teachingDays = formData.getAll("teachingDays").map(String).join(",") || "1,2,3,4,5";

  const education = await prisma.education.create({
    data: {
      name,
      startDate: new Date(`${startDate}T00:00:00`),
      teachingDays,
      startTime: requiredString(formData, "startTime"),
      endTime: requiredString(formData, "endTime"),
      hoursPerDay: numberValue(formData, "hoursPerDay", 7.5),
      fikaStart: requiredString(formData, "fikaStart"),
      fikaEnd: requiredString(formData, "fikaEnd"),
      lunchStart: requiredString(formData, "lunchStart"),
      lunchEnd: requiredString(formData, "lunchEnd"),
    },
  });

  revalidatePath("/dashboard");
  redirect(`/educations/${education.id}`);
}

export async function addCourse(formData: FormData) {
  const educationId = requiredString(formData, "educationId");
  const maxOrder = await prisma.educationCourse.aggregate({
    where: { educationId },
    _max: { order: true },
  });

  await prisma.educationCourse.create({
    data: {
      educationId,
      name: requiredString(formData, "name"),
      level: optionalString(formData, "level"),
      points: numberValue(formData, "points", 100),
      totalWeeks: numberValue(formData, "totalWeeks", 5),
      order: (maxOrder._max.order ?? 0) + 1,
      locked: formData.get("locked") === "on",
    },
  });

  await recalculateEducationPlan(prisma, educationId);
  revalidatePath(`/educations/${educationId}`);
}

export async function addSegment(formData: FormData) {
  const educationId = requiredString(formData, "educationId");
  const courseId = requiredString(formData, "courseId");
  const maxOrder = await prisma.courseSegment.aggregate({
    where: { courseId },
    _max: { order: true },
  });

  await prisma.courseSegment.create({
    data: {
      courseId,
      name: requiredString(formData, "name"),
      type: requiredString(formData, "type") as "teaching" | "apl" | "break" | "exam",
      weeks: numberValue(formData, "weeks", 1),
      requiredHours: formData.get("requiredHours") ? numberValue(formData, "requiredHours", 0) : null,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  await recalculateEducationPlan(prisma, educationId);
  revalidatePath(`/educations/${educationId}`);
}

export async function createDefaultSegment(formData: FormData) {
  const educationId = requiredString(formData, "educationId");
  const courseId = requiredString(formData, "courseId");
  const totalWeeks = numberValue(formData, "totalWeeks", 1);

  await prisma.courseSegment.create({
    data: {
      courseId,
      name: "Undervisning",
      type: "teaching",
      weeks: totalWeeks,
      order: 1,
    },
  });

  await recalculateEducationPlan(prisma, educationId);
  revalidatePath(`/educations/${educationId}`);
}
