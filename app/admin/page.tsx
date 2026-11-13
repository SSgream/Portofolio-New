import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import {
  addExperience, addHighlight, addProject, addSkill, logoutAction, removeItem, saveProfile,
  updateExperience, updateHighlight, updateProject, updateSkill,
} from "@/app/actions";
export const dynamic = "force-dynamic";

const inp = "min-h-11 w-full rounded-xl border border-edge bg-white px-4 py-2 text-base";
const btn = "min-h-11 rounded-full bg-peach px-6 font-semibold text-navy hover:brightness-95";

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 rounded-3xl border border-edge bg-card p-6 md:p-8">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-navy">{title}</h2>
      {hint ? <p className="mb-5 mt-1 text-sm">{hint}</p> : <div className="mb-5" />}
      {children}
    </section>
  );
}
function Field({ name, label, value, area, span }: { name: string; label: string; value?: string; area?: boolean; span?: boolean }) {
  return (
    <label className={`block text-sm font-medium text-navy ${span ? "md:col-span-2" : ""}`}>
      {label}
      {area ? <textarea name={name} defaultValue={value} rows={4} className={`${inp} mt-1 font-normal`} /> : <input name={name} defaultValue={value} className={`${inp} mt-1 font-normal`} />}
    </label>
  );
}
/* Pilih gambar projek. Di form edit, tampilkan gambar saat ini dan opsi menghapusnya. */
function ImageField({ current }: { current?: string }) {
  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-navy">
        Gambar projek (JPG, PNG, atau WebP, maks 4 MB)
        <input type="file" name="image" accept="image/*" className={`${inp} mt-1 font-normal file:mr-4 file:rounded-full file:border-0 file:bg-mist file:px-4 file:py-1.5 file:font-semibold file:text-navy`} />
      </label>
      {current && (
        <div className="mt-3 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current} alt="Gambar saat ini" className="h-16 w-24 rounded-lg object-cover" />
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="remove_image" value="1" className="h-4 w-4" />Hapus gambar ini</label>
        </div>
      )}
    </div>
  );
}
/* Satu baris item: klik untuk membuka form edit. Tombol hapus ada di dalam supaya tidak terpencet tanpa sengaja. */
function Item({ table, id, title, action, children }: { table: string; id: number; title: React.ReactNode; action: (fd: FormData) => Promise<void>; children: React.ReactNode }) {
  return (
    <li className="border-t border-edge">
      <details className="group">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-sm">
          <span>{title}</span>
          <span className="font-semibold text-steel group-open:hidden">Edit</span>
          <span className="hidden font-semibold text-steel group-open:inline">Tutup</span>
        </summary>
        <div className="pb-5 pt-2">
          <form action={action} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="id" value={id} />
            {children}
            <div className="md:col-span-2"><button className={btn}>Simpan perubahan</button></div>
          </form>
          <form action={removeItem} className="mt-2">
            <input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />
            <button className="min-h-11 text-sm font-semibold text-[#9b2c2c] hover:underline">Hapus item ini</button>
          </form>
        </div>
      </details>
    </li>
  );
}

