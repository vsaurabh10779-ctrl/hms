"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type CrudOption = { value: string | number; label: string };
export type CrudField = {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  options?: CrudOption[] | ((data: Record<string, any>) => CrudOption[]);
};
export type CrudColumn = {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
};
export type CrudProps = {
  title: string;
  subtitle?: string;
  endpoint: string;
  columns: CrudColumn[];
  fields: CrudField[];
  initial: Record<string, any>;
  empty?: string;
};

export default function CrudPanel({
  title,
  subtitle,
  endpoint,
  columns,
  fields,
  initial = {},
  empty = "No records yet.",
}: CrudProps) {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [meta, setMeta] = useState<Record<string, any>>({});
  const [form, setForm] = useState<Record<string, any>>({ ...initial });
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(endpoint);
    const data = await res.json();
    const key = Object.keys(data)[0];
    setRows(data[key] || []);
    setMeta(data);
    setLoading(false);
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const selectOptions = useMemo(() => {
    const map: Record<string, CrudOption[]> = {};
    fields.forEach((f) => {
      if (f.type === "select") {
        map[f.name] =
          typeof f.options === "function" ? f.options(meta) : (f.options as CrudOption[]) || [];
      }
    });
    return map;
  }, [fields, meta]);

  function set(name: string, value: any) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    setForm({ ...initial });
    setOpen(false);
    load();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          {open ? "Cancel" : "+ Add " + title.split(" ").pop()}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((f) => (
              <label key={f.name} className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {f.label}
                </span>
                {f.type === "select" ? (
                  <select
                    required={f.required}
                    value={form[f.name] ?? ""}
                    onChange={(e) => set(f.name, e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  >
                    <option value="">— Select {f.label} —</option>
                    {selectOptions[f.name].map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type || "text"}
                    required={f.required}
                    value={form[f.name] ?? ""}
                    onChange={(e) => set(f.name, f.type === "number" ? e.target.value : e.target.value)}
                    placeholder={f.placeholder || ""}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  />
                )}
              </label>
            ))}
          </div>
          {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
          <button
            disabled={saving}
            className="mt-6 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-sm text-slate-400">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-400">{empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  {columns.map((c) => (
                    <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-teal-50/40">
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3 text-slate-700">
                        {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}