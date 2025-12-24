"use client";

import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Star,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { useUrlFilter } from "~/hooks/useFilters";
import { FilterGroup } from "~/components/filters/FilterGroup";

const applicantsData = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    position: "Senior Frontend Developer",
    experience: "5 years",
    education: "BS Computer Science",
    skills: ["React", "TypeScript", "Node.js"],
    status: "active",
    rating: 4.5,
    appliedDate: "2024-01-20",
    lastActivity: "2024-01-22",
    resume: "john_smith_resume.pdf",
    avatar: "/placeholder.svg?height=40&width=40&text=JS",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 234-5678",
    location: "New York, NY",
    position: "Product Manager",
    experience: "7 years",
    education: "MBA, BS Engineering",
    skills: ["Product Strategy", "Analytics", "Agile"],
    status: "interview",
    rating: 4.8,
    appliedDate: "2024-01-19",
    lastActivity: "2024-01-21",
    resume: "sarah_johnson_resume.pdf",
    avatar: "/placeholder.svg?height=40&width=40&text=SJ",
  },
  {
    id: 3,
    name: "Mike Chen",
    email: "mike.chen@email.com",
    phone: "+1 (555) 345-6789",
    location: "Austin, TX",
    position: "UX Designer",
    experience: "4 years",
    education: "BFA Design",
    skills: ["Figma", "User Research", "Prototyping"],
    status: "offer",
    rating: 4.2,
    appliedDate: "2024-01-18",
    lastActivity: "2024-01-20",
    resume: "mike_chen_resume.pdf",
    avatar: "/placeholder.svg?height=40&width=40&text=MC",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@email.com",
    phone: "+1 (555) 456-7890",
    location: "Seattle, WA",
    position: "Backend Engineer",
    experience: "6 years",
    education: "MS Computer Science",
    skills: ["Python", "AWS", "Docker"],
    status: "hired",
    rating: 4.9,
    appliedDate: "2024-01-17",
    lastActivity: "2024-01-19",
    resume: "emily_davis_resume.pdf",
    avatar: "/placeholder.svg?height=40&width=40&text=ED",
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david.wilson@email.com",
    phone: "+1 (555) 567-8901",
    location: "Boston, MA",
    position: "Data Scientist",
    experience: "3 years",
    education: "PhD Statistics",
    skills: ["Python", "Machine Learning", "SQL"],
    status: "rejected",
    rating: 3.8,
    appliedDate: "2024-01-16",
    lastActivity: "2024-01-18",
    resume: "david_wilson_resume.pdf",
    avatar: "/placeholder.svg?height=40&width=40&text=DW",
  },
];

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

interface ApplicantsFilter {
  [key: string]: string | undefined;
  search: string;
  status: string;
  position: string;
}

