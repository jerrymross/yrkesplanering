# Yrkesplan

Yrkesplan är en första MVP för att planera yrkesutbildningar, kurser, nivåer, APL-perioder och lektioner.

Byggt för Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-inspirerade komponenter, Prisma och SQLite i utveckling. Prisma-modellen är hållen enkel så `datasource` senare kan bytas från SQLite till PostgreSQL, exempelvis Supabase.

## Funktioner i MVP

- Dashboard med utbildningar, startdatum, antal kurser och status.
- Skapa utbildning med undervisningsdagar, tider, timmar per dag, fika och lunch.
- Utbildningsdetalj med nivåer/kurser och delperioder.
- Validering av delperiodernas veckor mot kursens totala veckor.
- Automatisk planering via `calculateEducationPlan`.
- Seed-data för `Bageri och konditori`.
- Veckovy måndag-fredag 08:30-16:00.
- Drag-and-drop för lektioner med `@dnd-kit`.
- PATCH-route: `/api/lessons/[id]/move`.
- Låsta lektioner kan inte flyttas.

## Kom igång lokalt

Krav:

- Node.js 20 eller senare
- npm

Skapa `.env`:

```bash
cp .env.example .env
```

Installera beroenden:

```bash
npm install
```

Skapa databasen och kör seed:

```bash
npm run db:push
npm run db:seed
```

Starta utvecklingsservern:

```bash
npm run dev
```

Öppna `http://localhost:3000`.

## Build

```bash
npm run build
```

Build-scriptet kör `prisma generate` före `next build`.

## Databas

Utveckling använder SQLite:

```env
DATABASE_URL="file:./dev.db"
```

För PostgreSQL/Supabase senare:

1. Byt `provider` i `prisma/schema.prisma` från `sqlite` till `postgresql`.
2. Sätt `DATABASE_URL` till Supabase/PostgreSQL-anslutningen.
3. Kör Prisma-migreringar i stället för `db push`.

## Vercel och GitHub

1. Skapa ett GitHub-repo och pusha projektet.
2. Logga in på Vercel och välj `Add New Project`.
3. Importera GitHub-repot.
4. Lägg till miljövariabeln `DATABASE_URL`.
5. Deploya från Vercel.

För produktion bör SQLite ersättas med PostgreSQL, eftersom Vercels filsystem inte är en permanent databas.

## Antaganden

- Version 1 hoppar över lördag och söndag men hanterar inte svenska röda dagar. `lib/scheduler/date-utils.ts` har en förberedd `isHoliday`-funktion.
- Lektionens pedagogiska `order` ändras inte vid drag-and-drop. Endast `date`, `startTime` och `endTime` uppdateras.
- Vid flytt behåller lektionen sin tidigare längd.
- APL-lektioner visas som `APL vecka X av Y`; övriga lektioner visas som `Lektion X av Y`.
- Fika och lunch visas som blockerade rutor i veckovyn.

## Viktiga filer

- `prisma/schema.prisma` - datamodell
- `prisma/seed.ts` - exempelutbildning och lektioner
- `lib/scheduler/calculateEducationPlan.ts` - planeringsmotor
- `app/dashboard/page.tsx` - dashboard
- `app/educations/[id]/page.tsx` - utbildningsdetalj
- `components/schedule/week-schedule.tsx` - veckovy och drag-and-drop
- `app/api/lessons/[id]/move/route.ts` - flytt av lektion
