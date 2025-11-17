import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// GET /api/staff/list
export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        member: {
          select: {
            fullName: true,
            email: true,
            role: true,
          },
        },
        team: {
          select: {
            name: true,
          },
        },
        project: {
          select: {
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}
