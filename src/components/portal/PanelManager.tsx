import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { panelsQuery } from "@/lib/data/queries";
import type { PanelMember } from "@/lib/data/types";

const PANELS = [
  { value: "teachers", label: "Teachers' Panel of English" },
  { value: "web", label: "Web Committee" },
];

const EMPTY = {
  panel: "teachers",
  full_name: "",
  role: "",
  bio: "",
  photo_url: "",
  sort_order: "0",
};

/** Admin-only editor for the teachers' panel and the web committee. */
export function PanelManager() {
  const queryClient = useQueryClient();
  const panels = useQuery(panelsQuery);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function reset() {
    setForm(EMPTY);
    setEditingId(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const payload = {
      panel: form.panel,
      full_name: form.full_name,
      role: form.role || null,
      bio: form.bio || null,
      photo_url: form.photo_url || null,
      sort_order: Number(form.sort_order) || 0,
    };
    const { error } = editingId
      ? await supabase.from("panel_members").update(payload).eq("id", editingId)
      : await supabase.from("panel_members").insert(payload);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Person updated" : "Person added");
    reset();
    queryClient.invalidateQueries({ queryKey: ["panel_members"] });
  }

  async function remove(person: PanelMember) {
    if (!confirm(`Remove ${person.full_name}?`)) return;
    const { error } = await supabase.from("panel_members").delete().eq("id", person.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Person removed");
    queryClient.invalidateQueries({ queryKey: ["panel_members"] });
  }

  function startEdit(person: PanelMember) {
    setEditingId(person.id);
    setForm({
      panel: person.panel,
      full_name: person.full_name,
      role: person.role ?? "",
      bio: person.bio ?? "",
      photo_url: person.photo_url ?? "",
      sort_order: String(person.sort_order),
    });
  }

  return (
    <Card className="border-border/70 shadow-soft">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold">Teachers&apos; panel &amp; web committee</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These people appear on the public About page.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Panel</Label>
              <Select value={form.panel} onValueChange={(v) => setForm({ ...form, panel: v })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PANELS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="p-name">Full name</Label>
              <Input
                id="p-name"
                className="mt-2"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="p-role">Role / title</Label>
              <Input
                id="p-role"
                className="mt-2"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="p-photo">Photo URL (optional)</Label>
              <Input
                id="p-photo"
                className="mt-2"
                value={form.photo_url}
                onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="p-order">Display order</Label>
              <Input
                id="p-order"
                type="number"
                className="mt-2"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="p-bio">Short bio</Label>
            <Textarea
              id="p-bio"
              rows={3}
              className="mt-2"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="rounded-full" disabled={busy}>
              {editingId ? "Save person" : "Add person"}
            </Button>
            {editingId ? (
              <Button type="button" variant="ghost" className="rounded-full" onClick={reset}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>

        {PANELS.map((panel) => {
          const rows = (panels.data ?? []).filter((p) => p.panel === panel.value);
          return (
            <div key={panel.value} className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {panel.label}
              </h3>
              <ul className="mt-2 divide-y divide-border">
                {rows.map((person) => (
                  <li key={person.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="font-medium">{person.full_name}</p>
                      <p className="text-sm text-muted-foreground">{person.role}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(person)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(person)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </li>
                ))}
                {rows.length === 0 ? (
                  <li className="py-4 text-sm text-muted-foreground">Nobody added yet.</li>
                ) : null}
              </ul>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
