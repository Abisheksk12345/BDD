import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// DELETE /api/member/[id]
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> } // ✅ Next.js 16 params are a Promise
) {
  try {
    const { id } = await context.params; // ✅ Await params (Next.js 16+)

    if (!id) {
      return NextResponse.json({ message: "Member ID missing" }, { status: 400 });
    }

    // ✅ Check if member exists
    const member = await prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    // ✅ Delete member
    await prisma.member.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Member deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete Member Error:", error);
    return NextResponse.json(
      { message: "Failed to delete member", error: String(error) },
      { status: 500 }
    );
  }
}
