import { NextRequest, NextResponse } from "next/server";
import { authSession } from "~/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await authSession();
    if (!session?.tokens?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Server-side (API route): Use Docker service name when in Docker
    // In Docker, use service name "backend", otherwise use localhost
    // Priority: NEXT_PUBLIC_BASE_API_URL > BACKEND_URL > Docker service name > localhost
    const backendBaseUrl = process.env.NEXT_PUBLIC_BASE_API_URL || process.env.BACKEND_URL || "http://backend:8002";
    const backendUrl = `${backendBaseUrl}/interviews`;
    console.log("Proxying interview creation to:", backendUrl);
    console.log("Request body:", JSON.stringify(body, null, 2));

    let response: Response;
    try {
      response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
        body: JSON.stringify(body),
      });
    } catch (fetchError: any) {
      console.error("Failed to connect to backend:", fetchError);
      return NextResponse.json(
        { 
          error: "Connection error",
          message: "Failed to connect to backend server. Please try again."
        },
        { status: 503 }
      );
    }

    // Try to parse response
    let responseData: any;
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        return NextResponse.json(
          { 
            error: "Invalid response format",
            message: "Backend returned invalid JSON response"
          },
          { status: 500 }
        );
      }

      if (!response.ok) {
        console.error("Backend error response:", {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        });
        // Return the backend error response
        return NextResponse.json(
          responseData || { error: "Backend error", status: response.status },
          { status: response.status }
        );
      }

      console.log("Interview created successfully:", responseData);
      return NextResponse.json(responseData);
    } else {
      // Non-JSON response - try to read as text
      let text: string;
      try {
        text = await response.text();
      } catch (textError) {
        console.error("Failed to read response text:", textError);
        return NextResponse.json(
          { 
            error: "Invalid response from backend",
            message: `Backend returned status ${response.status} with unreadable content`
          },
          { status: response.status || 500 }
        );
      }
      
      console.error("Backend returned non-JSON response:", {
        status: response.status,
        statusText: response.statusText,
        text: text.substring(0, 500),
      });
      
      // If status is OK but non-JSON, try to parse or return success
      if (response.ok) {
        return NextResponse.json(
          { message: "Interview created successfully", rawResponse: text.substring(0, 200) },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Invalid response from backend", 
          message: `Backend returned status ${response.status}`,
          details: text.substring(0, 200) 
        },
        { status: response.status }
      );
    }
  } catch (error: any) {
    console.error("Error creating interview:", {
      message: error.message,
      stack: error.stack,
      error: error,
    });
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error.message || "Failed to create interview"
      },
      { status: 500 }
    );
  }
}

