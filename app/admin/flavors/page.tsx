'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  IceCream2,
} from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase';
import { toast } from '@/components/Toast';

interface Flavor {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  tags: string[] | null;
  first_appeared: string;
  last_appeared: string | null;
  total_appearances: number;
  rarity_score: number | null;
}

const CATEGORIES = [
  'creamy',
  'fruity',
  'chocolate',
  'nutty',
  'unique',
  'savory',
  'seasonal',
  'vegan',
  'floral',
];

export default function FlavorManagementPage() {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingFlavor, setEditingFlavor] = useState<Flavor | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New flavor form state
  const [newFlavor, setNewFlavor] = useState({
    name: '',
    description: '',
    category: '',
    rarity_score: 5,
    first_appeared: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadFlavors();
  }, []);

  const loadFlavors = async () => {
    setIsLoading(true);
    const supabase = createSupabaseBrowser();

    try {
      const { data, error } = await supabase
        .from('flavors')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setFlavors(data || []);
    } catch (error) {
      console.error('Error loading flavors:', error);
      toast.error('Failed to load flavors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFlavor = async (flavor: Flavor) => {
    setIsSaving(true);
    const supabase = createSupabaseBrowser();

    try {
      const { error } = await supabase
        .from('flavors')
        .update({
          name: flavor.name,
          description: flavor.description,
          category: flavor.category,
          rarity_score: flavor.rarity_score,
          first_appeared: flavor.first_appeared,
          last_appeared: flavor.last_appeared,
          total_appearances: flavor.total_appearances,
        })
        .eq('id', flavor.id);

      if (error) throw error;

      setFlavors(prev => prev.map(f => f.id === flavor.id ? flavor : f));
      setEditingFlavor(null);
      toast.success('Flavor updated!');
    } catch (error) {
      console.error('Error saving flavor:', error);
      toast.error('Failed to save flavor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateFlavor = async () => {
    if (!newFlavor.name.trim()) {
      toast.error('Flavor name is required');
      return;
    }

    setIsSaving(true);
    const supabase = createSupabaseBrowser();

    try {
      const { data, error } = await supabase
        .from('flavors')
        .insert({
          name: newFlavor.name,
          description: newFlavor.description || null,
          category: newFlavor.category || null,
          rarity_score: newFlavor.rarity_score,
          first_appeared: newFlavor.first_appeared,
          total_appearances: 1,
        })
        .select()
        .single();

      if (error) throw error;

      setFlavors(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setIsCreating(false);
      setNewFlavor({
        name: '',
        description: '',
        category: '',
        rarity_score: 5,
        first_appeared: new Date().toISOString().split('T')[0],
      });
      toast.success('Flavor created!');
    } catch (error) {
      console.error('Error creating flavor:', error);
      toast.error('Failed to create flavor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFlavor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flavor?')) return;

    const supabase = createSupabaseBrowser();

    try {
      const { error } = await supabase
        .from('flavors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFlavors(prev => prev.filter(f => f.id !== id));
      toast.success('Flavor deleted');
    } catch (error) {
      console.error('Error deleting flavor:', error);
      toast.error('Failed to delete flavor');
    }
  };

  const filteredFlavors = flavors.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRarityLabel = (score: number | null) => {
    if (!score) return 'Unknown';
    if (score >= 8) return 'Legendary';
    if (score >= 6) return 'Rare';
    if (score >= 4) return 'Uncommon';
    return 'Common';
  };

  const getRarityColor = (score: number | null) => {
    if (!score) return 'text-gray-500';
    if (score >= 8) return 'text-yellow-600';
    if (score >= 6) return 'text-purple-600';
    if (score >= 4) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin"
          className="p-2 rounded-xl bg-white/50 text-dead-red hover:bg-white/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl text-chocolate">Manage Flavors</h1>
          <p className="text-chocolate/60 text-sm">{flavors.length} total flavors</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="btn-groovy flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Flavor
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search flavors..."
          className="input-groovy w-full pl-10"
        />
      </div>

      {/* Create Flavor Modal */}
      {isCreating && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 w-full max-w-lg"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-chocolate">Add New Flavor</h2>
              <button onClick={() => setIsCreating(false)} className="text-chocolate/50 hover:text-chocolate">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-chocolate mb-1">Name *</label>
                <input
                  type="text"
                  value={newFlavor.name}
                  onChange={(e) => setNewFlavor(prev => ({ ...prev, name: e.target.value }))}
                  className="input-groovy w-full"
                  placeholder="e.g., Black Sesame"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-chocolate mb-1">Description</label>
                <textarea
                  value={newFlavor.description}
                  onChange={(e) => setNewFlavor(prev => ({ ...prev, description: e.target.value }))}
                  className="input-groovy w-full h-20 resize-none"
                  placeholder="Describe the flavor..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-chocolate mb-1">Category</label>
                  <select
                    value={newFlavor.category}
                    onChange={(e) => setNewFlavor(prev => ({ ...prev, category: e.target.value }))}
                    className="input-groovy w-full"
                  >
                    <option value="">Select...</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-chocolate mb-1">
                    Rarity (0-10): {newFlavor.rarity_score}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={newFlavor.rarity_score}
                    onChange={(e) => setNewFlavor(prev => ({ ...prev, rarity_score: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-chocolate mb-1">First Appeared</label>
                <input
                  type="date"
                  value={newFlavor.first_appeared}
                  onChange={(e) => setNewFlavor(prev => ({ ...prev, first_appeared: e.target.value }))}
                  className="input-groovy w-full"
                />
              </div>

              <button
                onClick={handleCreateFlavor}
                disabled={isSaving}
                className="btn-groovy w-full flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {isSaving ? 'Creating...' : 'Create Flavor'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Flavor List */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-dead-red" />
          <p className="text-chocolate/60 mt-2">Loading flavors...</p>
        </div>
      ) : filteredFlavors.length === 0 ? (
        <div className="text-center py-12">
          <IceCream2 className="w-12 h-12 mx-auto text-chocolate/30 mb-4" />
          <p className="text-chocolate/60">No flavors found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFlavors.map((flavor) => (
            <motion.div
              key={flavor.id}
              className="groovy-card p-4"
              layout
            >
              {editingFlavor?.id === flavor.id ? (
                // Edit Mode
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editingFlavor.name}
                    onChange={(e) => setEditingFlavor(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="input-groovy w-full font-medium"
                  />
                  <textarea
                    value={editingFlavor.description || ''}
                    onChange={(e) => setEditingFlavor(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="input-groovy w-full h-16 resize-none text-sm"
                    placeholder="Description..."
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-chocolate/60">Category</label>
                      <select
                        value={editingFlavor.category || ''}
                        onChange={(e) => setEditingFlavor(prev => prev ? { ...prev, category: e.target.value } : null)}
                        className="input-groovy w-full text-sm"
                      >
                        <option value="">None</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-chocolate/60">Rarity: {editingFlavor.rarity_score}</label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={editingFlavor.rarity_score || 5}
                        onChange={(e) => setEditingFlavor(prev => prev ? { ...prev, rarity_score: parseFloat(e.target.value) } : null)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-chocolate/60">Appearances</label>
                      <input
                        type="number"
                        value={editingFlavor.total_appearances}
                        onChange={(e) => setEditingFlavor(prev => prev ? { ...prev, total_appearances: parseInt(e.target.value) || 0 } : null)}
                        className="input-groovy w-full text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveFlavor(editingFlavor)}
                      disabled={isSaving}
                      className="btn-groovy flex-1 flex items-center justify-center gap-2"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                    <button
                      onClick={() => setEditingFlavor(null)}
                      className="btn-outline-groovy"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-chocolate">{flavor.name}</h3>
                      <span className={`text-xs font-medium ${getRarityColor(flavor.rarity_score)}`}>
                        {getRarityLabel(flavor.rarity_score)}
                      </span>
                    </div>
                    {flavor.description && (
                      <p className="text-sm text-chocolate/60 mt-1 line-clamp-1">{flavor.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-chocolate/50">
                      {flavor.category && <span className="capitalize">{flavor.category}</span>}
                      <span>{flavor.total_appearances} appearances</span>
                      <span>Since {new Date(flavor.first_appeared).getFullYear()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingFlavor(flavor)}
                      className="p-2 rounded-lg hover:bg-dead-red/10 text-dead-red transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFlavor(flavor.id)}
                      className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
