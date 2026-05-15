"use client";

import { DndContext, type DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ToastProvider, useToast } from "@/components/ui/toast";

type ScheduleLesson = {
  id: string;
  courseName: string;
  title: string;
  type: string;
  order: number;
  label: string;
  date: string;
  startTime: string;
  endTime: string;
  locked: boolean;
};

const weekdays = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag"];
const timeSlots = [
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
];

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function mondayOf(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  return addDays(date, offset);
}

function minutes(time: string) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

function timeFromMinutes(value: number) {
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function slotLabel(time: string) {
  if (time === "10:00") {
    return "Fika";
  }
  if (time === "12:00") {
    return "Lunch";
  }
  return time;
}

function DraggableLesson({ lesson }: { lesson: ScheduleLesson }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lesson.id,
    data: { lesson },
    disabled: lesson.locked,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
      className={cn(
        "rounded-md border bg-white p-2 text-left shadow-sm",
        lesson.locked ? "cursor-not-allowed opacity-80" : "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-primary">{lesson.courseName}</p>
          <p className="text-xs text-muted-foreground">{lesson.label}</p>
        </div>
        {lesson.locked ? <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : null}
      </div>
      <p className="mt-1 text-sm font-medium">{lesson.title}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {lesson.startTime}-{lesson.endTime}
      </p>
    </div>
  );
}

function DroppableSlot({
  id,
  children,
  disabled,
}: {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-24 border-l border-t p-2 transition-colors",
        disabled ? "bg-secondary/70" : "bg-white",
        isOver && "bg-emerald-50",
      )}
    >
      {children}
    </div>
  );
}

function WeekScheduleInner({ initialLessons }: { initialLessons: ScheduleLesson[] }) {
  const [lessons, setLessons] = useState(initialLessons);
  const { showToast } = useToast();
  const firstDate = lessons[0]?.date ?? toLocalDateKey(new Date());
  const weekStart = mondayOf(firstDate);
  const weekDates = weekdays.map((_, index) => toLocalDateKey(addDays(weekStart, index)));

  const lessonsBySlot = useMemo(() => {
    const map = new Map<string, ScheduleLesson[]>();
    for (const lesson of lessons) {
      const key = `${lesson.date}|${lesson.startTime}`;
      map.set(key, [...(map.get(key) ?? []), lesson]);
    }
    return map;
  }, [lessons]);

  async function handleDragEnd(event: DragEndEvent) {
    const lesson = event.active.data.current?.lesson as ScheduleLesson | undefined;
    const overId = String(event.over?.id ?? "");

    if (!lesson || !overId) {
      return;
    }

    if (lesson.locked) {
      showToast("Kan inte flytta: lektionen är låst");
      return;
    }

    const [date, startTime] = overId.split("|");
    const duration = Math.max(30, minutes(lesson.endTime) - minutes(lesson.startTime));
    const endTime = timeFromMinutes(minutes(startTime) + duration);

    const response = await fetch(`/api/lessons/${lesson.id}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, startTime, endTime }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      showToast(payload?.error ?? "Lektionen kunde inte flyttas");
      return;
    }

    setLessons((current) =>
      current.map((item) => (item.id === lesson.id ? { ...item, date, startTime, endTime } : item)),
    );
    showToast("Lektion flyttad");
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto rounded-md border bg-white">
        <div className="grid min-w-[980px] grid-cols-[90px_repeat(5,minmax(170px,1fr))]">
          <div className="border-b bg-muted p-3 text-sm font-medium">Tid</div>
          {weekDates.map((date, index) => (
            <div key={date} className="border-b border-l bg-muted p-3">
              <p className="text-sm font-semibold">{weekdays[index]}</p>
              <p className="text-xs text-muted-foreground">{date}</p>
            </div>
          ))}
          {timeSlots.map((time) => {
            const isBreak = time === "10:00" || time === "12:00";
            return (
              <div key={time} className="contents">
                <div className="border-t bg-muted p-3 text-sm font-medium">{slotLabel(time)}</div>
                {weekDates.map((date) => {
                  const key = `${date}|${time}`;
                  return (
                    <DroppableSlot key={key} id={key} disabled={isBreak}>
                      <div className="grid gap-2">
                        {(lessonsBySlot.get(key) ?? []).map((lesson) => (
                          <DraggableLesson key={lesson.id} lesson={lesson} />
                        ))}
                        {isBreak ? <p className="text-xs text-muted-foreground">{slotLabel(time)}</p> : null}
                      </div>
                    </DroppableSlot>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </DndContext>
  );
}

export function WeekSchedule({ lessons }: { lessons: ScheduleLesson[] }) {
  return (
    <ToastProvider>
      <WeekScheduleInner initialLessons={lessons} />
    </ToastProvider>
  );
}
