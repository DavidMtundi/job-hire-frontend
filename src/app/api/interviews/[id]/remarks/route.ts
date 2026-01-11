import { NextRequest, NextResponse } from "next/server";
import { authSession } from "~/lib/auth";
import { serverAuthenticatedFetch } from "~/lib/api-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await authSession();
    if (!session?.tokens?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id: interviewId } = await params;

    // Server-side: Use Docker service name or BACKEND_URL env var
    const backendBaseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BASE_API_URL || "http://backend:8002";
    const response = await serverAuthenticatedFetch(
      `${backendBaseUrl}/interviews/${interviewId}/remarks`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(data, { status: response.status });
      }

      return NextResponse.json(data);
    } else {
      const text = await response.text();
      return NextResponse.json(
        {
          error: "Invalid response from backend",
          details: text.substring(0, 200),
          status: response.status,
          contentType: contentType
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error", details: error.toString() },
      { status: 500 }
    );
  }
}
