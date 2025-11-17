import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// -----------------------------------------------------
// 🟢 CREATE TEAM
// -----------------------------------------------------
export async function POST(req: Request) {
  try {
    const { name, description, projectId } = await req.json();

    if (!name || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const team = await prisma.team.create({
      data: {
        name,
        description,
        projectId,
      },
      include: { members: true },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/team error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// -----------------------------------------------------
// 🔵 GET TEAMS (all teams or by projectId)
// -----------------------------------------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const teams = await prisma.team.findMany({
      where: { projectId },
      include: {
        members: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(teams, { status: 200 });
  } catch (error) {
    console.error("❌ GET /api/team error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// -----------------------------------------------------
// 🟡 UPDATE TEAM
// -----------------------------------------------------
export async function PUT(req: Request) {
  try {
    const { id, name, description } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Team ID required" }, { status: 400 });
    }

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: {
        name,
        description,
        updatedAt: new Date(),
      },
      include: { members: true },
    });

    return NextResponse.json(updatedTeam, { status: 200 });
  } catch (error) {
    console.error("❌ PUT /api/team error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// -----------------------------------------------------
// 🔴 DELETE TEAM
// -----------------------------------------------------
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing team ID" }, { status: 400 });
    }

    // Delete members first (foreign key constraint)
    await prisma.member.deleteMany({
      where: { teamId: id },
    });

    // Delete team
    await prisma.team.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Team deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ DELETE /api/team error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
