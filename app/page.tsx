import { sql } from "@/lib/db";
import Image from "next/image";
import ProjectList from "./ProjectList";
import Reveal from "./Reveal";
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
  const [prof, skills, projects, exps, hl, certs] = await Promise.all([
    sql`SELECT * FROM profile WHERE id=1`,
    sql`SELECT * FROM skills ORDER BY id`,
    sql`SELECT * FROM projects ORDER BY (sort_order = 0), sort_order, id DESC`,
    sql`SELECT * FROM experiences ORDER BY id DESC`,
    sql`SELECT * FROM highlights ORDER BY id`,
    sql`SELECT * FROM certificates ORDER BY id DESC`,
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
    certs.length > 0 && ["Certificates", "#sertifikat"],
  ].filter(Boolean) as [string, string][];
  const at = p.headline_accent
    ? String(p.headline).indexOf(p.headline_accent)
    : -1;
  const skillGroups: [string, any[]][] = [];
  skills.forEach((s: any) => {
    const cat = ["", "Keahlian", "Umum"].includes(s.category)
      ? "Other"
      : s.category;
    const g = skillGroups.find(([c]) => c === cat);
    if (g) g[1].push(s);
    else skillGroups.push([cat, [s]]);
  });
  skillGroups.sort(
    (a, b) => Number(a[0] === "Other") - Number(b[0] === "Other"),
  );
  const grouped = skillGroups.length > 1;
  const bar = ["bg-peach", "bg-steel", "bg-navy"];

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

      <div className="relative overflow-hidden bg-navy">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="hero-grid absolute inset-0" />
          <div className="hero-glow absolute -left-40 top-1/4 h-[32rem] w-[32rem] rounded-full" />
          <svg
            className="hero-trend absolute inset-x-0 bottom-0 h-3/5 w-full"
            viewBox="0 0 1200 300"
            preserveAspectRatio="none"
          >
            <path
              className="hero-area"
              d="M0 240 C120 220 180 140 300 160 S480 250 600 190 S800 60 920 100 S1100 150 1200 60 L1200 300 L0 300 Z"
              fill="rgba(233,166,107,0.12)"
            />
            <path
              className="hero-line"
              vectorEffect="non-scaling-stroke"
              d="M0 240 C120 220 180 140 300 160 S480 250 600 190 S800 60 920 100 S1100 150 1200 60"
              fill="none"
              stroke="#E9A66B"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              className="hero-pulse"
              pathLength={1}
              vectorEffect="non-scaling-stroke"
              d="M0 240 C120 220 180 140 300 160 S480 250 600 190 S800 60 920 100 S1100 150 1200 60"
              fill="none"
              stroke="#FFD9B0"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <section
          id="top"
          className={`${wrap} relative grid scroll-mt-4 items-center gap-12 pb-20 pt-10 md:grid-cols-2 md:gap-16 md:pb-28 md:pt-16`}
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
              alt="`Portrait of ${p.name}`"
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
          <Reveal>
            <div className={`${wrap} py-12`}>
              <p className="label text-white">Skills</p>
              <dl className="mt-6 divide-y divide-white/15">
                {skillGroups.map(([cat, list]) => (
                  <div
                    key={cat}
                    className={`grid gap-3 py-5 first:pt-0 last:pb-0 md:gap-8 ${grouped ? "md:grid-cols-[13rem_1fr]" : ""}`}
                  >
                    {grouped && (
                      <dt className="text-sm font-semibold text-white">
                        {cat}
                      </dt>
                    )}
                    <dd className="flex flex-wrap gap-2">
                      {list.map((s: any) => (
                        <span
                          key={s.id}
                          className="rounded-full border border-white/35 px-4 py-1.5 text-sm font-medium text-white"
                        >
                          {s.name}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </section>
      )}

      {projects.length > 0 && (
        <section id="projek" className="scroll-mt-4 bg-mist py-20 md:py-28">
          <div className={wrap}>
            <Reveal>
              <p className="label text-steel">Selected projects</p>
              <h2 className={`${h2} mb-12 mt-3 max-w-2xl text-navy`}>
                Work that speaks through data.
              </h2>
              <ProjectList
                projects={projects.map((x: any) => ({
                  id: x.id,
                  title: x.title,
                  description: x.description,
                  tech: x.tech,
                  kind: x.kind,
                  year: x.year,
                  url: x.url,
                  repo: x.repo,
                  image_url: x.image_url ?? "",
                }))}
              />
            </Reveal>
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
                src="/fotoselwin3.jpeg"
                alt={`Photo of ${p.name}`}
                width={600}
                height={750}
                className="relative aspect-[4/5] h-auto w-full rounded-3xl object-cover object-top shadow-xl shadow-navy/25"
              />
            </div>
          </div>
          <Reveal>
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
                  <div key={x.id}>
                    <div
                      aria-hidden
                      className={`bar-shine h-1 rounded-full ${bar[i % 3]}`}
                      style={{ "--d": `${i * 0.8}s` } as React.CSSProperties}
                    />
                    <div className="pt-4">
                      <h3 className="font-display text-xl font-semibold text-navy">
                        {x.title}
                      </h3>
                      <p className="mt-1">{x.text}</p>
                    </div>
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
          </Reveal>
        </section>
      )}

            {certs.length > 0 && (
        <section id="sertifikat" className="scroll-mt-4 bg-mist py-20 md:py-28">
          <div className={wrap}>
            <Reveal>
              <p className="label text-steel">Certificates</p>
              <h2 className={`${h2} mb-12 mt-3 max-w-2xl text-navy`}>Continuous learning.</h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,19rem),1fr))] gap-6">
                {certs.map((x: any) => {
                  const info = [x.issuer, x.year].filter(Boolean).join(" · ");
                  if (!x.image_url) {
                    return (
                      <article key={x.id} className="flex aspect-[4/3] flex-col justify-end rounded-3xl border border-edge bg-card p-6">
                        <h3 className="font-display text-xl font-semibold leading-snug text-navy">{x.title}</h3>
                        {info && <p className="mt-1 text-sm text-steel">{info}</p>}
                      </article>
                    );
                  }
                  return (
                    <article
                      key={x.id}
                      className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-edge bg-white shadow-sm transition duration-300 hover:shadow-xl hover:shadow-navy/15"
                    >
                      <a
                        href={x.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${x.title} certificate in full size`}
                        className="block h-full w-full"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={x.image_url}
                          alt={`${x.title} certificate`}
                          loading="lazy"
                          className="h-full w-full object-cover object-top transition-transform duration-500 motion-safe:group-hover:scale-105"
                        />
                      </a>
                      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-linear-to-t from-navy/95 via-navy/60 to-navy/25 p-5 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                        <h3 className="line-clamp-3 font-display text-lg font-semibold leading-snug text-white">{x.title}</h3>
                        {info && <p className="mt-1 text-sm text-onnavy">{info}</p>}
                        <div className="mt-3 flex items-center justify-between gap-3 text-sm font-semibold text-white">
                          <span>View full size ↗</span>
                          {x.verify_url && (
                            <a
                              href={x.verify_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="pointer-events-auto inline-flex min-h-11 items-center rounded-full bg-peach px-4 text-navy transition-colors hover:bg-white"
                            >
                              Verify
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {hasContact && (
        <section id="kontak" className={`${wrap} scroll-mt-4 pb-16`}>
          <Reveal>
            <div className="relative overflow-hidden rounded-[32px] bg-navy px-6 py-14 text-center md:px-16 md:py-20">
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="cta-grid absolute inset-0" />
                <div className="cta-glow absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full" />
              </div>
              <div className="relative">
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
            </div>
          </Reveal>
        </section>
      )}

      <footer className={`${wrap} py-8 text-sm`}>
        {p.footer_note || `© ${new Date().getFullYear()} ${p.name}`}
      </footer>
    </>
  );
}
