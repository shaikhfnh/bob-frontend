import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '../styles/motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ===== Real SVG icons — replacing every emoji =====
const Icon = {
  search: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  clear: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>,
  download: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>,
  chevronDown: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m6 9 6 6 6-6"/></svg>,
  chevronLeft: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m15 18-6-6 6-6"/></svg>,
  sortUp: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m18 15-6-6-6 6"/></svg>,
  file: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>,
  magnifierEmpty: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
};

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
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-600 transition-all hover:bg-white/60"
      >
        <Icon.download className="h-3.5 w-3.5" /> {label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={springs.snappy}>
          <Icon.chevronDown className="h-3 w-3" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={springs.snappy}
            className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-white/60 bg-white/80 py-1.5 shadow-xl backdrop-blur-2xl"
          >
            <button
              onClick={() => { onCSV(); setOpen(false); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-neutral-800 transition-colors hover:bg-black/[0.04]"
            >
              <Icon.file className="h-4 w-4 text-neutral-500" />
              Export as CSV
            </button>
            <button
              onClick={() => { onPDF(); setOpen(false); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-neutral-800 transition-colors hover:bg-black/[0.04]"
            >
              <Icon.file className="h-4 w-4 text-neutral-500" />
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
        <tr key={`skeleton-${i}`} className="h-[56px] border-b border-black/[0.04] last:border-0">
          {Array.from({ length: columnCount }).map((_, j) => (
            <td key={j} className="px-5 py-2">
              <div className="h-3.5 w-[70%] animate-pulse rounded-full bg-neutral-200/70" style={{ animationDelay: `${(i + j) * 40}ms` }} />
            </td>
          ))}
          {hasRowClick && <td className="px-5 py-2" />}
        </tr>
      ))}
    </>
  );
}

