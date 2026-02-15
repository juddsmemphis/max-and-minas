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
            className="p-3 rounded-lg bg-white text-mm-red border-2 border-mm-black shadow-bold-sm hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
        </Link>
        <div>
          <h1 className="font-heading font-bold text-2xl text-mm-black">
            Customer Suggestions
          </h1>
          <p className="text-sm text-mm-gray-600">
            {suggestions.length} ideas from the community
          </p>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mm-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search suggestions..."
            className="w-full pl-10 pr-4 py-3 bg-white rounded-lg border-2 border-mm-black text-mm-black placeholder:text-mm-gray-400 focus:outline-none focus:ring-2 focus:ring-mm-blue"
          />
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 border-2 border-mm-black">
          <button
            onClick={() => setSortBy('upvotes')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-heading font-bold transition-colors flex items-center gap-1',
              sortBy === 'upvotes'
                ? 'bg-mm-blue text-white'
                : 'text-mm-gray-600 hover:text-mm-black'
            )}
          >
            <TrendingUp className="w-4 h-4" />
            Top
          </button>
          <button
            onClick={() => setSortBy('newest')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-heading font-bold transition-colors flex items-center gap-1',
              sortBy === 'newest'
                ? 'bg-mm-blue text-white'
                : 'text-mm-gray-600 hover:text-mm-black'
            )}
          >
            <Clock className="w-4 h-4" />
            New
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border-3 border-mm-black rounded-xl p-4 text-center shadow-bold-sm">
          <p className="font-heading font-bold text-2xl text-mm-blue">
            {suggestions.length}
          </p>
          <p className="text-xs text-mm-gray-500 font-medium">Total Ideas</p>
        </div>
        <div className="bg-white border-3 border-mm-black rounded-xl p-4 text-center shadow-bold-sm">
          <p className="font-heading font-bold text-2xl text-mm-pink">
            {suggestions.reduce((acc, s) => acc + s.upvotes, 0)}
          </p>
          <p className="text-xs text-mm-gray-500 font-medium">Total Votes</p>
        </div>
        <div className="bg-white border-3 border-mm-black rounded-xl p-4 text-center shadow-bold-sm">
          <p className="font-heading font-bold text-2xl text-mm-orange">
            {suggestions.filter((s) => s.upvotes >= 10).length}
          </p>
          <p className="text-xs text-mm-gray-500 font-medium">Popular (10+)</p>
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
              className="bg-white border-3 border-mm-black rounded-xl p-4 flex items-start gap-4 shadow-bold-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Vote Count */}
              <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-mm-blue/10 text-mm-blue min-w-[60px] border-2 border-mm-blue/30">
                <ThumbsUp className="w-5 h-5" />
                <span className="text-lg font-heading font-bold">
                  {suggestion.upvotes}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading font-bold text-lg text-mm-black">
                    {suggestion.flavor_name}
                  </h3>
                  {index < 3 && suggestion.upvotes >= 10 && (
                    <span className="px-2 py-0.5 bg-mm-orange text-white text-xs font-heading font-bold rounded-full whitespace-nowrap border border-mm-black/20">
                      Popular
                    </span>
                  )}
                </div>
                {suggestion.description && (
                  <p className="text-sm text-mm-gray-600 mt-1">
                    {suggestion.description}
                  </p>
                )}
                <p className="text-xs text-mm-gray-400 mt-2">
                  {formatRelativeTime(suggestion.created_at)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMarkReviewed(suggestion.id)}
                  className="p-2 rounded-lg hover:bg-mm-mint/20 text-mm-mint transition-colors"
                  title="Mark as reviewed"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(suggestion.id)}
                  className="p-2 rounded-lg hover:bg-mm-red/10 text-mm-red transition-colors"
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
