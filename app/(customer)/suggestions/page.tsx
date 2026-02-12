'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  ThumbsUp,
  Plus,
  X,
  Send,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { toast } from '@/components/Toast';
import { createSupabaseBrowser } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { FlavorSuggestion } from '@/lib/database.types';

type SortOption = 'upvotes' | 'newest';

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<FlavorSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('upvotes');
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const { user } = useStore();

  // Form state
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSuggestions();
    loadUserVotes();
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
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserVotes = async () => {
    if (!user) return;

    const supabase = createSupabaseBrowser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('flavor_suggestion_votes')
      .select('suggestion_id')
      .eq('user_id', user.id);

    if (data) {
      setVotedIds(new Set(data.map((v: { suggestion_id: string }) => v.suggestion_id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim()) {
      toast.error('Please enter a flavor name');
      return;
    }

    setIsSubmitting(true);
    const supabase = createSupabaseBrowser();

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('flavor_suggestions')
        .insert({
          flavor_name: newName.trim(),
          description: newDescription.trim() || null,
          suggested_by: user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;

      setSuggestions((prev) => [data, ...prev]);
      setNewName('');
      setNewDescription('');
      setShowForm(false);
      toast.success('Suggestion submitted!', 'Thanks for sharing your idea');
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast.error('Failed to submit', 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (suggestionId: string) => {
    if (!user) {
      toast.info('Sign in to vote', 'Create an account to upvote suggestions');
      return;
    }

    const hasVoted = votedIds.has(suggestionId);
    const supabase = createSupabaseBrowser();

    try {
      if (hasVoted) {
        // Remove vote
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('flavor_suggestion_votes')
          .delete()
          .eq('suggestion_id', suggestionId)
          .eq('user_id', user.id);

        // Update local state
        setVotedIds((prev) => {
          const next = new Set(prev);
          next.delete(suggestionId);
          return next;
        });

        // Update suggestion count
        setSuggestions((prev) =>
          prev.map((s) =>
            s.id === suggestionId ? { ...s, upvotes: s.upvotes - 1 } : s
          )
        );
      } else {
        // Add vote
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('flavor_suggestion_votes').insert({
          suggestion_id: suggestionId,
          user_id: user.id,
        });

        // Update local state
        setVotedIds((prev) => new Set([...Array.from(prev), suggestionId]));

        // Update suggestion count
        setSuggestions((prev) =>
          prev.map((s) =>
            s.id === suggestionId ? { ...s, upvotes: s.upvotes + 1 } : s
          )
        );
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote', 'Please try again');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl text-chocolate mb-2">
          Flavor Suggestions
        </h1>
        <p className="text-chocolate/60">
          Vote for ideas you&apos;d love to see at Max &amp; Mina&apos;s
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
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

        <motion.button
          className="btn-groovy flex items-center gap-2"
          onClick={() => setShowForm(true)}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          Suggest
        </motion.button>
      </div>

      {/* Suggestion Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="w-full max-w-md groovy-card p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-chocolate">
                  Suggest a Flavor
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 rounded-lg hover:bg-psychedelic-purple/10 text-chocolate/60"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-chocolate mb-1">
                    Flavor Name *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Boba Milk Tea"
                    className="input-groovy w-full"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-chocolate mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="What makes this flavor special?"
                    className="input-groovy w-full h-24 resize-none"
                    maxLength={500}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !newName.trim()}
                  className="btn-groovy w-full flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Suggestion
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="groovy-card p-4 animate-pulse">
              <div className="h-6 bg-psychedelic-purple/10 rounded w-3/4 mb-2" />
              <div className="h-4 bg-psychedelic-purple/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <EmptyState
          type="suggestions"
          action={
            <button
              onClick={() => setShowForm(true)}
              className="btn-groovy flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              Be the First!
            </button>
          }
        />
      ) : (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {suggestions.map((suggestion, index) => {
            const hasVoted = votedIds.has(suggestion.id);

            return (
              <motion.div
                key={suggestion.id}
                className="groovy-card p-4 flex items-start gap-4"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                {/* Vote Button */}
                <motion.button
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors',
                    hasVoted
                      ? 'bg-psychedelic-purple text-white'
                      : 'bg-psychedelic-purple/10 text-psychedelic-purple hover:bg-psychedelic-purple/20'
                  )}
                  onClick={() => handleVote(suggestion.id)}
                  whileTap={{ scale: 0.95 }}
                >
                  <ThumbsUp
                    className={cn('w-5 h-5', hasVoted && 'fill-current')}
                  />
                  <span className="text-sm font-semibold">
                    {suggestion.upvotes}
                  </span>
                </motion.button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg text-chocolate">
                      {suggestion.flavor_name}
                    </h3>
                    {index < 3 && (
                      <span className="px-2 py-0.5 bg-psychedelic-orange/20 text-psychedelic-orange text-xs font-medium rounded-full">
                        #{index + 1}
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
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
