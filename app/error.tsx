"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Något gick fel</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            Appen fick ett serverfel. Kontrollera Vercel-loggarna för exakt orsak.
          </p>
          {error.digest ? <p className="text-sm text-muted-foreground">Digest: {error.digest}</p> : null}
          <Button type="button" onClick={reset} className="w-fit">
            Försök igen
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
