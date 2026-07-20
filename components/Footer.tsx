"use client";

import Link from "next/link";
import { Instagram, Facebook, Twitter, Youtube, MapPin, Phone, Mail, Send } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";
import { useState } from "react";

export default function Footer() {
  const { t, lang, replayIntro, reducedMotion, setReducedMotion } = useApp();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const socials = [
    { icon: Instagram, href: "#" },
    { icon: Facebook, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Youtube, href: "#" },
  ];

  return (
    <footer id="contact" className="relative border-t border-gold/15 bg-ink-soft">
      {/* Newsletter */}
      <div className="section-pad !py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/10 to-transparent p-8 text-center md:p-12">
          <h3 className="font-display text-3xl font-bold text-gold-gradient">{t.sections.newsletter}</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-cream/60">{t.footer.about}</p>
          <form
            onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }}
            className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder={t.common.emailPlaceholder}
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-cream outline-none focus:border-gold"
            />
            <button type="submit" className="btn-gold whitespace-nowrap">
              {done ? "✓" : <>{t.common.subscribe} <Send size={15} /></>}
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-12 md:grid-cols-4 md:px-10">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-gold/50 font-display text-lg font-bold text-gold">N</span>
            <span className="font-display text-2xl font-bold text-gold-gradient">{t.brand}</span>
          </div>
          <p className="text-sm leading-relaxed text-cream/60">{t.footer.about}</p>
          <div className="mt-4 flex gap-2">
            {socials.map((s, i) => (
              <a key={i} href={s.href} className="grid h-10 w-10 place-items-center rounded-full glass-light text-cream/70 transition hover:bg-gold hover:text-ink">
                <s.icon size={17} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-display text-lg font-semibold text-gold">{t.footer.quickLinks}</h4>
          <ul className="space-y-2 text-sm text-cream/60">
            <li><Link href="/products" className="hover:text-gold">{t.nav.shop}</Link></li>
            <li><Link href="/#categories" className="hover:text-gold">{t.nav.categories}</Link></li>
            <li><Link href="/#best" className="hover:text-gold">{t.nav.bestSellers}</Link></li>
            <li><Link href="/#offers" className="hover:text-gold">{t.nav.offers}</Link></li>
            <li><Link href="/#about" className="hover:text-gold">{t.nav.about}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-lg font-semibold text-gold">{t.footer.customerCare}</h4>
          <ul className="space-y-2 text-sm text-cream/60">
            <li><a href="#" className="hover:text-gold">{t.footer.shipping}</a></li>
            <li><a href="#" className="hover:text-gold">{t.footer.returns}</a></li>
            <li><a href="#" className="hover:text-gold">{t.footer.privacy}</a></li>
            <li><a href="#" className="hover:text-gold">{t.footer.terms}</a></li>
            <li><Link href="/#faq" className="hover:text-gold">{t.sections.faq}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-lg font-semibold text-gold">{t.footer.contactUs}</h4>
          <ul className="space-y-3 text-sm text-cream/60">
            <li className="flex items-center gap-2"><MapPin size={16} className="text-gold" /> {t.brandSub}</li>
            <li className="flex items-center gap-2"><Phone size={16} className="text-gold" /> +963 900 000 000</li>
            <li className="flex items-center gap-2"><Mail size={16} className="text-gold" /> hello@nervana.sweets</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 border-t border-white/10 py-5 text-center text-xs text-cream/40 sm:flex-row sm:gap-4">
        <span>© {new Date().getFullYear()} {t.brand} — {t.footer.rights}.</span>
        <button onClick={replayIntro} className="text-cream/50 transition hover:text-gold">
          ✦ {lang === "ar" ? "إعادة المقدمة" : "Replay intro"}
        </button>
        <button onClick={() => setReducedMotion(!reducedMotion)} className="text-cream/50 transition hover:text-gold" aria-pressed={reducedMotion}>
          {reducedMotion ? "✦ " : "◦ "}{lang === "ar" ? (reducedMotion ? "الحركة المخفّضة: مُفعّلة" : "وضع الحركة المخفّضة") : (reducedMotion ? "Reduced motion: on" : "Reduced motion")}
        </button>
      </div>
    </footer>
  );
}
