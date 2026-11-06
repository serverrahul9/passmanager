import React from 'react';
import { PLATFORM_CATEGORIES } from '../utils/platforms';
import { Layers, Globe, Users, Tv, DollarSign, Briefcase, MoreHorizontal } from 'lucide-react';

const getCategoryIcon = (id) => {
  switch (id) {
    case 'all': return <Layers className="w-3.5 h-3.5" />;
    case 'google': return <Globe className="w-3.5 h-3.5" />;
    case 'social': return <Users className="w-3.5 h-3.5" />;
    case 'entertainment': return <Tv className="w-3.5 h-3.5" />;
    case 'finance': return <DollarSign className="w-3.5 h-3.5" />;
    case 'work': return <Briefcase className="w-3.5 h-3.5" />;
    default: return <MoreHorizontal className="w-3.5 h-3.5" />;
  }
};

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  accounts = [],
}) {
  const getCount = (catId) => {
    if (catId === 'all') return accounts.length;
    return accounts.filter((a) => a.category === catId).length;
  };

  return (
    <div className="w-full flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none py-1">
      {PLATFORM_CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const count = getCount(cat.id);
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all active:scale-95 ${
              isSelected
                ? 'bg-gradient-to-r from-sky-400 to-cyan-500 text-slate-950 shadow-glass-glow font-bold'
                : 'liquid-btn-secondary text-slate-300 hover:text-white hover:border-sky-400/40'
            }`}
          >
            {getCategoryIcon(cat.id)}
            <span>{cat.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                isSelected
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-sky-950/70 text-sky-300 border border-sky-400/20'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

