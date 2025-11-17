import {prisma} from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const { scenarios } = await req.json();

  const updates = scenarios.map((s: any) =>
    prisma.scenario.update({
      where: { id: s.id },
      data: { order: s.order },
    })
  );

  await prisma.$transaction(updates);

  return NextResponse.json({ success: true });
}
