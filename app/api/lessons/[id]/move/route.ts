import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as {
    date?: string;
    startTime?: string;
    endTime?: string;
  };

  const lesson = await prisma.lesson.findUnique({ where: { id } });

  if (!lesson) {
    return NextResponse.json({ error: "Lektionen kunde inte hittas" }, { status: 404 });
  }

  if (lesson.locked) {
    return NextResponse.json({ error: "Kan inte flytta: lektionen är låst" }, { status: 423 });
  }

  if (!body.date || !body.startTime || !body.endTime) {
    return NextResponse.json({ error: "Datum, starttid och sluttid krävs" }, { status: 400 });
  }

  const updated = await prisma.lesson.update({
    where: { id },
    data: {
      date: new Date(`${body.date}T00:00:00`),
      startTime: body.startTime,
      endTime: body.endTime,
    },
  });

  return NextResponse.json({
    id: updated.id,
    date: body.date,
    startTime: updated.startTime,
    endTime: updated.endTime,
  });
}
