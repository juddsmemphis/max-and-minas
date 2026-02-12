'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { cn, debounce } from '@/lib/utils';
import { useStore } from '@/lib/store';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onFilterClick?: () => void;
  placeholder?: string;
  showFilters?: boolean;
  className?: string;
}

export function SearchBar({
  onSearch,
  onFilterClick,
  placeholder = 'Search 15,000+ flavors...',
  showFilters = true,
  className,
}: SearchBarProps) {
  const { searchQuery, setSearchQuery, searchFilters } = useStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const hasActiveFilters =
    searchFilters.category ||
    searchFilters.rarity ||
    searchFilters.dietary.length > 0 ||
    searchFilters.yearRange ||
    searchFilters.season;

  // Debounced search
  useEffect(() => {
    const debouncedSearch = debounce((query: string) => {
      setSearchQuery(query);
      onSearch?.(query);
    }, 300);

    debouncedSearch(localQuery);
  }, [localQuery, setSearchQuery, onSearch]);

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    onSearch?.('');
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative flex items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-psychedelic-purple/50" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-10 py-3 bg-white/80 backdrop-blur-sm border-2 border-psychedelic-purple/20 rounded-2xl text-chocolate placeholder:text-chocolate/40 focus:outline-none focus:border-psychedelic-purple/50 focus:ring-2 focus:ring-psychedelic-purple/20 transition-all"
          />
          {localQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-psychedelic-purple/10 text-psychedelic-purple hover:bg-psychedelic-purple/20 transition-colors"
              onClick={handleClear}
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Filter Button */}
        {showFilters && (
          <motion.button
            className={cn(
              'ml-2 p-3 rounded-2xl transition-colors relative',
              hasActiveFilters
                ? 'bg-psychedelic-purple text-white'
                : 'bg-white/80 border-2 border-psychedelic-purple/20 text-psychedelic-purple hover:bg-psychedelic-purple/10'
            )}
            onClick={onFilterClick}
            whileTap={{ scale: 0.95 }}
          >
            <SlidersHorizontal className="w-5 h-5" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-psychedelic-pink text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}
