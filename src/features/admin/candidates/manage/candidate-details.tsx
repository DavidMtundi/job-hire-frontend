"use client";

import { BriefcaseIcon, CalendarIcon, DownloadIcon, GraduationCapIcon, MailIcon, MapPinIcon, PhoneIcon, Star } from 'lucide-react';
import { TCandidate } from '~/apis/candidates/schema';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { getStatusColor } from '~/lib/utils';

export const CandidateDetails = ({ candidate }: { candidate: TCandidate }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={candidate.metadata?.avatar} />
          <AvatarFallback>
            {candidate.first_name.charAt(0)}{candidate.last_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">
            {candidate.first_name} {candidate.last_name}
          </h2>
          <p className="text-gray-600">{candidate.current_position}</p>
          <div className="flex items-center mt-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">
            {candidate.metadata?.rating}
            </span>
            <Badge
              className={`ml-2 ${getStatusColor(
                candidate.joining_availability
              )}`}
            >
              {candidate.joining_availability.charAt(0).toUpperCase() +
                candidate.joining_availability.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: "Contact Information",
            items: [
              { icon: MailIcon, text: candidate.email },
              { icon: PhoneIcon, text: candidate.phone },
              { icon: MapPinIcon, text: candidate.address },
            ],
          },
          {
            title: "Professional Details",
            items: [
              {
                icon: BriefcaseIcon,
                text: `${candidate.years_experience} experience`,
              },
              {
                icon: GraduationCapIcon,
                text: candidate.last_education ?? "",
              },
              {
                icon: CalendarIcon,
                text: `Applied ${new Date(
                  candidate.metadata?.appliedDate
                ).toLocaleDateString()}`,
              },
            ],
          },
        ].map((section, i) => (
          <div key={i} className="space-y-3">
            <h3 className="font-semibold text-gray-900">
              {section.title}
            </h3>
            {section.items.map((item, idx) => (
              <div key={idx} className="flex items-center text-gray-600">
              <item.icon className="h-4 w-4 mr-2" />
              <span className="text-sm">{item.text}</span>
            </div>
            ))}
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {candidate.skills.map((skill: string, index: number) => (
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
            candidate.metadata?.lastActivity
          ).toLocaleDateString()}
        </p>
      </div>

      {/* <div className="flex space-x-2 pt-4 border-t">
        <Button
          onClick={() => {}}
        >
          <MailIcon className="h-4 w-4 mr-2" />
          Send Email
        </Button>
        <Button
          variant="outline"
          onClick={() => {}}
        >
          <DownloadIcon className="h-4 w-4 mr-2" />
          View Resume
        </Button>
      </div> */}
    </div>
  );
}