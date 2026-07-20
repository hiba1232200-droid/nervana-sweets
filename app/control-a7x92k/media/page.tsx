"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  UploadCloud, Search, Trash2, Replace, FolderInput, Copy, Check, X, Image as ImageIcon,
} from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import type { MediaFolderKey } from "@/lib/admin/seed";
import { PageHead, Card, Btn, Badge, inputCls } from "@/components/admin/ui";

const FOLDERS: { key: MediaFolderKey; label: string }[] = [
  { key: "products", label: "Product Images" },
  { key: "categories", label: "Category Icons" },
  { key: "banners", label: "Banners" },
  { key: "promos", label: "Promotional" },
  { key: "gallery", label: "Gallery" },
  { key: "assets", label: "Website Assets" },
];

interface Pending { url: string; filename: string; alt: string; width: number; height: number; sizeKb: number; }

function readImage(file: File): Promise<Pending> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      const img = new window.Image();
      img.onload = () => resolve({
        url, filename: file.name.replace(/\.[^.]+$/, ".webp"),
        alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        width: img.naturalWidth, height: img.naturalHeight, sizeKb: Math.round(file.size / 1024),
      });
      img.src = url;
    };
    reader.readAsDataURL(file);
  });
}

export default function MediaAdmin() {
  const { media, addMedia, renameMedia, setMediaAlt, moveMedia, replaceMedia, removeMedia } = useAdmin();
  const [folder, setFolder] = useState<MediaFolderKey>("products");
  const [q, setQ] = useState("");
  const [pending, setPending] = useState<Pending[]>([]);
  const [drag, setDrag] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const replaceRef = useRef<{ id: string } | null>(null);
  const replaceInput = useRef<HTMLInputElement>(null);

  const list = useMemo(() => media.filter((m) =>
    m.folder === folder && `${m.filename} ${m.alt}`.toLowerCase().includes(q.toLowerCase())
  ), [media, folder, q]);

  const ingest = async (files: FileList | null) => {
    if (!files) return;
    const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const read = await Promise.all(imgs.map(readImage));
    setPending((p) => [...p, ...read]);
  };

  const publish = () => {
    addMedia(pending.map((p) => ({ ...p, folder })));
    setPending([]);
  };

  const onReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceRef.current) return;
    const p = await readImage(file);
    replaceMedia(replaceRef.current.id, p.url);
    replaceRef.current = null;
    e.target.value = "";
  };

  const copy = (url: string, id: string) => {
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="space-y-4">
      <PageHead title="Media Manager" desc="Upload, organize and optimize every image asset." />

      {/* Folder tabs */}
      <div className="flex flex-wrap gap-2">
        {FOLDERS.map((f) => (
          <button key={f.key} onClick={() => setFolder(f.key)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${folder === f.key ? "bg-gold text-ink" : "bg-white/5 text-cream/60 hover:bg-white/10"}`}>
            {f.label} <span className="opacity-60">({media.filter((m) => m.folder === f.key).length})</span>
          </button>
        ))}
      </div>

      {/* Upload zone (drag & drop + multiple) */}
      <Card>
        <label
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); ingest(e.dataTransfer.files); }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-10 text-center transition ${drag ? "border-gold bg-gold/5" : "border-white/15 hover:border-gold/40"}`}
        >
          <UploadCloud size={30} className="text-gold" />
          <p className="text-sm text-cream">Drag & drop images here, or <span className="text-gold">browse</span></p>
          <p className="text-xs text-cream/40">Auto-compressed → WebP · responsive sizes · lazy-loaded · CDN-ready</p>
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => ingest(e.target.files)} />
        </label>

        {/* Preview before publishing */}
        {pending.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-cream">Preview ({pending.length}) — into “{FOLDERS.find((f) => f.key === folder)?.label}”</span>
              <div className="flex gap-2">
                <Btn variant="ghost" size="sm" onClick={() => setPending([])}>Clear</Btn>
                <Btn size="sm" onClick={publish}><Check size={14} /> Publish {pending.length}</Btn>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {pending.map((p, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
                  <div className="relative mb-2 aspect-square overflow-hidden rounded-lg">
                    <Image src={p.url} alt={p.alt} fill className="object-cover" sizes="200px" unoptimized />
                    <button onClick={() => setPending((x) => x.filter((_, k) => k !== i))} className="absolute end-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70"><X size={12} /></button>
                  </div>
                  <input value={p.filename} onChange={(e) => setPending((x) => x.map((m, k) => (k === i ? { ...m, filename: e.target.value } : m)))} className={inputCls + " mb-1 !py-1 text-xs"} />
                  <input value={p.alt} placeholder="Alt text (SEO)" onChange={(e) => setPending((x) => x.map((m, k) => (k === i ? { ...m, alt: e.target.value } : m)))} className={inputCls + " !py-1 text-xs"} />
                  <p className="mt-1 text-[10px] text-cream/40">{p.width}×{p.height} · {p.sizeKb} KB</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 w-fit">
        <Search size={15} className="text-cream/40" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search media…" className="w-56 bg-transparent text-sm outline-none" />
      </div>

      {/* Library grid */}
      {list.length === 0 ? (
        <Card><div className="grid place-items-center gap-2 py-12 text-cream/40"><ImageIcon size={28} /> No media in this folder yet.</div></Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((m) => (
            <div key={m.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-ink-soft/60">
              <div className="relative aspect-square overflow-hidden">
                <Image src={m.url} alt={m.alt} fill className="object-cover transition group-hover:scale-105" sizes="240px" unoptimized />
                <div className="absolute inset-0 flex items-end justify-center gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => copy(m.url, m.id)} title="Copy URL" className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 hover:bg-gold hover:text-ink">{copied === m.id ? <Check size={14} /> : <Copy size={14} />}</button>
                  <button onClick={() => { replaceRef.current = { id: m.id }; replaceInput.current?.click(); }} title="Replace" className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 hover:bg-gold hover:text-ink"><Replace size={14} /></button>
                  <button onClick={() => removeMedia(m.id)} title="Delete" className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 hover:bg-rose-500 hover:text-white"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="space-y-1 p-2">
                <input value={m.filename} onChange={(e) => renameMedia(m.id, e.target.value)} className="w-full rounded-md bg-transparent text-xs font-medium text-cream outline-none hover:bg-white/5 focus:bg-white/5" />
                <input value={m.alt} onChange={(e) => setMediaAlt(m.id, e.target.value)} placeholder="Alt text (SEO)" className="w-full rounded-md bg-transparent text-[11px] text-cream/50 outline-none hover:bg-white/5 focus:bg-white/5" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cream/30">{m.width}×{m.height} · {m.sizeKb}KB</span>
                  <select value={m.folder} onChange={(e) => moveMedia(m.id, e.target.value as MediaFolderKey)} className="rounded bg-transparent text-[10px] text-cream/50 outline-none">
                    {FOLDERS.map((f) => <option key={f.key} value={f.key} className="bg-ink">{f.key}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <input ref={replaceInput} type="file" accept="image/*" className="hidden" onChange={onReplaceFile} />

      <p className="text-xs text-cream/40">
        <Badge tone="gold">Optimization</Badge> In production, uploads POST to <b className="text-gold">/api/media/upload</b> where each image is compressed, converted to WebP, resized into responsive variants (320–1600px) with a blur placeholder, and referenced in the database — then served via <b className="text-gold">next/image</b> with lazy-loading and long-term browser caching.
      </p>
    </div>
  );
}
