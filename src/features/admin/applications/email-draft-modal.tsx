"use client";

import { useState } from "react";
import { Mail, Sparkles, Send, X, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { toast } from "sonner";
import {
  useGenerateShortlistDraftMutation,
  useGenerateRejectionDraftMutation,
  useSendApplicationEmailMutation,
} from "~/apis/applications/email-drafts-queries";
import { IEmailDraft } from "~/apis/applications/email-drafts-dto";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface EmailDraftModalProps {
  applicationId: string;
  candidateName?: string;
  jobTitle?: string;
  trigger?: React.ReactNode;
}

export function EmailDraftModal({
  applicationId,
  candidateName,
  jobTitle,
  trigger,
}: EmailDraftModalProps) {
  const [open, setOpen] = useState(false);
  const [draftType, setDraftType] = useState<"shortlist" | "rejection">("shortlist");
  const [draft, setDraft] = useState<IEmailDraft | null>(null);
  const [nextSteps, setNextSteps] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const generateShortlistMutation = useGenerateShortlistDraftMutation();
  const generateRejectionMutation = useGenerateRejectionDraftMutation();
  const sendEmailMutation = useSendApplicationEmailMutation();

  const handleGenerateDraft = async () => {
    try {
      let result;
      if (draftType === "shortlist") {
        result = await generateShortlistMutation.mutateAsync({
          applicationId,
          request: { next_steps: nextSteps || undefined },
        });
      } else {
        result = await generateRejectionMutation.mutateAsync({
          applicationId,
          request: { rejection_reason: rejectionReason || undefined },
        });
      }

      if (result.success && result.data) {
        setDraft(result.data);
        toast.success("Email draft generated successfully!");
      } else {
        toast.error(result.message || "Failed to generate draft");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to generate email draft");
    }
  };

  const handleSendEmail = async () => {
    if (!draft) {
      toast.error("Please generate a draft first");
      return;
    }

    try {
      const result = await sendEmailMutation.mutateAsync({
        applicationId,
        request: draft,
      });

      if (result.success) {
        toast.success("Email sent successfully!");
        setOpen(false);
        setDraft(null);
        setNextSteps("");
        setRejectionReason("");
      } else {
        toast.error(result.message || "Failed to send email");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to send email");
    }
  };

  const isGenerating =
    generateShortlistMutation.isPending || generateRejectionMutation.isPending;
  const isSending = sendEmailMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI Email Draft
          </DialogTitle>
          <DialogDescription>
            Generate and send professional emails to candidates using AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Draft Type Selection */}
          {!draft && (
            <Tabs value={draftType} onValueChange={(v) => setDraftType(v as "shortlist" | "rejection")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="shortlist">Shortlist Email</TabsTrigger>
                <TabsTrigger value="rejection">Rejection Email</TabsTrigger>
              </TabsList>

              <TabsContent value="shortlist" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Shortlist Email</CardTitle>
                    <CardDescription>
                      Generate a professional email to inform the candidate they've been shortlisted
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="next-steps">Next Steps (Optional)</Label>
                      <Textarea
                        id="next-steps"
                        placeholder="e.g., We will contact you within 3-5 business days to schedule an interview..."
                        value={nextSteps}
                        onChange={(e) => setNextSteps(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={handleGenerateDraft}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Draft
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rejection" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Rejection Email</CardTitle>
                    <CardDescription>
                      Generate a respectful and professional rejection email
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="rejection-reason">Rejection Reason (Optional)</Label>
                      <Textarea
                        id="rejection-reason"
                        placeholder="e.g., We received many qualified applications and have decided to move forward with other candidates..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={handleGenerateDraft}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Draft
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Draft Editor */}
          {draft && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Draft Generated
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDraft(null);
                    setNextSteps("");
                    setRejectionReason("");
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Generate New
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Edit Email Draft</CardTitle>
                  <CardDescription>
                    Review and edit the AI-generated email before sending
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={draft.subject}
                      onChange={(e) =>
                        setDraft({ ...draft, subject: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="greeting">Greeting</Label>
                    <Input
                      id="greeting"
                      value={draft.greeting}
                      onChange={(e) =>
                        setDraft({ ...draft, greeting: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="body">Body</Label>
                    <Textarea
                      id="body"
                      value={draft.body}
                      onChange={(e) =>
                        setDraft({ ...draft, body: e.target.value })
                      }
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="closing">Closing</Label>
                    <Input
                      id="closing"
                      value={draft.closing}
                      onChange={(e) =>
                        setDraft({ ...draft, closing: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="signature">Signature</Label>
                    <Input
                      id="signature"
                      value={draft.signature}
                      onChange={(e) =>
                        setDraft({ ...draft, signature: e.target.value })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-gray-50 space-y-2">
                    <p className="font-semibold text-sm text-gray-600">Subject:</p>
                    <p className="text-sm">{draft.subject}</p>
                    <div className="mt-4 space-y-2 text-sm">
                      <p>{draft.greeting}</p>
                      <p className="whitespace-pre-wrap">{draft.body}</p>
                      <p className="mt-4">{draft.closing}</p>
                      <p className="mt-2">{draft.signature}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDraft(null);
                    setNextSteps("");
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

