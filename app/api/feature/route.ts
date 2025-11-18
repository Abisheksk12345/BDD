import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  const features = await prisma.feature.findMany({
    where: { projectId },
    orderBy: { order: "asc" },  // ⭐ FIXED: sort by `order`, not createdAt
    include: {
      scenarios: {
        orderBy: { order: "asc" },   // ⭐ Scenarios also sorted by order
        select: {
          id: true,
          name: true,
          order: true,
        }
      }
    }
  });

  return NextResponse.json(features);
}


export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, projectId } = body;

  if (!name || !projectId) {
    return NextResponse.json({ error: "name and projectId are required" }, { status: 400 });
  }

  // 🔥 Get last order
  const lastFeature = await prisma.feature.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
  });

  const nextOrder = lastFeature ? lastFeature.order + 1 : 1;

  const feature = await prisma.feature.create({
    data: { 
      name, 
      description, 
      projectId,
      order: nextOrder      // ⭐ SUPER IMPORTANT
    }
  });

  return NextResponse.json(feature, { status: 201 });
}



// export async function DELETE(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { id } = params;

//     if (!id) {
//       return NextResponse.json({ error: "Feature ID missing" }, { status: 400 });
//     }

//     // Delete Feature
//     await prisma.feature.delete({
//       where: { id },
//     });

//     return NextResponse.json({ message: "Feature deleted successfully ✅" });
//   } catch (error: any) {
//     console.error("DELETE FEATURE ERROR:", error);
//     return NextResponse.json(
//       { error: error.message || "Failed to delete feature" },
//       { status: 500 }
//     );
//   }
// }
