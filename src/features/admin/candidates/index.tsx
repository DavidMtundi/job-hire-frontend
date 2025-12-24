"use client";

import {
  Briefcase,
  Calendar,
  Download,
  Eye,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  PlusIcon,
  Search,
  Star
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useGetCandidatesQuery } from "~/apis/candidates/queries";
import { FilterGroup } from "~/components/filters/FilterGroup";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { CandidateList } from "./candidate-list";
import { DeleteCandidateModal } from "./manage/delete-candidate-modal";
import { ViewCandidateProfileModal } from "./manage/view-candidate-profile-modal";

const getStatusColor = (status: string) => {
  const colors = {
    active: "bg-blue-100 text-blue-800",
    interview: "bg-purple-100 text-purple-800",
    offer: "bg-yellow-100 text-yellow-800",
    hired: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
};

const InfoItem = ({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) => (
  <div className="flex items-center text-gray-600">
    <Icon className="h-4 w-4 mr-2" />
    <span className="text-sm">{text}</span>
  </div>
);

interface CandidatesFilter {
  [key: string]: string | undefined;
  search: string | undefined;
  status: string | undefined;
  position: string | undefined;
}

export default function CandidatesScreen() {
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [filters, setFilters] = useState<CandidatesFilter>({
    search: "",
    status: "",
    position: "",
  });

  const { data, isLoading, isError } = useGetCandidatesQuery();
  const candidatesData = data?.data ?? [];

  const filteredCandidates = candidatesData.filter((candidate) => {
    const search = filters.search?.trim()?.toLowerCase();

    const matchesSearch =
      !search ||
      [candidate.first_name, candidate.last_name, candidate.email, candidate.current_position].some((field) =>
        field?.toLowerCase().includes(search)
      );

    const matchesStatus =
      !filters.status || candidate.joining_availability === filters.status;

    const matchesPosition =
      !filters.position || candidate.current_position === filters.position;

    return matchesSearch && matchesStatus && matchesPosition;
  });

  const statusCounts = candidatesData.reduce(
    (acc, candidate) => {
      acc.all++;
      acc[candidate.joining_availability as keyof typeof acc]++;
      return acc;
    },
    { all: 0, active: 0, interview: 0, offer: 0, hired: 0, rejected: 0 }
  );

  const handleAction = (type: string, candidate: any) => {
    if (type === "profile") {
      setSelectedApplicant(candidate);
      setShowProfileModal(true);
    } else if (type === "resume") {
      setSelectedApplicant(candidate);
      setShowResumeModal(true);
    } else if (type === "contact") {
      window.location.href = `mailto:${candidate.email}`;
    }
  };

  const filtersOptions = [
    {
      key: "status",
      label: "Status",
      value: filters.status ?? "all",
      onChange: (val: string) =>
        setFilters((prev) => ({
          ...prev,
          status: val === "all" ? undefined : val,
        })),
      options: [
        { label: "All Status", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Blacklisted", value: "blacklisted" },
        { label: "Suspended", value: "suspended" },
      ],
    },
    {
      key: "position",
      label: "Position",
      value: filters.position ?? "all",
      onChange: (val: string) =>
        setFilters((prev) => ({
          ...prev,
          position: val === "all" ? undefined : val,
        })),
      options: [
        { label: "All Positions", value: "all" },
        ...[...new Set(candidatesData.map((a) => a.current_position))].map((pos) => ({
          label: pos,
          value: pos,
        })),
      ],
    },
  ];

  function setStatusFilter(value: string): void {
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : value,
    }));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600">Manage and review candidates</p>
        </div>
        <div>
          <Button asChild>
            <Link href={"/admin/candidates/create"}>
              <PlusIcon /> Create Candidate
            </Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-none p-0 border-none">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search candidates by name, email, or position..."
                value={filters.search ?? ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    search:
                      e.target.value.trim() === "" ? undefined : e.target.value,
                  }))
                }
                className="pl-10"
              />
            </div>
            <FilterGroup filters={filtersOptions} />
          </div>
        </CardContent>
      </Card>

      <CandidateList data={filteredCandidates} isLoading={isLoading} isError={isError} />

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Applicant Profile</DialogTitle>
            <DialogDescription>
              Detailed information about the candidate
            </DialogDescription>
          </DialogHeader>
          {selectedApplicant && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedApplicant.metadata?.avatar} />
                  <AvatarFallback>
                    {selectedApplicant.first_name.charAt(0)}{selectedApplicant.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">
                    {selectedApplicant.first_name} {selectedApplicant.last_name}
                  </h2>
                  <p className="text-gray-600">{selectedApplicant.current_position}</p>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">
                      {selectedApplicant.metadata?.rating}
                    </span>
                    <Badge
                      className={`ml-2 ${getStatusColor(
                        selectedApplicant.joining_availability
                      )}`}
                    >
                      {selectedApplicant.joining_availability.charAt(0).toUpperCase() +
                        selectedApplicant.joining_availability.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Contact Information",
                    items: [
                      { icon: Mail, text: selectedApplicant.email },
                      { icon: Phone, text: selectedApplicant.phone },
                      { icon: MapPin, text: selectedApplicant.address },
                    ],
                  },
                  {
                    title: "Professional Details",
                    items: [
                      {
                        icon: Briefcase,
                        text: `${selectedApplicant.years_experience} experience`,
                      },
                      {
                        icon: GraduationCap,
                        text: selectedApplicant.last_education ?? "",
                      },
                      {
                        icon: Calendar,
                        text: `Applied ${new Date(
                          selectedApplicant.metadata?.appliedDate
                        ).toLocaleDateString()}`,
                      },
                    ],
                  },
                ].map((section, i) => (
                  <div key={i} className="space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      {section.title}
                    </h3>
                    {section.items.map((item, j) => (
                      <InfoItem key={j} icon={item.icon} text={item.text} />
                    ))}
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {selectedApplicant.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Recent Activity
                </h3>
                <p className="text-sm text-gray-600">
                  Last activity:{" "}
                  {new Date(
                    selectedApplicant.metadata?.lastActivity
                  ).toLocaleDateString()}
                </p>
              </div>

              <div className="flex space-x-2 pt-4 border-t">
                <Button
                  onClick={() => handleAction("contact", selectedApplicant)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAction("resume", selectedApplicant)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  View Resume
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showResumeModal} onOpenChange={setShowResumeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Resume - {selectedApplicant?.first_name} {selectedApplicant?.last_name}</DialogTitle>
            <DialogDescription>{selectedApplicant?.resume}</DialogDescription>
          </DialogHeader>
          {selectedApplicant && (
            <div className="space-y-4">
              <div className="border rounded-lg p-6 bg-gray-50 min-h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <Download className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Resume Preview
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedApplicant.metadata?.resume}
                  </p>
                  <div className="space-y-2">
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Eye className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                {[
                  {
                    value: selectedApplicant.years_experience,
                    label: "Experience",
                    color: "text-blue-600",
                  },
                  {
                    value: selectedApplicant.metadata?.rating,
                    label: "Rating",
                    color: "text-green-600",
                  },
                  {
                    value: selectedApplicant.skills.length,
                    label: "Skills",
                    color: "text-purple-600",
                  },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ViewCandidateProfileModal  />
      <DeleteCandidateModal />
    </div>
  );
}
