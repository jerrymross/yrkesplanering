import { Plus } from "lucide-react";
import { addCourse, addSegment, createDefaultSegment } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function AddCourseForm({ educationId }: { educationId: string }) {
  return (
    <form action={addCourse}>
      <input type="hidden" name="educationId" value={educationId} />
      <Card>
        <CardHeader>
          <CardTitle>Lägg till nivå/kurs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-6">
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="course-name">Namn</Label>
            <Input id="course-name" name="name" placeholder="Konditori nivå 2" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="level">Nivå</Label>
            <Input id="level" name="level" placeholder="2" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="points">Poäng</Label>
            <Input id="points" name="points" type="number" defaultValue="100" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="totalWeeks">Veckor</Label>
            <Input id="totalWeeks" name="totalWeeks" type="number" defaultValue="5" required />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4" />
              Lägg till
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export function AddSegmentForm({ educationId, courseId }: { educationId: string; courseId: string }) {
  return (
    <form action={addSegment} className="grid gap-3 rounded-md bg-muted p-3 md:grid-cols-5">
      <input type="hidden" name="educationId" value={educationId} />
      <input type="hidden" name="courseId" value={courseId} />
      <Input name="name" placeholder="Delperiod" required />
      <Select name="type" defaultValue="teaching">
        <option value="teaching">Undervisning</option>
        <option value="apl">APL</option>
        <option value="break">Uppehåll</option>
        <option value="exam">Examination</option>
      </Select>
      <Input name="weeks" type="number" min="1" defaultValue="1" required />
      <Input name="requiredHours" type="number" step="0.5" placeholder="Krav timmar" />
      <Button type="submit">
        <Plus className="h-4 w-4" />
        Delperiod
      </Button>
    </form>
  );
}

export function DefaultSegmentButton({
  educationId,
  courseId,
  totalWeeks,
}: {
  educationId: string;
  courseId: string;
  totalWeeks: number;
}) {
  return (
    <form action={createDefaultSegment}>
      <input type="hidden" name="educationId" value={educationId} />
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="totalWeeks" value={totalWeeks} />
      <Button type="submit" variant="secondary">
        Skapa standarddelperiod
      </Button>
    </form>
  );
}
