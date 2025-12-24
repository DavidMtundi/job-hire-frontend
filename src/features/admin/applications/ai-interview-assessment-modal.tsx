"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Zap, DownloadIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

interface AIInterviewAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentData: any;
  application: any;
  scoresData: any;
  isLoadingScores: boolean;
}

export const AIInterviewAssessmentModal = ({
  isOpen,
  onClose,
  assessmentData,
  application,
  scoresData,
  isLoadingScores,
}: AIInterviewAssessmentModalProps) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [isQuestionsExpanded, setIsQuestionsExpanded] = useState(true);

  const answers = scoresData?.data?.answers || [];

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "M/d/yyyy");
    } catch {
      return "N/A";
    }
  };

  const getCorrectAudioUrl = (answerUrl: string) => {
    if (!answerUrl) return "";

    try {
      const urlParts = answerUrl.split('/');
      const audioFilename = urlParts[urlParts.length - 1]; // audio_id.mp3
      const interviewId = urlParts[urlParts.length - 2];
      const applicationId = urlParts[urlParts.length - 3];

      const baseUrl = answerUrl.split('/audio_answers')[0];
      return `${baseUrl}/ai-interview/answer-audio/${applicationId}/${interviewId}/${audioFilename}`;
    } catch (error) {
      console.error("Error parsing audio URL:", error);
      return answerUrl; 
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">AI Technical Screening</DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">{assessmentData.candidateName}</span> • Completed on {formatDate(assessmentData.completedDate)}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="px-4 py-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-sm">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Technical Score</h4>
                <p className="text-3xl font-bold text-gray-900">{assessmentData.technicalScore}%</p>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-white shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all rounded-full"
                    style={{ width: `${assessmentData.technicalScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="px-4 py-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 shadow-sm">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide break-words">Communication Score</h4>
                <p className="text-3xl font-bold text-gray-900">{assessmentData.communicationScore}%</p>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-white shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all rounded-full"
                    style={{ width: `${assessmentData.communicationScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="px-4 py-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 shadow-sm">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Score</h4>
                <p className="text-3xl font-bold text-gray-900">{assessmentData.totalScore}%</p>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-white shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all rounded-full"
                    style={{ width: `${assessmentData.totalScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`flex items-center justify-between p-4 rounded-xl border-2 ${
            assessmentData.status === "PASSED"
              ? "bg-gradient-to-r from-green-50 to-green-100 border-green-200"
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                assessmentData.status === "PASSED"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}></div>
              <span className="text-sm font-semibold text-gray-700">Final Result:</span>
            </div>
            <div className={`px-4 py-2 rounded-full shadow-md ${
              assessmentData.status === "PASSED"
                ? "bg-gradient-to-r from-green-500 to-green-600"
                : "bg-red-500"
            }`}>
              <span className="text-sm font-bold text-white">
                {assessmentData.status} (Threshold: {assessmentData.threshold}%)
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Questions & Responses</h3>
              </div>
              <button
                onClick={() => setIsQuestionsExpanded(!isQuestionsExpanded)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <ChevronDown
                  className={`h-5 w-5 text-gray-600 transition-transform ${
                    isQuestionsExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {isLoadingScores ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Loading questions...</p>
              </div>
            ) : isQuestionsExpanded && answers.length > 0 ? (
              <div className="space-y-3">
                {answers.map((answer: any, index: number) => {
                  const isExpanded = expandedQuestions.has(answer.id);
                  const technicalScore = answer.answer_score !== null ? answer.answer_score : 0;
                  const communicationScore = answer.communication_score !== null ? answer.communication_score : 0;

                  return (
                    <div
                      key={answer.id}
                      className="bg-white rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-all overflow-hidden"
                    >
                      <div
                        className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleQuestion(answer.id)}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                              <span className="text-white font-bold text-base">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">Question {index + 1}</h4>
                              <p className="text-sm text-gray-700 leading-relaxed break-words">{answer.question}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pl-14">
                            <div className="flex items-center gap-2">
                              
                            </div>
                            <div className="flex-shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-600" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-200 p-6 space-y-6 bg-gray-50">
                          {answer.difficulty && (
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-semibold text-gray-700">Difficulty:</label>
                              <div className="px-3 py-1 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full border border-orange-300">
                                <span className="text-xs font-semibold text-orange-700 capitalize">{answer.difficulty}</span>
                              </div>
                            </div>
                          )}

                          {answer.answer_url && (
                            <div className="space-y-3">
                              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Audio Response
                              </label>
                              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                <audio controls className="w-full">
                                  <source src={getCorrectAudioUrl(answer.answer_url)} type="audio/mpeg" />
                                  Your browser does not support the audio element.
                                </audio>
                              </div>
                            </div>
                          )}

                          {answer.answer_transcription && (
                            <div className="space-y-3">
                              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                Answer Transcription
                              </label>
                              <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                <p className="text-sm text-gray-700 leading-relaxed">{answer.answer_transcription}</p>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Technical Score
                              </label>
                              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                                <p className="text-2xl font-bold text-gray-900 mb-3">{technicalScore}/10</p>
                                <div className="relative h-3 w-full overflow-hidden rounded-full bg-white shadow-inner">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all rounded-full"
                                    style={{ width: `${(technicalScore / 10) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                Communication Score
                              </label>
                              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200">
                                <p className="text-2xl font-bold text-gray-900 mb-3">{communicationScore}/10</p>
                                <div className="relative h-3 w-full overflow-hidden rounded-full bg-white shadow-inner">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all rounded-full"
                                    style={{ width: `${(communicationScore / 10) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : isQuestionsExpanded && answers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No questions available</p>
              </div>
            ) : null}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button 
              variant="outline" 
              className="bg-white"
              onClick={() => {
                toast.info("Coming soon!");
              }}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

