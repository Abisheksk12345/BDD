import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// -------------------------------
// CREATE SCENARIO (POST)
// -------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, featureId, testSteps } = body;

    if (!name || !featureId) {
      return NextResponse.json(
        { error: "Name and Feature ID are required" },
        { status: 400 }
      );
    }

    // ⭐ Get last scenario order under this feature
    const lastScenario = await prisma.scenario.findFirst({
      where: { featureId },
      orderBy: { order: "desc" },
    });

    const nextOrder = lastScenario ? lastScenario.order + 1 : 1;

    // ⭐ Create scenario with proper order
    const scenario = await prisma.scenario.create({
      data: {
        name,
        description,
        featureId,
        order: nextOrder,
        testSteps: testSteps ?? [],
      },
    });

    return NextResponse.json(scenario, { status: 201 });
  } catch (err) {
    console.error("SCENARIO POST ERROR:", err);
    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}


// -------------------------------
// GET SCENARIOS BY FEATURE
// -------------------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const featureId = searchParams.get("featureId");

    if (!featureId) {
      return NextResponse.json(
        { error: "Feature ID is required" },
        { status: 400 }
      );
    }

    const scenarios = await prisma.scenario.findMany({
      where: { featureId },
      orderBy: { order: "asc" },  // ⭐ Now sort by order, not createdAt
    });

    return NextResponse.json(scenarios);
  } catch (err) {
    console.error("SCENARIO GET ERROR:", err);
    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}
