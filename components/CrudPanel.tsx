"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type CrudRow = Record<string, any>;
export type CrudOption = { value: string | number; label: string };
export type CrudField = {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  options?: CrudOption[] | ((data: CrudRow) => CrudOption[]);
};
export type CrudColumn = {
  key: string;
  label: string;
  render?: (value: any, row: CrudRow) => React.ReactNode;
};
export type CrudProps = {
  title: string;
  subtitle?: string;
  endpoint: string;
  columns: CrudColumn[];
  fields: CrudField[];
  initial: CrudRow;
  empty?: string;
  rowLabel?: (row: CrudRow) => string;
};

export default function CrudPanel({
  title,
  subtitle,
  endpoint,
  columns,
  fields,
  initial = {},
  empty = "No records yet.",
  rowLabel,
}: CrudProps) {
  const [rows, setRows] = useState<CrudRow[]>([]);
  const [meta, setMeta] = useState<CrudRow>({});
  const [form, setForm] = useState<CrudRow>({ ...initial });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CrudRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  const singular = title.split(" ").pop() || title;
  const formOpen = open || Boolean(editing);

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

  function resetForm() {
    setForm({ ...initial });
    setEditing(null);
    setOpen(false);
    setError("");
  }

  function startAdd() {
    setError("");
    setNotice("");
    setEditing(null);
    setForm({ ...initial });
    setOpen((v) => !v);
  }

  function startEdit(row: CrudRow) {
    setError("");
    setNotice("");
    const next: CrudRow = { ...initial };
    fields.forEach((f) => {
      if (row[f.name] !== undefined) next[f.name] = row[f.name];
    });
    setForm(next);
    setEditing(row);
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(editing ? `${endpoint}/${editing.id}` : endpoint, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    setNotice(
      editing
        ? `${singular} updated successfully.`
        : `${singular} added successfully.`
    );
    resetForm();
    load();
  }

  async function remove(row: CrudRow) {
    const label = rowLabel ? rowLabel(row) : String(row.name ?? `record #${row.id}`);
    if (!window.confirm(`Delete ${singular.toLowerCase()} "${label}"? This cannot be undone.`)) return;
    setPendingDelete(row.id);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`${endpoint}/${row.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not delete record");
        return;
      }
      const n = Number(data.appointments || 0);
      setNotice(
        n > 0
          ? `${singular} deleted, along with ${n} linked appointment${n === 1 ? "" : "s"}.`
          : `${singular} deleted.`
      );
      if (editing && editing.id === row.id) resetForm();
      load();
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <button
          onClick={formOpen ? resetForm : startAdd}
          className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          {formOpen ? "Cancel" : "+ Add " + singular}
        </button>
      </div>

      {notice && (
        <p className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {notice}
        </p>
      )}

      {formOpen && (
        <form onSubmit={submit} className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              {editing ? `Edit ${singular.toLowerCase()}` : `Add ${singular.toLowerCase()}`}
            </h2>
            {editing && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-500">
                #{editing.id}
              </span>
            )}
          </div>
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
                    onChange={(e) => set(f.name, e.target.value)}
                    placeholder={f.placeholder || ""}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  />
                )}
              </label>
            ))}
          </div>
          {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
          <div className="mt-6 flex items-center gap-3">
            <button
              disabled={saving}
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Save"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
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
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
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
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(row)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(row)}
                          disabled={pendingDelete === row.id}
                          className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:border-rose-400 hover:bg-rose-50 disabled:opacity-50"
                        >
                          {pendingDelete === row.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
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