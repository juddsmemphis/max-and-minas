'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Award, Sparkles } from 'lucide-react';

export default function OurStoryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="inline-block px-4 py-2 bg-mm-yellow text-mm-black font-heading font-bold text-sm uppercase tracking-widest rounded-full border-2 border-mm-black mb-4">
          Est. 1997
        </span>
        <h1 className="font-accent text-5xl md:text-6xl text-mm-black mb-4">
          Our Story
        </h1>
        <p className="text-xl text-mm-gray-600 font-medium">
          The OGs of Cereal Ice Cream
        </p>
      </motion.div>

      {/* Owners Photo - Premium Treatment */}
      <motion.div
        className="relative mb-12"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border-3 border-mm-black shadow-bold-lg">
          <Image
            src="/images/owners.jpg"
            alt="Bruce and Mark Becker, owners of Max & Mina's"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-mm-black/60 via-transparent to-transparent" />
          {/* Caption on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-white font-heading font-bold text-xl">
              Bruce & Mark Becker
            </p>
            <p className="text-white/80 text-sm">
              Founders & Ice Cream Innovators
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <StatBox icon={<Calendar className="w-5 h-5" />} value="1997" label="Founded" />
        <StatBox icon={<Sparkles className="w-5 h-5" />} value="15,000+" label="Unique Flavors" />
        <StatBox icon={<MapPin className="w-5 h-5" />} value="Queens" label="Flushing, NY" />
        <StatBox icon={<Award className="w-5 h-5" />} value="#1" label="Most Unique in USA" />
      </motion.div>

      {/* Story Content - Cards instead of paragraphs */}
      <div className="space-y-6">
        <motion.div
          className="bg-white border-3 border-mm-black rounded-xl p-6 shadow-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-mm-pink flex items-center justify-center flex-shrink-0 border-2 border-mm-black">
              <span className="text-2xl">🍦</span>
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl text-mm-black mb-2">
                Where It All Began
              </h3>
              <p className="text-mm-gray-600 leading-relaxed">
                Max & Mina&apos;s is an ice cream scoop shop based in Flushing, Queens, NY.
                Owned by brothers Bruce and Mark Becker, we&apos;ve been serving the community
                since 1997 with one mission: push the boundaries of what ice cream can be.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white border-3 border-mm-black rounded-xl p-6 shadow-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-mm-yellow flex items-center justify-center flex-shrink-0 border-2 border-mm-black">
              <span className="text-2xl">🥣</span>
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl text-mm-black mb-2">
                The OGs of Cereal Ice Cream
              </h3>
              <p className="text-mm-gray-600 leading-relaxed">
                Before cereal milk ice cream was trendy, we were doing it. Our ever-changing
                menu features eccentric flavors like Lox, Purple Mint Chip, beer, corn on the cob,
                and over 15,000 more inventive creations—all made in-house right here in Queens.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white border-3 border-mm-black rounded-xl p-6 shadow-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-mm-mint flex items-center justify-center flex-shrink-0 border-2 border-mm-black">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl text-mm-black mb-2">
                Nationally Recognized
              </h3>
              <p className="text-mm-gray-600 leading-relaxed">
                Named <strong>#1 of the top 10 most unique ice cream parlors in America</strong> in
                &quot;Everybody Loves Ice Cream&quot; by Shannon Jackson Arnold. The Travel Channel
                listed us as &quot;one of America&apos;s most famous ice cream paradises.&quot;
                We&apos;ve been an answer on Hollywood Squares and in Trivial Pursuit!
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <motion.div
        className="mt-12 bg-mm-black text-white rounded-xl p-8 text-center border-3 border-mm-black"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="font-accent text-3xl mb-2">Come Visit Us</h3>
        <p className="text-white/80 mb-6">
          71-26 Main Street, Flushing, NY 11367
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="https://maps.google.com/?q=Max+and+Minas+Flushing"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-white text-mm-black font-heading font-bold text-sm uppercase tracking-wide rounded-lg border-2 border-white hover:bg-mm-yellow transition-colors"
          >
            Get Directions
          </a>
          <a
            href="tel:+17184281168"
            className="px-6 py-3 bg-mm-red text-white font-heading font-bold text-sm uppercase tracking-wide rounded-lg border-2 border-white hover:bg-mm-pink transition-colors"
          >
            Call Us
          </a>
        </div>
      </motion.div>
    </div>
  );
}

function StatBox({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-white border-3 border-mm-black rounded-xl p-4 text-center shadow-bold-sm">
      <div className="flex justify-center text-mm-blue mb-2">{icon}</div>
      <p className="font-heading font-bold text-2xl text-mm-black">{value}</p>
      <p className="text-xs text-mm-gray-500 font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}
