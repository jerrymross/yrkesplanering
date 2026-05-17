import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseSetupNotice } from "@/components/database-setup-notice";
import { LinkButton } from "@/components/ui/link-button";
import { formatDate, statusLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const educationResult = await prisma.education
    .findMany({
      include: {
        _count: { select: { courses: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    .then((educations) => ({ educations, error: null }))
    .catch((error: unknown) => ({ educations: [], error }));

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Planera yrkesutbildningar, nivåer, APL och lektioner.</p>
        </div>
        <LinkButton href="/educations/new">
          <Plus className="h-4 w-4" />
          Skapa utbildning
        </LinkButton>
      </div>

      {educationResult.error ? (
        <DatabaseSetupNotice error={educationResult.error} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Utbildningar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-3 pr-4 font-medium">Namn</th>
                    <th className="py-3 pr-4 font-medium">Startdatum</th>
                    <th className="py-3 pr-4 font-medium">Nivåer/kurser</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {educationResult.educations.map((education) => (
                    <tr key={education.id} className="border-b last:border-0">
                      <td className="py-4 pr-4 font-medium">
                        <a className="text-primary hover:underline" href={`/educations/${education.id}`}>
                          {education.name}
                        </a>
                      </td>
                      <td className="py-4 pr-4">{formatDate(education.startDate)}</td>
                      <td className="py-4 pr-4">{education._count.courses}</td>
                      <td className="py-4 pr-4">
                        <Badge tone={education.status === "planned" ? "success" : "neutral"}>
                          {statusLabel(education.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {educationResult.educations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        Inga utbildningar ännu.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
