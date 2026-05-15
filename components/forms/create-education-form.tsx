import { CalendarPlus } from "lucide-react";
import { createEducation } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const days = [
  { value: "1", label: "Mån" },
  { value: "2", label: "Tis" },
  { value: "3", label: "Ons" },
  { value: "4", label: "Tor" },
  { value: "5", label: "Fre" },
];

export function CreateEducationForm() {
  return (
    <form action={createEducation}>
      <Card>
        <CardHeader>
          <CardTitle>Ny utbildning</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="name">Namn</Label>
            <Input id="name" name="name" placeholder="Ex. Bageri och konditori" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="startDate">Startdatum</Label>
            <Input id="startDate" name="startDate" type="date" required />
          </div>
          <div className="grid gap-2">
            <Label>Undervisningsdagar</Label>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <label key={day.value} className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm">
                  <input name="teachingDays" type="checkbox" value={day.value} defaultChecked />
                  {day.label}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="startTime">Starttid</Label>
              <Input id="startTime" name="startTime" type="time" defaultValue="08:30" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">Sluttid</Label>
              <Input id="endTime" name="endTime" type="time" defaultValue="16:00" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hoursPerDay">Timmar per dag</Label>
              <Input id="hoursPerDay" name="hoursPerDay" type="number" step="0.5" defaultValue="7.5" required />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2">
              <Label htmlFor="fikaStart">Fika start</Label>
              <Input id="fikaStart" name="fikaStart" type="time" defaultValue="10:00" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fikaEnd">Fika slut</Label>
              <Input id="fikaEnd" name="fikaEnd" type="time" defaultValue="10:30" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lunchStart">Lunch start</Label>
              <Input id="lunchStart" name="lunchStart" type="time" defaultValue="12:00" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lunchEnd">Lunch slut</Label>
              <Input id="lunchEnd" name="lunchEnd" type="time" defaultValue="13:00" required />
            </div>
          </div>
          <Button type="submit" className="w-fit">
            <CalendarPlus className="h-4 w-4" />
            Skapa utbildning
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
