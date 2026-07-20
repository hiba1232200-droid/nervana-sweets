"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, X, Plus, Trash2, Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { useApp, type IntroScene } from "@/lib/stores/AppProvider";
import { galleryImages, faqs as seedFaqs } from "@/lib/data/products";
import { PageHead, Card, Table, Badge, Btn, Field, inputCls, Toggle } from "@/components/admin/ui";
import { Sparkles, RotateCcw } from "lucide-react";

export default function ContentAdmin() {
  const { banners, toggleBanner, reviews, setReviewStatus } = useAdmin();
  const { introEnabled, introDuration, introScene, introModelUrl, setIntroEnabled, setIntroDuration, setIntroScene, setIntroModelUrl, replayIntro } = useApp();
  const [hero, setHero] = useState({ title: "نيرفانا", subtitle: "حيث يلتقي التراث بالفخامة" });
  const [faqList, setFaqList] = useState(seedFaqs.map((f, i) => ({ id: i, q: f.qEn, a: f.aEn })));
  const [contact, setContact] = useState({ phone: "+963 900 000 000", email: "hello@nervana.sweets", address: "Damascus, Syria" });
  const [social, setSocial] = useState({ instagram: "@nervana", facebook: "nervana", twitter: "@nervana", youtube: "nervana" });

  return (
    <div className="space-y-4">
      <PageHead title="Content Management" desc="Homepage, banners, gallery, FAQ, reviews & contact." />

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-cream"><Sparkles size={18} className="text-gold" /> Luxury Welcome Intro</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-cream/50">Enabled</span>
            <Toggle on={introEnabled} onChange={setIntroEnabled} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={`Duration — ${introDuration}s`}>
            <input type="range" min={2} max={10} value={introDuration} onChange={(e) => setIntroDuration(+e.target.value)} className="w-full accent-gold" />
          </Field>
          <Field label="Scene / occasion">
            <select className={inputCls} value={introScene} onChange={(e) => setIntroScene(e.target.value as IntroScene)}>
              <option value="default">Default (Gold)</option>
              <option value="eid">Eid</option>
              <option value="ramadan">Ramadan</option>
              <option value="wedding">Wedding</option>
              <option value="custom">Custom model</option>
            </select>
          </Field>
          <Field label="Custom 3D model URL (.glb/.gltf)">
            <input className={inputCls} placeholder="https://…/model.glb" value={introModelUrl} onChange={(e) => setIntroModelUrl(e.target.value)} />
          </Field>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Btn variant="outline" size="sm" onClick={replayIntro}><RotateCcw size={14} /> Preview / replay intro</Btn>
          <span className="text-xs text-cream/40">The cinematic 3D intro plays once per visitor (remembered in the browser).</span>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-display text-lg font-bold text-cream">Homepage / Hero Editor</h3>
          <div className="space-y-3">
            <Field label="Hero title"><input className={inputCls} value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} /></Field>
            <Field label="Hero subtitle"><input className={inputCls} value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} /></Field>
            <Btn size="sm">Save homepage</Btn>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-display text-lg font-bold text-cream">Banner / Slider Manager</h3>
          <div className="space-y-2">
            {banners.map((b) => (
              <div key={b.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-2">
                <div className="relative h-12 w-16 overflow-hidden rounded-lg"><Image src={b.image} alt="" fill className="object-cover" sizes="64px" /></div>
                <div className="flex-1"><p className="text-sm text-cream">{b.subtitle}</p><p className="text-xs text-cream/40">{b.title}</p></div>
                <Toggle on={b.active} onChange={() => toggleBanner(b.id)} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 font-display text-lg font-bold text-cream">Gallery Manager</h3>
        <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
          {galleryImages.map((src, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg">
              <Image src={src} alt="" fill className="object-cover" sizes="100px" />
              <button className="absolute inset-0 grid place-items-center bg-black/60 opacity-0 transition group-hover:opacity-100"><Trash2 size={16} className="text-rose-300" /></button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 font-display text-lg font-bold text-cream">Reviews Moderation</h3>
        <Table head={["Customer", "Product", "Rating", "Status", "Actions"]}>
          {reviews.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2.5 text-cream/80">{r.customer}</td>
              <td className="px-4 py-2.5 text-cream/60">{r.product}</td>
              <td className="px-4 py-2.5 text-gold">{"★".repeat(r.rating)}</td>
              <td className="px-4 py-2.5"><Badge tone={r.status === "approved" ? "green" : r.status === "rejected" ? "rose" : "amber"}>{r.status}</Badge></td>
              <td className="px-4 py-2.5">
                <div className="flex gap-1">
                  <button onClick={() => setReviewStatus(r.id, "approved")} className="grid h-7 w-7 place-items-center rounded-lg text-emerald-300 hover:bg-emerald-500/10"><Check size={14} /></button>
                  <button onClick={() => setReviewStatus(r.id, "rejected")} className="grid h-7 w-7 place-items-center rounded-lg text-rose-300 hover:bg-rose-500/10"><X size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-display text-lg font-bold text-cream">FAQ Editor</h3>
          <div className="space-y-2">
            {faqList.map((f, i) => (
              <div key={f.id} className="rounded-xl bg-white/[0.03] p-3">
                <input className={inputCls + " mb-2"} value={f.q} onChange={(e) => setFaqList(faqList.map((x, k) => (k === i ? { ...x, q: e.target.value } : x)))} />
                <textarea rows={2} className={inputCls} value={f.a} onChange={(e) => setFaqList(faqList.map((x, k) => (k === i ? { ...x, a: e.target.value } : x)))} />
              </div>
            ))}
            <Btn size="sm" variant="outline" onClick={() => setFaqList([...faqList, { id: Date.now(), q: "", a: "" }])}><Plus size={14} /> Add FAQ</Btn>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-display text-lg font-bold text-cream">Contact & Social</h3>
          <div className="space-y-3">
            <Field label="Phone"><input className={inputCls} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></Field>
            <Field label="Email"><input className={inputCls} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></Field>
            <Field label="Address"><input className={inputCls} value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3"><Instagram size={15} className="text-gold/70" /><input className="w-full bg-transparent py-2 text-sm outline-none" value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} /></div>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3"><Facebook size={15} className="text-gold/70" /><input className="w-full bg-transparent py-2 text-sm outline-none" value={social.facebook} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} /></div>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3"><Twitter size={15} className="text-gold/70" /><input className="w-full bg-transparent py-2 text-sm outline-none" value={social.twitter} onChange={(e) => setSocial({ ...social, twitter: e.target.value })} /></div>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3"><Youtube size={15} className="text-gold/70" /><input className="w-full bg-transparent py-2 text-sm outline-none" value={social.youtube} onChange={(e) => setSocial({ ...social, youtube: e.target.value })} /></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
