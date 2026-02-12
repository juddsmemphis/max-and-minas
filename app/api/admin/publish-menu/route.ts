import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';
import { calculateRarityScore } from '@/lib/rarity';
import {
  sendDailyDropNotification,
  sendWatchlistAlertNotification,
} from '@/lib/onesignal';
import { differenceInDays } from 'date-fns';

interface FlavorToPublish {
  flavorId?: string;
  name: string;
  isNew: boolean;
  category?: string;
  tags?: string[];
  soldOut?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { flavors, menuDate } = await request.json();

    if (!flavors || !Array.isArray(flavors) || flavors.length === 0) {
      return NextResponse.json(
        { error: 'Flavors array is required' },
        { status: 400 }
      );
    }

    const date = menuDate || new Date().toISOString().split('T')[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createSupabaseServer() as any;

    // Clear existing menu for this date
    await supabase.from('daily_menu').delete().eq('menu_date', date);

    const publishedFlavors: Array<{
      flavorId: string;
      name: string;
      isNew: boolean;
      appearanceNumber: number;
      daysSinceLast: number | null;
    }> = [];

    for (const flavor of flavors as FlavorToPublish[]) {
      let flavorId = flavor.flavorId;

      // If it's a new flavor, create it first
      if (flavor.isNew || !flavorId) {
        const { data: newFlavor, error: insertError } = await supabase
          .from('flavors')
          .insert({
            name: flavor.name,
            category: flavor.category || null,
            tags: flavor.tags || [],
            first_appeared: date,
            last_appeared: date,
            total_appearances: 1,
            total_days_available: 1,
            rarity_score: 5.0, // Default for new flavors
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating new flavor:', insertError);
          continue;
        }

        flavorId = newFlavor.id;
        publishedFlavors.push({
          flavorId: flavorId as string,
          name: flavor.name,
          isNew: true,
          appearanceNumber: 1,
          daysSinceLast: null,
        });
      } else {
        // Update existing flavor
        const { data: existingFlavor } = await supabase
          .from('flavors')
          .select('*')
          .eq('id', flavorId)
          .single();

        if (existingFlavor) {
          const daysSinceLast = existingFlavor.last_appeared
            ? differenceInDays(new Date(date), new Date(existingFlavor.last_appeared))
            : null;

          const newAppearances = existingFlavor.total_appearances + 1;

          // Update flavor record
          const updatedFlavor = {
            ...existingFlavor,
            last_appeared: date,
            total_appearances: newAppearances,
            total_days_available: existingFlavor.total_days_available + 1,
          };

          // Recalculate rarity score
          const rarityScore = calculateRarityScore(updatedFlavor);

          await supabase
            .from('flavors')
            .update({
              last_appeared: date,
              total_appearances: newAppearances,
              total_days_available: existingFlavor.total_days_available + 1,
              rarity_score: rarityScore,
              updated_at: new Date().toISOString(),
            })
            .eq('id', flavorId);

          publishedFlavors.push({
            flavorId,
            name: existingFlavor.name,
            isNew: false,
            appearanceNumber: newAppearances,
            daysSinceLast,
          });
        }
      }

      // Add to daily menu
      if (flavorId) {
        await supabase.from('daily_menu').insert({
          flavor_id: flavorId,
          menu_date: date,
          appearance_number: publishedFlavors.find((f) => f.flavorId === flavorId)
            ?.appearanceNumber,
          days_since_last: publishedFlavors.find((f) => f.flavorId === flavorId)
            ?.daysSinceLast,
          sold_out_at: flavor.soldOut ? new Date().toISOString() : null,
        });
      }
    }

    // Send notifications
    const rareCount = publishedFlavors.filter((f) => {
      // Consider it rare if it's appeared less than 10 times
      return f.appearanceNumber < 10;
    }).length;

    // Send daily drop notification to all users
    await sendDailyDropNotification(publishedFlavors.length, rareCount);

    // Send watchlist alerts
    const flavorIds = publishedFlavors.map((f) => f.flavorId);

    // Get users watching these flavors
    const { data: watchlistMatches } = await supabase
      .from('user_watchlists')
      .select('user_id, flavor_id, flavors!inner(name)')
      .in('flavor_id', flavorIds)
      .eq('alert_enabled', true);

    if (watchlistMatches && watchlistMatches.length > 0) {
      // Group by flavor to send batch notifications
      const flavorUserMap = new Map<
        string,
        { users: string[]; name: string; daysSinceLast: number | null }
      >();

      for (const match of watchlistMatches) {
        const flavorInfo = publishedFlavors.find(
          (f) => f.flavorId === match.flavor_id
        );
        if (!flavorInfo) continue;

        const existing = flavorUserMap.get(match.flavor_id);
        if (existing) {
          existing.users.push(match.user_id);
        } else {
          flavorUserMap.set(match.flavor_id, {
            users: [match.user_id],
            name: flavorInfo.name,
            daysSinceLast: flavorInfo.daysSinceLast,
          });
        }
      }

      // Send notifications for each flavor
      for (const [, flavorData] of Array.from(flavorUserMap)) {
        await sendWatchlistAlertNotification(
          flavorData.users,
          flavorData.name,
          flavorData.daysSinceLast
        );
      }
    }

    // Mark the photo as processed
    await supabase
      .from('flavor_photos')
      .update({ processed: true })
      .eq('menu_date', date)
      .eq('processed', false);

    return NextResponse.json({
      success: true,
      published: publishedFlavors.length,
      date,
      flavors: publishedFlavors,
      notificationsSent: {
        daily: true,
        watchlist: watchlistMatches?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error publishing menu:', error);
    return NextResponse.json(
      { error: 'Failed to publish menu' },
      { status: 500 }
    );
  }
}
