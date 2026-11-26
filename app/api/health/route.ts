import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENROUTER_API_KEY",
] as const;

export async function GET() {
  const missingEnv = REQUIRED_ENV_VARS.filter(
    (key) => !process.env[key]?.trim()
  );

  if (missingEnv.length > 0) {
    return NextResponse.json(
      {
        status: "degraded",
        database: "unknown",
        missingEnv,
      },
      { status: 503 }
    );
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: "unhealthy",
          database: "error",
          error: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
