"use server";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function reorderProjects(ids: (number | string)[]) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const list = Array.isArray(ids) ? ids.map(Number) : [];
  if (list.length === 0 || list.length > 500 || !list.every((n) => Number.isInteger(n) && n > 0)) {
    throw new Error("Invalid input");
  }
  // Neon (HTTP) memproses tiap query sebagai satu request; dijalankan paralel supaya cepat.
  await Promise.all(list.map((id, i) => sql`UPDATE projects SET sort_order = ${i + 1} WHERE id = ${id}`));
  revalidatePath("/");
  revalidatePath("/admin");
}
