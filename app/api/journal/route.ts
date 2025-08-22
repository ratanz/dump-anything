import { NextResponse } from 'next/server';
import { auth } from '../auth/[...nextauth]/route';
import prisma from '@/app/lib/prisma';

// GET handler to fetch all journal entries for the logged-in user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user from the session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch journal entries for this user
    const entries = await prisma.journalEntry.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Process entries to extract mood from content
    const processedEntries = entries.map(entry => {
      let mood = null;
      let content = entry.content;
      
      // Check if content has mood marker - look for [MOOD:X] pattern
      const moodMatch = content.match(/^\[MOOD:(.*?)\]\n/);
      if (moodMatch) {
        mood = moodMatch[1];
        // Remove the mood marker from content
        content = content.replace(/^\[MOOD:(.*?)\]\n/, '');
      }
      
      return {
        ...entry,
        content,
        mood
      };
    });

    return NextResponse.json(processedEntries);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

// POST handler to create a new journal entry
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user from the session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { content, date, mood } = body;

    if (!content || !date) {
      return NextResponse.json(
        { error: 'Content and date are required' },
        { status: 400 }
      );
    }

    // Store mood in the content if it exists
    let finalContent = content;
    if (mood) {
      // Add the mood at the beginning of the content with a special marker
      finalContent = `[MOOD:${mood}]\n${content}`;
    }

    // Create the journal entry
    const entry = await prisma.journalEntry.create({
      data: {
        content: finalContent,
        date: new Date(date),
        userId: user.id,
      },
    });

    // Add the mood to the returned entry for the frontend
    const returnEntry = {
      ...entry,
      content: content, 
      mood: mood || null
    };

    return NextResponse.json(returnEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a journal entry
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user from the session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the entry ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    // First check if the entry exists and belongs to this user
    const entry = await prisma.journalEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      );
    }

    if (entry.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this entry' },
        { status: 403 }
      );
    }

    // Delete the journal entry
    await prisma.journalEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete journal entry' },
      { status: 500 }
    );
  }
} 