const ROW_H = 56;

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
  mobileLabelKey, // which column's render() to use as each mobile card's title
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
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

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
    setSelected((s) => { const next = new Set(s); next.has(id) ? next.delete(id) : next.add(id); return next; });
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
  const mobileTitleCol = columns.find((c) => c.key === mobileLabelKey) || columns[0];
  const mobileSubCols = columns.filter((c) => c.key !== mobileTitleCol.key && c.key !== 'actions').slice(0, 3);
  const actionsCol = columns.find((c) => c.key === 'actions');

  return (
    <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-2xl">
      {/* Toolbar — the glass effect lives here and on the outer shell only;
          the dense data grid itself stays solid/opaque for legibility. */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/60 bg-white/40 p-4">
        <div className="relative w-full max-w-xs">
          <Icon.search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-xl border border-neutral-200/80 bg-white/70 py-2 pl-9 pr-8 text-sm outline-none transition-all focus:border-brand-red focus:bg-white focus:ring-2 focus:ring-brand-red/10"
          />
          {search && (
            <button onClick={() => updateSearch('')} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
              <Icon.clear className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <div key={f.key} className="flex gap-1 rounded-xl bg-white/50 p-1">
              {f.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFilter(f.key, opt.value)}
                  className={`relative rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                    (activeFilters[f.key] || 'all') === opt.value ? 'bg-white text-brand-ink shadow-sm' : 'text-neutral-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ))}
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-xs font-semibold text-brand-red underline decoration-brand-red/30 hover:decoration-brand-red">
              Clear
            </button>
          )}
          <div className="h-5 w-px bg-neutral-200" />
          <DownloadMenu onCSV={exportCSV} onPDF={exportPDF} />
        </div>
      </div>

      <AnimatePresence>
        {selectable && selected.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/60 bg-red-50/60"
          >
            <div className="flex items-center justify-between px-5 py-2.5">
              <p className="text-xs font-semibold text-brand-ink">{selected.size} selected</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setSelected(new Set())} className="text-xs font-medium text-neutral-500 hover:text-brand-ink">Clear selection</button>
                <DownloadMenu onCSV={exportSelectedCSV} onPDF={exportSelectedPDF} label="Export selected" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="p-8 text-center text-sm font-medium text-red-600">{error}</p>}

      {!error && (
        <>
          {!loading && filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-white p-10 text-center" style={{ minHeight: pageSize * ROW_H * 0.6 }}>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                <Icon.magnifierEmpty className="h-7 w-7 text-neutral-400" />
              </div>
              {hasActiveFilters ? (
                <>
                  <p className="mt-4 text-sm font-semibold text-brand-ink">No matches</p>
                  <p className="mt-1 text-xs text-brand-muted">Nothing fits that search or filter.</p>
                  <button onClick={clearAll} className="mt-3 text-xs font-semibold text-brand-red underline hover:no-underline">Clear search and filters</button>
                </>
              ) : (
                <>
                  <p className="mt-4 text-sm font-semibold text-brand-ink">Nothing here yet</p>
                  <p className="mt-1 text-xs text-brand-muted">New entries will show up here automatically.</p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* ===== Desktop / tablet: real table, solid background ===== */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full table-fixed bg-white text-sm">
                  <thead>
                    <tr className="bg-gradient-to-b from-neutral-900 to-neutral-800 text-left text-[11px] uppercase tracking-wide">
                      {selectable && (
                        <th className="w-10 px-5 py-3.5">
                          <input type="checkbox" checked={allPageSelected} onChange={togglePageSelectAll} className="h-3.5 w-3.5 accent-brand-red" aria-label="Select all rows on this page" />
                        </th>
                      )}
                      {columns.map((c) => (
                        <th
                          key={c.key}
                          onClick={() => c.sortable !== false && toggleSort(c.key)}
                          className={`px-5 py-3.5 font-semibold text-white/60 ${c.hideOnMobile ? 'hidden sm:table-cell' : ''} ${c.sortable !== false ? 'cursor-pointer select-none hover:text-white' : ''}`}
                        >
                          <span className="inline-flex items-center gap-1">
                            {c.label}
                            {sortKey === c.key && (
                              <motion.span animate={{ rotate: sortDir === 'asc' ? 0 : 180 }} className="text-white">
                                <Icon.sortUp className="h-3 w-3" />
                              </motion.span>
                            )}
                          </span>
                        </th>
                      ))}
                      {onRowClick && <th className="px-5 py-3.5" />}
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
                            <tr key={rowId} className="h-[56px] border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50">
                              {selectable && (
                                <td className="px-5 py-2">
                                  <input type="checkbox" checked={selected.has(rowId)} onChange={() => toggleRow(rowId)} className="h-3.5 w-3.5 accent-brand-red" aria-label="Select row" />
                                </td>
                              )}
                              {columns.map((c) => (
                                <td key={c.key} className={`overflow-hidden px-5 py-2 align-middle ${c.hideOnMobile ? 'hidden sm:table-cell' : ''}`}>
                                  <div className="line-clamp-1">{c.render ? c.render(row) : row[c.key]}</div>
                                </td>
                              ))}
                              {onRowClick && (
                                <td className="px-5 py-2 text-right">
                                  <button onClick={() => onRowClick(row)} className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-500 transition-all active:scale-95 hover:border-brand-ink hover:text-brand-ink">
                                    View
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                        {Array.from({ length: fillerCount }).map((_, i) => (
                          <tr key={`filler-${i}`} className="h-[56px]" aria-hidden="true">
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

              {/* ===== Mobile: real cards, not a squeezed table ===== */}
              <div className="divide-y divide-neutral-100 bg-white sm:hidden">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2 p-4">
                        <div className="h-4 w-1/2 animate-pulse rounded-full bg-neutral-200/70" />
                        <div className="h-3 w-3/4 animate-pulse rounded-full bg-neutral-200/50" />
                      </div>
                    ))
                  : pageRows.map((row, i) => {
                      const rowId = row.id ?? i;
                      return (
                        <div
                          key={rowId}
                          onClick={() => onRowClick?.(row)}
                          className={`flex items-start gap-3 p-4 ${onRowClick ? 'cursor-pointer active:bg-neutral-50' : ''}`}
                        >
                          {selectable && (
                            <input type="checkbox" checked={selected.has(rowId)} onChange={(e) => { e.stopPropagation(); toggleRow(rowId); }} className="mt-1 h-3.5 w-3.5 flex-shrink-0 accent-brand-red" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-brand-ink">
                              {mobileTitleCol.render ? mobileTitleCol.render(row) : row[mobileTitleCol.key]}
                            </div>
                            <div className="mt-1.5 space-y-1">
                              {mobileSubCols.map((c) => (
                                <div key={c.key} className="flex items-center justify-between text-xs text-neutral-500">
                                  <span className="font-medium text-neutral-400">{c.label}</span>
                                  <span>{c.render ? c.render(row) : row[c.key]}</span>
                                </div>
                              ))}
                            </div>
                            {actionsCol && (
                              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                {actionsCol.render(row)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
              </div>
            </>
          )}

          <div className="flex items-center justify-between border-t border-white/60 bg-white/40 px-5 py-3.5">
            <p className="text-xs text-neutral-500">
              {filtered.length === 0 ? '0 results' : `${startIdx}–${endIdx} of ${filtered.length}`}
            </p>
            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                disabled={safePage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 transition-all hover:bg-white disabled:opacity-30"
              >
                <Icon.chevronLeft className="h-3.5 w-3.5" />
              </motion.button>
              <span className="px-2 text-xs text-neutral-500">Page {safePage} of {totalPages}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                disabled={safePage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 transition-all hover:bg-white disabled:opacity-30"
              >
                <Icon.chevronLeft className="h-3.5 w-3.5 rotate-180" />
              </motion.button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}