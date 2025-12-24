"use client";

import { TDepartment } from '~/apis/departments/schemas';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { useDepartmentModal } from '~/hooks/use-department-modal';

export const DepartmentDetailsModal = () => {
  const { data: department, modal, isOpen, onOpenChange } = useDepartmentModal();

  // console.log("Rendering DepartmentDetailsModal:", department);

  return (
    <Dialog open={modal === "view" && isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Department Details</DialogTitle>
          <DialogDescription>View department details</DialogDescription>
        </DialogHeader>
        {department 
          ? <DepartmentDetailsView department={department} /> 
          : (
            <div className="flex justify-center items-center">
              No department found
            </div>
          )
        }
      </DialogContent>
    </Dialog>
  )
}

const DepartmentDetailsView = ({ department }: { department: TDepartment }) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-2">Department Information</h4>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Name:</strong> {department?.name}
          </p>
          <p>
            <strong>Description:</strong> {department?.description}
          </p>
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Jobs Information</h4>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Total Jobs:</strong> {department?.total_jobs}
          </p>
        </div>
      </div>
    </div>
  );
}
