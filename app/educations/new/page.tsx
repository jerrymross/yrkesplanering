import { CreateEducationForm } from "@/components/forms/create-education-form";

export default function NewEducationPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Skapa utbildning</h1>
        <p className="mt-1 text-muted-foreground">Starta med ramarna för skoldag, raster och undervisningsdagar.</p>
      </div>
      <CreateEducationForm />
    </main>
  );
}
