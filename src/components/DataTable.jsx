import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '../styles/motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function DownloadMenu({ onCSV, onPDF, label = 'Download' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-muted transition-all hover:bg-neutral-100"
      >
        ⬇ {label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={springs.snappy} className="text-[10px]">▾</motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={springs.snappy}
            className="absolute right-0 z-20 mt-1.5 w-40 overflow-hidden rounded-xl border border-neutral-200 bg-white/95 py-1 shadow-lg backdrop-blur-xl"
          >
            <button
              onClick={() => { onCSV(); setOpen(false); }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-brand-ink transition-colors hover:bg-neutral-50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-neutral-300 text-[10px] font-bold">CSV</span>
              Export as CSV
            </button>
            <button
              onClick={() => { onPDF(); setOpen(false); }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-brand-ink transition-colors hover:bg-neutral-50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-neutral-300 text-[10px] font-bold">PDF</span>
              Export as PDF
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SkeletonRows({ pageSize, columnCount, hasRowClick }) {
  return (
    <>
      {Array.from({ length: Math.min(pageSize, 6) }).map((_, i) => (
        <tr key={`skeleton-${i}`} className="h-[52px] border-b border-neutral-100/70 last:border-0">
          {Array.from({ length: columnCount }).map((_, j) => (
            <td key={j} className="px-4 py-2">
              <div className="h-3.5 w-[70%] animate-pulse rounded bg-neutral-200" style={{ animationDelay: `${(i + j) * 40}ms` }} />
            </td>
          ))}
          {hasRowClick && <td className="px-4 py-2" />}
        </tr>
      ))}
    </>
  );
}

const ROW_H = 52;

export default function DataTable({
  data,
  columns,
  searchKeys = [],
  filters = [],
  pageSize = 10,
  exportFilename = 'export',
  onRowClick,
  selectable = false,
  loading = false,
  error = '',
}) {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());

  const hasActiveFilters = search || Object.values(activeFilters).some((v) => v && v !== 'all');

  const filtered = useMemo(() => {
    let rows = [...data];
    if (search && searchKeys.length) {
      const q = search.toLowerCase();
      rows = rows.filter((row) => searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(q)));
    }
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== 'all') rows = rows.filter((row) => row[key] === value);
    });
    if (sortKey) {
      rows.sort((a, b) => {
        const av = a[sortKey] ?? '';
        const bv = b[sortKey] ?? '';
        return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
      });
    }
    return rows;
  }, [data, search, activeFilters, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const safePage = Math.min(page, totalPages);
  const startIdx = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIdx = Math.min(safePage * pageSize, filtered.length);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const fillerCount = Math.max(0, pageSize - pageRows.length);

  const pageRowIds = pageRows.map((r, i) => r.id ?? i);
  const allPageSelected = pageRowIds.length > 0 && pageRowIds.every((id) => selected.has(id));

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }
  function updateFilter(key, value) { setActiveFilters((f) => ({ ...f, [key]: value })); setPage(1); }
  function updateSearch(value) { setSearch(value); setPage(1); }
  function clearAll() { setSearch(''); setActiveFilters({}); setPage(1); }

  function toggleRow(id) {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function togglePageSelectAll() {
    setSelected((s) => {
      const next = new Set(s);
      if (allPageSelected) pageRowIds.forEach((id) => next.delete(id));
      else pageRowIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function toCSV(rows) {
    const headers = columns.map((c) => c.label);
    const body = rows.map((row) => columns.map((c) => (c.exportValue ? c.exportValue(row) : row[c.key] ?? '')));
    return [headers, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  }
  function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
  function toPDF(rows, filename) {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [columns.map((c) => c.label)],
      body: rows.map((row) => columns.map((c) => (c.exportValue ? c.exportValue(row) : String(row[c.key] ?? '')))),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 26, 26] },
    });
    doc.save(filename);
  }

  const exportCSV = () => downloadCSV(toCSV(filtered), `${exportFilename}.csv`);
  const exportPDF = () => toPDF(filtered, `${exportFilename}.pdf`);
  const exportSelectedCSV = () => downloadCSV(toCSV(data.filter((r, i) => selected.has(r.id ?? i))), `${exportFilename}-selected.csv`);
  const exportSelectedPDF = () => toPDF(data.filter((r, i) => selected.has(r.id ?? i)), `${exportFilename}-selected.pdf`);

  const columnCount = columns.length + (selectable ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/60 shadow-sm backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/70 p-4">
        <div className="relative w-full max-w-xs">
          <input
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg border border-neutral-200 bg-white/70 px-3 py-2 pr-8 text-sm outline-none transition-colors focus:border-brand-ink"
          />
          {search && (
            <button
              onClick={() => updateSearch('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <div key={f.key} className="flex gap-1.5 rounded-lg bg-neutral-100/70 p-1">
              {f.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFilter(f.key, opt.value)}
                  className={`relative rounded-md px-3 py-1 text-xs font-semibold transition-all active:scale-95 ${
                    (activeFilters[f.key] || 'all') === opt.value ? 'bg-white text-brand-ink shadow-sm' : 'text-brand-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ))}
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-xs font-semibold text-brand-red underline hover:no-underline">
              Clear
            </button>
          )}
          <div className="h-5 w-px bg-neutral-200" />
          <DownloadMenu onCSV={exportCSV} onPDF={exportPDF} />
        </div>
      </div>

      {/* Selection toolbar — only appears once something's actually selected,
          so it never takes up space or attention otherwise. */}
      <AnimatePresence>
        {selectable && selected.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-neutral-200/70 bg-neutral-50"
          >
            <div className="flex items-center justify-between px-4 py-2.5">
              <p className="text-xs font-semibold text-brand-ink">{selected.size} selected</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setSelected(new Set())} className="text-xs font-medium text-brand-muted hover:text-brand-ink">
                  Clear selection
                </button>
                <DownloadMenu onCSV={exportSelectedCSV} onPDF={exportSelectedPDF} label="Export selected" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="p-8 text-center text-sm font-medium text-red-600">⚠ {error}</p>}

      {!error && (
        <>
          {!loading && filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: pageSize * ROW_H }}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-2xl">
                {hasActiveFilters ? '🔍' : '📋'}
              </div>
              {hasActiveFilters ? (
                <>
                  <p className="mt-3 text-sm font-semibold text-brand-ink">No matches</p>
                  <p className="mt-1 text-xs text-brand-muted">Nothing fits that search or filter.</p>
                  <button onClick={clearAll} className="mt-3 text-xs font-semibold text-brand-red underline hover:no-underline">
                    Clear search and filters
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm font-semibold text-brand-ink">Nothing here yet</p>
                  <p className="mt-1 text-xs text-brand-muted">New entries will show up here automatically.</p>
                </>
              )}
            </div>
          ) : (
            <div className="relative">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed text-sm">
                  <thead>
                    <tr className="bg-black text-left text-[11px] uppercase tracking-wide">
                      {selectable && (
                        <th className="w-10 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={allPageSelected}
                            onChange={togglePageSelectAll}
                            className="h-3.5 w-3.5 accent-brand-red"
                            aria-label="Select all rows on this page"
                          />
                        </th>
                      )}
                      {columns.map((c) => (
                        <th
                          key={c.key}
                          onClick={() => c.sortable !== false && toggleSort(c.key)}
                          className={`px-4 py-3 font-semibold text-white/70 ${c.hideOnMobile ? 'hidden sm:table-cell' : ''} ${c.sortable !== false ? 'cursor-pointer select-none hover:text-white' : ''}`}
                        >
                          {c.label}
                          {sortKey === c.key && <span className="ml-1 text-white">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                        </th>
                      ))}
                      {onRowClick && <th className="px-4 py-3"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <SkeletonRows pageSize={pageSize} columnCount={columnCount} hasRowClick={!!onRowClick} />
                    ) : (
                      <>
                        {pageRows.map((row, i) => {
                          const rowId = row.id ?? i;
                          return (
                            <tr key={rowId} className="h-[52px] border-b border-neutral-100/70 transition-colors last:border-0 hover:bg-neutral-50/70">
                              {selectable && (
                                <td className="px-4 py-2">
                                  <input
                                    type="checkbox"
                                    checked={selected.has(rowId)}
                                    onChange={() => toggleRow(rowId)}
                                    className="h-3.5 w-3.5 accent-brand-red"
                                    aria-label="Select row"
                                  />
                                </td>
                              )}
                              {columns.map((c) => (
                                <td key={c.key} className={`overflow-hidden px-4 py-2 align-middle ${c.hideOnMobile ? 'hidden sm:table-cell' : ''}`}>
                                  <div className="line-clamp-1">{c.render ? c.render(row) : row[c.key]}</div>
                                </td>
                              ))}
                              {onRowClick && (
                                <td className="px-4 py-2 text-right">
                                  <button
                                    onClick={() => onRowClick(row)}
                                    className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-brand-muted transition-all active:scale-95 hover:border-brand-ink hover:text-brand-ink"
                                  >
                                    View
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                        {Array.from({ length: fillerCount }).map((_, i) => (
                          <tr key={`filler-${i}`} className="h-[52px]" aria-hidden="true">
                            {selectable && <td />}
                            {columns.map((c) => <td key={c.key} className={c.hideOnMobile ? 'hidden sm:table-cell' : ''} />)}
                            {onRowClick && <td />}
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white/80 to-transparent sm:hidden" />
            </div>
          )}

          <div className="flex items-center justify-between border-t border-neutral-200/70 px-4 py-3">
            <p className="text-xs text-brand-muted">
              {filtered.length === 0 ? '0 results' : `Showing ${startIdx}–${endIdx} of ${filtered.length}`}
            </p>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                disabled={safePage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-md px-2.5 py-1 text-xs font-semibold text-brand-muted transition-all hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                ← Prev
              </motion.button>
              <span className="text-xs text-brand-muted">Page {safePage} of {totalPages}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                disabled={safePage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-md px-2.5 py-1 text-xs font-semibold text-brand-muted transition-all hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                Next →
              </motion.button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}