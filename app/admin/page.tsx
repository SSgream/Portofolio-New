import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import {
  addExperience, addHighlight, addProject, addSkill, logoutAction, removeItem, saveProfile,
  updateExperience, updateHighlight, updateProject, updateSkill, addCertificate, updateCertificate
} from "@/app/actions";
import ThemeToggle from "@/app/ThemeToggle";
import { ActionForm, ImageField, SubmitButton, Toaster } from "./ui";
import SortableProjects from "./SortableProjects";
import { orderProjects } from "@/lib/projectOrder";
export const dynamic = "force-dynamic";

/* Salin isi file ini ke halaman admin-mu (page.tsx di folder admin). */

const inp =
  "min-h-11 w-full rounded-xl border border-edge bg-white px-4 py-2 text-base font-normal text-navy outline-none transition duration-200 placeholder:text-navy/40 focus:border-steel focus:ring-4 focus:ring-steel/15";

const NAV: [string, string][] = [
  ["Profil", "#profil"],
  ["Projek", "#projek"],
  ["Keahlian", "#keahlian"],
  ["Poin Tentang", "#poin"],
  ["Sertifikat", "#sertifikat"],
  ["Pengalaman", "#pengalaman"],
];

/* ---------- Bagian-bagian halaman ---------- */
function Card({ id, title, hint, count, children }: { id: string; title: string; hint?: string; count?: number; children: React.ReactNode }) {
  return (
    <section
      id={id}
      className="mb-8 scroll-mt-32 rounded-[28px] border border-edge bg-white p-6 shadow-[0_1px_2px_rgba(27,47,75,0.04),0_16px_40px_-24px_rgba(27,47,75,0.18)] md:p-8 lg:scroll-mt-24"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-navy">{title}</h2>
          {hint && <p className="mt-1 text-sm">{hint}</p>}
        </div>
        {count !== undefined && (
          <span className="shrink-0 rounded-full bg-mist px-3 py-1 text-sm font-semibold text-steel">{count}</span>
        )}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 border-b border-edge pb-8 last:mb-0 last:border-0 last:pb-0">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-steel">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ name, label, value, area, span, hint }: { name: string; label: string; value?: string; area?: boolean; span?: boolean; hint?: string }) {
  return (
    <label className={`block text-sm font-medium text-navy ${span ? "md:col-span-2" : ""}`}>
      {label}
      {area ? (
        <textarea name={name} defaultValue={value} rows={4} className={`${inp} mt-1 leading-relaxed`} />
      ) : (
        <input name={name} defaultValue={value} className={`${inp} mt-1`} />
      )}
      {hint && <span className="mt-1.5 block text-sm font-normal">{hint}</span>}
    </label>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-edge px-4 py-8 text-center text-sm">{text}</div>;
}

/* Panel "Tambah ...": tertutup secara default supaya halaman tidak penuh. Tombol + berputar jadi × saat dibuka. */
function AddPanel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details className="group mb-6 rounded-2xl border border-edge bg-mist/60">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-2xl px-4 font-semibold text-navy transition-colors hover:bg-mist [&::-webkit-details-marker]:hidden">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-navy text-white transition-transform duration-200 group-open:rotate-45">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        {label}
      </summary>
      <div className="panel-in border-t border-edge p-4 md:p-5">{children}</div>
    </details>
  );
}

/* Satu item daftar. Baris menampilkan ringkasan; tombol Edit membuka form.
   Tombol hapus dipisah di bagian bawah panel, jauh dari tombol Simpan. */
