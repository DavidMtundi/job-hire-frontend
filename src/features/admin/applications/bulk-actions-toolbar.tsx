"use client";

import { useState } from "react";
import { Table } from "@tanstack/react-table";
import { TApplication } from "~/apis/applications/schemas";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Mail, MoreVertical, UserCheck, Tag, Trash2, FileDown } from "lucide-react";
import { toast } from "sonner";
import {
  useBulkUpdateStatusMutation,
  useBulkAssignRecruiterMutation,
  useBulkSendEmailMutation,
} from "~/apis/bulk-operations/queries";
import { useGetEmailTemplatesQuery } from "~/apis/communications/queries";
import { useGetStatusListQuery } from "~/apis/applications/queries";
import { Loader2 } from "lucide-react";

interface BulkActionsToolbarProps {
  table: Table<TApplication>;
}

export function BulkActionsToolbar({ table }: BulkActionsToolbarProps) {
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [isAssignRecruiterOpen, setIsAssignRecruiterOpen] = useState(false);
  const [isSendEmailOpen, setIsSendEmailOpen] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState<string>("");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [selectedRecruiterId, setSelectedRecruiterId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const selectedApplicationIds = selectedRows.map((row) => row.original.id);

  const { data: statusList } = useGetStatusListQuery();
  const { data: templatesData } = useGetEmailTemplatesQuery();
  const updateStatusMutation = useBulkUpdateStatusMutation();
  const assignRecruiterMutation = useBulkAssignRecruiterMutation();
  const sendEmailMutation = useBulkSendEmailMutation();

  const templates = templatesData?.data || [];

  const handleBulkUpdateStatus = async () => {
    if (!selectedStatusId) {
      toast.error("Please select a status");
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        application_ids: selectedApplicationIds,
        status_id: parseInt(selectedStatusId),
        remarks: statusRemarks || undefined,
      });
      setIsUpdateStatusOpen(false);
      setSelectedStatusId("");
      setStatusRemarks("");
      table.resetRowSelection();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update status");
    }
  };

  const handleBulkAssignRecruiter = async () => {
    if (!selectedRecruiterId) {
      toast.error("Please select a recruiter");
      return;
    }

    try {
      await assignRecruiterMutation.mutateAsync({
        application_ids: selectedApplicationIds,
        recruiter_id: selectedRecruiterId,
      });
      setIsAssignRecruiterOpen(false);
      setSelectedRecruiterId("");
      table.resetRowSelection();
    } catch (error: any) {
      toast.error(error?.message || "Failed to assign recruiter");
    }
  };

  const handleBulkSendEmail = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select an email template");
      return;
    }

    try {
      await sendEmailMutation.mutateAsync({
        application_ids: selectedApplicationIds,
        template_id: selectedTemplateId,
        variables: {},
      });
      setIsSendEmailOpen(false);
      setSelectedTemplateId("");
      table.resetRowSelection();
    } catch (error: any) {
      toast.error(error?.message || "Failed to send emails");
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} application{selectedCount !== 1 ? "s" : ""} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUpdateStatusOpen(true)}
            disabled={updateStatusMutation.isPending}
          >
            <Tag className="h-4 w-4 mr-2" />
            Update Status
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAssignRecruiterOpen(true)}
            disabled={assignRecruiterMutation.isPending}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Assign Recruiter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSendEmailOpen(true)}
            disabled={sendEmailMutation.isPending}
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.resetRowSelection()}
          >
            Clear Selection
          </Button>
        </div>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status for {selectedCount} Application(s)</DialogTitle>
            <DialogDescription>
              Select a new status for all selected applications
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status-select">Status *</Label>
              <Select value={selectedStatusId} onValueChange={setSelectedStatusId}>
                <SelectTrigger id="status-select">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  {statusList?.map((status) => (
                    <SelectItem key={status.id} value={status.id.toString()}>
                      {status.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                value={statusRemarks}
                onChange={(e) => setStatusRemarks(e.target.value)}
                placeholder="Add any notes about this status change..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsUpdateStatusOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkUpdateStatus}
                disabled={!selectedStatusId || updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Recruiter Dialog */}
      <Dialog open={isAssignRecruiterOpen} onOpenChange={setIsAssignRecruiterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Recruiter to {selectedCount} Application(s)</DialogTitle>
            <DialogDescription>
              Assign a recruiter to all selected applications
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recruiter-select">Recruiter *</Label>
              <Select value={selectedRecruiterId} onValueChange={setSelectedRecruiterId}>
                <SelectTrigger id="recruiter-select">
                  <SelectValue placeholder="Select recruiter..." />
                </SelectTrigger>
                <SelectContent>
                  {/* TODO: Fetch and display recruiters list */}
                  <SelectItem value="placeholder" disabled>
                    Loading recruiters...
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Recruiter list will be populated from users with recruiter role
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAssignRecruiterOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkAssignRecruiter}
                disabled={!selectedRecruiterId || assignRecruiterMutation.isPending}
              >
                {assignRecruiterMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign Recruiter"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={isSendEmailOpen} onOpenChange={setIsSendEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email to {selectedCount} Candidate(s)</DialogTitle>
            <DialogDescription>
              Send an email using a template to all selected candidates
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-select">Email Template *</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger id="template-select">
                  <SelectValue placeholder="Select template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsSendEmailOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkSendEmail}
                disabled={!selectedTemplateId || sendEmailMutation.isPending}
              >
                {sendEmailMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Emails
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