export default async function Admin() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [prof, skills, projects, exps, hl] = await Promise.all([
    sql`SELECT * FROM profile WHERE id=1`,
    sql`SELECT * FROM skills ORDER BY id`,
    sql`SELECT * FROM projects ORDER BY (sort_order = 0), sort_order, id DESC`,
    sql`SELECT * FROM experiences ORDER BY id DESC`,
    sql`SELECT * FROM highlights ORDER BY id`,
  ]);
  const p: any = {
    name: "", hero_label: "", headline: "", headline_accent: "", bio: "", about_title: "", about_text: "",
    contact_title: "", contact_text: "", email: "", github: "", linkedin: "", tableau: "", footer_note: "",
    ...prof[0],
  };
  return (
    <>
      <header className="bg-navy">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4 text-white">
          <h1 className="font-display text-xl font-semibold">Kelola portofolio</h1>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <a href="/" target="_blank" className="inline-flex min-h-11 items-center rounded-full px-4 text-onnavy hover:text-white">Lihat situs</a>
            <form action={logoutAction}><button className="min-h-11 rounded-full border border-white/40 px-5">Keluar</button></form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Card title="Profil" hint="Teks utama situs. Kolom yang dikosongkan tidak ditampilkan.">
          <form action={saveProfile} className="grid gap-4 md:grid-cols-2">
            <Field name="name" label="Nama" value={p.name} />
            <Field name="hero_label" label="Label kecil di atas judul" value={p.hero_label} />
            <Field name="headline" label="Judul utama" value={p.headline} span />
            <Field name="headline_accent" label="Kata yang disorot warna peach (harus ada di judul)" value={p.headline_accent} span />
            <Field name="bio" label="Paragraf perkenalan (di hero)" value={p.bio} area span />
            <Field name="about_title" label="Judul bagian Tentang" value={p.about_title} span />
            <Field name="about_text" label="Isi Tentang (pisahkan paragraf dengan baris kosong)" value={p.about_text} area span />
            <Field name="contact_title" label="Judul bagian Kontak" value={p.contact_title} span />
            <Field name="contact_text" label="Subteks Kontak" value={p.contact_text} span />
            <Field name="email" label="Email" value={p.email} />
            <Field name="linkedin" label="Link LinkedIn" value={p.linkedin} />
            <Field name="github" label="Link GitHub" value={p.github} />
            <Field name="tableau" label="Link Tableau Public" value={p.tableau} />
            <Field name="footer_note" label="Teks footer" value={p.footer_note} span />
            <div className="md:col-span-2"><button className={btn}>Simpan profil</button></div>
          </form>
        </Card>

        <Card title="Projek" hint="Yang terbaru tampil paling awal. Klik Edit pada sebuah projek untuk mengubahnya.">
          <form action={addProject} className="mb-6 grid gap-4 md:grid-cols-2">
            <Field name="title" label="Nama projek" span />
            <Field name="description" label="Deskripsi 1-2 kalimat" area span />
            <Field name="tech" label="Teknologi (pisahkan dengan koma)" />
            <Field name="kind" label="Jenis, mis. Dashboard" />
            <Field name="year" label="Tahun" />
            <Field name="url" label="Link studi kasus" />
            <Field name="repo" label="Link GitHub projek, mis. https://github.com/username/nama-repo (opsional)" span />
            <Field name="sort_order" label="Urutan tampil (1 = paling awal; kosongkan agar otomatis)" />
            <ImageField />
            <div className="md:col-span-2"><button className={btn}>Tambah projek</button></div>
          </form>
          <ul>
            {projects.map((x: any, i: number) => (
              <Item key={x.id} table="projects" id={x.id} title={`${i + 1}. ${x.title}`} action={updateProject}>
                <Field name="title" label="Nama projek" value={x.title} span />
                <Field name="description" label="Deskripsi" value={x.description} area span />
                <Field name="tech" label="Teknologi" value={x.tech} />
                <Field name="kind" label="Jenis" value={x.kind} />
                <Field name="year" label="Tahun" value={x.year} />
                <Field name="url" label="Link studi kasus" value={x.url} />
                <Field name="repo" label="Link GitHub projek" value={x.repo} span />
                <Field name="sort_order" label="Urutan tampil (1 = paling awal; 0 atau kosong = otomatis)" value={x.sort_order ? String(x.sort_order) : ""} />
                <ImageField current={x.image_url} />
              </Item>
            ))}
          </ul>
        </Card>

        <Card title="Keahlian" hint="Tampil sebagai chip di strip biru, urut sesuai waktu ditambahkan.">
          <form action={addSkill} className="mb-5 flex gap-3">
            <input name="name" required aria-label="Nama keahlian" placeholder="Mis. Tableau" className={inp} />
            <button className={btn}>Tambah</button>
          </form>
          <ul>
            {skills.map((s: any) => (
              <Item key={s.id} table="skills" id={s.id} title={s.name} action={updateSkill}>
                <Field name="name" label="Nama keahlian" value={s.name} span />
              </Item>
            ))}
          </ul>
        </Card>

        <Card title="Poin Tentang" hint="Poin pendek di bagian Tentang, mis. Rancang, Olah, Sajikan.">
          <form action={addHighlight} className="mb-5 grid gap-4 md:grid-cols-2">
            <Field name="title" label="Judul poin" />
            <Field name="text" label="Penjelasan singkat" />
            <div className="md:col-span-2"><button className={btn}>Tambah poin</button></div>
          </form>
          <ul>
            {hl.map((x: any) => (
              <Item key={x.id} table="highlights" id={x.id} title={x.title} action={updateHighlight}>
                <Field name="title" label="Judul poin" value={x.title} />
                <Field name="text" label="Penjelasan singkat" value={x.text} />
              </Item>
            ))}
          </ul>
        </Card>

        <Card title="Pengalaman" hint="Tampil di bagian Tentang. Yang terbaru ditambahkan tampil paling awal.">
          <form action={addExperience} className="mb-6 grid gap-4 md:grid-cols-2">
            <Field name="role" label="Posisi" />
            <Field name="company" label="Perusahaan / organisasi" />
            <Field name="start_date" label="Mulai, mis. Jan 2024" />
            <Field name="end_date" label="Selesai (kosong = Sekarang)" />
            <Field name="description" label="Apa yang kamu kerjakan (satu baris per poin)" area span />
            <div className="md:col-span-2"><button className={btn}>Tambah pengalaman</button></div>
          </form>
          <ul>
            {exps.map((x: any) => (
              <Item key={x.id} table="experiences" id={x.id} title={`${x.role}, ${x.company}`} action={updateExperience}>
                <Field name="role" label="Posisi" value={x.role} />
                <Field name="company" label="Perusahaan / organisasi" value={x.company} />
                <Field name="start_date" label="Mulai" value={x.start_date} />
                <Field name="end_date" label="Selesai" value={x.end_date} />
                <Field name="description" label="Deskripsi" value={x.description} area span />
              </Item>
            ))}
          </ul>
        </Card>
      </main>
    </>
  );
}