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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mm-gray-400" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-10 py-3 bg-white border-3 border-mm-black rounded-xl text-mm-black font-body placeholder:text-mm-gray-400 focus:outline-none focus:ring-2 focus:ring-mm-blue focus:border-mm-blue transition-all"
          />
          {localQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-mm-gray-200 text-mm-black hover:bg-mm-gray-300 transition-colors"
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
              'ml-2 p-3 rounded-xl transition-colors relative border-3 border-mm-black',
              hasActiveFilters
                ? 'bg-mm-blue text-white'
                : 'bg-white text-mm-black hover:bg-mm-gray-100'
            )}
            onClick={onFilterClick}
            whileTap={{ scale: 0.95 }}
          >
            <SlidersHorizontal className="w-5 h-5" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-mm-pink text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-mm-black">
                !
              </span>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}
