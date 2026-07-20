import prisma from "@/lib/db/prisma";

// Fire-and-forget audit trail for every sensitive mutation.
export async function audit(params: {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  req?: Request;
  meta?: Record<string, unknown>;
}) {
  const { userId, action, entity, entityId, req, meta } = params;
  const ip = req?.headers.get("x-forwarded-for")?.split(",")[0] || undefined;
  const userAgent = req?.headers.get("user-agent") || undefined;
  try {
    await prisma.auditLog.create({
      data: { userId, action, entity, entityId, ip, userAgent, meta: meta as any },
    });
  } catch {
    /* never let auditing break the request */
  }
}
