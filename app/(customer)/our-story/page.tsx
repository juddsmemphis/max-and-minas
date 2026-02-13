'use client';

import Image from 'next/image';

export default function OurStoryPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl text-chocolate mb-2">
          Our Story
        </h1>
      </div>

      {/* Owners Photo */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
          <Image
            src="/images/owners.jpg"
            alt="Bruce and Mark Becker, owners of Max & Mina's"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Story Text */}
      <div className="text-center space-y-6">
        <p className="text-chocolate/80 leading-relaxed">
          Max and Mina&apos;s is an ice cream scoop shop, based in Flushing, Queens, NY, opened in 1997. Owned by brothers Bruce and Mark Becker, it is known for being the OGs of cereal ice cream, and for its ever-changing eccentric ice cream flavors, such as Lox, Purple Mint Chip, beer, corn on the cob, and over 15,000 more inventive menu options - all made in house at their shop in Queens.
        </p>

        <p className="text-chocolate/80 leading-relaxed">
          Max and Mina&apos;s was named number 1 of the top 10 most unique ice cream parlors in America, in Everybody Loves Ice Cream; the Whole Scoop on America&apos;s favorite treat by Shannon Jackson Arnold; The Travel Channel listed the shop as &quot;one of America&apos;s most famous ice cream paradises.&quot; Some famous Manhattan restaurants offer Max &amp; Mina&apos;s Ice Cream on their dessert menus. The store has been an answer on Hollywood Squares, and in recent versions of Trivial Pursuit.
        </p>
      </div>
    </div>
  );
}
