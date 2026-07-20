"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ADMIN_PATH } from "@/lib/admin/config";
import { useApp } from "@/lib/stores/AppProvider";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./commerce/CartDrawer";
import WishlistDrawer from "./commerce/WishlistDrawer";
import CompareDrawer from "./commerce/CompareDrawer";
import SearchModal from "./commerce/SearchModal";
import AuthModal from "./commerce/AuthModal";
import FloatingActions from "./commerce/FloatingActions";
import Assistant from "./ai/Assistant";
import Toaster from "./notifications/Toaster";
import NotificationCenter from "./notifications/NotificationCenter";
import SoftPrompt from "./push/SoftPrompt";
import WelcomeIntro from "./intro/WelcomeIntro";
import PromoPopup from "./promo/PromoPopup";
import AudioController from "./audio/AudioController";
import EnvironmentLayer from "./three/EnvironmentLayer";

const AmbientBackground = dynamic(() => import("./three/AmbientBackground"), { ssr: false });

export default function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings, lang } = useApp();
  // The hidden admin dashboard and the auth screens render chrome-less.
  if (pathname?.startsWith(ADMIN_PATH) || pathname?.startsWith("/auth")) return <>{children}</>;

  // Maintenance mode (toggled from the Admin Dashboard) takes the shop offline.
  if (settings.maintenanceMode) {
    return (
      <div className="grid min-h-screen place-items-center bg-luxury-radial px-6 text-center">
        <div>
          <span className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-2xl border border-gold/40 font-display text-3xl font-bold text-gold">N</span>
          <h1 className="font-display text-4xl font-bold text-gold-gradient">
            {lang === "ar" ? "الموقع قيد الصيانة" : "Under Maintenance"}
          </h1>
          <p className="mt-3 max-w-md text-cream/60">
            {lang === "ar"
              ? "نعمل على تحسين تجربتك. سنعود قريباً بأحلى الحلويات."
              : "We're polishing the experience. We'll be back shortly with the finest sweets."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <EnvironmentLayer />
      <AmbientBackground />
      <Navbar />
      <main id="main-content" className="min-h-screen">{children}</main>
      <Footer />
      <CartDrawer />
      <WishlistDrawer />
      <CompareDrawer />
      <SearchModal />
      <AuthModal />
      <NotificationCenter />
      <FloatingActions />
      <Assistant />
      <Toaster />
      <SoftPrompt />
      <PromoPopup />
      <WelcomeIntro />
      <AudioController />
    </>
  );
}
