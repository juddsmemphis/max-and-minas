'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Image as ImageIcon,
  Check,
  X,
  Plus,
  Edit2,
  Loader2,
  ArrowLeft,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { toBase64, cn } from '@/lib/utils';
import { toast } from '@/components/Toast';

interface ParsedFlavor {
  extracted: string;
  existing: { id: string; name: string } | null;
  isNew: boolean;
  confidence: 'high' | 'medium' | 'low';
  soldOut: boolean;
  confirmed: boolean;
  editedName?: string;
}

type Step = 'upload' | 'review' | 'publishing' | 'done';

export default function AdminUpload() {
  useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedFlavors, setParsedFlavors] = useState<ParsedFlavor[]>([]);
  const [menuDate, setMenuDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Process with Claude
    setIsProcessing(true);
    try {
      const base64 = await toBase64(file);

      const response = await fetch('/api/admin/parse-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, menuDate }),
      });

      if (!response.ok) throw new Error('Failed to parse photo');

      const data = await response.json();

      // Initialize parsed flavors with confirmation status
      const flavors: ParsedFlavor[] = data.matched.map(
        (match: ParsedFlavor) => ({
          ...match,
          confirmed: match.confidence === 'high',
        })
      );

      setParsedFlavors(flavors);
      setStep('review');
      toast.success('Photo analyzed!', `Found ${flavors.length} flavors`);
    } catch (error) {
      console.error('Error processing photo:', error);
      toast.error('Failed to process photo', 'Please try again');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleConfirm = (index: number) => {
    setParsedFlavors((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, confirmed: !f.confirmed } : f
      )
    );
  };

  const handleToggleSoldOut = (index: number) => {
    setParsedFlavors((prev) =>
      prev.map((f, i) => (i === index ? { ...f, soldOut: !f.soldOut } : f))
    );
  };

  const handleEditName = (index: number, newName: string) => {
    setParsedFlavors((prev) =>
      prev.map((f, i) =>
        i === index
          ? { ...f, editedName: newName, confirmed: true, isNew: true }
          : f
      )
    );
    setEditingIndex(null);
  };

  const handleRemoveFlavor = (index: number) => {
    setParsedFlavors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddFlavor = () => {
    setParsedFlavors((prev) => [
      ...prev,
      {
        extracted: 'New Flavor',
        existing: null,
        isNew: true,
        confidence: 'low',
        soldOut: false,
        confirmed: true,
        editedName: '',
      },
    ]);
    setEditingIndex(parsedFlavors.length);
  };

  const handlePublish = async () => {
    const confirmedFlavors = parsedFlavors.filter((f) => f.confirmed);

    if (confirmedFlavors.length === 0) {
      toast.error('No flavors selected', 'Please confirm at least one flavor');
      return;
    }

    setStep('publishing');

    try {
      const flavorsToPublish = confirmedFlavors.map((f) => ({
        flavorId: f.existing?.id,
        name: f.editedName || f.existing?.name || f.extracted,
        isNew: f.isNew || !f.existing,
        soldOut: f.soldOut,
      }));

      const response = await fetch('/api/admin/publish-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flavors: flavorsToPublish, menuDate }),
      });

      if (!response.ok) throw new Error('Failed to publish menu');

      const data = await response.json();
      setStep('done');
      toast.success(
        'Menu published!',
        `${data.published} flavors are now live`
      );
    } catch (error) {
      console.error('Error publishing menu:', error);
      toast.error('Failed to publish', 'Please try again');
      setStep('review');
    }
  };

  const confirmedCount = parsedFlavors.filter((f) => f.confirmed).length;

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
            {step === 'upload' && "Upload Today's Menu"}
            {step === 'review' && 'Review Flavors'}
            {step === 'publishing' && 'Publishing...'}
            {step === 'done' && 'Menu Published!'}
          </h1>
          <p className="text-sm text-mm-gray-600">
            {step === 'upload' && 'Take a photo of the flavor board'}
            {step === 'review' && `${confirmedCount} of ${parsedFlavors.length} flavors selected`}
            {step === 'done' && 'Notifications sent to users'}
          </p>
        </div>
      </div>

      {/* Date Picker */}
      {step === 'upload' && (
        <div className="mb-6">
          <label className="block text-sm font-heading font-bold text-mm-black mb-2">
            Menu Date
          </label>
          <input
            type="date"
            value={menuDate}
            onChange={(e) => setMenuDate(e.target.value)}
            className="w-full max-w-xs px-4 py-2 bg-white rounded-lg border-2 border-mm-black text-mm-black focus:outline-none focus:ring-2 focus:ring-mm-blue"
          />
        </div>
      )}

      {/* Upload Step */}
      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Upload Area */}
            <div
              className={cn(
                'relative border-3 border-dashed border-mm-blue/40 rounded-xl p-8 text-center transition-all cursor-pointer hover:border-mm-blue hover:bg-mm-blue/5',
                isProcessing && 'pointer-events-none'
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-96 mx-auto rounded-xl border-2 border-mm-black"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-mm-black/70 rounded-xl flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="w-10 h-10 mx-auto mb-2 animate-spin" />
                        <p className="font-heading font-bold">Analyzing flavors...</p>
                        <p className="text-sm opacity-70">
                          Claude is reading the menu board
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-mm-red flex items-center justify-center border-2 border-mm-black">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-mm-black mb-2">
                    Tap to Take Photo
                  </h3>
                  <p className="text-mm-gray-600 mb-4">
                    Or drag and drop an image here
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-mm-gray-500">
                    <span className="flex items-center gap-1">
                      <Camera className="w-4 h-4" /> Camera
                    </span>
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" /> Gallery
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Review Step */}
        {step === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm mb-4">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-mm-mint border border-mm-black" /> Matched
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-mm-yellow border border-mm-black" /> Review
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-mm-blue border border-mm-black" /> New
              </span>
            </div>

            {/* Flavor List */}
            <div className="space-y-2">
              {parsedFlavors.map((flavor, index) => (
                <motion.div
                  key={index}
                  className={cn(
                    'bg-white border-3 border-mm-black rounded-xl p-4 flex items-center gap-3 shadow-bold-sm',
                    !flavor.confirmed && 'opacity-50'
                  )}
                  layout
                >
                  {/* Confidence Indicator */}
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full flex-shrink-0 border border-mm-black',
                      flavor.confidence === 'high' && 'bg-mm-mint',
                      flavor.confidence === 'medium' && 'bg-mm-yellow',
                      flavor.confidence === 'low' && 'bg-mm-blue'
                    )}
                  />

                  {/* Flavor Name */}
                  <div className="flex-1 min-w-0">
                    {editingIndex === index ? (
                      <input
                        type="text"
                        defaultValue={
                          flavor.editedName ||
                          flavor.existing?.name ||
                          flavor.extracted
                        }
                        className="w-full py-1 px-2 bg-white rounded-lg border-2 border-mm-black text-mm-black focus:outline-none focus:ring-2 focus:ring-mm-blue"
                        autoFocus
                        onBlur={(e) => handleEditName(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleEditName(
                              index,
                              (e.target as HTMLInputElement).value
                            );
                          }
                        }}
                      />
                    ) : (
                      <div>
                        <p className="font-heading font-bold text-mm-black truncate">
                          {flavor.editedName ||
                            flavor.existing?.name ||
                            flavor.extracted}
                        </p>
                        {flavor.existing &&
                          flavor.extracted !== flavor.existing.name && (
                            <p className="text-xs text-mm-gray-500">
                              Detected: &quot;{flavor.extracted}&quot;
                            </p>
                          )}
                      </div>
                    )}
                  </div>

                  {/* Sold Out Toggle */}
                  <button
                    className={cn(
                      'px-2 py-1 rounded-lg text-xs font-heading font-bold transition-colors border-2',
                      flavor.soldOut
                        ? 'bg-mm-red text-white border-mm-black'
                        : 'bg-mm-gray-100 text-mm-gray-500 border-mm-gray-300 hover:bg-mm-gray-200'
                    )}
                    onClick={() => handleToggleSoldOut(index)}
                  >
                    {flavor.soldOut ? 'SOLD OUT' : 'Available'}
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      className="p-2 rounded-lg hover:bg-mm-blue/10 text-mm-gray-500 hover:text-mm-blue transition-colors"
                      onClick={() => setEditingIndex(index)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-mm-red/10 text-mm-gray-500 hover:text-mm-red transition-colors"
                      onClick={() => handleRemoveFlavor(index)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      className={cn(
                        'p-2 rounded-lg transition-colors border-2',
                        flavor.confirmed
                          ? 'bg-mm-mint text-mm-black border-mm-black'
                          : 'bg-mm-gray-100 text-mm-gray-400 border-mm-gray-200 hover:bg-mm-mint/20 hover:text-mm-mint hover:border-mm-mint'
                      )}
                      onClick={() => handleToggleConfirm(index)}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Add New Flavor Button */}
            <button
              className="w-full py-3 border-3 border-dashed border-mm-blue/40 rounded-xl text-mm-blue hover:border-mm-blue hover:bg-mm-blue/5 transition-all flex items-center justify-center gap-2 font-heading font-bold"
              onClick={handleAddFlavor}
            >
              <Plus className="w-5 h-5" />
              Add Flavor Manually
            </button>

            {/* Publish Button */}
            <div className="pt-4 border-t-2 border-mm-gray-200">
              <button
                className="w-full py-4 bg-mm-red text-white font-heading font-bold text-lg rounded-lg border-2 border-mm-black shadow-bold hover:shadow-bold-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:shadow-bold disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                onClick={handlePublish}
                disabled={confirmedCount === 0}
              >
                <Send className="w-5 h-5" />
                Publish {confirmedCount} Flavor{confirmedCount !== 1 && 's'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Publishing Step */}
        {step === 'publishing' && (
          <motion.div
            key="publishing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-mm-red animate-spin" />
            <h3 className="font-heading font-bold text-xl text-mm-black mb-2">
              Publishing Menu...
            </h3>
            <p className="text-mm-gray-600">
              Sending notifications to users
            </p>
          </motion.div>
        )}

        {/* Done Step */}
        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16 text-center"
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-4 rounded-xl bg-mm-mint flex items-center justify-center border-3 border-mm-black"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <Check className="w-10 h-10 text-mm-black" />
            </motion.div>
            <h3 className="font-heading font-bold text-2xl text-mm-black mb-2">
              Menu Published!
            </h3>
            <p className="text-mm-gray-600 mb-8">
              Today&apos;s flavors are now live and users have been notified
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/">
                <button className="px-6 py-3 bg-white text-mm-black font-heading font-bold rounded-lg border-2 border-mm-black shadow-bold-sm hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">View Menu</button>
              </Link>
              <Link href="/admin">
                <button className="px-6 py-3 bg-mm-red text-white font-heading font-bold rounded-lg border-2 border-mm-black shadow-bold-sm hover:shadow-bold hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">Back to Dashboard</button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
