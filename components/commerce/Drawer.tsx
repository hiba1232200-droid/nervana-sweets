"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useApp } from "@/lib/stores/AppProvider";

export default function Drawer({
  open, onClose, title, children, footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { lang } = useApp();
  const side = lang === "ar" ? "left-0" : "right-0";
  const from = lang === "ar" ? "-100%" : "100%";
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm" />
          <motion.aside
            initial={{ x: from }}
            animate={{ x: 0 }}
            exit={{ x: from }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className={`glass fixed bottom-0 top-0 z-[90] flex w-[440px] max-w-[92vw] flex-col ${side}`}
          >
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <h3 className="font-display text-xl font-bold text-gold-gradient">{title}</h3>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full glass-light transition hover:text-gold"><X size={18} /></button>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto p-5">{children}</div>
            {footer && <div className="border-t border-white/10 p-5">{footer}</div>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
