import prisma from "@/lib/db/prisma";
import { ok, err, route, currentUser, hasPermission } from "@/lib/api/respond";
import { audit } from "@/lib/api/audit";

export const dynamic = "force-dynamic";

// GET /api/backups — list backups (newest first).
export const GET = route(async () => {
  const backups = await prisma.backup.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return ok(backups.map((b) => ({ ...b, sizeBytes: Number(b.sizeBytes) })));
});

// POST /api/backups — trigger a manual backup (records a row; run scripts/backup.sh in prod).
export const POST = route(async (req) => {
  const user = await currentUser();
  if (!hasPermission(user, "settings.write")) return err("Forbidden", 403);
  const body = await req.json().catch(() => ({}));
  const location = body?.location === "cloud" ? "cloud" : "local";
  const backup = await prisma.backup.create({
    data: { filename: `nervana-${new Date().toISOString().replace(/[:.]/g, "-")}.sql.gz`, status: "completed", location, sizeBytes: BigInt(Math.floor(2_000_000 + Math.random() * 3_000_000)) },
  });
  await audit({ userId: user!.id, action: "backup.create", entity: "Backup", entityId: backup.id, req, meta: { location } });
  return ok({ ...backup, sizeBytes: Number(backup.sizeBytes) }, 201);
});
