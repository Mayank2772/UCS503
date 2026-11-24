import { Link, useNavigate } from "react-router-dom";

const team = [
  {
    name: "Mayank Garg",
    role: "Product & Engineering",
    image: "/team/team-1.jpg",
    accent: "#2563eb",
    initials: "MG",
    linkedin: "https://www.linkedin.com/in/mayank2772/",
    bio: "Led the application architecture and backend development, including authentication, APIs, database integration, placement drives, applications.",
  },
  {
    name: "Paryag Bansal",
    role: "Design & Experience",
    image: "/team/team-2.jpg",
    accent: "#7c3aed",
    initials: "PB",
    linkedin: "https://www.linkedin.com/in/paryag-bansal/",
    bio: "Designed and developed the student and admin user interfaces, responsive layouts, navigation, forms, dashboards, and overall user experience.",
  },
  {
    name: "Aashna",
    role: "Community & Partnerships",
    image: "/team/team-3.jpg",
    accent: "#0891b2",
    initials: "A",
    linkedin: "https://www.linkedin.com/in/aashna-bhandari-5a2113379/",
    bio: "Worked on product planning, content, testing, placement workflows, and coordination to make the application useful and easy to use.",
  },
];

function TeamImage({ member }) {
  return (
    <div
      className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem]"
      style={{ background: `linear-gradient(145deg, ${member.accent}, #0f172a)` }}
    >
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_top_right,white,transparent_45%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950/60 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-white/80">
        {member.initials}
      </div>
      <img
        src={member.image}
        alt={member.name}
        className="absolute inset-0 h-full w-full object-cover"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
      <div className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-wider text-white backdrop-blur-md">
        CAMPUSCONNECT
      </div>
    </div>
  );
}

export default function TeamPage() {
  const navigate = useNavigate();
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7faff] text-slate-900">
      <section className="relative overflow-hidden bg-[#0f2a5e] px-5 pb-24 pt-6 text-white sm:px-8 lg:px-12">
        <div className="absolute -right-32 -top-40 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-48 left-1/3 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl" />
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link to="/" className="flex min-w-0 items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            CampusConnect
          </Link>
          <button type="button" onClick={goBack} className="shrink-0 rounded-full border border-white/20 px-3 py-2 text-xs text-blue-100 transition hover:bg-white/10 sm:px-4 sm:text-sm">
            <span className="sm:hidden">← Back</span>
            <span className="hidden sm:inline">← Go back</span>
          </button>
        </nav>
        <div className="relative mx-auto mt-20 max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
            The people behind the platform
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
            Meet the team building
            <span className="block text-blue-200">better beginnings.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-blue-100/80 sm:text-base">
            We are creating a calmer, more connected way for students to discover opportunities and take their next career step.
          </p>
        </div>
      </section>
      <section className="relative mx-auto -mt-14 max-w-6xl px-5 pb-16 sm:px-8 lg:px-12">
        <div className="grid gap-5 md:grid-cols-3">
          {team.map((member) => (
            <article key={member.image} className="rounded-[2rem] bg-white p-3 shadow-xl shadow-slate-200/60">
              <TeamImage member={member} />
              <div className="px-3 pb-3 pt-5">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: member.accent }}>
                  {member.role}
                </p>
                <h2 className="mt-2 text-xl font-bold">{member.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{member.bio}</p>
                <a href={member.linkedin} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold hover:underline" style={{ color: member.accent }}>
                  LinkedIn <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
