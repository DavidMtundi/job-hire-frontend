"use client";

import { useState } from "react";
import { Mail, Sparkles, Send, X, Loader2, FileText, Eye } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  useGetEmailTemplatesQuery,
  useSendEmailMutation,
  usePreviewTemplateMutation,
  useGenerateAIEmailMutation,
} from "~/apis/communications/queries";
import { TEmailTemplate } from "~/apis/communications/schemas";

interface EnhancedEmailModalProps {
  applicationId: string;
  candidateName?: string;
  jobTitle?: string;
  trigger?: React.ReactNode;
}

export function EnhancedEmailModal({
  applicationId,
  candidateName,
  jobTitle,
  trigger,
}: EnhancedEmailModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<{ subject: string; body: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"template" | "custom">("template");
  
  // AI Generation state
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiTone, setAiTone] = useState<string>("professional");
  const [customSubject, setCustomSubject] = useState<string>("");
  const [customBody, setCustomBody] = useState<string>("");

  const { data: templatesData, isLoading: isLoadingTemplates } = useGetEmailTemplatesQuery();
  const sendEmailMutation = useSendEmailMutation();
  const previewMutation = usePreviewTemplateMutation();
  const generateAIEmailMutation = useGenerateAIEmailMutation();

  const templates = templatesData?.data || [];

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const handlePreview = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select a template first");
      return;
    }

    try {
      const result = await previewMutation.mutateAsync({
        templateId: selectedTemplateId,
        applicationId,
        customVariables,
      });

      if (result.success && result.data) {
        setPreview(result.data);
        toast.success("Preview generated successfully!");
      } else {
        toast.error(result.message || "Failed to generate preview");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to generate preview");
    }
  };

  const handleSendEmail = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select a template");
      return;
    }

    try {
      const result = await sendEmailMutation.mutateAsync({
        application_id: applicationId,
        template_id: selectedTemplateId,
        variables: customVariables,
        custom_template: false,
      });

      if (result.success) {
        toast.success("Email sent successfully!");
        setOpen(false);
        setSelectedTemplateId("");
        setCustomVariables({});
        setPreview(null);
      } else {
        toast.error(result.message || "Failed to send email");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to send email");
    }
  };

  const handleVariableChange = (variable: string, value: string) => {
    setCustomVariables((prev) => ({
      ...prev,
      [variable]: value,
    }));
  };

  const isSending = sendEmailMutation.isPending;
  const isPreviewing = previewMutation.isPending;
  const isGeneratingAI = generateAIEmailMutation.isPending;

  const handleGenerateAIEmail = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please describe what you want the email to be about");
      return;
    }

    try {
      const result = await generateAIEmailMutation.mutateAsync({
        applicationId,
        userPrompt: aiPrompt,
        tone: aiTone,
      });

      if (result.success && result.data) {
        setCustomSubject(result.data.subject || "");
        setCustomBody(result.data.body || "");
        setPreview(result.data);
        toast.success("Email generated successfully! Review and edit if needed.");
      } else {
        toast.error(result.message || "Failed to generate email");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to generate email");
    }
  };

  const handleSendCustomEmail = async () => {
    if (!customSubject.trim() || !customBody.trim()) {
      toast.error("Please provide both subject and body");
      return;
    }

    try {
      const result = await sendEmailMutation.mutateAsync({
        application_id: applicationId,
        subject: customSubject,
        body: customBody,
        custom_template: true,
        variables: {},
      });

      if (result.success) {
        toast.success("Email sent successfully!");
        setOpen(false);
        setCustomSubject("");
        setCustomBody("");
        setAiPrompt("");
        setPreview(null);
      } else {
        toast.error(result.message || "Failed to send email");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to send email");
    }
  };

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
            <Mail className="h-5 w-5 text-blue-600" />
            Send Email to Candidate
          </DialogTitle>
          <DialogDescription>
            Send professional emails using templates or create custom messages
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "template" | "custom")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template">Use Template</TabsTrigger>
            <TabsTrigger value="custom">Custom Email</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4 mt-4">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label htmlFor="template-select">Select Email Template</Label>
              <Select
                value={selectedTemplateId}
                onValueChange={(value) => {
                  setSelectedTemplateId(value);
                  setPreview(null);
                }}
              >
                <SelectTrigger id="template-select">
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingTemplates ? (
                    <SelectItem value="loading" disabled>
                      Loading templates...
                    </SelectItem>
                  ) : templates.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      No templates available
                    </SelectItem>
                  ) : (
                    templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <span>{template.name}</span>
                          {template.is_default && (
                            <Badge variant="outline" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Template Info */}
            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Template Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-gray-600">Category: </span>
                    <Badge variant="outline" className="text-xs">
                      {selectedTemplate.category.replace("_", " ")}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-600">Subject: </span>
                    <span className="text-xs text-gray-700">{selectedTemplate.subject}</span>
                  </div>
                  {selectedTemplate.variables.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-gray-600">Variables: </span>
                      <span className="text-xs text-gray-700">
                        {selectedTemplate.variables.join(", ")}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Custom Variables */}
            {selectedTemplate && selectedTemplate.variables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Customize Variables (Optional)</CardTitle>
                  <CardDescription className="text-xs">
                    Override default values for template variables
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedTemplate.variables.map((variable) => (
                    <div key={variable}>
                      <Label htmlFor={`var-${variable}`} className="text-xs">
                        {variable.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Label>
                      <Input
                        id={`var-${variable}`}
                        value={customVariables[variable] || ""}
                        onChange={(e) => handleVariableChange(variable, e.target.value)}
                        placeholder={`Enter ${variable.replace("_", " ")}`}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Preview Section */}
            {preview && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Email Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold">Subject:</Label>
                    <p className="text-sm text-gray-700 mt-1">{preview.subject}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Body:</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-700 whitespace-pre-wrap">
                      {preview.body}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={!selectedTemplateId || isPreviewing}
              >
                {isPreviewing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </>
                )}
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={!selectedTemplateId || isSending}
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
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 mt-4">
            {/* AI Email Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  AI Email Generator
                </CardTitle>
                <CardDescription>
                  Describe what you want the email to be about, and AI will generate it for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-prompt">What should this email be about?</Label>
                  <Textarea
                    id="ai-prompt"
                    placeholder="e.g., Invite the candidate for a technical interview next week, or Thank them for applying but let them know we're moving forward with other candidates..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    Be specific about the purpose, tone, and any important details
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-tone">Email Tone</Label>
                  <Select value={aiTone} onValueChange={setAiTone}>
                    <SelectTrigger id="ai-tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerateAIEmail}
                  disabled={!aiPrompt.trim() || isGeneratingAI}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Custom Email Editor */}
            {(customSubject || customBody || preview) && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Generated Email</CardTitle>
                  <CardDescription>
                    Review and customize the AI-generated email before sending
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-subject">Subject</Label>
                    <Input
                      id="custom-subject"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Email subject"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-body">Body</Label>
                    <Textarea
                      id="custom-body"
                      value={customBody}
                      onChange={(e) => setCustomBody(e.target.value)}
                      placeholder="Email body"
                      rows={10}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCustomSubject("");
                        setCustomBody("");
                        setPreview(null);
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleSendCustomEmail}
                      disabled={!customSubject.trim() || !customBody.trim() || isSending}
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
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

