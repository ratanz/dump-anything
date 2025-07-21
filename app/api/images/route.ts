import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const images = await prisma.image.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
} 