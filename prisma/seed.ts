import { PrismaClient } from "@prisma/client";
import { addDays, nextTeachingDay } from "../lib/scheduler/date-utils";
import { recalculateEducationPlan } from "../lib/scheduler/persistPlan";

const prisma = new PrismaClient();

function lessonDate(startDate: Date, index: number) {
  let cursor = nextTeachingDay(startDate, [1, 2, 3, 4, 5]);
  let counted = 0;

  while (counted < index) {
    cursor = addDays(cursor, 1);
    cursor = nextTeachingDay(cursor, [1, 2, 3, 4, 5]);
    counted += 1;
  }

  return cursor;
}

async function main() {
  await prisma.lesson.deleteMany();
  await prisma.courseSegment.deleteMany();
  await prisma.educationCourse.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.room.deleteMany();
  await prisma.education.deleteMany();

  const teacher = await prisma.teacher.create({
    data: { name: "Anna Lärare", email: "anna@example.se" },
  });

  const room = await prisma.room.create({
    data: { name: "Bageriet" },
  });

  const education = await prisma.education.create({
    data: {
      name: "Bageri och konditori",
      startDate: new Date("2026-08-17T00:00:00"),
      status: "draft",
    },
  });

  const bageri = await prisma.educationCourse.create({
    data: {
      educationId: education.id,
      name: "Bageri nivå 1",
      level: "1",
      points: 100,
      totalWeeks: 5,
      order: 1,
      segments: {
        create: {
          name: "Undervisning",
          type: "teaching",
          order: 1,
          weeks: 5,
        },
      },
    },
    include: { segments: true },
  });

  const konditori1 = await prisma.educationCourse.create({
    data: {
      educationId: education.id,
      name: "Konditori nivå 1",
      level: "1",
      points: 100,
      totalWeeks: 5,
      order: 2,
      segments: {
        create: {
          name: "Undervisning",
          type: "teaching",
          order: 1,
          weeks: 5,
        },
      },
    },
    include: { segments: true },
  });

  const konditori2 = await prisma.educationCourse.create({
    data: {
      educationId: education.id,
      name: "Konditori nivå 2",
      level: "2",
      points: 200,
      totalWeeks: 10,
      order: 3,
      segments: {
        create: [
          {
            name: "Undervisning",
            type: "teaching",
            order: 1,
            weeks: 5,
          },
          {
            name: "APL",
            type: "apl",
            order: 2,
            weeks: 5,
          },
        ],
      },
    },
    include: { segments: true },
  });

  await recalculateEducationPlan(prisma, education.id);

  const refreshedKonditori1 = await prisma.educationCourse.findUniqueOrThrow({
    where: { id: konditori1.id },
    include: { segments: true },
  });
  const refreshedKonditori2 = await prisma.educationCourse.findUniqueOrThrow({
    where: { id: konditori2.id },
    include: { segments: true },
  });
  const konditori2Teaching = refreshedKonditori2.segments.find((segment) => segment.type === "teaching");
  const konditori2Apl = refreshedKonditori2.segments.find((segment) => segment.type === "apl");

  await prisma.lesson.createMany({
    data: [
      ...Array.from({ length: 10 }).map((_, index) => ({
        educationId: education.id,
        courseId: refreshedKonditori1.id,
        segmentId: refreshedKonditori1.segments[0].id,
        title: `Moment ${index + 1}`,
        type: index % 2 === 0 ? ("practical" as const) : ("theory" as const),
        order: index + 1,
        date: lessonDate(refreshedKonditori1.calculatedStart ?? education.startDate, index),
        startTime: "08:30",
        endTime: "10:00",
        teacherId: teacher.id,
        roomId: room.id,
        locked: index === 0,
      })),
      ...Array.from({ length: 10 }).map((_, index) => ({
        educationId: education.id,
        courseId: refreshedKonditori2.id,
        segmentId: konditori2Teaching?.id,
        title: `Konditorimoment ${index + 1}`,
        type: index % 2 === 0 ? ("practical" as const) : ("theory" as const),
        order: index + 1,
        date: lessonDate(konditori2Teaching?.calculatedStart ?? refreshedKonditori2.calculatedStart ?? education.startDate, index),
        startTime: "13:00",
        endTime: "14:30",
        teacherId: teacher.id,
        roomId: room.id,
        locked: false,
      })),
      ...Array.from({ length: 5 }).map((_, index) => ({
        educationId: education.id,
        courseId: refreshedKonditori2.id,
        segmentId: konditori2Apl?.id,
        title: `APL vecka ${index + 1}`,
        type: "apl" as const,
        order: index + 1,
        date: lessonDate(konditori2Apl?.calculatedStart ?? refreshedKonditori2.calculatedStart ?? education.startDate, index * 5),
        startTime: "08:30",
        endTime: "16:00",
        teacherId: teacher.id,
        roomId: room.id,
        locked: false,
      })),
    ],
  });

  void bageri;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
