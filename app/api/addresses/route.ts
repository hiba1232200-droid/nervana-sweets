import prisma from "@/lib/db/prisma";
import { ok, err, route, parseBody, currentUser } from "@/lib/api/respond";
import { addressSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

// GET /api/addresses — the user's saved delivery addresses.
export const GET = route(async () => {
  const u = await currentUser();
  if (!u) return err("Unauthorized", 401);
  const addresses = await prisma.address.findMany({ where: { userId: u.id }, orderBy: { isDefault: "desc" } });
  return ok(addresses);
});

// POST /api/addresses — add a saved address.
export const POST = route(async (req) => {
  const u = await currentUser();
  if (!u) return err("Unauthorized", 401);
  const body = await parseBody(req, addressSchema);
  const count = await prisma.address.count({ where: { userId: u.id } });
  const address = await prisma.address.create({
    data: { userId: u.id, ...body, isDefault: count === 0 },
  });
  return ok(address, 201);
});
