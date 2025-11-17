import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;  // ✅ MUST AWAIT

  if (!id) {
    return Response.json({ error: "Invalid scenario ID" }, { status: 400 });
  }

  try {
    const scenario = await prisma.scenario.findUnique({
      where: { id },
      include: { feature: true },
    });

    if (!scenario) {
      return Response.json({ error: "Scenario not found" }, { status: 404 });
    }

    return Response.json(scenario);
  } catch (error) {
    console.log("Scenario GET Error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;  // ✅ MUST AWAIT
  const body = await req.json();

  const { name, description, testSteps } = body;

  try {
    const updated = await prisma.scenario.update({
      where: { id },
      data: {
        name,
        description,
        testSteps: testSteps ?? [],
      },
    });

    return Response.json(updated);
  } catch (error) {
    console.log("Scenario UPDATE Error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;  // ✅ MUST AWAIT

  try {
    await prisma.scenario.delete({
      where: { id },
    });

    return Response.json({ message: "Scenario deleted" });
  } catch (error) {
    console.log("Scenario DELETE Error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
