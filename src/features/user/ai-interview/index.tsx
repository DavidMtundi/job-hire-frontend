"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Mic, Square, RotateCcw, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { useGetAIInterviewQuestionsQuery, useSubmitAnswerMutation, useMarkAIInterviewMutation } from "~/apis/ai-interview/queries";

interface Recording {
  blob: Blob | null;
  duration: number;
  url: string | null;
}

interface QuestionAnswer {
  question: string;
  recording: Recording;
}

type InterviewStep = "interview" | "review" | "submitted";

export default function AIInterviewScreen() {
  const searchParams = useSearchParams();
  const interviewId = searchParams.get("interview_id");
  const jobId = searchParams.get("job_id");
  const applicationId = searchParams.get("application_id");

  const {
    data: questionsData,
    isLoading: isLoadingQuestions,
    error: questionsError,
  } = useGetAIInterviewQuestionsQuery(jobId);

  const submitAnswerMutation = useSubmitAnswerMutation();
  const markAIInterviewMutation = useMarkAIInterviewMutation();

  const [currentStep, setCurrentStep] = useState<InterviewStep>("interview");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [totalInterviewTime, setTotalInterviewTime] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState({ current: 0, total: 0 });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const interviewStartTimeRef = useRef<number>(0);
  const currentlyPlayingAudioRef = useRef<HTMLAudioElement | null>(null);

  const questions = questionsData?.map((q) => q.question) || [];
  const currentAnswer = answers[currentQuestionIndex];
  const hasRecording = currentAnswer?.recording?.blob !== null;

  useEffect(() => {
    if (questionsData && questionsData.length > 0 && answers.length === 0) {
      setAnswers(
        questionsData.map((q) => ({
          question: q.question,
          recording: { blob: null, duration: 0, url: null },
        }))
      );
    }
  }, [questionsData, answers.length]);

  useEffect(() => {
    if (interviewStartTimeRef.current === 0 && !isLoadingQuestions && questionsData) {
      interviewStartTimeRef.current = Date.now();
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isLoadingQuestions, questionsData]);

  const startRecording = async () => {
    if (isRecording || (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording")) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

        const updatedAnswers = [...answers];
        updatedAnswers[currentQuestionIndex].recording = {
          blob: audioBlob,
          duration: duration,
          url: audioUrl,
        };
        setAnswers(updatedAnswers);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        toast.success("Answer recorded successfully!");
      };

      mediaRecorder.onerror = (event: Event) => {
        toast.error("Recording error occurred");
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      startTimeRef.current = Date.now();

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);
    } catch (error) {
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) {
      return;
    }

    const state = mediaRecorderRef.current.state;

    if (state === "recording") {
      try {
        if (typeof mediaRecorderRef.current.requestData === "function") {
          mediaRecorderRef.current.requestData();
        }

        mediaRecorderRef.current.stop();
        setIsRecording(false);

        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      } catch (error) {
        toast.error("Failed to stop recording");
      }
    } else if (state === "inactive") {
      setIsRecording(false);
    } else if (state === "paused") {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      } catch (error) {
      }
    }
  };

  const reRecord = () => {
    setRecordingTime(0);
    const updatedAnswers = [...answers];
    if (updatedAnswers[currentQuestionIndex]?.recording?.url) {
      URL.revokeObjectURL(updatedAnswers[currentQuestionIndex].recording.url!);
    }
    if (updatedAnswers[currentQuestionIndex]) {
      updatedAnswers[currentQuestionIndex].recording = {
        blob: null,
        duration: 0,
        url: null,
      };
      setAnswers(updatedAnswers);
    }
  };

  const goToNextQuestion = async () => {
    if (!interviewId) {
      toast.error("Interview ID is missing");
      return;
    }

    if (!applicationId) {
      toast.error("Application ID is missing");
      return;
    }

    const currentAnswer = answers[currentQuestionIndex];
    const questionData = questionsData?.find((q) => q.question === currentAnswer?.question);
        const answerToSubmit = currentAnswer?.recording?.blob 
      ? {
          applicationId,
          interviewId,
          question: currentAnswer.question,
          difficulty: questionData?.difficulty || "",
          audioFile: currentAnswer.recording.blob,
        }
      : null;

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setRecordingTime(0);
    } else {
      const totalTime = answers.reduce((sum, answer) => sum + (answer.recording?.duration || 0), 0);
      setTotalInterviewTime(totalTime);
      setCurrentStep("review");
    }

    if (answerToSubmit && answerToSubmit.difficulty) {
      setTimeout(() => {
        submitAnswerMutation.mutate(answerToSubmit, {
          onSuccess: () => {
            console.log("Answer submitted successfully for question:", answerToSubmit.question);
          },
          onError: (error) => {
            console.error("Failed to submit answer:", error);
          }
        });
      }, 100);
    }
  };

  const handleAudioPlay = (audioElement: HTMLAudioElement) => {
    if (currentlyPlayingAudioRef.current && currentlyPlayingAudioRef.current !== audioElement) {
      currentlyPlayingAudioRef.current.pause();
    }
    currentlyPlayingAudioRef.current = audioElement;
  };

  const handleSubmit = async () => {
    if (!interviewId) {
      toast.error("Interview ID is missing");
      return;
    }

    if (!applicationId) {
      toast.error("Application ID is missing");
      return;
    }

    setIsSubmitting(true);

    try {
        await markAIInterviewMutation.mutateAsync({
        applicationId,
        interviewId,
        isAiInterview: false,
      });

      const submissionData = {
        submitted: true,
        totalQuestions: questions.length,
        totalTime: totalInterviewTime,
        submittedAt: new Date().toISOString(),
      };

      const existingSubmissions = localStorage.getItem("ai_interview_submissions");
      const submissions = existingSubmissions ? JSON.parse(existingSubmissions) : {};
      submissions[interviewId] = submissionData;
      localStorage.setItem("ai_interview_submissions", JSON.stringify(submissions));

      toast.success("Interview completed successfully!");
      setCurrentStep("submitted");
    } catch (error) {
      toast.error("Failed to complete interview. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTotalTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins} minute${mins > 1 ? "s" : ""} ${secs} second${secs !== 1 ? "s" : ""}`;
    }
    return `${secs} second${secs !== 1 ? "s" : ""}`;
  };

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center animate-pulse">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Interview</h1>
              <p className="text-gray-600">Please wait while we prepare your interview questions...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questionsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Interview</h1>
              <p className="text-gray-600">
                {questionsError.message || "Failed to load interview questions. Please try again."}
              </p>
            </div>
            <Button onClick={() => window.close()} variant="outline" className="w-full">
              Close Window
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === "submitted") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
              <p className="text-gray-600">
                Your AI interview has been submitted successfully.
              </p>
            </div>
            <p className="text-sm text-gray-500">You can now close this tab.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === "review") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Your Answers</h1>
              <p className="text-gray-600">Review your recorded answers before submitting</p>
            </CardContent>
          </Card>

          {/* Time Taken Card */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-blue-600">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Time Taken</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatTotalTime(totalInterviewTime)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Out of</p>
                  <p className="text-xl font-semibold text-blue-600">15 minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Answers List */}
          <div className="space-y-4">
            {answers.map((answer, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-blue-600">
                          Question {index + 1}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium">{answer.question}</p>
                    </div>

                    {answer.recording.url ? (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Recorded Answer</span>
                          <span className="text-sm font-medium text-gray-900">
                            Duration: {formatTime(answer.recording.duration)}
                          </span>
                        </div>
                        <audio
                          controls
                          className="w-full"
                          src={answer.recording.url}
                          onPlay={(e) => handleAudioPlay(e.currentTarget)}
                        />
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">No answer recorded</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Button */}
          <Card>
            <CardContent className="p-6">
              <Button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-lg py-6"
              >
                Submit Interview
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (questions.length === 0 || answers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center animate-pulse">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Interview</h1>
              <p className="text-gray-600">Please wait while we prepare your interview questions...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-6">
        {/* Progress Bar */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 mb-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card>
          <CardContent className="p-8">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{questions[currentQuestionIndex]}</h2>
                <p className="text-gray-600">Click the microphone button below to record your answer</p>
              </div>

              {/* Recording Section */}
              <div className="flex flex-col items-center space-y-6">
                {/* Recording Time Display */}
                {(isRecording || hasRecording) && (
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900 font-mono">{formatTime(recordingTime)}</p>
                  </div>
                )}

                {/* Record Button */}
                {!hasRecording && (
                  <div className="relative">
                    {isRecording && (
                      <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping pointer-events-none" />
                    )}
                    <Button
                      type="button"
                      onClick={() => {
                        const currentState = mediaRecorderRef.current?.state;
                        if (currentState === "recording") {
                          stopRecording();
                        } else {
                          startRecording();
                        }
                      }}
                      className={cn(
                        "w-32 h-32 rounded-full transition-all duration-300 relative z-10",
                        isRecording
                          ? "bg-red-500 hover:bg-red-600 animate-pulse"
                          : "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                      )}
                    >
                      {isRecording ? (
                        <Square className="w-12 h-12 text-white" />
                      ) : (
                        <Mic className="w-12 h-12 text-white" />
                      )}
                    </Button>
                  </div>
                )}

                {/* Re-record and Next Buttons */}
                {hasRecording && currentAnswer && (
                  <div className="flex flex-col items-center gap-4 w-full">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full">
                      <div className="flex items-center justify-center gap-2 text-green-700">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">Answer recorded!</span>
                      </div>
                    </div>

                    {currentAnswer?.recording?.url && (
                      <audio
                        controls
                        className="w-full"
                        src={currentAnswer.recording.url}
                        onPlay={(e) => handleAudioPlay(e.currentTarget)}
                      />
                    )}


                    <div className="flex gap-3 w-full">
                      <Button onClick={reRecord} variant="outline" className="flex-1 gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Re-record
                      </Button>
                      <Button
                        onClick={goToNextQuestion}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                      >
                        {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Review Answers"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Instruction Text */}
                {!hasRecording && !isRecording && (
                  <p className="text-sm text-gray-500 text-center">Tap the microphone to start recording</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
