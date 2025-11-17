import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ params is a Promise, must await
) {
  const { id } = await params; // ✅ FIX: unwrap params

  if (!id) {
    return NextResponse.json({ message: "ID missing" }, { status: 400 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!project) {
      return NextResponse.json({ message: "Project Not Found" }, { status: 404 });
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}


export async function DELETE(req: Request, context: any) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { message: "Project ID is required" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. DELETE all Scenarios under this project's features
      await tx.scenario.deleteMany({
        where: {
          feature: { projectId: id },
        },
      });

      // 2. DELETE all Features
      await tx.feature.deleteMany({
        where: { projectId: id },
      });

      // 3. DELETE all Members inside Teams of this project
      await tx.member.deleteMany({
        where: {
          team: { projectId: id },
        },
      });

      // 4. DELETE all Staff linked to this project
      await tx.staff.deleteMany({
        where: { projectId: id },
      });

      // 5. DELETE all Teams
      await tx.team.deleteMany({
        where: { projectId: id },
      });

      // 6. DELETE Project
      await tx.project.delete({
        where: { id },
      });
    });

    return NextResponse.json(
      { success: true, message: "Project deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE PROJECT ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error", error },
      { status: 500 }
    );
  }
}
