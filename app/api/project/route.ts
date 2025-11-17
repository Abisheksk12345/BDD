import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      name,
      key,
      type,
      status,
      description,
      startDate,
      endDate,
      template,
      ownerId,
    } = await req.json();

    // Convert status to ENUM
    const formattedStatus = status
      ?.toUpperCase()
      .replace(" ", "_")
      .replace("-", "_");

    const formattedType = type
      ?.toUpperCase()
      .replace(" ", "_");

    // Auto-generate key if empty
    const projectKey =
      key?.trim() ||
      name.substring(0, 3).toUpperCase() +
        Date.now().toString().slice(-3);

    const project = await prisma.project.create({
      data: {
        name,
        key: projectKey,
        type: formattedType,
        status: formattedStatus,
        description,
        template,
        ownerId: ownerId || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        owner: {
          select: {
            id: true,
            member: {
              select: { fullName: true },
            },
          },
        },
      },
    });

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error", error: error.message },
      { status: 500 }
    );
  }
}



export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: {
            id: true,
            member: {
              select: { fullName: true },
            },
          },
        },
      },
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Something went wrong", error: error.message },
      { status: 500 }
    );
  }
}

 