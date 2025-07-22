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

    return NextResponse.json(entries);
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
    const { content, date } = body;

    if (!content || !date) {
      return NextResponse.json(
        { error: 'Content and date are required' },
        { status: 400 }
      );
    }

    // Create the journal entry
    const entry = await prisma.journalEntry.create({
      data: {
        content,
        date: new Date(date),
        userId: user.id,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    );
  }
} 