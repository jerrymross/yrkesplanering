import { notFound } from "next/navigation";
import { AlertTriangle, CalendarDays, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { calculateEducationPlan, parseTeachingDays } from "@/lib/scheduler";
import type { SegmentKind } from "@/lib/scheduler";
import { formatDate, statusLabel } from "@/lib/format";
import { AddCourseForm, AddSegmentForm, DefaultSegmentButton } from "@/components/forms/course-forms";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeekSchedule } from "@/components/schedule/week-schedule";

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function lessonLabels<
  T extends {
    id: string;
    segmentId: string | null;
    courseId: string;
    type: string;
    order: number;
  },
>(lessons: T[]) {
  const groups = new Map<string, T[]>();

  for (const lesson of lessons) {
    const key = lesson.segmentId ? `segment:${lesson.segmentId}` : `course:${lesson.courseId}`;
    groups.set(key, [...(groups.get(key) ?? []), lesson]);
  }

  const labels = new Map<string, string>();

  for (const group of groups.values()) {
    const sorted = [...group].sort((a, b) => a.order - b.order);
    sorted.forEach((lesson, index) => {
      const prefix = lesson.type === "apl" ? "APL vecka" : "Lektion";
      labels.set(lesson.id, `${prefix} ${index + 1} av ${sorted.length}`);
    });
  }

  return labels;
}

export default async function EducationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const education = await prisma.education.findUnique({
    where: { id },
    include: {
      courses: {
        include: {
          segments: { orderBy: { order: "asc" } },
        },
        orderBy: { order: "asc" },
      },
      lessons: {
        include: {
          course: true,
          segment: true,
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }, { order: "asc" }],
      },
    },
  });

  if (!education) {
    notFound();
  }

  const plan = calculateEducationPlan({
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
        type: segment.type as SegmentKind,
        order: segment.order,
        weeks: segment.weeks,
        requiredHours: segment.requiredHours,
      })),
    })),
  });

  const labels = lessonLabels(education.lessons);
  const scheduleLessons = education.lessons.map((lesson) => ({
    id: lesson.id,
    courseName: lesson.course.name,
    title: lesson.title,
    type: lesson.type,
    order: lesson.order,
    label: labels.get(lesson.id) ?? "Lektion",
    date: dateKey(lesson.date),
    startTime: lesson.startTime,
    endTime: lesson.endTime,
    locked: lesson.locked,
  }));

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="text-3xl font-semibold">{education.name}</h1>
          <p className="mt-1 text-muted-foreground">
            Start {formatDate(education.startDate)} · {education.startTime}-{education.endTime} ·{" "}
            {education.hoursPerDay} timmar per dag
          </p>
        </div>
        <Badge tone={education.status === "planned" ? "success" : "neutral"}>{statusLabel(education.status)}</Badge>
      </div>

      {plan.warnings.length > 0 ? (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
              <div>
                <p className="font-medium text-amber-950">Planen behöver kontrolleras</p>
                <ul className="mt-2 grid gap-1 text-sm text-amber-900">
                  {plan.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Planerad period</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatDate(plan.calculatedStart)} - {formatDate(plan.calculatedEnd)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Nivåer/kurser</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{education.courses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lektioner</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{education.lessons.length}</p>
          </CardContent>
        </Card>
      </section>

      <AddCourseForm educationId={education.id} />

      <section className="grid gap-4">
        <div>
          <h2 className="text-xl font-semibold">Nivåer och delperioder</h2>
          <p className="text-sm text-muted-foreground">Kurser räknas i ordning och varje delperiod får egna datum.</p>
        </div>
        {education.courses.map((course) => {
          const plannedCourse = plan.courses.find((item) => item.id === course.id);
          const weeks = course.segments.reduce((sum, segment) => sum + segment.weeks, 0);
          const hasMismatch = weeks !== course.totalWeeks;

          return (
            <Card key={course.id}>
              <CardHeader className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {course.order}. {course.name}
                    {course.locked ? <Lock className="h-4 w-4 text-muted-foreground" /> : null}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {course.points}p · {course.totalWeeks} veckor · {formatDate(plannedCourse?.calculatedStart)} -{" "}
                    {formatDate(plannedCourse?.calculatedEnd)}
                  </p>
                </div>
                {hasMismatch ? <Badge tone="warning">Delperioder: {weeks}/{course.totalWeeks} veckor</Badge> : null}
              </CardHeader>
              <CardContent className="grid gap-4">
                {course.segments.length === 0 ? (
                  <div className="flex flex-col justify-between gap-3 rounded-md border bg-muted p-4 md:flex-row md:items-center">
                    <p className="text-sm text-muted-foreground">Kursen saknar delperioder.</p>
                    <DefaultSegmentButton educationId={education.id} courseId={course.id} totalWeeks={course.totalWeeks} />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="py-2 pr-4 font-medium">Delperiod</th>
                          <th className="py-2 pr-4 font-medium">Typ</th>
                          <th className="py-2 pr-4 font-medium">Veckor</th>
                          <th className="py-2 pr-4 font-medium">Datum</th>
                          <th className="py-2 pr-4 font-medium">Dagar/timmar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {course.segments.map((segment) => (
                          <tr key={segment.id} className="border-b last:border-0">
                            <td className="py-3 pr-4 font-medium">{segment.name}</td>
                            <td className="py-3 pr-4">{segment.type}</td>
                            <td className="py-3 pr-4">{segment.weeks}</td>
                            <td className="py-3 pr-4">
                              {formatDate(segment.calculatedStart)} - {formatDate(segment.calculatedEnd)}
                            </td>
                            <td className="py-3 pr-4">
                              {segment.calculatedDays ?? 0} dagar · {segment.calculatedHours ?? 0} h
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <AddSegmentForm educationId={education.id} courseId={course.id} />
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Veckovy</h2>
        </div>
        <WeekSchedule lessons={scheduleLessons} />
      </section>
    </main>
  );
}
