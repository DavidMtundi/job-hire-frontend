import { NextRequest, NextResponse } from "next/server";
import { authSession } from "~/lib/auth";
import { serverAuthenticatedFetch } from "~/lib/api-helpers";

// Allow this API route to be included in static HTML export builds.
export const dynamic = "force-static";

// For `output: "export"`, Next requires `generateStaticParams()` on dynamic routes.
// Returning an empty list avoids prerendering any `/api/applications/[id]` variants.
export async function generateStaticParams() {
  // Placeholder parameter set to satisfy `output: "export"`.
  // This route will still be served dynamically in normal deployments.
  return [{ id: "0" }];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await authSession();
    if (!session?.tokens?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: applicationId } = await params;

    // Server-side: Use Docker service name or BACKEND_URL env var
    const backendBaseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BASE_API_URL || "http://backend:8002";
    const response = await serverAuthenticatedFetch(
      `${backendBaseUrl}/applications/${applicationId}`,
      { method: "GET" }
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

