"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, Mail, FileText } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useGetEmailTemplatesQuery,
  useCreateEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
  useDeleteEmailTemplateMutation,
} from "~/apis/communications/queries";
import {
  CreateEmailTemplateSchema,
  UpdateEmailTemplateSchema,
  TCreateEmailTemplate,
  TUpdateEmailTemplate,
  TEmailTemplate,
  TEmailTemplateCategory,
} from "~/apis/communications/schemas";
import { Loader2 } from "lucide-react";

const CATEGORY_LABELS: Record<TEmailTemplateCategory, string> = {
  application_acknowledgment: "Application Acknowledgment",
  screening_rejection: "Screening Rejection",
  interview_invitation: "Interview Invitation",
  offer_letter: "Offer Letter",
  rejection_after_interview: "Rejection After Interview",
  reference_check_request: "Reference Check Request",
  shortlist_notification: "Shortlist Notification",
  custom: "Custom",
};

export default function EmailTemplatesScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TEmailTemplate | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<TEmailTemplate | null>(null);

  const { data, isLoading, refetch } = useGetEmailTemplatesQuery();
  const createMutation = useCreateEmailTemplateMutation();
  const updateMutation = useUpdateEmailTemplateMutation();
  const deleteMutation = useDeleteEmailTemplateMutation();

  const templates = data?.data || [];
  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createForm = useForm<TCreateEmailTemplate>({
    resolver: zodResolver(CreateEmailTemplateSchema),
    defaultValues: {
      name: "",
      category: "custom",
      subject: "",
      body: "",
      variables: [],
      is_default: false,
    },
  });

  const updateForm = useForm<TUpdateEmailTemplate>({
    resolver: zodResolver(UpdateEmailTemplateSchema),
  });

  const handleCreate = async (data: TCreateEmailTemplate) => {
    try {
      const result = await createMutation.mutateAsync(data);
      if (result.success) {
        toast.success("Template created successfully!");
        setIsCreateModalOpen(false);
        createForm.reset();
        refetch();
      } else {
        toast.error(result.message || "Failed to create template");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to create template");
    }
  };

  const handleUpdate = async (templateId: string, data: TUpdateEmailTemplate) => {
    try {
      const result = await updateMutation.mutateAsync({ templateId, data });
      if (result.success) {
        toast.success("Template updated successfully!");
        setEditingTemplate(null);
        updateForm.reset();
        refetch();
      } else {
        toast.error(result.message || "Failed to update template");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update template");
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const result = await deleteMutation.mutateAsync(templateId);
      if (result.success) {
        toast.success("Template deleted successfully!");
        refetch();
      } else {
        toast.error(result.message || "Failed to delete template");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete template");
    }
  };

  const openEditModal = (template: TEmailTemplate) => {
    setEditingTemplate(template);
    updateForm.reset({
      name: template.name,
      category: template.category,
      subject: template.subject,
      body: template.body,
      variables: template.variables,
      is_default: template.is_default,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">
            Manage email templates for candidate communications
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
              <DialogDescription>
                Create a new email template with customizable variables
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  {...createForm.register("name")}
                  placeholder="e.g., Interview Invitation"
                />
                {createForm.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {createForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={createForm.watch("category")}
                  onValueChange={(value) =>
                    createForm.setValue("category", value as TEmailTemplateCategory)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  {...createForm.register("subject")}
                  placeholder="e.g., Interview Invitation - {{job_title}}"
                />
                {createForm.formState.errors.subject && (
                  <p className="text-sm text-red-500 mt-1">
                    {createForm.formState.errors.subject.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="body">Email Body *</Label>
                <Textarea
                  id="body"
                  {...createForm.register("body")}
                  rows={10}
                  placeholder="Dear {{candidate_name}}, ..."
                  className="font-mono text-sm"
                />
                {createForm.formState.errors.body && (
                  <p className="text-sm text-red-500 mt-1">
                    {createForm.formState.errors.body.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Use {"{{variable_name}}"} for dynamic content (e.g., {"{{candidate_name}}"})
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Templates Table */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          </CardContent>
        </Card>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? "No templates found matching your search" : "No templates yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Templates ({filteredTemplates.length})</CardTitle>
            <CardDescription>Manage your email templates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Variables</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CATEGORY_LABELS[template.category]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.slice(0, 3).map((varName) => (
                          <Badge key={varName} variant="secondary" className="text-xs">
                            {varName}
                          </Badge>
                        ))}
                        {template.variables.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.variables.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.is_default ? (
                        <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                      ) : (
                        <Badge variant="outline">Custom</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingTemplate(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!template.is_default && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(template.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* View Template Modal */}
      <Dialog open={!!viewingTemplate} onOpenChange={() => setViewingTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewingTemplate?.name}</DialogTitle>
            <DialogDescription>
              {CATEGORY_LABELS[viewingTemplate?.category || "custom"]}
            </DialogDescription>
          </DialogHeader>
          {viewingTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Subject</Label>
                <p className="text-sm text-gray-700 mt-1">{viewingTemplate.subject}</p>
              </div>
              <div>
                <Label>Body</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-700 whitespace-pre-wrap">
                  {viewingTemplate.body}
                </div>
              </div>
              {viewingTemplate.variables.length > 0 && (
                <div>
                  <Label>Available Variables</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {viewingTemplate.variables.map((varName) => (
                      <Badge key={varName} variant="secondary">
                        {"{{" + varName + "}}"}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Template Modal */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>Update template details</DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <form
              onSubmit={updateForm.handleSubmit((data) =>
                handleUpdate(editingTemplate.id, data)
              )}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="edit-name">Template Name</Label>
                <Input
                  id="edit-name"
                  {...updateForm.register("name")}
                  placeholder="e.g., Interview Invitation"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={updateForm.watch("category") || editingTemplate.category}
                  onValueChange={(value) =>
                    updateForm.setValue("category", value as TEmailTemplateCategory)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-subject">Subject</Label>
                <Input
                  id="edit-subject"
                  {...updateForm.register("subject")}
                  placeholder="e.g., Interview Invitation - {{job_title}}"
                />
              </div>
              <div>
                <Label htmlFor="edit-body">Email Body</Label>
                <Textarea
                  id="edit-body"
                  {...updateForm.register("body")}
                  rows={10}
                  placeholder="Dear {{candidate_name}}, ..."
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingTemplate(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Template"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

