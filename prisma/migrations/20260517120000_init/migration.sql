-- CreateEnum
CREATE TYPE "EducationStatus" AS ENUM ('draft', 'planned', 'active', 'completed');

-- CreateEnum
CREATE TYPE "SegmentType" AS ENUM ('teaching', 'apl', 'break', 'exam');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('teaching', 'apl', 'exam', 'theory', 'practical');

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "teachingDays" TEXT NOT NULL DEFAULT '1,2,3,4,5',
    "startTime" TEXT NOT NULL DEFAULT '08:30',
    "endTime" TEXT NOT NULL DEFAULT '16:00',
    "hoursPerDay" DOUBLE PRECISION NOT NULL DEFAULT 7.5,
    "fikaStart" TEXT NOT NULL DEFAULT '10:00',
    "fikaEnd" TEXT NOT NULL DEFAULT '10:30',
    "lunchStart" TEXT NOT NULL DEFAULT '12:00',
    "lunchEnd" TEXT NOT NULL DEFAULT '13:00',
    "status" "EducationStatus" NOT NULL DEFAULT 'draft',
    "calculatedStart" TIMESTAMP(3),
    "calculatedEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationCourse" (
    "id" TEXT NOT NULL,
    "educationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT,
    "points" INTEGER NOT NULL,
    "totalWeeks" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "calculatedStart" TIMESTAMP(3),
    "calculatedEnd" TIMESTAMP(3),
    "calculatedDays" INTEGER,
    "calculatedHours" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseSegment" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SegmentType" NOT NULL,
    "order" INTEGER NOT NULL,
    "weeks" INTEGER NOT NULL,
    "requiredHours" DOUBLE PRECISION,
    "calculatedStart" TIMESTAMP(3),
    "calculatedEnd" TIMESTAMP(3),
    "calculatedDays" INTEGER,
    "calculatedHours" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "educationId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "segmentId" TEXT,
    "title" TEXT NOT NULL,
    "type" "LessonType" NOT NULL,
    "order" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "teacherId" TEXT,
    "roomId" TEXT,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EducationCourse_educationId_order_idx" ON "EducationCourse"("educationId", "order");

-- CreateIndex
CREATE INDEX "CourseSegment_courseId_order_idx" ON "CourseSegment"("courseId", "order");

-- CreateIndex
CREATE INDEX "Lesson_educationId_date_idx" ON "Lesson"("educationId", "date");

-- CreateIndex
CREATE INDEX "Lesson_courseId_order_idx" ON "Lesson"("courseId", "order");

-- CreateIndex
CREATE INDEX "Lesson_segmentId_order_idx" ON "Lesson"("segmentId", "order");

-- AddForeignKey
ALTER TABLE "EducationCourse" ADD CONSTRAINT "EducationCourse_educationId_fkey" FOREIGN KEY ("educationId") REFERENCES "Education"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSegment" ADD CONSTRAINT "CourseSegment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "EducationCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_educationId_fkey" FOREIGN KEY ("educationId") REFERENCES "Education"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "EducationCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "CourseSegment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
