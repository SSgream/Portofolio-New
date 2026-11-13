import { sql } from "@/lib/db";
import Image from "next/image";
import ProjectList from "./ProjectList";
export const dynamic = "force-dynamic";

const wrap = "mx-auto w-full max-w-[1200px] px-6";
const h2 =
  "font-display text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-[1.1] tracking-[-0.02em]";
const btn =
  "inline-flex min-h-11 items-center justify-center rounded-full px-6 font-semibold transition-colors";
const peachBtn = `${btn} bg-peach text-navy hover:bg-white`;
const ghostBtn = `${btn} border border-white/40 text-white hover:bg-white hover:text-navy`;

function Art({ i }: { i: number }) {
  const v = i % 3;
  const bg = ["bg-navy", "bg-steel", "bg-cream"][v];
  return (
    <div className={`${bg} aspect-[16/10]`} aria-hidden>
      <svg
        viewBox="0 0 400 200"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {v === 0 && (
          <>
            {[50, 80, 60, 110, 90, 130].map((h, k) => (
              <rect
                key={k}
                x={40 + k * 56}
                y={170 - h}
                width="34"
                height={h}
                rx="6"
                fill={k === 5 ? "#E9A66B" : "#C3D0E0"}
                opacity={k === 5 ? 1 : 0.45}
              />
            ))}
            <polyline
              points="57,95 113,70 169,85 225,45 281,60 337,30"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        )}
        {v === 1 && (
          <>
            <path
              d="M0 150 L60 120 120 132 180 85 240 100 300 55 360 70 400 40 V200 H0Z"
              fill="#fff"
              opacity="0.22"
            />
            <polyline
              points="0,150 60,120 120,132 180,85 240,100 300,55 360,70 400,40"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </>
        )}
        {v === 2 &&
          (
            [
              [300, "#1B2F4B"],
              [210, "#2F5D8C"],
              [130, "#E9A66B"],
            ] as const
          ).map(([w, c], k) => (
            <rect
              key={k}
              x="40"
              y={40 + k * 46}
              width={w}
              height="26"
              rx="13"
              fill={c}
            />
          ))}
      </svg>
    </div>
  );
}

