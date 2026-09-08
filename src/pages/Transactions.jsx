import { useMemo, useState } from "react";
import { Filter, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { NAVY, GREEN, RED } from "../lib/constants";
import { idr, formatDate } from "../lib/format";
import CatIcon from "../components/CatIcon";
import { TxModal } from "../components/Modals";

function FilterChip({ active, onClick, label, color, iconKey }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
      style={{
        background: active ? NAVY : "white",
        color: active ? "white" : "#475569",
        border: active ? "1px solid " + NAVY : "1px solid #E2E8F0",
      }}
    >
      {iconKey && <CatIcon iconKey={iconKey} size={12} color={active ? "white" : color} />}
      {label}
    </button>
  );
}

export default function Transactions({ categories, transactions, onAdd, onDelete, showModal, setShowModal }) {
  const [filterCat, setFilterCat] = useState("all");
  const [page, setPage] = useState(1);

  const catById = useMemo(() => {
    const m = {};
    categories.forEach((c) => (m[c.id] = c));
    return m;
  }, [categories]);

  const withBalance = useMemo(() => {
    const asc = [...transactions].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    let running = 0;
    return asc.map((t) => {
      running += t.type === "income" ? t.amount : -t.amount;
      return { ...t, balance: running };
    });
  }, [transactions]);

  const desc = useMemo(() => [...withBalance].reverse(), [withBalance]);
  const filtered = useMemo(
    () => (filterCat === "all" ? desc : desc.filter((t) => t.category_id === filterCat)),
    [desc, filterCat]
  );
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter size={15} className="text-slate-400 flex-shrink-0" />
        <FilterChip active={filterCat === "all"} onClick={() => { setFilterCat("all"); setPage(1); }} label="Semua" />
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            active={filterCat === c.id}
            onClick={() => { setFilterCat(c.id); setPage(1); }}
            label={c.name}
            color={c.color}
            iconKey={c.icon}
          />
        ))}
      </div>

      <div className="hidden lg:block ft-card bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500" style={{ borderBottom: "1px solid #E2E8F0" }}>
              <th className="py-3 pl-5 font-normal">No</th>
              <th className="py-3 font-normal">Tanggal</th>
              <th className="py-3 font-normal">Kategori</th>
              <th className="py-3 font-normal">Item</th>
              <th className="py-3 font-normal text-right">Pemasukan</th>
              <th className="py-3 font-normal text-right">Pengeluaran</th>
              <th className="py-3 pr-5 font-normal text-right">Saldo</th>
              <th className="py-3 pr-5"></th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr><td colSpan={8} className="py-8 text-center text-slate-400">Data tidak ditemukan</td></tr>
            )}
            {paged.map((t, i) => {
              const cat = catById[t.category_id];
              return (
                <tr key={t.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td className="py-3 pl-5 text-slate-500">{(page - 1) * 10 + i + 1}</td>
                  <td className="py-3">{formatDate(t.date)}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: (cat?.color || "#999") + "1A" }}>
                        <CatIcon iconKey={cat?.icon} size={12} color={cat?.color} />
                      </span>
                      {cat?.name}
                    </span>
                  </td>
                  <td className="py-3">{t.item}</td>
                  <td className="ft-num py-3 text-right" style={{ color: GREEN }}>{t.type === "income" ? idr(t.amount) : "-"}</td>
                  <td className="ft-num py-3 text-right" style={{ color: RED }}>{t.type === "expense" ? idr(t.amount) : "-"}</td>
                  <td className="ft-num py-3 pr-5 text-right font-medium">{idr(t.balance)}</td>
                  <td className="py-3 pr-5 text-right">
                    <button onClick={() => onDelete(t.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden space-y-3">
        {paged.length === 0 && <div className="text-center text-slate-400 py-8">Data tidak ditemukan</div>}
        {paged.map((t) => {
          const cat = catById[t.category_id];
          const isIncome = t.type === "income";
          return (
            <div key={t.id} className="ft-card bg-white rounded-xl p-4" style={{ border: "1px solid #E2E8F0" }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: (cat?.color || "#999") + "1A" }}>
                    <CatIcon iconKey={cat?.icon} size={16} color={cat?.color} />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: NAVY }}>{t.item}</div>
                    <div className="text-xs text-slate-500">{cat?.name} &middot; {formatDate(t.date)}</div>
                  </div>
                </div>
                <button onClick={() => onDelete(t.id)} className="text-slate-300"><Trash2 size={15} /></button>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #F1F5F9" }}>
                <div className="ft-num text-sm font-medium" style={{ color: isIncome ? GREEN : RED }}>
                  {isIncome ? "+" : "-"}{idr(t.amount)}
                </div>
                <div className="ft-num text-xs text-slate-500">Saldo {idr(t.balance)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="disabled:opacity-30"><ChevronLeft size={18} /></button>
          <span className="text-sm text-slate-500">Halaman {page} dari {pageCount}</span>
          <button disabled={page === pageCount} onClick={() => setPage(page + 1)} className="disabled:opacity-30"><ChevronRight size={18} /></button>
        </div>
      )}

      {showModal && (
        <TxModal
          categories={categories}
          onClose={() => setShowModal(false)}
          onSave={async (tx) => { await onAdd(tx); setShowModal(false); }}
        />
      )}
    </div>
  );
}
