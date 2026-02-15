'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List } from 'lucide-react';
import { FlavorCard } from '@/components/FlavorCard';
import { SearchBar } from '@/components/SearchBar';
import { LoadingCard, LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { createSupabaseBrowser } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Flavor } from '@/lib/database.types';

const CATEGORIES = [
  'All',
  'Fruity',
  'Creamy',
  'Chocolate',
  'Nutty',
  'Unique',
  'Savory',
  'Vegan',
];

const RARITIES = ['All', 'Legendary', 'Rare', 'Uncommon', 'Regular'];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'rarity', label: 'Rarity' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'appearances', label: 'Most Appearances' },
];

export default function ArchivePage() {
  const router = useRouter();
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Filters
  const { searchQuery, setSearchQuery } = useStore();
  const [category, setCategory] = useState<string>('All');
  const [rarity, setRarity] = useState<string>('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dietaryFilter, setDietaryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('rarity');

  // Load available tags
  useEffect(() => {
    const loadTags = async () => {
      const supabase = createSupabaseBrowser();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('flavors')
        .select('tags');

      if (data) {
        const allTags = new Set<string>();
        data.forEach((flavor: { tags: string[] | null }) => {
          if (flavor.tags && Array.isArray(flavor.tags)) {
            flavor.tags.forEach((tag: string) => allTags.add(tag));
          }
        });
        setAvailableTags(Array.from(allTags).sort());
      }
    };
    loadTags();
  }, []);

  const PAGE_SIZE = 20;

  const loadFlavors = useCallback(
    async (reset: boolean = false) => {
      const supabase = createSupabaseBrowser();
      const currentPage = reset ? 0 : page;

      if (reset) {
        setIsLoading(true);
        setPage(0);
      } else {
        setIsLoadingMore(true);
      }

      try {
        let query = supabase.from('flavors').select('*', { count: 'exact' });

        // Apply search
        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }

        // Apply category filter
        if (category !== 'All') {
          query = query.eq('category', category.toLowerCase());
        }

        // Apply rarity filter
        if (rarity !== 'All') {
          const rarityRanges: Record<string, [number, number]> = {
            Legendary: [8, 10],
            Rare: [5, 8],
            Uncommon: [3, 5],
            Regular: [0, 3],
          };
          const [min, max] = rarityRanges[rarity];
          query = query.gte('rarity_score', min).lt('rarity_score', max);
        }

        // Apply tag filter
        if (selectedTags.length > 0) {
          query = query.contains('tags', selectedTags);
        }

        // Apply dietary filter
        if (dietaryFilter === 'Gluten Free') {
          query = query.eq('is_gluten_free', true);
        } else if (dietaryFilter === 'Nut Free') {
          query = query.eq('contains_nuts', false);
        } else if (dietaryFilter === 'Contains Nuts') {
          query = query.eq('contains_nuts', true);
        }

        // Apply sorting
        switch (sortBy) {
          case 'name':
            query = query.order('name', { ascending: true });
            break;
          case 'rarity':
            query = query.order('rarity_score', { ascending: false });
            break;
          case 'newest':
            query = query.order('first_appeared', { ascending: false });
            break;
          case 'oldest':
            query = query.order('first_appeared', { ascending: true });
            break;
          case 'appearances':
            query = query.order('total_appearances', { ascending: false });
            break;
        }

        // Pagination
        query = query.range(
          currentPage * PAGE_SIZE,
          (currentPage + 1) * PAGE_SIZE - 1
        );

        const { data, error, count } = await query;

        if (error) throw error;

        if (reset) {
          setFlavors(data || []);
        } else {
          setFlavors((prev) => [...prev, ...(data || [])]);
        }

        setTotalCount(count || 0);
        setHasMore((data?.length || 0) === PAGE_SIZE);
      } catch (error) {
        console.error('Error loading flavors:', error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [page, searchQuery, category, rarity, selectedTags, dietaryFilter, sortBy]
  );

  // Initial load and filter changes
  useEffect(() => {
    loadFlavors(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, category, rarity, selectedTags, dietaryFilter, sortBy]);

  // Load more
  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      setPage((p) => p + 1);
      loadFlavors(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setCategory('All');
    setRarity('All');
    setSelectedTags([]);
    setDietaryFilter('All');
    setSortBy('rarity');
  };

  // Toggle a tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const hasActiveFilters =
    searchQuery || category !== 'All' || rarity !== 'All' || selectedTags.length > 0 || dietaryFilter !== 'All';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading font-bold text-3xl text-mm-black mb-2">
          Flavor Archive
        </h1>
        <p className="text-mm-gray-600 font-body">
          {totalCount.toLocaleString()} flavors since 1997
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <SearchBar
          placeholder="Search flavors..."
          onFilterClick={() => setShowFilters(!showFilters)}
          showFilters
        />

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white border-3 border-mm-black rounded-xl shadow-bold p-4 space-y-4">
                {/* Category */}
                <div>
                  <label className="text-sm font-heading font-bold text-mm-black mb-2 block">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm font-body font-medium transition-colors border-2',
                          category === cat
                            ? 'bg-mm-blue text-white border-mm-black'
                            : 'bg-white text-mm-blue border-mm-blue hover:bg-mm-blue/10'
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rarity */}
                <div>
                  <label className="text-sm font-heading font-bold text-mm-black mb-2 block">
                    Rarity
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {RARITIES.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRarity(r)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm font-body font-medium transition-colors border-2',
                          rarity === r
                            ? 'bg-mm-pink text-white border-mm-black'
                            : 'bg-white text-mm-pink border-mm-pink hover:bg-mm-pink/10'
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary */}
                <div>
                  <label className="text-sm font-heading font-bold text-mm-black mb-2 block">
                    Dietary
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Gluten Free', 'Nut Free', 'Contains Nuts'].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDietaryFilter(d)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm font-body font-medium transition-colors border-2',
                          dietaryFilter === d
                            ? d === 'Gluten Free'
                              ? 'bg-mm-mint text-white border-mm-black'
                              : d === 'Nut Free'
                              ? 'bg-mm-blue text-white border-mm-black'
                              : d === 'Contains Nuts'
                              ? 'bg-mm-orange text-white border-mm-black'
                              : 'bg-mm-blue text-white border-mm-black'
                            : d === 'Gluten Free'
                            ? 'bg-white text-mm-mint border-mm-mint hover:bg-mm-mint/10'
                            : d === 'Nut Free'
                            ? 'bg-white text-mm-blue border-mm-blue hover:bg-mm-blue/10'
                            : d === 'Contains Nuts'
                            ? 'bg-white text-mm-orange border-mm-orange hover:bg-mm-orange/10'
                            : 'bg-white text-mm-blue border-mm-blue hover:bg-mm-blue/10'
                        )}
                      >
                        {d === 'Gluten Free' ? 'GF' : d === 'Nut Free' ? 'NF' : d === 'Contains Nuts' ? '🥜 Nuts' : d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {availableTags.length > 0 && (
                  <div>
                    <label className="text-sm font-heading font-bold text-mm-black mb-2 block">
                      Tags {selectedTags.length > 0 && `(${selectedTags.length} selected)`}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-body font-medium transition-colors border-2',
                            selectedTags.includes(tag)
                              ? 'bg-mm-pink text-white border-mm-black'
                              : 'bg-white text-mm-pink border-mm-pink hover:bg-mm-pink/10'
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sort */}
                <div>
                  <label className="text-sm font-heading font-bold text-mm-black mb-2 block">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full md:w-auto px-4 py-2 border-2 border-mm-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-mm-blue"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset */}
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-mm-blue hover:underline font-body"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-mm-gray-600 font-body">
            Showing {flavors.length} of {totalCount.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 bg-white border-2 border-mm-black rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'grid'
                  ? 'bg-mm-blue text-white'
                  : 'text-mm-gray-500 hover:text-mm-black'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'list'
                  ? 'bg-mm-blue text-white'
                  : 'text-mm-gray-500 hover:text-mm-black'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Flavors */}
      {isLoading ? (
        <div
          className={cn(
            'gap-4',
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col'
          )}
        >
          {[...Array(9)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      ) : flavors.length === 0 ? (
        <EmptyState
          type="search"
          action={
            hasActiveFilters ? (
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-white text-mm-black font-heading font-bold border-3 border-mm-black rounded-xl hover:bg-mm-gray-100 transition-all"
              >
                Clear Filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <motion.div
            className={cn(
              'gap-4',
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'flex flex-col'
            )}
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.03 },
              },
            }}
          >
            {flavors.map((flavor) => (
              <motion.div
                key={flavor.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <FlavorCard
                  flavor={flavor}
                  onClick={() => router.push(`/flavor/${flavor.id}`)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="px-6 py-3 bg-white text-mm-black font-heading font-bold border-3 border-mm-black rounded-xl hover:bg-mm-gray-100 transition-all disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Loading...
                  </span>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