export default function ApplicantsScreen() {
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const { filters, setFilters } = useUrlFilter<ApplicantsFilter>();

  const filteredApplicants = applicantsData.filter((applicant) => {
    const search = filters.search?.trim()?.toLowerCase();

    const matchesSearch =
      !search ||
      [applicant.name, applicant.email, applicant.position].some((field) =>
        field?.toLowerCase().includes(search)
      );

    const matchesStatus =
      !filters.status || applicant.status === filters.status;

    const matchesPosition =
      !filters.position || applicant.position === filters.position;

    return matchesSearch && matchesStatus && matchesPosition;
  });

  const statusCounts = applicantsData.reduce(
    (acc, applicant) => {
      acc.all++;
      acc[applicant.status as keyof typeof acc]++;
      return acc;
    },
    { all: 0, active: 0, interview: 0, offer: 0, hired: 0, rejected: 0 }
  );

  const handleAction = (type: string, applicant: any) => {
    if (type === "profile") {
      setSelectedApplicant(applicant);
      setShowProfileModal(true);
    } else if (type === "resume") {
      setSelectedApplicant(applicant);
      setShowResumeModal(true);
    } else if (type === "contact") {
      window.location.href = `mailto:${applicant.email}`;
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
        { label: "Interview", value: "interview" },
        { label: "Offer", value: "offer" },
        { label: "Hired", value: "hired" },
        { label: "Rejected", value: "rejected" },
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
        ...[...new Set(applicantsData.map((a) => a.position))].map((pos) => ({
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
          <p className="text-gray-600">Manage and review job applicants</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filter
          </Button>
        </div>
      </div>

      <Card className="bg-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search applicants by name, email, or position..."
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

      <Card className="bg-white shadow-lg">
        <CardContent className="p-0">
          <Tabs
            value={filters.status ?? "all"}
            onValueChange={setStatusFilter}
            className="w-full"
          >
            <div className="border-b px-6 py-5">
              <TabsList className="grid w-full grid-cols-6">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <TabsTrigger
                    key={status}
                    value={status}
                    className="cursor-pointer"
                  >
                    {status === "all"
                      ? "All"
                      : status.charAt(0).toUpperCase() + status.slice(1)}{" "}
                    ({count})
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {filteredApplicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={applicant.avatar} />
                          <AvatarFallback>
                            {applicant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {applicant.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600 ml-1">
                                  {applicant.rating}
                                </span>
                              </div>
                              <Badge
                                className={getStatusColor(applicant.status)}
                              >
                                {applicant.status.charAt(0).toUpperCase() +
                                  applicant.status.slice(1)}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <InfoItem
                              icon={Briefcase}
                              text={applicant.position}
                            />
                            <InfoItem icon={MapPin} text={applicant.location} />
                            <InfoItem icon={Mail} text={applicant.email} />
                            <InfoItem icon={Phone} text={applicant.phone} />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <InfoItem
                              icon={GraduationCap}
                              text={applicant.education}
                            />
                            <InfoItem
                              icon={Calendar}
                              text={`Applied ${new Date(
                                applicant.appliedDate
                              ).toLocaleDateString()}`}
                            />
                            <div className="flex items-center text-gray-600">
                              <span className="text-sm">
                                {applicant.experience} experience
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {applicant.skills.map((skill, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <p className="text-sm text-gray-500">
                              Last activity:{" "}
                              {new Date(
                                applicant.lastActivity
                              ).toLocaleDateString()}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {[
                                {
                                  icon: Eye,
                                  text: "View Profile",
                                  action: "profile",
                                },
                                {
                                  icon: Download,
                                  text: "Resume",
                                  action: "resume",
                                },
                                {
                                  icon: Mail,
                                  text: "Contact",
                                  action: "contact",
                                },
                              ].map((btn, i) => (
                                <Button
                                  key={i}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center bg-transparent"
                                  onClick={() =>
                                    handleAction(btn.action, applicant)
                                  }
                                >
                                  <btn.icon className="h-4 w-4 mr-1" />
                                  {btn.text}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!filteredApplicants.length && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No applicants found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search criteria or filters.
                  </p>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Applicant Profile</DialogTitle>
            <DialogDescription>
              Detailed information about the applicant
            </DialogDescription>
          </DialogHeader>
          {selectedApplicant && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedApplicant.avatar} />
                  <AvatarFallback>
                    {selectedApplicant.name
                      .split(" ")
                      .map((n: any[]) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">
                    {selectedApplicant.name}
                  </h2>
                  <p className="text-gray-600">{selectedApplicant.position}</p>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">
                      {selectedApplicant.rating}
                    </span>
                    <Badge
                      className={`ml-2 ${getStatusColor(
                        selectedApplicant.status
                      )}`}
                    >
                      {selectedApplicant.status.charAt(0).toUpperCase() +
                        selectedApplicant.status.slice(1)}
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
                      { icon: MapPin, text: selectedApplicant.location },
                    ],
                  },
                  {
                    title: "Professional Details",
                    items: [
                      {
                        icon: Briefcase,
                        text: `${selectedApplicant.experience} experience`,
                      },
                      {
                        icon: GraduationCap,
                        text: selectedApplicant.education,
                      },
                      {
                        icon: Calendar,
                        text: `Applied ${new Date(
                          selectedApplicant.appliedDate
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
                  {selectedApplicant.skills.map(
                    (skill: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Recent Activity
                </h3>
                <p className="text-sm text-gray-600">
                  Last activity:{" "}
                  {new Date(
                    selectedApplicant.lastActivity
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
            <DialogTitle>Resume - {selectedApplicant?.name}</DialogTitle>
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
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Matching skills:</span>{" "}
                    {selectedApplicant.skills && selectedApplicant.skills.length > 0
                      ? selectedApplicant.skills.join(", ")
                      : "N/A"}
                  </p>
                  <p className="text-sm text-gray-700 mb-4">
                    <span className="font-semibold">Match score:</span>{" "}
                    {typeof selectedApplicant.score === "number"
                      ? `${Math.floor(selectedApplicant.score ?? 0 * 20)}%`
                      : "N/A"}
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
                    value: selectedApplicant.experience,
                    label: "Experience",
                    color: "text-blue-600",
                  },
                  {
                    value: selectedApplicant.rating,
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
    </div>
  );
}
