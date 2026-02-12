import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createSupabaseServer } from '@/lib/supabase';
import { fuzzyMatch } from '@/lib/utils';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ExtractedFlavor {
  name: string;
  soldOut: boolean;
}

interface ParsedResult {
  extracted: ExtractedFlavor[];
  matched: Array<{
    extracted: string;
    existing: { id: string; name: string } | null;
    isNew: boolean;
    confidence: 'high' | 'medium' | 'low';
    soldOut: boolean;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, menuDate } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Call Claude Vision to extract flavors
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Extract all ice cream flavor names from this menu board photo.

Rules:
1. Return ONLY a valid JSON array
2. Each item should have this structure: {"name": "Flavor Name", "soldOut": false}
3. If you see "SOLD OUT", "X", or strikethrough next to a flavor, set soldOut to true
4. Be precise with flavor names - copy them exactly as written
5. Include ALL flavors visible on the board
6. Don't invent or guess flavors that aren't clearly visible

Example output:
[
  {"name": "Ube Horchata", "soldOut": false},
  {"name": "Mango Sticky Rice", "soldOut": true},
  {"name": "Black Sesame", "soldOut": false}
]

Return ONLY the JSON array, no other text.`,
            },
          ],
        },
      ],
    });

    // Parse Claude's response
    let extractedFlavors: ExtractedFlavor[] = [];
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        extractedFlavors = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse flavor names from image' },
        { status: 500 }
      );
    }

    // Fetch existing flavors from database
    const supabase = createSupabaseServer();
    const { data: existingFlavors, error: fetchError } = await supabase
      .from('flavors')
      .select('id, name')
      .order('name');

    if (fetchError) {
      console.error('Database error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch existing flavors' },
        { status: 500 }
      );
    }

    // Match extracted flavors against existing ones
    const matchedResults = extractedFlavors.map((extracted) => {
      const matches = fuzzyMatch(
        extracted.name,
        existingFlavors || [],
        3 // Levenshtein distance threshold
      );

      const bestMatch = matches[0];

      if (bestMatch && bestMatch.distance === 0) {
        // Exact match
        return {
          extracted: extracted.name,
          existing: { id: bestMatch.id, name: bestMatch.name },
          isNew: false,
          confidence: 'high' as const,
          soldOut: extracted.soldOut,
        };
      } else if (bestMatch && bestMatch.distance <= 2) {
        // Close match - needs review
        return {
          extracted: extracted.name,
          existing: { id: bestMatch.id, name: bestMatch.name },
          isNew: false,
          confidence: 'medium' as const,
          soldOut: extracted.soldOut,
        };
      } else {
        // New flavor
        return {
          extracted: extracted.name,
          existing: null,
          isNew: true,
          confidence: 'low' as const,
          soldOut: extracted.soldOut,
        };
      }
    });

    // Store the photo and raw response for reference
    if (menuDate) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('flavor_photos').insert({
        image_url: 'uploaded', // We'd store actual URL if uploading to storage
        menu_date: menuDate,
        claude_response: {
          raw: responseText,
          extracted: extractedFlavors,
        },
        processed: false,
      });
    }

    const result: ParsedResult = {
      extracted: extractedFlavors,
      matched: matchedResults,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error parsing photo:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
