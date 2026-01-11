"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";
import { useGenerateJobWithAIMutation } from "~/apis/jobs/queries";

const languages = [
  { label: "English", value: "en" },
  { label: "Urdu", value: "ur" },
  { label: "Arabic", value: "ar" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Chinese", value: "zh" },
  { label: "Japanese", value: "ja" },
];

interface AIJobGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobGenerated: (jobData: any) => void;
}

export function AIJobGenerationDialog({
  open,
  onOpenChange,
  onJobGenerated,
}: AIJobGenerationDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("en");

  const { mutate: generateJob, isPending } = useGenerateJobWithAIMutation();

  // Log when dialog opens
  useEffect(() => {
    if (open) {
      console.log("========================================");
      console.log("[AI Dialog] ✅ DIALOG OPENED - Ready for AI job generation");
      console.log("[AI Dialog] Current state:", {
        open,
        promptLength: prompt.length,
        language,
        isPending,
        hasMutation: !!generateJob,
      });
      console.log("========================================");
    }
  }, [open]);

  // CRITICAL FIX: Prevent any navigation when dialog is open or when form is being submitted
  useEffect(() => {
    if (!open) return;

    console.log("[AI Dialog] Dialog opened - setting up navigation blockers");

    // Block all form submissions on the page when dialog is open (defense in depth)
    const handleFormSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      // Only block if it's NOT our dialog form
      if (form.id !== "ai-job-generation-form" && open) {
        console.warn("[AI Dialog] Blocking form submission from:", form.id || form.className || "unknown form");
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    // Prevent browser back/forward navigation when dialog is open
    const handlePopState = (e: PopStateEvent) => {
      if (open && isPending) {
        console.warn("[AI Dialog] PopState blocked while dialog is open and pending");
        e.preventDefault();
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    // Add listeners with capture to catch early
    document.addEventListener("submit", handleFormSubmit, true);
    window.addEventListener('popstate', handlePopState, true);

    return () => {
      document.removeEventListener("submit", handleFormSubmit, true);
      window.removeEventListener('popstate', handlePopState, true);
      console.log("[AI Dialog] Dialog closed - navigation blockers removed");
    };
  }, [open, isPending]);


  const handleGenerate = () => {
    console.log("========================================");
    console.log("[AI Dialog] 🚀 handleGenerate() CALLED");
    console.log("[AI Dialog] Entry point - Current state:", {
      prompt,
      promptLength: prompt.length,
      promptTrimmed: prompt.trim(),
      language,
      isPending,
      mutationAvailable: !!generateJob,
      timestamp: new Date().toISOString(),
    });
    console.log("========================================");
    debugger; // BREAKPOINT 1: Function entry - check prompt, language, isPending state
    
    if (!prompt.trim()) {
      console.warn("[AI Dialog] ⚠️ Validation failed: Empty prompt");
      debugger; // BREAKPOINT 2: Empty prompt validation
      toast.error("Please enter a job description prompt");
      return;
    }

    console.log("[AI Dialog] ✅ Validation passed: Prompt is valid");
    console.log("[AI Dialog] 📤 Preparing API request to /jobs/ai-generate");
    console.log("[AI Dialog] Request payload:", {
      text: prompt,
      language,
      save: false,
    });
    
    debugger; // BREAKPOINT 3: Before API call - verify mutation function is available
    console.log("[AI Dialog] Mutation function available:", !!generateJob);
    console.log("[AI Dialog] Calling generateJob mutation now...");

    const requestStartTime = Date.now();
    console.log("[AI Dialog] ⏱️ API Request started at:", new Date().toISOString());

    generateJob(
      {
        text: prompt,
        language,
        save: false,
      },
      {
        onSuccess: (response) => {
          const requestDuration = Date.now() - requestStartTime;
          console.log("========================================");
          console.log("[AI Dialog] ✅ SUCCESS: Job generation completed!");
          console.log("[AI Dialog] Request duration:", requestDuration, "ms");
          console.log("[AI Dialog] Full response:", JSON.stringify(response, null, 2));
          console.log("[AI Dialog] Response data:", response?.data);
          debugger; // BREAKPOINT 4: Success handler - inspect response data
          
          toast.success("Job generated successfully!");
          onJobGenerated(response.data);
          onOpenChange(false);
          setPrompt("");
          setLanguage("en");
          console.log("[AI Dialog] Dialog closed and state reset");
          console.log("========================================");
        },
        onError: (error: any) => {
          const requestDuration = Date.now() - requestStartTime;
          console.log("========================================");
          console.log("[AI Dialog] ❌ ERROR: Job generation failed!");
          console.log("[AI Dialog] Request duration before error:", requestDuration, "ms");
          debugger; // BREAKPOINT 5: Error handler - inspect error object
          
          console.log("[AI Dialog] Error object structure:", {
            errorType: typeof error,
            errorConstructor: error?.constructor?.name,
            errorKeys: error ? Object.keys(error) : [],
            hasResponse: !!error?.response,
            hasRequest: !!error?.request,
            hasConfig: !!error?.config,
            isAxiosError: error?.isAxiosError,
          });
          
          console.log("[AI Dialog] Error details:", {
            message: error?.message,
            code: error?.code,
            status: error?.response?.status || error?.status,
            statusText: error?.response?.statusText,
            responseData: error?.response?.data,
            requestUrl: error?.config?.url,
            requestMethod: error?.config?.method,
            requestHeaders: error?.config?.headers ? Object.keys(error?.config?.headers) : [],
            authHeaderPresent: !!error?.config?.headers?.Authorization,
            authHeaderValue: error?.config?.headers?.Authorization ? error.config.headers.Authorization.substring(0, 50) + "..." : "MISSING",
          });
          
          // Check if this is an authentication error that was prevented
          if (error?.isAuthError || error?.code === "AUTH_REQUIRED") {
            console.error("[AI Dialog] 🔒 AUTHENTICATION ERROR: Request was prevented - token not available");
            console.error("[AI Dialog] This means the token could not be retrieved before making the request");
            toast.error("Authentication required. Please refresh the page and log in again.");
            console.log("========================================");
            return; // Don't proceed, user needs to login
          }
          
          // Extract detailed error message from API response
          const errorMessage = 
            error?.response?.data?.detail ||
            error?.response?.data?.message ||
            error?.message ||
            "Failed to generate job";
          
          // Check for 401 specifically
          if (error?.response?.status === 401 || error?.status === 401) {
            console.error("[AI Dialog] 🔒 401 UNAUTHORIZED: Authentication failed on backend");
            console.error("[AI Dialog] This means the request reached the backend but token was invalid/missing");
            console.error("[AI Dialog] Full error details:", {
              message: errorMessage,
              status: error?.response?.status || error?.status,
              hasAuthHeader: !!error?.config?.headers?.Authorization,
              authHeaderPreview: error?.config?.headers?.Authorization?.substring(0, 50) + "...",
              responseData: error?.response?.data,
              requestConfig: {
                url: error?.config?.url,
                method: error?.config?.method,
                baseURL: error?.config?.baseURL,
              },
            });
            
            toast.error("Authentication expired. Please refresh the page and try again.");
            console.log("========================================");
            return; // Prevent further processing
          }
          
          // Check for network errors
          if (!error?.response) {
            console.error("[AI Dialog] 🌐 NETWORK ERROR: Request did not reach the backend");
            console.error("[AI Dialog] This could mean:", {
              backendIsDown: "Backend server is not responding",
              networkIssue: "Network connectivity problem",
              corsIssue: "CORS policy blocking the request",
              timeout: "Request timed out",
            });
          }
          
          console.error("[AI Dialog] Generation failed with error:", {
            message: errorMessage,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            fullError: error,
            errorType: error?.constructor?.name,
            errorKeys: error ? Object.keys(error) : [],
          });
          
          toast.error(errorMessage);
          console.log("========================================");
        },
      }
    );
    
    debugger; // BREAKPOINT 6: After mutation call - verify it was triggered
    console.log("[AI Dialog] ✅ Mutation function called - request should be in flight now");
    console.log("[AI Dialog] Waiting for API response...");
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        // Prevent closing if generation is in progress
        if (isPending && !newOpen) {
          console.warn("[AI Dialog] Attempted to close dialog while generation is pending - blocking");
          return;
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent 
        className="sm:max-w-[525px]"
        onInteractOutside={(e) => {
          // Prevent closing dialog when clicking outside during generation
          if (isPending) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent ESC from closing if generation is pending
          if (isPending) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          // Additional prevention for outside clicks
          if (isPending) {
            e.preventDefault();
          }
        }}
      >
        {/* CRITICAL: Wrap form in a div to prevent bubbling to parent forms */}
        <div
          onClick={(e) => {
            // Prevent any click events from bubbling to parent forms
            e.stopPropagation();
          }}
        >
        <form
          id="ai-job-generation-form"
          action="javascript:void(0)" // CRITICAL: Use javascript:void(0) to absolutely prevent any form action
          method="post" // Explicitly set method (even though we prevent submission)
          autoComplete="off" // Disable autocomplete to prevent browser interference
          onSubmit={(e) => {
            console.log("========================================");
            console.log("[AI Dialog] 📋 FORM onSubmit EVENT TRIGGERED");
            console.log("[AI Dialog] Form submission event details:", {
              defaultPrevented: e.defaultPrevented,
              isPropagationStopped: e.isPropagationStopped,
              target: e.target,
              currentTarget: e.currentTarget,
              timestamp: new Date().toISOString(),
            });
            debugger; // BREAKPOINT 12: Form submission event
            
            // CRITICAL: Always prevent default form submission - this is the key fix
            e.preventDefault();
            e.stopPropagation();
            console.log("[AI Dialog] ✅ preventDefault() and stopPropagation() called");
            
            // Access native event for stopImmediatePropagation
            const nativeEvent = e.nativeEvent || (e as any).originalEvent;
            if (nativeEvent && typeof nativeEvent.stopImmediatePropagation === 'function') {
              nativeEvent.stopImmediatePropagation();
              console.log("[AI Dialog] ✅ stopImmediatePropagation() called on native event");
            }
            
            // Prevent any navigation that might happen - multiple layers of protection
            if (typeof window !== "undefined") {
              console.log("[AI Dialog] Setting up navigation blockers...");
              // Block any navigation attempts
              const blockNavigation = (event: Event) => {
                console.warn("[AI Dialog] 🛑 Navigation attempt blocked:", event.type);
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
              };
              
              window.addEventListener('beforeunload', blockNavigation, { capture: true });
              setTimeout(() => {
                window.removeEventListener('beforeunload', blockNavigation, { capture: true });
              }, 100);
            }
            
            console.log("[AI Dialog] Checking conditions for handleGenerate...");
            if (prompt.trim() && !isPending) {
              debugger; // BREAKPOINT 13: Form submission conditions met
              console.log("[AI Dialog] ✅ Form submission conditions MET - calling handleGenerate()");
              handleGenerate();
            } else {
              debugger; // BREAKPOINT 14: Form submission blocked
              console.warn("[AI Dialog] ⚠️ Form submission BLOCKED - conditions not met:", {
                hasPrompt: !!prompt.trim(),
                promptValue: prompt,
                isPending,
              });
            }
            
            console.log("[AI Dialog] Form onSubmit handler complete");
            return false; // Additional prevention - explicit false return
          }}
          noValidate // Prevent browser validation that might cause issues
        >
        <DialogHeader>
          <DialogTitle>Generate Job with AI</DialogTitle>
          <DialogDescription>
            Describe the job you want to create and AI will generate a complete
            job description for you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="prompt">Job Description Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="e.g., I want a Python developer with 3 years of experience"
              value={prompt}
              onChange={(e) => {
                const newValue = e.target.value;
                console.log("[AI Dialog] 📝 Prompt text changed:", {
                  oldLength: prompt.length,
                  newLength: newValue.length,
                  value: newValue.substring(0, 50) + (newValue.length > 50 ? "..." : ""),
                });
                setPrompt(newValue);
              }}
              rows={4}
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={language}
              onValueChange={setLanguage}
              disabled={isPending}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenChange(false);
              }}
            disabled={isPending}
              type="button"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isPending || !prompt.trim()}
            onClick={(e) => {
              console.log("========================================");
              console.log("[AI Dialog] 🖱️ GENERATE BUTTON CLICKED");
              console.log("[AI Dialog] Button click event:", {
                isPending,
                hasPrompt: !!prompt.trim(),
                promptLength: prompt.trim().length,
                promptPreview: prompt.substring(0, 50) + "...",
                language,
                timestamp: new Date().toISOString(),
              });
              debugger; // BREAKPOINT 11: Generate button clicked
              // Form onSubmit will handle the actual generation
              // But log here for visibility
              console.log("[AI Dialog] Button click handler complete - form onSubmit will be triggered");
            }}
          >
            {isPending ? "Generating..." : "Generate Job"}
          </Button>
        </DialogFooter>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
