// src/app/pages/PatientList.tsx
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Plus, Search, ChevronRight } from "lucide-react";
import { Avatar } from "../components/common/Avatar";
import { patients } from "../../data/mockData";

export function PatientList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState<"Tous" | "Actif" | "Archivé">("Tous");

  const filtered = patients.filter(
    (p) =>
      (filtre === "Tous" || p.statut === filtre) &&
      p.nom.toLowerCase().includes(search.toLowerCase())
  );

  const handlePatientClick = (patientId: number) => {
    navigate(`/patient-detail/${patientId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>{t('patients.title')}</h1>
        <button className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-2xl text-sm font-medium hover:shadow-lg active:scale-95 transition-all">
          <Plus size={18} />
          {t('patients.add')}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-border rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
          <Search size={18} className="text-muted-foreground flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('patients.search')}
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(["Tous", "Actif", "Archivé"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltre(f)}
              className="px-4 py-2 rounded-2xl text-xs md:text-sm font-medium transition-all"
              style={{
                background: filtre === f ? "#4A90D9" : "#EDF2F7",
                color: filtre === f ? "#fff" : "#718096",
              }}
            >
              {t(`patients.filters.${f.toLowerCase()}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => handlePatientClick(p.id)}
            className="bg-white rounded-2xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left border border-border/50"
          >
            <Avatar initials={p.avatar} size={52} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-base">{p.nom}</span>
                <span
                  className="text-[10px] font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-2"
                  style={{
                    background: p.statut === "Actif" ? "#F0FFF4" : "#F7FAFC",
                    color: p.statut === "Actif" ? "#48BB78" : "#718096",
                  }}
                >
                  {p.statut}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{t('patients.age', { age: p.age })}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(p.progression / p.total) * 100}%`, background: "linear-gradient(90deg, #4A90D9, #6EC6A0)" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{t('patients.progress', { done: p.progression, total: p.total })}</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground flex-shrink-0 mt-2" />
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">{t('patients.noResults')}</div>
      )}
    </div>
  );
}