import prisma from "@/lib/db/prisma";

// Role-Based Access Control. Permissions are keyed strings (e.g. "orders.write").
// The `owner` role implicitly holds every permission.

export async function getUserPermissions(userId: string): Promise<Set<string>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });
  if (!user?.role) return new Set();
  if (user.role.name === "owner") return new Set(["*"]);
  return new Set(user.role.permissions.map((rp) => rp.permission.key));
}

export function can(perms: Set<string>, permission: string): boolean {
  return perms.has("*") || perms.has(permission);
}

export async function requirePermission(userId: string | undefined, permission: string): Promise<boolean> {
  if (!userId) return false;
  const perms = await getUserPermissions(userId);
  return can(perms, permission);
}
