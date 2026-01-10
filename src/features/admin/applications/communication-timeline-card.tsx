"use client";

import { useGetCommunicationTimelineQuery } from "~/apis/communications/queries";
import { TCommunicationTimeline, TCommunicationType } from "~/apis/communications/schemas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Mail, Phone, MessageSquare, Calendar, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface CommunicationTimelineCardProps {
  applicationId: string;
}

const getCommunicationIcon = (type: TCommunicationType) => {
  switch (type) {
    case "email":
      return <Mail className="h-4 w-4" />;
    case "sms":
      return <MessageSquare className="h-4 w-4" />;
    case "call":
      return <Phone className="h-4 w-4" />;
    case "interview":
      return <Calendar className="h-4 w-4" />;
    case "note":
      return <FileText className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "sent":
      return "bg-blue-100 text-blue-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "opened":
      return "bg-purple-100 text-purple-800";
    case "clicked":
      return "bg-indigo-100 text-indigo-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "bounced":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const CommunicationTimelineCard = ({ applicationId }: CommunicationTimelineCardProps) => {
  const { data, isLoading, error } = useGetCommunicationTimelineQuery(applicationId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communication Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communication Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Error loading communication timeline</p>
        </CardContent>
      </Card>
    );
  }

  const communications = data?.data || [];

  if (communications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communication Timeline</CardTitle>
          <CardDescription>All communications with this candidate</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            No communications yet. Start by sending an email or adding a note.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication Timeline</CardTitle>
        <CardDescription>All communications with this candidate</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {communications.map((comm: TCommunicationTimeline) => (
            <div
              key={comm.id}
              className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  {getCommunicationIcon(comm.communication_type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 capitalize">
                      {comm.communication_type.replace("_", " ")}
                    </h4>
                    {comm.template_name && (
                      <Badge variant="outline" className="text-xs">
                        {comm.template_name}
                      </Badge>
                    )}
                  </div>
                  <Badge className={`text-xs ${getStatusColor(comm.status)}`}>
                    {comm.status}
                  </Badge>
                </div>
                {comm.subject && (
                  <p className="text-sm font-medium text-gray-700 mb-1">{comm.subject}</p>
                )}
                {comm.content && (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">
                    {comm.content}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {comm.sent_to && (
                    <span>
                      To: <span className="font-medium">{comm.sent_to}</span>
                    </span>
                  )}
                  <span>
                    {format(new Date(comm.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                  {comm.opened_at && (
                    <span className="text-green-600">
                      Opened: {format(new Date(comm.opened_at), "MMM d, h:mm a")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

