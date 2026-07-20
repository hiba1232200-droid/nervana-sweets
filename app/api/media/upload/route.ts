import prisma from "@/lib/db/prisma";
import { ok, err, route, currentUser, hasPermission } from "@/lib/api/respond";
import { optimizeAndStore } from "@/lib/media/optimize";
import { audit } from "@/lib/api/audit";
import { MediaFolder } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // sharp requires the Node runtime

const FOLDER_MAP: Record<string, MediaFolder> = {
  products: "PRODUCTS", categories: "CATEGORIES", banners: "BANNERS",
  promos: "PROMOS", gallery: "GALLERY", assets: "ASSETS",
};

// POST /api/media/upload  (multipart form-data: files[], folder, alt?)
export const POST = route(async (req) => {
  const user = await currentUser();
  if (!hasPermission(user, "content.write") && !hasPermission(user, "products.write")) return err("Forbidden", 403);

  const form = await req.formData();
  const folderKey = String(form.get("folder") || "products").toLowerCase();
  const folder = FOLDER_MAP[folderKey] ?? "PRODUCTS";
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return err("No files provided", 400);

  const created = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const buf = Buffer.from(await file.arrayBuffer());
    const opt = await optimizeAndStore(buf, { folder: folderKey, filename: file.name });
    const asset = await prisma.mediaAsset.create({
      data: {
        folder,
        filename: file.name.replace(/\.[^.]+$/, ".webp"),
        url: opt.url,
        alt: (form.get("alt") as string) || file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        mime: "image/webp",
        width: opt.width,
        height: opt.height,
        sizeBytes: opt.sizeBytes,
        blurDataUrl: opt.blurDataUrl,
        variants: opt.variants,
        uploadedById: user!.id,
      },
    });
    created.push(asset);
  }

  await audit({ userId: user!.id, action: "media.upload", entity: "MediaAsset", req, meta: { count: created.length } });
  return ok(created, 201);
});
