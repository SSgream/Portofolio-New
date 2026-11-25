import { sql } from "@/lib/db";
import Image from "next/image";
import ProjectList from "./ProjectList";
import Reveal from "./Reveal";
import Intro from "./Intro";
import HeroTrend from "./HeroTrend";
import ThemeToggle from "./ThemeToggle";
export const dynamic = "force-dynamic";

const wrap = "mx-auto w-full max-w-[1200px] px-6";
const h2 =
  "font-display text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-[1.1] tracking-[-0.02em]";
const btn =
  "inline-flex min-h-11 items-center justify-center rounded-full px-6 font-semibold transition duration-200 active:scale-[0.97]";
const whiteBtn = `${btn} btn-light bg-white text-navy hover:bg-mist`;
const ghostBtn = `${btn} border border-white/25 text-white hover:border-white hover:bg-white/10`;
const darkBtn = `${btn} bg-navy text-white hover:bg-steel`;
const lineBtn = `${btn} border border-edge bg-white text-navy hover:border-navy hover:bg-mist/60`;

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
  const bar = ["bg-steel", "bg-navy", "bg-steel/40"];

  return (
    <div className="bg-white">
      <Intro name={p.name} label={p.hero_label} />
      <header className="sticky top-0 z-50 px-4 pt-4">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between rounded-full border border-edge bg-white/85 py-2 pl-3 pr-2 shadow-[0_10px_30px_-14px_rgba(27,47,75,0.25)] backdrop-blur-md">
          <a href="#top" className="flex min-h-11 items-center gap-3 text-navy">
            <Image
              id="site-avatar"
              src="/fotoselwin.jpeg"
              alt=""
              width={80}
              height={80}
              className="intro-hide h-10 w-10 rounded-full object-cover"
            />
            <span id="site-name" className="intro-hide font-display text-lg font-semibold">
              {p.name}
            </span>
          </a>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map(([l, h]) => (
              <a
                key={h}
                href={h}
                className="inline-flex min-h-11 items-center rounded-full px-4 font-medium text-navy/70 transition-colors hover:bg-mist hover:text-navy"
              >
                {l}
              </a>
            ))}
            {hasContact && (
              <a href="#kontak" className={`${darkBtn} ml-1`}>
                Contact me
              </a>
            )}
            <ThemeToggle className="ml-1" />
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <details className="relative">
              <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-edge px-5 font-semibold text-navy">
                Menu
              </summary>
              <div className="absolute right-0 top-14 z-20 flex w-56 flex-col rounded-3xl border border-edge bg-card p-3 font-medium text-navy shadow-lg">
                {nav.map(([l, h]) => (
                  <a key={h} href={h} className="flex min-h-11 items-center px-4">
                    {l}
                  </a>
                ))}
                {hasContact && (
                  <a href="#kontak" className={`${darkBtn} mt-2`}>
                    Contact me
                  </a>
                )}
              </div>
            </details>
          </div>
        </div>
      </header>

      <div className="relative overflow-hidden bg-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <HeroTrend />
        </div>
        <section
          id="top"
          className={`${wrap} relative grid scroll-mt-4 items-center gap-12 pb-20 pt-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:pb-28 md:pt-20`}
        >
          <div>
            {p.hero_label && (
              <p className="rise label text-steel" style={{ "--d": "0s" } as React.CSSProperties}>
                {p.hero_label}
              </p>
            )}
            <h1
              className="rise mt-5 font-display text-[clamp(2.5rem,5.5vw,4.125rem)] font-bold leading-[1.1] tracking-[-0.02em] text-navy"
              style={{ "--d": "0.1s" } as React.CSSProperties}
            >
              {at >= 0 ? (
                <>
                  {p.headline.slice(0, at)}
                  <span className="rounded-2xl bg-steel/10 px-3 [box-decoration-break:clone]">
                    {p.headline_accent}
                  </span>
                  {p.headline.slice(at + p.headline_accent.length)}
                </>
              ) : (
                p.headline
              )}
            </h1>
            {p.bio && (
              <p
                className="rise mt-6 max-w-xl whitespace-pre-line text-lg leading-relaxed"
                style={{ "--d": "0.2s" } as React.CSSProperties}
              >
                {p.bio}
              </p>
            )}
            <div className="rise mt-9 flex flex-wrap gap-3" style={{ "--d": "0.3s" } as React.CSSProperties}>
              {projects.length > 0 && (
                <a href="#projek" className={darkBtn}>
                  View projects
                </a>
              )}
              {hasContact && (
                <a href="#kontak" className={lineBtn}>
                  Get in touch
                </a>
              )}
            </div>
          </div>
          <div className="rise relative" style={{ "--d": "0.25s", "--rot": "4deg" } as React.CSSProperties}>
            <div
              aria-hidden
              className="float-a absolute -left-4 bottom-10 z-10 hidden rounded-2xl border border-edge bg-white p-3 shadow-[0_20px_40px_-20px_rgba(27,47,75,0.35)] sm:block md:-left-8"
            >
              <svg viewBox="0 0 80 48" width="80" height="48">
                {[18, 30, 22, 38, 28].map((h, k) => (
                  <rect key={k} x={4 + k * 15} y={46 - h} width="10" height={h} rx="3" fill={k === 3 ? "#2F5D8C" : "#C3D0E0"} />
                ))}
              </svg>
            </div>
            <div
              aria-hidden
              className="float-b absolute -right-3 top-8 z-10 hidden rounded-2xl border border-edge bg-white p-3 shadow-[0_20px_40px_-20px_rgba(27,47,75,0.35)] sm:block md:-right-6"
            >
              <svg viewBox="0 0 80 40" width="80" height="40">
                <polyline points="2,32 18,22 32,26 48,12 62,16 78,4" fill="none" stroke="#2F5D8C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="78" cy="4" r="4" fill="#1B2F4B" />
              </svg>
            </div>
            <div className="float-slow rounded-[32px] border border-edge bg-white p-3 shadow-[0_30px_60px_-30px_rgba(27,47,75,0.35)]">
              <Image
                src="/fotoselwin.jpeg"
                alt={`Portrait of ${p.name}`}
                width={1600}
                height={1000}
                priority
                className="h-auto w-full rounded-3xl"
              />
            </div>
          </div>
        </section>
      </div>

      {projects.length > 0 && (
        <section id="projek" className="scroll-mt-4 overflow-x-clip bg-mist py-20 md:py-28">
          <div className={wrap}>
            <Reveal>
              <p className="label text-steel">Selected projects</p>
              <h2 className={`${h2} mb-12 mt-3 max-w-2xl text-navy`}>
                Work that speaks through data.
              </h2>
            </Reveal>
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
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section id="keahlian" className="scroll-mt-4 bg-white">
          <Reveal>
            <div className={`${wrap} py-16 md:py-20`}>
              <p className="label text-steel">Skills</p>
              <dl className="mt-6 divide-y divide-edge">
                {skillGroups.map(([cat, list]) => (
                  <div
                    key={cat}
                    className={`grid gap-3 py-5 first:pt-0 last:pb-0 md:gap-8 ${grouped ? "md:grid-cols-[13rem_1fr]" : ""}`}
                  >
                    {grouped && (
                      <dt className="text-sm font-semibold text-navy">{cat}</dt>
                    )}
                    <dd className="flex flex-wrap gap-2">
                      {list.map((s: any) => (
                        <span
                          key={s.id}
                          className="rounded-full border border-edge bg-mist/60 px-4 py-1.5 text-sm font-medium text-navy"
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

      {hasAbout && (
        <div className="bg-mist/60">
        <section
          id="tentang"
          className={`${wrap} grid scroll-mt-4 gap-10 py-20 md:grid-cols-[5fr_7fr] md:gap-16 md:py-28`}
        >
          <div className="md:sticky md:top-28 md:self-start">
            <p className="label text-steel">About</p>
            {p.about_title && (
              <h2 className={`${h2} mt-3 text-navy`}>{p.about_title}</h2>
            )}
            <div className="relative mt-10 hidden max-w-xs md:block">
              <div aria-hidden className="absolute inset-0 -rotate-6 rounded-[28px] bg-steel/15" />
              <div aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 rounded-[28px] border-2 border-steel/40" />
              <Image
                src="/fotoselwin3.jpeg"
                alt={`Photo of ${p.name}`}
                width={600}
                height={750}
                className="relative aspect-[4/5] h-auto w-full rounded-[28px] object-cover object-top shadow-[0_30px_60px_-30px_rgba(27,47,75,0.4)]"
              />
              {p.hero_label && (
                <div className="float-slow absolute -bottom-5 -right-6 z-10 flex items-center gap-2 rounded-2xl border border-edge bg-card px-4 py-2.5 text-sm font-semibold text-navy shadow-[0_20px_40px_-20px_rgba(27,47,75,0.4)]">
                  <span aria-hidden className="h-2 w-2 rounded-full bg-steel" />
                  {p.hero_label}
                </div>
              )}
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
        </div>
      )}

      {certs.length > 0 && (
        <section id="sertifikat" className="scroll-mt-4 bg-white py-20 md:py-28">
          <div className={wrap}>
            <Reveal>
              <p className="label text-steel">Certificates</p>
              <h2 className={`${h2} mb-12 mt-3 max-w-2xl text-navy`}>
                Continuous learning.
              </h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,19rem),1fr))] gap-6">
                {certs.map((x: any) => {
                  const info = [x.issuer, x.year].filter(Boolean).join(" · ");
                  if (!x.image_url) {
                    return (
                      <article
                        key={x.id}
                        className="flex aspect-[4/3] flex-col justify-end rounded-3xl border border-edge bg-card p-6"
                      >
                        <h3 className="font-display text-xl font-semibold leading-snug text-navy">
                          {x.title}
                        </h3>
                        {info && (
                          <p className="mt-1 text-sm text-steel">{info}</p>
                        )}
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
                        <h3 className="line-clamp-3 font-display text-lg font-semibold leading-snug text-white">
                          {x.title}
                        </h3>
                        {info && (
                          <p className="mt-1 text-sm text-onnavy">{info}</p>
                        )}
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

      <div className={certs.length > 0 ? "bg-mist/60" : "bg-white"}>
        {hasContact && (
          <section id="kontak" className={`${wrap} scroll-mt-4 pb-4 pt-16 md:pt-24`}>
            <Reveal>
              <div className="cta-card relative overflow-hidden rounded-[32px] bg-navy px-6 pt-20 text-center md:px-16 md:pt-28">
                <div aria-hidden className="pointer-events-none absolute inset-0">
                  {[0, 2, 4].map((d) => (
                    <span
                      key={d}
                      className="ring-pulse absolute left-1/2 top-[42%] h-[34rem] w-[34rem] rounded-full border border-white/15"
                      style={{ animationDelay: `${d}s` }}
                    />
                  ))}
                  <div className="float-a absolute left-[7%] top-[18%] hidden rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm md:block">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="3" />
                      <path d="M3.5 7.5 12 13l8.5-5.5" />
                    </svg>
                  </div>
                  <div className="float-b absolute right-[7%] top-[46%] hidden rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm md:block">
                    <svg viewBox="0 0 80 40" width="72" height="36" fill="none">
                      <polyline points="2,32 18,22 32,26 48,12 62,16 78,4" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="78" cy="4" r="4" fill="white" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <h2 className={`${h2} mx-auto max-w-2xl text-white`}>
                    {p.contact_title || "Have data that needs to be made clear?"}
                  </h2>
                  {p.contact_text && (
                    <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-onnavy">
                      {p.contact_text}
                    </p>
                  )}
                  <div className="mt-10 flex flex-wrap justify-center gap-3">
                    {p.email && (
                      <a href={`mailto:${p.email}`} className={`${whiteBtn} gap-2 break-all`}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="5" width="18" height="14" rx="3" />
                          <path d="M3.5 7.5 12 13l8.5-5.5" />
                        </svg>
                        {p.email}
                      </a>
                    )}
                    {social.map(([l, u]) => (
                      <a key={l} href={u} target="_blank" rel="noopener noreferrer" className={`${ghostBtn} group gap-2`}>
                        {l}
                        <span aria-hidden className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                      </a>
                    ))}
                  </div>

                  {skills.length > 0 && (
                    <div
                      aria-hidden
                      className="mt-20 overflow-hidden border-t border-white/10 py-6 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]"
                    >
                      <div className="marquee flex w-max">
                        {[...skills, ...skills].map((s: any, i: number) => (
                          <span
                            key={i}
                            className="mr-3 shrink-0 rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-white/60"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          </section>
        )}

        <footer className={`${wrap} py-8 text-sm`}>
          {p.footer_note || `© ${new Date().getFullYear()} ${p.name}`}
        </footer>
      </div>
    </div>
  );
}