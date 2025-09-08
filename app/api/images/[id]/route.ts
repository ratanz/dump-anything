import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// Next.js provides params as a Promise in strict mode types
type RouteContext = { params: Promise<{ id: string }> };

// GET /api/images/[id]
export async function GET(req: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    return NextResponse.json(image, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}

// DELETE /api/images/[id]
export async function DELETE(req: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    const existing = await prisma.image.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    await prisma.image.delete({ where: { id } });
    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
