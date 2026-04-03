"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Spinner } from "~/components/spinner";
import apiClient from "~/lib/axios";

export const ResumeViewer = () => {
  const { data: session, status } = useSession();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = session?.user?.id;
    if (status === "loading") {
      return;
    }
    if (!userId) {
      setError("Sign in to view your resume.");
      return;
    }

    let cancelled = false;
    let blobUrl: string | null = null;

    const fetchPdf = async () => {
      setError(null);
      setPdfUrl(null);
      try {
        const response = await apiClient.get(`/candidates/get-candidate-resume/${userId}`, {
          responseType: "blob",
        });

        if (response.status !== 200) {
          throw new Error("Failed to fetch PDF");
        }

        const blob = response.data;
        const url = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        blobUrl = url;
        setPdfUrl(url);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Could not load your resume. Try again or re-upload from your profile.");
        }
      }
    };

    void fetchPdf();

    return () => {
      cancelled = true;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [session?.user?.id, status]);

  if (status === "loading" || (!pdfUrl && !error)) {
    return <Spinner className="size-6" />;
  }

  if (error) {
    return <p className="text-sm text-muted-foreground">{error}</p>;
  }

  if (!pdfUrl) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <iframe
        src={pdfUrl}
        className="w-full h-[calc(100vh-12rem)] sm:h-[calc(100vh-10rem)]"
        style={{ border: "none", minHeight: "600px" }}
        title="Resume preview"
      />
    </div>
  );
};
