import { NextRequest, NextResponse } from "next/server";
import { authSession } from "~/lib/auth";

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

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/applications/${applicationId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
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

