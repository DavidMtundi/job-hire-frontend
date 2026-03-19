import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const backendBaseUrl =
      process.env.NEXT_PUBLIC_BASE_API_URL ||
      process.env.BACKEND_URL ||
      "https://job-hire-backend-production.up.railway.app";

    const res = await fetch(`${backendBaseUrl}/analytics/summary-reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.detail || data?.error || "Failed to generate summary" },
        { status: res.status }
      );
    }

    // backend returns ServiceResult { success, data: { summary } }
    const summary = data?.data?.summary ?? data?.summary ?? "";
    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Summary reports error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate summary" },
      { status: 500 }
    );
  }
}
