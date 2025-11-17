import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> } // 👈 params is now a Promise
) {
  try {
    const { id } = await context.params; // ✅ must await

    if (!id) {
      return NextResponse.json({ message: "Team ID missing" }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(team, { status: 200 });
  } catch (error) {
    console.error("GET /api/team/[id] error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: String(error) },
      { status: 500 }
    );
  }
}


// PUT /api/team/[id]
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> } // ✅ params is a Promise in Next.js 16+
) {
  try {
    const { id } = await context.params; // ✅ Await params

    if (!id) {
      return NextResponse.json({ message: "Team ID missing" }, { status: 400 });
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { message: "Team name is required" },
        { status: 400 }
      );
    }

    // ✅ Update team
    const updated = await prisma.team.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PUT /api/team/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to update team", error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/team/[id]
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ message: "Team ID missing" }, { status: 400 });
    }

    // ✅ Delete all members first
    await prisma.member.deleteMany({
      where: { teamId: id },
    });

    // ✅ Then delete team
    await prisma.team.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Team and related members deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/team/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to delete team", error: String(error) },
      { status: 500 }
    );
  }
}


