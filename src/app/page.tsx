"use client";

import { DataGrid } from "../components/DataGrid/DataGrid";
import { useMemo } from "react";

export default function Home() {
  const data = useMemo(() => Array.from({ length: 50000 }, (_, i) => ({
    id: i + 1,
    name: `Name ${i + 1}`,
    age: 20 + (i % 50),
    role: i % 5 === 0 ? "Admin" : "User",
    status: i % 3 === 0 ? "Active" : "Inactive",
    email: `user${i + 1}@example.com`,
    score: ((i * 13) % 100) * 10,
  })), []);

  const columns = useMemo(() => [
    { id: "id", title: "ID", width: 60, pinned: "left" as const },
    { id: "name", title: "Full Name", width: 180, editable: true, sortable: true },
    { id: "age", title: "Age", width: 80, sortable: true },
    { id: "role", title: "Role", width: 120 },
    {
      id: "status",
      title: "Status",
      width: 130,
      renderCell: (val: string) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${val === 'Active'
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
          }`}>
          {val}
        </span>
      )
    },
    {
      id: "email",
      title: "Email",
      width: 220,
      editable: true,
      renderCell: (val: string) => (
        <span className="text-blue-500 dark:text-blue-400 hover:underline cursor-pointer transition-all">
          {val}
        </span>
      )
    },
    {
      id: "score",
      title: "Performance",
      width: 180,
      sortable: true,
      renderCell: (val: number) => {
        const percentage = (val / 1000) * 100;
        return (
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${val > 700 ? 'bg-emerald-500' : val > 400 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-[11px] font-mono tabular-nums text-gray-500 dark:text-zinc-400 w-8">{val}</span>
          </div>
        );
      }
    },
  ], []);

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-50 dark:bg-[#09090b] p-4 md:p-6 lg:p-10 transition-colors duration-500 overflow-hidden">
      <header className="mb-4 md:mb-10 animate-fade-in shrink-0">
        <div className="flex items-center gap-3 mb-2 md:mb-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
          </div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Quantum<span className="text-blue-600">Grid</span>
          </h1>
        </div>
        <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed hidden sm:block">
          The ultimate data manipulation engine. Handling <span className="text-zinc-900 dark:text-zinc-100 font-semibold underline decoration-blue-500/30">50,000 entities</span> with zero latency virtualization and predictive focus management.
        </p>
      </header>

      <main className="flex-1 min-h-0 border border-zinc-200 dark:border-white/10 rounded-xl md:rounded-2xl overflow-hidden glass-morphism shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <DataGrid
          data={data}
          columns={columns}
          className="h-full w-full"
        />
      </main>

      <footer className="mt-4 md:mt-6 text-[10px] md:text-[11px] text-zinc-400 dark:text-zinc-500 flex flex-wrap justify-between items-center gap-4 animate-fade-in shrink-0" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="font-medium tracking-wide">READY</span>
          </div>
          <div className="w-px h-3 bg-zinc-200 dark:bg-zinc-800" />
          <div className="font-mono tabular-nums uppercase hidden sm:block">Latency: ~2ms</div>
          <div className="w-px h-3 bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
          <div className="font-mono tabular-nums uppercase">FPS: 60</div>
        </div>
        <div className="hidden lg:flex items-center gap-6 font-medium">
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm text-[10px]">ARRROWS</kbd> NAVIGATE
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm text-[10px]">ENTER</kbd> EDIT
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm text-[10px]">ESC</kbd> CANCEL
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm text-[10px]">CTRL+Z</kbd> UNDO
        </div>
      </footer>
    </div>
  );
}
