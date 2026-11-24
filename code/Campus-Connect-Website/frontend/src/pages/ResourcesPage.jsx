import { useEffect, useMemo, useState } from "react";
import Topbar from "../components/Topbar";
import { fetchResourceFile, getResources } from "../api/resources";

const categories = [
  { name: "All Resources", icon: "✦", color: "#2563eb" },
  { name: "DSA Sheets", icon: "⌘", color: "#7c3aed" },
  { name: "Aptitude", icon: "◈", color: "#d97706" },
  { name: "Core CS", icon: "⚙", color: "#0891b2" },
  { name: "HR Rounds", icon: "◎", color: "#059669" },
  { name: "Interview Experiences", icon: "☷", color: "#db2777" },
];

function ResourceIcon({ category }) {
  const config = categories.find((item) => item.name === category) || categories[0];
  return (
    <div
      className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold"
      style={{ color: config.color, background: `${config.color}14` }}
    >
      {config.icon}
    </div>
  );
}

export default function ResourcesPage({ onNav }) {
  const [resources, setResources] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All Resources");
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    getResources()
      .then(setResources)
      .catch((error) => setLoadError(error.message));
  }, []);

  const visibleResources = useMemo(() => {
    const query = search.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesCategory =
        activeCategory === "All Resources" || resource.category === activeCategory;
      const matchesSearch =
        !query ||
        [resource.title, resource.description, resource.category]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, resources, search]);

  const featured = resources.filter((resource) => resource.featured).slice(0, 3);

  const openFile = async (resource, download = false) => {
    try {
      const blob = await fetchResourceFile(resource._id, download);
      const url = URL.createObjectURL(blob);
      if (download) {
        const link = document.createElement("a");
        link.href = url;
        link.download = resource.fileName || resource.title;
        link.click();
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      setLoadError(error.message);
    }
  };

  const resourceTarget = (resource) =>
    resource.fileName ? undefined : resource.resourceUrl;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f0f6ff" }}>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="Interview Prep Resources" onNav={onNav} />
        <main className="min-w-0 flex-1 overflow-y-auto px-3 py-4 sm:p-6">
          <section
            className="rounded-3xl p-7 mb-6 text-white relative overflow-hidden"
            style={{ background: "linear-gradient(120deg, #172554, #2563eb 62%, #60a5fa)" }}
          >
            <div className="relative z-10 max-w-2xl">
              <p className="text-blue-200 text-sm font-semibold mb-2">PREPARE WITH CONFIDENCE</p>
              <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                Your placement prep, all in one place.
              </h1>
              <p className="text-blue-100 mt-2 text-sm leading-6">
                Curated sheets, practice sets, and interview guidance shared by your placement cell.
              </p>
            </div>
            <div className="absolute -right-10 -bottom-20 w-64 h-64 rounded-full border-[28px] border-white/10" />
            <div className="absolute right-24 top-8 w-16 h-16 rounded-2xl rotate-12 bg-white/10" />
          </section>

          {loadError && (
            <div className="mb-5 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700">
              {loadError}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {categories.slice(1, 5).map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className="bg-white rounded-2xl p-4 text-left border hover:-translate-y-0.5 transition-all"
                style={{ borderColor: activeCategory === category.name ? category.color : "#e2e8f0" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold" style={{ color: category.color }}>
                    {resources.filter((resource) => resource.category === category.name).length}
                  </span>
                  <ResourceIcon category={category.name} />
                </div>
                <p className="text-xs font-semibold text-slate-600 mt-3">{category.name}</p>
              </button>
            ))}
          </div>

          {featured.length > 0 && activeCategory === "All Resources" && !search && (
            <section className="mb-7">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recommended for you</h2>
                  <p className="text-xs text-slate-400 mt-1">Start with these high-impact resources</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {featured.map((resource) => (
                  <div
                    key={resource._id}
                    className="bg-white rounded-2xl p-4 border border-blue-100 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <ResourceIcon category={resource.category} />
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 rounded-full px-2 py-1">
                        FEATURED
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 mt-4">{resource.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{resource.description}</p>
                    <button
                      type="button"
                      onClick={() => resourceTarget(resource) ? window.open(resourceTarget(resource), "_blank", "noopener,noreferrer") : openFile(resource)}
                      className="text-xs font-semibold text-blue-600 mt-3"
                    >
                      {resource.fileName ? "Open resource ↗" : "Open link ↗"}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-5">
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-slate-200 flex-1">
              <span className="text-slate-400">⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search sheets, aptitude, HR questions..."
                className="outline-none bg-transparent text-sm flex-1"
              />
            </div>
            <select
              value={activeCategory}
              onChange={(event) => setActiveCategory(event.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 outline-none"
            >
              {categories.map((category) => (
                <option key={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {visibleResources.map((resource) => (
              <div
                key={resource._id}
                className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <ResourceIcon category={resource.category} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900">{resource.title}</h3>
                    <span className="text-[10px] font-semibold rounded-full px-2 py-1 bg-slate-100 text-slate-500">
                      {resource.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 truncate">{resource.description}</p>
                  <div className="flex gap-3 text-xs text-slate-400 mt-2">
                    {resource.difficulty && <span>{resource.difficulty}</span>}
                    {resource.duration && <span>• {resource.duration}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => resourceTarget(resource) ? window.open(resourceTarget(resource), "_blank", "noopener,noreferrer") : openFile(resource)}
                    className="text-blue-600 text-sm font-bold"
                  >
                    Open ↗
                  </button>
                  {resource.fileName && (
                    <button
                      type="button"
                      onClick={() => openFile(resource, true)}
                      className="text-slate-500 text-sm font-semibold"
                    >
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
            {visibleResources.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="text-4xl mb-3">✦</div>
                <h3 className="font-bold text-slate-800">Resources are coming soon</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Your placement cell will publish preparation material here.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
