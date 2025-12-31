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

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    // Server-side: Use Docker service name or BACKEND_URL env var
    const backendBaseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BASE_API_URL || "http://backend:8002";
    const apiUrl = `${backendBaseUrl}/${applicationId}/remarks`;
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.tokens.accessToken}`,
      },
    });

    let responseData;
    
    try {
      const text = await response.text();
      
      if (text) {
        try {
          responseData = JSON.parse(text);
        } catch {
          return NextResponse.json(
            {
              error: "Invalid response from backend",
              details: text.substring(0, 200),
              status: response.status,
            },
            { status: response.ok ? 200 : response.status }
          );
        }
      } else {
        responseData = [];
      }
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Failed to parse response",
          details: parseError instanceof Error ? parseError.message : String(parseError),
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(responseData, { status: response.status });
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error in GET /api/applications/[id]/remarks:", error);
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        details: error.toString() 
      },
      { status: 500 }
    );
  }
}

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
    const { id: applicationId } = await params;

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    if (!body.user_id || !body.remark || !body.status) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, remark, and status are required" },
        { status: 400 }
      );
    }

    // Server-side: Use Docker service name or BACKEND_URL env var
    const backendBaseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BASE_API_URL || "http://backend:8002";
    const apiUrl = `${backendBaseUrl}/${applicationId}/remarks`;
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.tokens.accessToken}`,
      },
      body: JSON.stringify({
        user_id: body.user_id,
        remark: body.remark,
        status: body.status,
      }),
    });

    const text = await response.text();
    let responseData;

    if (text) {
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = { message: text.trim() || "Done successfully" };
      }
    } else {
      responseData = { message: "Done successfully" };
    }

    if (!response.ok) {
      return NextResponse.json(
        responseData || { error: "Failed to create remark" },
        { status: response.status }
      );
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error in POST /api/applications/[id]/remarks:", error);
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        details: error.toString() 
      },
      { status: 500 }
    );
  }
}

