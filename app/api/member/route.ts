import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/member
export async function POST(req: Request) {
  try {
    const { teamId, fullName, email, role } = await req.json();

    if (!teamId || !fullName || !email || !role) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    // ✅ Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // ✅ Create member (linked if user exists)
    const member = await prisma.member.create({
      data: {
        teamId,
        fullName,
        email,
        role,
        userId: user ? user.id : null,
      },
    });

    // ✅ Get related projectId from the team
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { projectId: true },
    });

    // ✅ Automatically create staff entry linked to member, team, and project
    await prisma.staff.create({
      data: {
        userId: user ? user.id : null,
        memberId: member.id,
        teamId,
        projectId: team?.projectId ?? null,
      },
    });

    return NextResponse.json(
      { message: "Member & Staff created successfully", member },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add Member Error:", error);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
