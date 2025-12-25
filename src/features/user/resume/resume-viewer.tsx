"use client";

import { useEffect, useState } from "react";
import { Spinner } from "~/components/spinner";
import apiClient from "~/lib/axios";

export const ResumeViewer = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await apiClient.get(
          "https://dev-api-hiring.must.company/candidates/get-candidate-resume/35",
          { responseType: "blob" }
        );

        if (response.status !== 200) {
          throw new Error("Failed to fetch PDF");
        }

        // console.log("response", response);

        const blob = response.data;
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPdf();

    // cleanup: revoke url when unmounted
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, []);

  if (!pdfUrl) {
    return <Spinner className="size-6" />
  }

  return (
    <div className="w-full h-full">
      <iframe
        src={pdfUrl}
        className="w-full h-[calc(100vh-12rem)] sm:h-[calc(100vh-10rem)]"
        style={{ border: "none", minHeight: "600px" }}
      />
    </div>
  );
};
