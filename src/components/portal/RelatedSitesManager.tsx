import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { relatedSitesQuery, type RelatedSite } from "@/lib/data/queries";

function normalize(url: string) {
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

export function RelatedSitesManager() {
  const qc = useQueryClient();
  const items = useQuery(relatedSitesQuery).data ?? [];
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: relatedSitesQuery.queryKey });

  async function add() {
    if (!name.trim() || !url.trim()) { toast.error("Name and link are required"); return; }
    const { error } = await supabase.from("related_sites").insert({
      name: name.trim(), url: normalize(url), description: desc.trim() || null,
      sort_order: (items.at(-1)?.sort_order ?? 0) + 1,
    });
    if (error) { toast.error(error.message); return; }
    setName(""); setUrl(""); setDesc("");
    toast.success("Website added");
    refresh();
  }

  async function update(id: string, patch: Partial<RelatedSite>) {
    const { error } = await supabase.from("related_sites").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this website?")) return;
    const { error } = await supabase.from("related_sites").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    refresh();
  }

  async function move(i: number, dir: -1 | 1) {
    const a = items[i], b = items[i + dir];
    if (!a || !b) return;
    await Promise.all([
      supabase.from("related_sites").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("related_sites").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-lg border bg-card p-4">
        <p className="font-semibold">Add a website</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Website name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Link (https://...)" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <Input placeholder="Short description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <Button onClick={add}>Add website</Button>
        <p className="text-xs text-muted-foreground">Shown on the homepage, three per row, with a preview picture.</p>
      </div>
      {items.map((s, i) => (
        <div key={s.id} className="space-y-3 rounded-lg border bg-card p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input defaultValue={s.name} onBlur={(e) => e.target.value !== s.name && update(s.id, { name: e.target.value })} />
            <Input defaultValue={s.url} onBlur={(e) => e.target.value !== s.url && update(s.id, { url: normalize(e.target.value) })} />
          </div>
          <Input defaultValue={s.description ?? ""} placeholder="Description" onBlur={(e) => update(s.id, { description: e.target.value || null })} />
          <div className="flex justify-end gap-2">
            <Button size="icon" variant="outline" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="size-4" /></Button>
            <Button size="icon" variant="outline" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}><ArrowDown className="size-4" /></Button>
            <Button size="icon" variant="outline" aria-label="Delete" onClick={() => remove(s.id)}><Trash2 className="size-4" /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}
