'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ThumbsUp,
  CheckCircle,
  Trash2,
  Search,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { toast } from '@/components/Toast';
import { createSupabaseBrowser } from '@/lib/supabase';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { FlavorSuggestion } from '@/lib/database.types';

type SortOption = 'upvotes' | 'newest';

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<FlavorSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('upvotes');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const loadSuggestions = async () => {
    setIsLoading(true);
    const supabase = createSupabaseBrowser();

    try {
      let query = supabase.from('flavor_suggestions').select('*');

      if (sortBy === 'upvotes') {
        query = query.order('upvotes', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast.error('Failed to load suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleMarkReviewed = async (id: string) => {
    toast.success('Marked as reviewed');
    // In a full implementation, you'd track this status
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this suggestion?')) return;

    const supabase = createSupabaseBrowser();

    try {
      const { error } = await supabase
        .from('flavor_suggestions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuggestions((prev) => prev.filter((s) => s.id !== id));
      toast.success('Suggestion deleted');
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      toast.error('Failed to delete');
    }
  };

  const filteredSuggestions = suggestions.filter((s) =>
    s.flavor_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <motion.button
            className="p-2 rounded-xl bg-white/50 text-chocolate hover:bg-white/80 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
        </Link>
        <div>
          <h1 className="font-display text-2xl text-chocolate">
            Customer Suggestions
          </h1>
          <p className="text-sm text-chocolate/60">
            {suggestions.length} ideas from the community
          </p>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-psychedelic-purple/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search suggestions..."
            className="input-groovy w-full pl-10"
          />
        </div>
        <div className="flex items-center gap-2 bg-white/50 rounded-lg p-1">
          <button
            onClick={() => setSortBy('upvotes')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1',
              sortBy === 'upvotes'
                ? 'bg-psychedelic-purple text-white'
                : 'text-chocolate/60 hover:text-chocolate'
            )}
          >
            <TrendingUp className="w-4 h-4" />
            Top
          </button>
          <button
            onClick={() => setSortBy('newest')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1',
              sortBy === 'newest'
                ? 'bg-psychedelic-purple text-white'
                : 'text-chocolate/60 hover:text-chocolate'
            )}
          >
            <Clock className="w-4 h-4" />
            New
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="groovy-card p-4 text-center">
          <p className="font-display text-2xl text-psychedelic-purple">
            {suggestions.length}
          </p>
          <p className="text-xs text-chocolate/60">Total Ideas</p>
        </div>
        <div className="groovy-card p-4 text-center">
          <p className="font-display text-2xl text-psychedelic-pink">
            {suggestions.reduce((acc, s) => acc + s.upvotes, 0)}
          </p>
          <p className="text-xs text-chocolate/60">Total Votes</p>
        </div>
        <div className="groovy-card p-4 text-center">
          <p className="font-display text-2xl text-psychedelic-orange">
            {suggestions.filter((s) => s.upvotes >= 10).length}
          </p>
          <p className="text-xs text-chocolate/60">Popular (10+)</p>
        </div>
      </div>

      {/* Suggestions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <EmptyState
          type="suggestions"
          title={searchQuery ? 'No matches found' : 'No suggestions yet'}
        />
      ) : (
        <div className="space-y-3">
          {filteredSuggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              className="groovy-card p-4 flex items-start gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Vote Count */}
              <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-psychedelic-purple/10 text-psychedelic-purple min-w-[60px]">
                <ThumbsUp className="w-5 h-5" />
                <span className="text-lg font-semibold">
                  {suggestion.upvotes}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg text-chocolate">
                    {suggestion.flavor_name}
                  </h3>
                  {index < 3 && suggestion.upvotes >= 10 && (
                    <span className="px-2 py-0.5 bg-psychedelic-orange/20 text-psychedelic-orange text-xs font-medium rounded-full whitespace-nowrap">
                      Popular
                    </span>
                  )}
                </div>
                {suggestion.description && (
                  <p className="text-sm text-chocolate/60 mt-1">
                    {suggestion.description}
                  </p>
                )}
                <p className="text-xs text-chocolate/40 mt-2">
                  {formatRelativeTime(suggestion.created_at)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMarkReviewed(suggestion.id)}
                  className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                  title="Mark as reviewed"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(suggestion.id)}
                  className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