export default async function Home() {
  const [prof, skills, projects, exps, hl] = await Promise.all([
    sql`SELECT * FROM profile WHERE id=1`,
    sql`SELECT * FROM skills ORDER BY id`,
    sql`SELECT * FROM projects ORDER BY (sort_order = 0), sort_order, id DESC`,
    sql`SELECT * FROM experiences ORDER BY id DESC`,
    sql`SELECT * FROM highlights ORDER BY id`,
  ]);
  const p: any = {
    name: "Your Name",
    hero_label: "",
    headline: "",
    headline_accent: "",
    bio: "",
    about_title: "",
    about_text: "",
    contact_title: "",
    contact_text: "",
    email: "",
    github: "",
    linkedin: "",
    tableau: "",
    footer_note: "",
    ...prof[0],
  };
  const social = [
    ["LinkedIn", p.linkedin],
    ["GitHub", p.github],
    ["Tableau Public", p.tableau],
  ].filter(([, u]) => u) as [string, string][];
  const paras = String(p.about_text)
    .split(/\n\s*\n/)
    .filter(Boolean);
  const hasAbout =
    Boolean(p.about_title) ||
    paras.length > 0 ||
    hl.length > 0 ||
    exps.length > 0;
  const hasContact = Boolean(p.email) || social.length > 0;
  const nav = [
    projects.length > 0 && ["Projects", "#projek"],
    skills.length > 0 && ["Skills", "#keahlian"],
    hasAbout && ["About", "#tentang"],
  ].filter(Boolean) as [string, string][];
  const at = p.headline_accent
    ? String(p.headline).indexOf(p.headline_accent)
    : -1;
  const edge = ["border-peach", "border-steel", "border-navy"];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-navy">
        <div className={`${wrap} flex items-center justify-between py-4`}>
          <a
            href="#top"
            className="flex min-h-11 items-center gap-3 text-white"
          >
            <Image
              src="/fotoselwin.jpeg"
              alt=""
              width={80}
              height={80}
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="font-display text-xl font-semibold">{p.name}</span>
          </a>
          <nav className="hidden items-center gap-2 md:flex">
            {nav.map(([l, h]) => (
              <a
                key={h}
                href={h}
                className="inline-flex min-h-11 items-center px-4 font-medium text-onnavy hover:text-white"
              >
                {l}
              </a>
            ))}
            {hasContact && (
              <a href="#kontak" className={peachBtn}>
                Contact me
              </a>
            )}
          </nav>
          <details className="relative md:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-white/40 px-5 font-semibold text-white">
              Menu
            </summary>
            <div className="absolute right-0 top-14 z-20 flex w-56 flex-col rounded-3xl border border-edge bg-card p-3 font-medium text-navy shadow-lg">
              {nav.map(([l, h]) => (
                <a key={h} href={h} className="flex min-h-11 items-center px-4">
                  {l}
                </a>
              ))}
              {hasContact && (
                <a href="#kontak" className={`${peachBtn} mt-2`}>
                  Contact me
                </a>
              )}
            </div>
          </details>
        </div>
      </header>

      <div className="bg-navy">
        <section
          id="top"
          className={`${wrap} grid scroll-mt-4 items-center gap-12 pb-20 pt-10 md:grid-cols-2 md:gap-16 md:pb-28 md:pt-16`}
        >
          <div>
            {p.hero_label && <p className="label text-peach">{p.hero_label}</p>}
            <h1 className="mt-5 font-display text-[clamp(2.5rem,5.5vw,4.125rem)] font-bold leading-[1.05] tracking-[-0.02em] text-white">
              {at >= 0 ? (
                <>
                  {p.headline.slice(0, at)}
                  <span className="text-peach">{p.headline_accent}</span>
                  {p.headline.slice(at + p.headline_accent.length)}
                </>
              ) : (
                p.headline
              )}
            </h1>
            {p.bio && (
              <p className="mt-6 max-w-xl whitespace-pre-line text-lg leading-relaxed text-onnavy">
                {p.bio}
              </p>
            )}
            <div className="mt-9 flex flex-wrap gap-3">
              {projects.length > 0 && (
                <a href="#projek" className={peachBtn}>
                  View projects
                </a>
              )}
              {hasContact && (
                <a href="#kontak" className={ghostBtn}>
                  Get in touch
                </a>
              )}
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] p-2 md:p-3">
            <Image
              src="/fotoselwin.jpeg"
              alt="Example of an analytics dashboard from my work"
              width={1600}
              height={1000}
              priority
              className="h-auto w-full rounded-2xl"
            />
          </div>
        </section>
      </div>

      {skills.length > 0 && (
        <section id="keahlian" className="scroll-mt-4 bg-steel">
          <div
            className={`${wrap} flex flex-col gap-5 py-8 md:flex-row md:items-center md:gap-10`}
          >
            <p className="label text-white">Skills</p>
            <ul className="flex flex-wrap gap-3">
              {skills.map((s: any) => (
                <li
                  key={s.id}
                  className="rounded-full border border-white/35 px-5 py-2 font-medium text-white"
                >
                  {s.name}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section id="projek" className="scroll-mt-4 bg-mist py-20 md:py-28">
          <div className={wrap}>
            <p className="label text-steel">Selected projects</p>
            <h2 className={`${h2} mb-12 mt-3 max-w-2xl text-navy`}>
              Work that speaks through data.
            </h2>
            <ProjectList
              projects={projects.map((x: any) => ({
                id: x.id, title: x.title, description: x.description, tech: x.tech,
                kind: x.kind, year: x.year, url: x.url, repo: x.repo, image_url: x.image_url ?? "",
              }))}
            />
          </div>
        </section>
      )}

      {hasAbout && (
        <section
          id="tentang"
          className={`${wrap} grid scroll-mt-4 gap-10 py-20 md:grid-cols-[5fr_7fr] md:gap-16 md:py-28`}
        >
          <div className="md:sticky md:top-28 md:self-start">
            <p className="label text-steel">About</p>
            {p.about_title && (
              <h2 className={`${h2} mt-3 text-navy`}>{p.about_title}</h2>
            )}
            <div className="relative mt-8 hidden max-w-xs md:block">
              <div
                aria-hidden
                className="absolute inset-0 translate-x-2 translate-y-2 rounded-3xl border-2 border-peach bg-peach/20"
              />
              <Image
                src="/fotoselwin.jpeg"
                alt={`Photo of ${p.name}`}
                width={600}
                height={750}
                className="relative aspect-[4/5] h-auto w-full rounded-3xl object-cover object-top shadow-xl shadow-navy/25"
              />
            </div>
          </div>
          <div>
            {paras.map((t, i) => (
              <p
                key={i}
                className="mb-5 max-w-2xl text-lg leading-relaxed last:mb-0"
              >
                {t}
              </p>
            ))}
            {hl.length > 0 && (
              <div className="mt-10 grid gap-6 sm:grid-cols-3">
                {hl.map((x: any, i: number) => (
                  <div key={x.id} className={`border-t-4 pt-4 ${edge[i % 3]}`}>
                    <h3 className="font-display text-xl font-semibold text-navy">
                      {x.title}
                    </h3>
                    <p className="mt-1">{x.text}</p>
                  </div>
                ))}
              </div>
            )}
            {exps.length > 0 && (
              <div className="mt-12">
                <p className="label mb-2 text-steel">Experience</p>
                <ol>
                  {exps.map((x: any) => (
                    <li
                      key={x.id}
                      className="grid gap-1 border-t border-edge py-5 sm:grid-cols-[9rem_1fr] sm:gap-6"
                    >
                      <p className="text-sm tabular-nums">
                        {x.start_date} – {x.end_date}
                      </p>
                      <div>
                        <p className="font-semibold text-navy">
                          {x.role}, {x.company}
                        </p>
                        {x.description && (
                          <p className="mt-1 whitespace-pre-line">
                            {x.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      )}

      {hasContact && (
        <section id="kontak" className={`${wrap} scroll-mt-4 pb-16`}>
          <div className="rounded-[32px] bg-navy px-6 py-14 text-center md:px-16 md:py-20">
            <h2 className={`${h2} mx-auto max-w-2xl text-white`}>
              {p.contact_title || "Have data that needs to be made clear?"}
            </h2>
            {p.contact_text && (
              <p className="mx-auto mt-4 max-w-xl text-lg text-onnavy">
                {p.contact_text}
              </p>
            )}
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              {p.email && (
                <a
                  href={`mailto:${p.email}`}
                  className={`${peachBtn} break-all`}
                >
                  {p.email}
                </a>
              )}
              {social.map(([l, u]) => (
                <a key={l} href={u} className={ghostBtn}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className={`${wrap} py-8 text-sm`}>
        {p.footer_note || `© ${new Date().getFullYear()} ${p.name}`}
      </footer>
    </>
  );
}