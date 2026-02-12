import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { suggestionId, userId, action } = await request.json();

    if (!suggestionId || !userId) {
      return NextResponse.json(
        { error: 'Suggestion ID and User ID are required' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createSupabaseServer() as any;

    if (action === 'remove') {
      // Remove vote
      const { error: deleteError } = await supabase
        .from('flavor_suggestion_votes')
        .delete()
        .eq('suggestion_id', suggestionId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Update vote count
      const { data: suggestion } = await supabase
        .from('flavor_suggestions')
        .select('upvotes')
        .eq('id', suggestionId)
        .single();

      if (suggestion) {
        await supabase
          .from('flavor_suggestions')
          .update({ upvotes: Math.max(0, suggestion.upvotes - 1) })
          .eq('id', suggestionId);
      }

      return NextResponse.json({ success: true, action: 'removed' });
    } else {
      // Add vote
      const { error: insertError } = await supabase
        .from('flavor_suggestion_votes')
        .insert({
          suggestion_id: suggestionId,
          user_id: userId,
        });

      if (insertError) {
        // Check if it's a duplicate key error
        if (insertError.code === '23505') {
          return NextResponse.json(
            { error: 'Already voted' },
            { status: 400 }
          );
        }
        throw insertError;
      }

      // Update vote count
      const { data: suggestion } = await supabase
        .from('flavor_suggestions')
        .select('upvotes')
        .eq('id', suggestionId)
        .single();

      if (suggestion) {
        await supabase
          .from('flavor_suggestions')
          .update({ upvotes: suggestion.upvotes + 1 })
          .eq('id', suggestionId);
      }

      return NextResponse.json({ success: true, action: 'added' });
    }
  } catch (error) {
    console.error('Error in vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
