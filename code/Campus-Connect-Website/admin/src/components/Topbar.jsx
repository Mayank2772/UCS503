export default function Topbar({ pageTitle }) {
  return (
    <header
      className="flex items-center justify-between px-3 py-3.5 sm:px-6 bg-white border-b flex-shrink-0"
      style={{ borderColor: "#e8edf5" }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label="Open navigation"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          onClick={() => window.dispatchEvent(new Event("toggle-mobile-nav"))}
        >
          ☰
        </button>
        <h2 className="truncate font-semibold text-base" style={{ color: "#0f172a" }}>
          {pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 rounded-xl px-3.5 py-2 border"
          style={{
            borderColor: "#e2e8f0",
            backgroundColor: "#f8fafc",
          }}
        ></div>
        <div className="flex items-center gap-2 cursor-pointer">
          <div
            className="flex items-center justify-center rounded-full text-white text-xs font-bold"
            style={{
              width: 34,
              height: 34,
              background: "linear-gradient(135deg,#4f7ef7,#6c63ff)",
            }}
          >
            A
          </div>
          <div className="hidden text-sm sm:block">
            <div className="font-semibold" style={{ color: "#0f172a" }}>
              Admin User
            </div>
            <div className="text-xs" style={{ color: "#94a3b8" }}>
              Placement Officer
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
