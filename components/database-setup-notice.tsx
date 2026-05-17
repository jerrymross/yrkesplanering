import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Okänt databasfel.";
}

export function DatabaseSetupNotice({ error }: { error: unknown }) {
  return (
    <Card className="border-amber-300 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-950">
          <AlertTriangle className="h-5 w-5" />
          Databasen är inte redo
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm text-amber-950">
        <p>
          Yrkesplan kunde inte läsa från databasen. Kontrollera att DATABASE_URL finns i Vercel och att
          Prisma-migrationerna har körts mot Supabase.
        </p>
        <pre className="overflow-x-auto rounded-md bg-white/70 p-3 text-xs">{errorMessage(error)}</pre>
        <div>
          <p className="font-medium">Kör detta mot samma databas:</p>
          <code className="mt-2 block rounded-md bg-white/70 p-3 text-xs">npm run db:deploy</code>
        </div>
      </CardContent>
    </Card>
  );
}
