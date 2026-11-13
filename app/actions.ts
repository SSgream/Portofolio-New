"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { isAdmin, login, logout } from "@/lib/auth";

const f = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const fix = (u: string) => (u && !/^https?:\/\//i.test(u) ? `https://${u}` : u);
async function guard() { if (!(await isAdmin())) redirect("/admin/login"); }
async function uploadImage(fd: FormData): Promise<string> {
  const file = fd.get("image");
  if (!(file instanceof File) || file.size === 0) return "";
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar.");
  if (file.size > 4 * 1024 * 1024) throw new Error("Ukuran gambar maksimal 4 MB.");
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const blob = await put(`projects/${safe}`, file, { access: "public", addRandomSuffix: true });
  return blob.url;
}
function done() { revalidatePath("/"); revalidatePath("/admin"); }

export async function loginAction(fd: FormData) {
  if (!(await login(f(fd, "password")))) redirect("/admin/login?error=1");
  redirect("/admin");
}
export async function logoutAction() { await logout(); redirect("/admin/login"); }

export async function saveProfile(fd: FormData) {
  await guard();
  await sql`INSERT INTO profile (id, name, hero_label, headline, headline_accent, bio, about_title, about_text,
      contact_title, contact_text, email, github, linkedin, tableau, footer_note)
    VALUES (1, ${f(fd,"name")}, ${f(fd,"hero_label")}, ${f(fd,"headline")}, ${f(fd,"headline_accent")}, ${f(fd,"bio")},
      ${f(fd,"about_title")}, ${f(fd,"about_text")}, ${f(fd,"contact_title")}, ${f(fd,"contact_text")},
      ${f(fd,"email")}, ${fix(f(fd,"github"))}, ${fix(f(fd,"linkedin"))}, ${fix(f(fd,"tableau"))}, ${f(fd,"footer_note")})
    ON CONFLICT (id) DO UPDATE SET
      name=EXCLUDED.name, hero_label=EXCLUDED.hero_label, headline=EXCLUDED.headline,
      headline_accent=EXCLUDED.headline_accent, bio=EXCLUDED.bio, about_title=EXCLUDED.about_title,
      about_text=EXCLUDED.about_text, contact_title=EXCLUDED.contact_title, contact_text=EXCLUDED.contact_text,
      email=EXCLUDED.email, github=EXCLUDED.github, linkedin=EXCLUDED.linkedin,
      tableau=EXCLUDED.tableau, footer_note=EXCLUDED.footer_note`;
  done();
}

/* ---------- Tambah ---------- */
export async function addSkill(fd: FormData) {
  await guard();
  await sql`INSERT INTO skills (name, category) VALUES (${f(fd,"name")}, 'Keahlian')`;
  done();
}
export async function addProject(fd: FormData) {
  await guard();
  const image = await uploadImage(fd);
  await sql`INSERT INTO projects (title, description, tech, kind, year, url, repo, image_url)
    VALUES (${f(fd,"title")}, ${f(fd,"description")}, ${f(fd,"tech")}, ${f(fd,"kind")}, ${f(fd,"year")}, ${fix(f(fd,"url"))}, ${fix(f(fd,"repo"))}, ${image})`;
  done();
}
export async function addExperience(fd: FormData) {
  await guard();
  await sql`INSERT INTO experiences (role, company, start_date, end_date, description)
    VALUES (${f(fd,"role")}, ${f(fd,"company")}, ${f(fd,"start_date")}, ${f(fd,"end_date") || "Sekarang"}, ${f(fd,"description")})`;
  done();
}
export async function addHighlight(fd: FormData) {
  await guard();
  await sql`INSERT INTO highlights (title, text) VALUES (${f(fd,"title")}, ${f(fd,"text")})`;
  done();
}

/* ---------- Edit ---------- */
export async function updateSkill(fd: FormData) {
  await guard();
  await sql`UPDATE skills SET name=${f(fd,"name")} WHERE id=${Number(f(fd,"id"))}`;
  done();
}
export async function updateProject(fd: FormData) {
  await guard();
  const image = await uploadImage(fd);
  const remove = f(fd, "remove_image") === "1";
  await sql`UPDATE projects SET title=${f(fd,"title")}, description=${f(fd,"description")}, tech=${f(fd,"tech")},
    kind=${f(fd,"kind")}, year=${f(fd,"year")}, url=${fix(f(fd,"url"))}, repo=${fix(f(fd,"repo"))},
    image_url = CASE WHEN ${image}::text <> '' THEN ${image}::text WHEN ${remove}::boolean THEN '' ELSE image_url END
    WHERE id=${Number(f(fd,"id"))}`;
  done();
}
export async function updateExperience(fd: FormData) {
  await guard();
  await sql`UPDATE experiences SET role=${f(fd,"role")}, company=${f(fd,"company")}, start_date=${f(fd,"start_date")},
    end_date=${f(fd,"end_date") || "Sekarang"}, description=${f(fd,"description")}
    WHERE id=${Number(f(fd,"id"))}`;
  done();
}
export async function updateHighlight(fd: FormData) {
  await guard();
  await sql`UPDATE highlights SET title=${f(fd,"title")}, text=${f(fd,"text")} WHERE id=${Number(f(fd,"id"))}`;
  done();
}

/* ---------- Hapus ---------- */
export async function removeItem(fd: FormData) {
  await guard();
  const id = Number(f(fd, "id"));
  const t = f(fd, "table");
  if (t === "skills") await sql`DELETE FROM skills WHERE id=${id}`;
  else if (t === "projects") await sql`DELETE FROM projects WHERE id=${id}`;
  else if (t === "experiences") await sql`DELETE FROM experiences WHERE id=${id}`;
  else if (t === "highlights") await sql`DELETE FROM highlights WHERE id=${id}`;
  done();
}