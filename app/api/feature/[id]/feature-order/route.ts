import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { features } = await req.json();

  if (!features || !Array.isArray(features)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const updates = features.map((f: any) =>
      prisma.feature.update({
        where: { id: f.id },
        data: { order: f.order },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ message: "Feature order updated" });
  } catch (err) {
    console.error("Feature ORDER update error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
