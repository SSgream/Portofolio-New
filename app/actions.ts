"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { isAdmin, login, logout } from "@/lib/auth";

const f = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
async function guard() { if (!(await isAdmin())) redirect("/admin/login"); }
function done() { revalidatePath("/"); revalidatePath("/admin"); }

export async function loginAction(fd: FormData) {
  if (!(await login(f(fd, "password")))) redirect("/admin/login?error=1");
  redirect("/admin");
}
export async function logoutAction() { await logout(); redirect("/admin/login"); }

export async function saveProfile(fd: FormData) {
  await guard();
  await sql`UPDATE profile SET name=${f(fd,"name")}, hero_label=${f(fd,"hero_label")}, headline=${f(fd,"headline")},
    headline_accent=${f(fd,"headline_accent")}, bio=${f(fd,"bio")}, about_title=${f(fd,"about_title")}, about_text=${f(fd,"about_text")},
    contact_title=${f(fd,"contact_title")}, contact_text=${f(fd,"contact_text")}, email=${f(fd,"email")}, github=${f(fd,"github")},
    linkedin=${f(fd,"linkedin")}, tableau=${f(fd,"tableau")}, footer_note=${f(fd,"footer_note")} WHERE id=1`;
  done();
}
export async function addSkill(fd: FormData) {
  await guard();
  await sql`INSERT INTO skills (name, category) VALUES (${f(fd,"name")}, 'Keahlian')`;
  done();
}
export async function addProject(fd: FormData) {
  await guard();
  await sql`INSERT INTO projects (title, description, tech, kind, year, url, repo)
    VALUES (${f(fd,"title")}, ${f(fd,"description")}, ${f(fd,"tech")}, ${f(fd,"kind")}, ${f(fd,"year")}, ${f(fd,"url")}, ${f(fd,"repo")})`;
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
