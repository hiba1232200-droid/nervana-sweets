import prisma from "@/lib/db/prisma";
import { ok, route } from "@/lib/api/respond";
import { MediaFolder } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET /api/media?folder=&q= — list optimized media assets.
export const GET = route(async (req) => {
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder")?.toUpperCase();
  const q = searchParams.get("q")?.trim();
  const assets = await prisma.mediaAsset.findMany({
    where: {
      ...(folder && folder in MediaFolder ? { folder: folder as MediaFolder } : {}),
      ...(q ? { OR: [{ filename: { contains: q, mode: "insensitive" } }, { alt: { contains: q, mode: "insensitive" } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return ok(assets);
});
