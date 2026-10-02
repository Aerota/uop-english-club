import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { testimonialsQuery, type Testimonial } from "@/lib/data/queries";

export function TestimonialsManager() {
  const qc = useQueryClient();
  const list = useQuery(testimonialsQuery);
  const [quote, setQuote] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState(false);
  const items = list.data ?? [];
  const refresh = () => qc.invalidateQueries({ queryKey: testimonialsQuery.queryKey });

  async function add() {
    if (!quote.trim() || !name.trim()) { toast.error("Quote and name are required"); return; }
    setBusy(true);
    const { error } = await supabase.from("testimonials").insert({
      quote: quote.trim(),
      author_name: name.trim(),
      author_role: role.trim() || null,
      sort_order: (items.at(-1)?.sort_order ?? 0) + 1,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setQuote(""); setName(""); setRole("");
    toast.success("Testimonial added");
    refresh();
  }

  async function update(id: string, patch: Partial<Testimonial>) {
    const { error } = await supabase.from("testimonials").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    refresh();
  }

  async function move(index: number, dir: -1 | 1) {
    const a = items[index], b = items[index + dir];
    if (!a || !b) return;
    await Promise.all([
      supabase.from("testimonials").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("testimonials").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-lg border bg-card p-4">
        <p className="font-semibold">Add a testimonial</p>
        <Textarea placeholder="Quote" value={quote} onChange={(e) => setQuote(e.target.value)} rows={3} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Name (e.g. Group 5)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Role (optional)" value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
        <Button onClick={add} disabled={busy}>Add testimonial</Button>
        <p className="text-xs text-muted-foreground">With more than 3 shown, the homepage switches to an animated carousel.</p>
      </div>

      {items.map((t, i) => (
        <div key={t.id} className="space-y-3 rounded-lg border bg-card p-4">
          <Textarea defaultValue={t.quote} rows={3} onBlur={(e) => e.target.value !== t.quote && update(t.id, { quote: e.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input defaultValue={t.author_name} onBlur={(e) => e.target.value !== t.author_name && update(t.id, { author_name: e.target.value })} />
            <Input defaultValue={t.author_role ?? ""} placeholder="Role" onBlur={(e) => update(t.id, { author_role: e.target.value || null })} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="mr-auto flex items-center gap-2 text-sm">
              <Switch checked={t.is_published} onCheckedChange={(v) => update(t.id, { is_published: v })} /> Shown on homepage
            </label>
            <Button size="icon" variant="outline" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="size-4" /></Button>
            <Button size="icon" variant="outline" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}><ArrowDown className="size-4" /></Button>
            <Button size="icon" variant="outline" aria-label="Delete" onClick={() => remove(t.id)}><Trash2 className="size-4" /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}
