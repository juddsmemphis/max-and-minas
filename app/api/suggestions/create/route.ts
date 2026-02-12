import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { flavorName, description, userId } = await request.json();

    if (!flavorName || !flavorName.trim()) {
      return NextResponse.json(
        { error: 'Flavor name is required' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createSupabaseServer() as any;

    const { data, error } = await supabase
      .from('flavor_suggestions')
      .insert({
        flavor_name: flavorName.trim(),
        description: description?.trim() || null,
        suggested_by: userId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating suggestion:', error);
      return NextResponse.json(
        { error: 'Failed to create suggestion' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, suggestion: data });
  } catch (error) {
    console.error('Error in create suggestion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
