import { useEffect, useState } from "react";
import {
  createResource,
  deleteResource,
  fetchResourceFile,
  getResources,
} from "../api/resources";

const categories = [
  "DSA Sheets",
  "Aptitude",
  "Core CS",
  "HR Rounds",
  "Interview Experiences",
];
const emptyForm = {
  title: "",
  description: "",
  category: "DSA Sheets",
  resourceUrl: "",
  difficulty: "Beginner",
  duration: "",
  featured: false,
  file: null,
};

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadResources = () =>
    getResources()
      .then(setResources)
      .catch((loadError) => setError(loadError.message));

  useEffect(() => {
    loadResources();
  }, []);

  const updateField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await createResource(form);
      setResources((current) => [response.resource, ...current]);
      setForm(emptyForm);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteResource(id);
      setResources((current) =>
        current.filter((resource) => resource._id !== id),
      );
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

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
    } catch (fileError) {
      setError(fileError.message);
    }
  };

  const filtered = resources.filter((resource) =>
    `${resource.title} ${resource.category}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div
      className="flex flex-col gap-5 p-6 overflow-y-auto h-full"
      style={{ background: "#f0f4fb" }}
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Interview Prep Resources
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Publish curated preparation material for students.
        </p>
      </div>
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
        <section className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900">Published resources</h2>
              <p className="text-xs text-slate-400 mt-1">
                {resources.length} resource(s) available to students
              </p>
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search resources"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none sm:w-44"
            />
          </div>
          <div className="space-y-3">
            {filtered.map((resource) => (
              <div
                key={resource._id}
                className="rounded-xl border border-slate-200 p-4 flex gap-3 items-start"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  ↗
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 items-center flex-wrap">
                    <h3 className="font-semibold text-slate-800">
                      {resource.title}
                    </h3>
                    <span className="text-[10px] rounded-full px-2 py-1 bg-slate-100 text-slate-500">
                      {resource.category}
                    </span>
                    {resource.featured && (
                      <span className="text-[10px] rounded-full px-2 py-1 bg-amber-50 text-amber-700">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {resource.description || "No description added."}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 truncate max-w-full">
                    {resource.fileName || resource.resourceUrl}
                  </p>
                </div>
                {(resource.fileName || resource.resourceUrl) && (
                  <button
                    type="button"
                    onClick={() =>
                      openFile(resource, Boolean(resource.fileName))
                    }
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {resource.fileName ? "Open" : "View"}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(resource._id)}
                  className="text-xs font-semibold text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-10">
                No resources published yet.
              </p>
            )}
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3"
        >
          <div>
            <h2 className="font-bold text-slate-900">Upload a resource</h2>
            <p className="text-xs text-slate-400 mt-1">
              Upload a document for students to open and download.
            </p>
          </div>
          <input
            required
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Resource title"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none"
          />
          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Short description"
            rows="3"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
          />
          <select
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none"
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <label className="block rounded-xl border border-dashed border-blue-300 bg-blue-50/50 px-3 py-4 text-sm text-slate-600 cursor-pointer">
            <span className="font-semibold text-blue-700">Choose file</span>
            <span className="block text-xs text-slate-400 mt-1">
              {form.file
                ? form.file.name
                : "PDF, DOCX, PPTX, XLSX, images and more (max 20 MB)"}
            </span>
            <input
              required={!form.resourceUrl}
              type="file"
              onChange={(event) =>
                updateField("file", event.target.files?.[0] || null)
              }
              className="hidden"
            />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              value={form.difficulty}
              onChange={(event) =>
                updateField("difficulty", event.target.value)
              }
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
            <input
              value={form.duration}
              onChange={(event) => updateField("duration", event.target.value)}
              placeholder="e.g. 4 hours"
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none"
            />
          </div>
          <button
            disabled={saving}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "#4f7ef7" }}
          >
            {saving ? "Publishing..." : "Publish Resource"}
          </button>
        </form>
      </div>
    </div>
  );
}
