"use client";

import { useParams } from "next/navigation";
import OrderTracking from "@/components/commerce/OrderTracking";

export default function OrderPage() {
  const params = useParams();
  const id = String(params?.id || "");
  return (
    <div className="min-h-screen bg-ink">
      <OrderTracking id={id} />
    </div>
  );
}
