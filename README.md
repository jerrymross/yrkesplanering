# Yrkesplan

Yrkesplan är en första MVP för att planera yrkesutbildningar, kurser, nivåer, APL-perioder och lektioner.

Byggt för Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-inspirerade komponenter, Prisma och PostgreSQL/Supabase.

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
- En PostgreSQL-databas, till exempel Supabase

Skapa `.env`:

```bash
cp .env.example .env
```

Sätt `DATABASE_URL` till din Supabase/PostgreSQL-anslutning:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?schema=public"
```

Installera beroenden:

```bash
npm install
```

Skapa tabeller och kör seed:

```bash
npm run db:deploy
npm run db:seed
```

Starta utvecklingsservern:

```bash
npm run dev
```

Öppna `http://localhost:3000`.

## Supabase

1. Skapa ett projekt i Supabase.
2. Kopiera en PostgreSQL connection string.
3. Lägg värdet i `.env` lokalt och i Vercel som `DATABASE_URL`.
4. Kör `npm run db:deploy` för att skapa tabeller.
5. Kör `npm run db:seed` om du vill ha exempelutbildningen.

För lokal utveckling kan du använda Supabase direkt. Om du vill utveckla helt offline kan du köra en lokal PostgreSQL-container och använda samma Prisma-schema.

## Build

```bash
npm run build
```

Build-scriptet kör `prisma generate` före `next build`.

## Vercel och GitHub

1. Pusha projektet till GitHub.
2. Importera repot i Vercel.
3. Lägg till miljövariabeln `DATABASE_URL`.
4. Deploya.
5. Kör `npm run db:deploy` mot samma databas en gång när schema ändras.

Seed körs inte automatiskt av Vercel. Kör `npm run db:seed` manuellt mot produktionsdatabasen om du vill ha exempeldata där.

## Antaganden

- Version 1 hoppar över lördag och söndag men hanterar inte svenska röda dagar. `lib/scheduler/date-utils.ts` har en förberedd `isHoliday`-funktion.
- Lektionens pedagogiska `order` ändras inte vid drag-and-drop. Endast `date`, `startTime` och `endTime` uppdateras.
- Vid flytt behåller lektionen sin tidigare längd.
- APL-lektioner visas som `APL vecka X av Y`; övriga lektioner visas som `Lektion X av Y`.
- Fika och lunch visas som blockerade rutor i veckovyn.

## Viktiga filer

- `prisma/schema.prisma` - datamodell
- `prisma/migrations/20260517120000_init/migration.sql` - initial PostgreSQL-migration
- `prisma/seed.ts` - exempelutbildning och lektioner
- `lib/scheduler/calculateEducationPlan.ts` - planeringsmotor
- `app/dashboard/page.tsx` - dashboard
- `app/educations/[id]/page.tsx` - utbildningsdetalj
- `components/schedule/week-schedule.tsx` - veckovy och drag-and-drop
- `app/api/lessons/[id]/move/route.ts` - flytt av lektion
