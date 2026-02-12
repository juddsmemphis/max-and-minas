'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Copy, Check } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getRarityInfo } from '@/lib/rarity';
import type { Flavor } from '@/lib/database.types';

interface ShareToInstagramProps {
  flavor: Flavor;
  onClose: () => void;
}

export function ShareToInstagram({ flavor, onClose }: ShareToInstagramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const rarityInfo = getRarityInfo(flavor);

  useEffect(() => {
    generateImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flavor]);

  const generateImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for Instagram Story (1080x1920)
    canvas.width = 1080;
    canvas.height = 1920;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#9B59B6');
    gradient.addColorStop(0.5, '#FF69B4');
    gradient.addColorStop(1, '#FF8C42');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some decorative circles
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 200 + 100;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // White card background
    const cardX = 80;
    const cardY = 600;
    const cardWidth = canvas.width - 160;
    const cardHeight = 800;
    const cornerRadius = 60;

    ctx.beginPath();
    ctx.moveTo(cardX + cornerRadius, cardY);
    ctx.lineTo(cardX + cardWidth - cornerRadius, cardY);
    ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + cornerRadius);
    ctx.lineTo(cardX + cardWidth, cardY + cardHeight - cornerRadius);
    ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - cornerRadius, cardY + cardHeight);
    ctx.lineTo(cardX + cornerRadius, cardY + cardHeight);
    ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - cornerRadius);
    ctx.lineTo(cardX, cardY + cornerRadius);
    ctx.quadraticCurveTo(cardX, cardY, cardX + cornerRadius, cardY);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();

    // Rarity badge
    const badgeColors: Record<string, string> = {
      legendary: '#FFD700',
      rare: '#9B59B6',
      uncommon: '#00CED1',
      regular: '#BFFF00',
    };
    ctx.fillStyle = badgeColors[rarityInfo.level] || '#9B59B6';
    ctx.beginPath();
    ctx.roundRect(cardX + 60, cardY + 60, 200, 60, 30);
    ctx.fill();

    // Badge text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${rarityInfo.emoji} ${rarityInfo.label}`, cardX + 160, cardY + 100);

    // Flavor name
    ctx.fillStyle = '#4A2C2A';
    ctx.font = 'bold 64px Fredoka One, cursive';
    ctx.textAlign = 'center';

    // Word wrap for long names
    const words = flavor.name.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    const maxWidth = cardWidth - 120;

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    let textY = cardY + 250;
    for (const line of lines) {
      ctx.fillText(line, canvas.width / 2, textY);
      textY += 80;
    }

    // Stats
    ctx.font = '36px Inter, sans-serif';
    ctx.fillStyle = '#4A2C2A';
    ctx.globalAlpha = 0.7;
    ctx.fillText(`Appeared ${flavor.total_appearances} times since ${formatDate(flavor.first_appeared)}`, canvas.width / 2, textY + 60);
    ctx.globalAlpha = 1;

    // Available now text
    ctx.fillStyle = '#9B59B6';
    ctx.font = 'bold 40px Fredoka One, cursive';
    ctx.fillText('AVAILABLE NOW', canvas.width / 2, cardY + cardHeight - 120);

    // Shop name and location
    ctx.fillStyle = '#4A2C2A';
    ctx.globalAlpha = 0.6;
    ctx.font = '28px Inter, sans-serif';
    ctx.fillText("Max & Mina's Ice Cream • Flushing, Queens", canvas.width / 2, cardY + cardHeight - 60);
    ctx.globalAlpha = 1;

    // Header text at top
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Pacifico, cursive';
    ctx.fillText("Max & Mina's", canvas.width / 2, 200);
    ctx.font = '32px Inter, sans-serif';
    ctx.fillText('FLAVOR DROP', canvas.width / 2, 280);

    // Footer
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText('Scan to never miss a drop', canvas.width / 2, canvas.height - 100);

    // Convert to image
    const url = canvas.toDataURL('image/png');
    setImageUrl(url);
  };

  const handleDownload = () => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.download = `${flavor.name.replace(/\s+/g, '-').toLowerCase()}-maxandminas.png`;
    link.href = imageUrl;
    link.click();
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/flavor/${flavor.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md groovy-card p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-chocolate">
            Share to Instagram
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-psychedelic-purple/10 text-chocolate/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="aspect-[9/16] bg-psychedelic-purple/10 rounded-2xl overflow-hidden mb-4">
          {imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt="Share preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="spinner-groovy" />
            </div>
          )}
        </div>

        {/* Hidden canvas for generation */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleDownload}
            className="btn-groovy w-full flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Image
          </button>

          <button
            onClick={handleCopyLink}
            className="btn-outline-groovy w-full flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy Link
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-chocolate/50 text-center mt-4">
          Download the image and share it to your Instagram story
        </p>
      </motion.div>
    </motion.div>
  );
}