function Item({
  table, id, title, subtitle, index, thumb, action, children, bare,
}: {
  table: string; id: number; title: React.ReactNode; subtitle?: string; index?: number; thumb?: string;
  action: (fd: FormData) => Promise<void>; children: React.ReactNode; bare?: boolean;
}) {
  const Wrap: "li" | "div" = bare ? "div" : "li";
  return (
    <Wrap className={bare ? "min-w-0" : "mb-3 last:mb-0"}>
      <details className="group rounded-2xl border border-edge bg-white transition duration-200 hover:border-steel/30 open:border-steel/40 open:shadow-[0_16px_40px_-24px_rgba(27,47,75,0.3)]">
        <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 rounded-2xl p-3 pr-4 [&::-webkit-details-marker]:hidden">
          {index !== undefined && (
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mist text-sm font-semibold text-steel">{index}</span>
          )}
          {thumb && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-navy">{title}</span>
            {subtitle && <span className="block truncate text-sm">{subtitle}</span>}
          </span>
          <span className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-edge px-4 text-sm font-semibold text-navy transition duration-200 group-hover:border-steel group-open:bg-mist">
            <span className="group-open:hidden">Edit</span>
            <span className="hidden group-open:inline">Tutup</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-open:rotate-180" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </summary>

        <div className="panel-in border-t border-edge p-4 md:p-5">
          <ActionForm action={action} message="Perubahan tersimpan." collapse className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="id" value={id} />
            {children}
            <div className="md:col-span-2">
              <SubmitButton>Simpan perubahan</SubmitButton>
            </div>
          </ActionForm>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-edge pt-4">
            <span className="text-sm">Sudah tidak dipakai?</span>
            <ActionForm action={removeItem} message="Item dihapus." confirmText="Hapus item ini? Tindakan ini tidak bisa dibatalkan.">
              <input type="hidden" name="table" value={table} />
              <input type="hidden" name="id" value={id} />
              <SubmitButton variant="danger" pendingLabel="Menghapus…">Hapus item ini</SubmitButton>
            </ActionForm>
          </div>
        </div>
      </details>
    </Wrap>
  );
}

export default async function Admin() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [prof, skills, projects, exps, hl, certs] = await Promise.all([
    sql`SELECT * FROM profile WHERE id=1`,
    sql`SELECT * FROM skills ORDER BY id`,
    sql`SELECT * FROM projects`,
    sql`SELECT * FROM experiences ORDER BY id DESC`,
    sql`SELECT * FROM highlights ORDER BY id`,
    sql`SELECT * FROM certificates ORDER BY id DESC`,
  ]);
  const p: any = {
    name: "", hero_label: "", headline: "", headline_accent: "", bio: "", about_title: "", about_text: "",
    contact_title: "", contact_text: "", email: "", github: "", linkedin: "", tableau: "", footer_note: "",
    ...prof[0],
  };

  // urutan projek: sama persis dengan di situs (3 teratas = banner, projek baru di urutan ke-4)
  const projectsOrdered = orderProjects(projects as any[]);

  // keahlian dikelompokkan per kategori, sama seperti di situs
  const byCat = new Map<string, any[]>();
  skills.forEach((s: any) => {
    const k = s.category || "Other";
    byCat.set(k, [...(byCat.get(k) || []), s]);
  });

  const stats: [string, number, string][] = [
    ["Projek", projects.length, "#projek"],
    ["Keahlian", skills.length, "#keahlian"],
    ["Sertifikat", certs.length, "#sertifikat"],
    ["Pengalaman", exps.length, "#pengalaman"],
  ];

  return (
    <div className="min-h-screen bg-mist/60">
      <Toaster />

      {/* Header + navigasi bagian (menempel di atas) */}
      <div className="sticky top-0 z-40 border-b border-edge bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-3">
            <span aria-hidden className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-steel/10 text-steel">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" rx="2" />
                <rect x="14" y="3" width="7" height="5" rx="2" />
                <rect x="14" y="12" width="7" height="9" rx="2" />
                <rect x="3" y="16" width="7" height="5" rx="2" />
              </svg>
            </span>
            <h1 className="font-display text-lg font-semibold text-navy">Kelola portofolio</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-11 items-center rounded-full border border-edge px-4 text-sm font-semibold text-navy transition duration-200 hover:border-navy active:scale-95 sm:inline-flex"
            >
              Lihat situs ↗
            </a>
            <ThemeToggle />
            <form action={logoutAction}>
              <button className="min-h-11 rounded-full bg-navy px-5 text-sm font-semibold text-white transition duration-200 hover:bg-steel active:scale-95">
                Keluar
              </button>
            </form>
          </div>
        </div>
        <nav aria-label="Bagian" className="flex gap-2 overflow-x-auto px-6 pb-3 [scrollbar-width:none] lg:hidden">
          {NAV.map(([l, h]) => (
            <a
              key={h}
              href={h}
              className="inline-flex min-h-9 shrink-0 items-center rounded-full border border-edge bg-white px-4 text-sm font-semibold text-navy transition-colors hover:bg-mist"
            >
              {l}
            </a>
          ))}
        </nav>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav aria-label="Bagian" className="sticky top-24 flex flex-col gap-1">
            {NAV.map(([l, h]) => (
              <a
                key={h}
                href={h}
                className="flex min-h-11 items-center rounded-xl px-4 font-medium text-navy/70 transition-colors hover:bg-white hover:text-navy"
              >
                {l}
              </a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          {/* Ringkasan */}
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map(([l, n, h]) => (
              <a
                key={l}
                href={h}
                className="rounded-2xl border border-edge bg-white p-4 transition duration-200 hover:border-steel/40 hover:shadow-lg"
              >
                <div className="font-display text-3xl font-semibold text-navy">{n}</div>
                <div className="text-sm">{l}</div>
              </a>
            ))}
          </div>

          {/* ---------------- Profil ---------------- */}
          <Card id="profil" title="Profil" hint="Teks utama situs. Kolom yang dikosongkan tidak ditampilkan.">
            <ActionForm action={saveProfile} message="Profil tersimpan.">
              <Group title="Bagian atas (hero)">
                <Field name="name" label="Nama" value={p.name} />
                <Field name="hero_label" label="Label kecil di atas judul" value={p.hero_label} />
                <Field name="headline" label="Judul utama" value={p.headline} span />
                <Field
                  name="headline_accent"
                  label="Kata yang disorot (bisa lebih dari satu)"
                  value={p.headline_accent}
                  span
                  hint="Pisahkan dengan koma agar berganti-ganti, mis. Clarity, Innovation, Impact. Tiap kata mendapat warna latar sendiri. Salah satunya harus ada di Judul utama; kata itulah yang diganti."
                />
                <Field name="bio" label="Paragraf perkenalan" value={p.bio} area span />
              </Group>

              <Group title="Bagian Tentang">
                <Field name="about_title" label="Judul bagian Tentang" value={p.about_title} span />
                <Field name="about_text" label="Isi Tentang" value={p.about_text} area span hint="Pisahkan paragraf dengan baris kosong." />
              </Group>

              <Group title="Kontak dan tautan">
                <Field name="contact_title" label="Judul bagian Kontak" value={p.contact_title} span />
                <Field name="contact_text" label="Subteks Kontak" value={p.contact_text} span />
                <Field name="email" label="Email" value={p.email} />
                <Field name="linkedin" label="Link LinkedIn" value={p.linkedin} />
                <Field name="github" label="Link GitHub" value={p.github} />
                <Field name="tableau" label="Link Tableau Public" value={p.tableau} />
                <Field name="footer_note" label="Teks footer" value={p.footer_note} span />
              </Group>

              <SubmitButton>Simpan profil</SubmitButton>
            </ActionForm>
          </Card>

          {/* ---------------- Projek ---------------- */}
          <Card id="projek" title="Projek" count={projects.length} hint="Klik Edit pada sebuah projek untuk mengubahnya. Urutan diatur dengan menyeret.">
            <AddPanel label="Tambah projek">
              <ActionForm action={addProject} message="Projek ditambahkan." reset collapse className="grid gap-4 md:grid-cols-2">
                <Field name="title" label="Nama projek" span />
                <Field name="description" label="Deskripsi 1-2 kalimat" area span />
                <Field name="tech" label="Teknologi" hint="Pisahkan dengan koma." />
                <Field name="kind" label="Jenis" hint="Mis. Dashboard." />
                <Field name="year" label="Tahun" />
                <Field name="url" label="Link studi kasus" />
                <Field name="repo" label="Link GitHub projek (opsional)" span hint="Mis. https://github.com/username/nama-repo" />
                {/* kosong = otomatis masuk di urutan ke-4, tepat di bawah banner */}
                <input type="hidden" name="sort_order" value="" />
                <ImageField />
                <div className="md:col-span-2">
                  <SubmitButton pendingLabel="Menambahkan…">Tambah projek</SubmitButton>
                </div>
              </ActionForm>
            </AddPanel>

            {projects.length === 0 ? (
              <Empty text="Belum ada projek. Klik “Tambah projek” untuk membuat yang pertama." />
            ) : (
              <SortableProjects
                rows={projectsOrdered.map((x: any) => ({
                  id: x.id,
                  node: (
                    <Item
                      bare
                      table="projects"
                      id={x.id}
                      thumb={x.image_url || undefined}
                      title={x.title}
                      subtitle={[x.kind, x.year, x.tech].filter(Boolean).join(" · ")}
                      action={updateProject}
                    >
                      <Field name="title" label="Nama projek" value={x.title} span />
                      <Field name="description" label="Deskripsi" value={x.description} area span />
                      <Field name="tech" label="Teknologi" value={x.tech} />
                      <Field name="kind" label="Jenis" value={x.kind} />
                      <Field name="year" label="Tahun" value={x.year} />
                      <Field name="url" label="Link studi kasus" value={x.url} />
                      <Field name="repo" label="Link GitHub projek" value={x.repo} span />
                      {/* urutan dipertahankan; diatur lewat seret, bukan dari form ini */}
                      <input type="hidden" name="sort_order" defaultValue={x.sort_order ? String(x.sort_order) : ""} />
                      <ImageField current={x.image_url} />
                    </Item>
                  ),
                }))}
              />
            )}
          </Card>

          {/* ---------------- Keahlian ---------------- */}
          <Card id="keahlian" title="Keahlian" count={skills.length} hint="Dikelompokkan per kategori di situs. Kategori yang kosong masuk ke Other.">
            <ActionForm action={addSkill} message="Keahlian ditambahkan." reset className="mb-6 grid gap-3 rounded-2xl border border-edge bg-mist/60 p-4 md:grid-cols-[1fr_1fr_auto]">
              <input name="name" required aria-label="Nama keahlian" placeholder="Nama, mis. PostgreSQL" className={inp} />
              <input name="category" aria-label="Kategori" placeholder="Kategori, mis. Databases" className={inp} />
              <SubmitButton pendingLabel="Menambahkan…">Tambah</SubmitButton>
            </ActionForm>

            {skills.length === 0 ? (
              <Empty text="Belum ada keahlian." />
            ) : (
              Array.from(byCat.entries()).map(([cat, list]) => (
                <div key={cat} className="mb-6 last:mb-0">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-steel">
                    {cat} <span className="font-medium normal-case tracking-normal">· {list.length}</span>
                  </h3>
                  <ul>
                    {list.map((s: any) => (
                      <Item key={s.id} table="skills" id={s.id} title={s.name} action={updateSkill}>
                        <Field name="name" label="Nama keahlian" value={s.name} />
                        <Field name="category" label="Kategori" value={s.category} />
                      </Item>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </Card>

          {/* ---------------- Poin Tentang ---------------- */}
          <Card id="poin" title="Poin Tentang" count={hl.length} hint="Poin pendek di bagian Tentang, mis. Rancang, Olah, Sajikan.">
            <AddPanel label="Tambah poin">
              <ActionForm action={addHighlight} message="Poin ditambahkan." reset collapse className="grid gap-4 md:grid-cols-2">
                <Field name="title" label="Judul poin" />
                <Field name="text" label="Penjelasan singkat" />
                <div className="md:col-span-2">
                  <SubmitButton pendingLabel="Menambahkan…">Tambah poin</SubmitButton>
                </div>
              </ActionForm>
            </AddPanel>

            {hl.length === 0 ? (
              <Empty text="Belum ada poin." />
            ) : (
              <ul>
                {hl.map((x: any) => (
                  <Item key={x.id} table="highlights" id={x.id} title={x.title} subtitle={x.text} action={updateHighlight}>
                    <Field name="title" label="Judul poin" value={x.title} />
                    <Field name="text" label="Penjelasan singkat" value={x.text} />
                  </Item>
                ))}
              </ul>
            )}
          </Card>

          {/* ---------------- Sertifikat ---------------- */}
          <Card id="sertifikat" title="Sertifikat" count={certs.length} hint="Unggah gambar sertifikat. Tutupi data pribadi sensitif seperti nomor identitas sebelum mengunggah.">
            <AddPanel label="Tambah sertifikat">
              <ActionForm action={addCertificate} message="Sertifikat ditambahkan." reset collapse className="grid gap-4 md:grid-cols-2">
                <Field name="title" label="Nama sertifikat" span />
                <Field name="issuer" label="Penerbit" hint="Mis. Coursera." />
                <Field name="year" label="Tahun" />
                <Field name="verify_url" label="Link verifikasi (opsional)" span />
                <ImageField label="Gambar sertifikat" />
                <div className="md:col-span-2">
                  <SubmitButton pendingLabel="Menambahkan…">Tambah sertifikat</SubmitButton>
                </div>
              </ActionForm>
            </AddPanel>

            {certs.length === 0 ? (
              <Empty text="Belum ada sertifikat." />
            ) : (
              <ul>
                {certs.map((x: any) => (
                  <Item
                    key={x.id}
                    table="certificates"
                    id={x.id}
                    thumb={x.image_url || undefined}
                    title={x.title}
                    subtitle={[x.issuer, x.year].filter(Boolean).join(" · ")}
                    action={updateCertificate}
                  >
                    <Field name="title" label="Nama sertifikat" value={x.title} span />
                    <Field name="issuer" label="Penerbit" value={x.issuer} />
                    <Field name="year" label="Tahun" value={x.year} />
                    <Field name="verify_url" label="Link verifikasi" value={x.verify_url} span />
                    <ImageField current={x.image_url} label="Gambar sertifikat" />
                  </Item>
                ))}
              </ul>
            )}
          </Card>

          {/* ---------------- Pengalaman ---------------- */}
          <Card id="pengalaman" title="Pengalaman" count={exps.length} hint="Tampil di bagian Tentang. Yang terbaru ditambahkan tampil paling awal.">
            <AddPanel label="Tambah pengalaman">
              <ActionForm action={addExperience} message="Pengalaman ditambahkan." reset collapse className="grid gap-4 md:grid-cols-2">
                <Field name="role" label="Posisi" />
                <Field name="company" label="Perusahaan / organisasi" />
                <Field name="start_date" label="Mulai" hint="Mis. Jan 2024." />
                <Field name="end_date" label="Selesai" hint="Kosong = Sekarang." />
                <Field name="description" label="Apa yang kamu kerjakan" area span hint="Satu baris per poin." />
                <div className="md:col-span-2">
                  <SubmitButton pendingLabel="Menambahkan…">Tambah pengalaman</SubmitButton>
                </div>
              </ActionForm>
            </AddPanel>

            {exps.length === 0 ? (
              <Empty text="Belum ada pengalaman." />
            ) : (
              <ul>
                {exps.map((x: any) => (
                  <Item
                    key={x.id}
                    table="experiences"
                    id={x.id}
                    title={`${x.role}, ${x.company}`}
                    subtitle={[x.start_date, x.end_date || "Sekarang"].filter(Boolean).join(" – ")}
                    action={updateExperience}
                  >
                    <Field name="role" label="Posisi" value={x.role} />
                    <Field name="company" label="Perusahaan / organisasi" value={x.company} />
                    <Field name="start_date" label="Mulai" value={x.start_date} />
                    <Field name="end_date" label="Selesai" value={x.end_date} />
                    <Field name="description" label="Deskripsi" value={x.description} area span />
                  </Item>
                ))}
              </ul>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}