import type { MetadataRoute } from "next";
import { ADMIN_PATH } from "@/lib/admin/config";

// Keep the hidden dashboard out of search engines entirely.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [ADMIN_PATH, `${ADMIN_PATH}/`],
      },
    ],
  };
}
