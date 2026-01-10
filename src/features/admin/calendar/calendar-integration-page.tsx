"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  useGetCalendarIntegrationsQuery,
  useCreateCalendarIntegrationMutation,
  useGetInterviewerAvailabilityQuery,
  useCreateInterviewerAvailabilityMutation,
} from "~/apis/calendar/queries";
import { Calendar, Clock, Plus, Settings, CheckCircle2, XCircle } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TCalendarType } from "~/apis/calendar/schemas";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function CalendarIntegrationPage() {
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [selectedCalendarType, setSelectedCalendarType] = useState<TCalendarType>("google");

  const { data: integrationsData, isLoading: isLoadingIntegrations, error: integrationsError } =
    useGetCalendarIntegrationsQuery();
  const { data: availabilityData, isLoading: isLoadingAvailability, error: availabilityError } =
    useGetInterviewerAvailabilityQuery();

  // Check for permission errors
  const hasPermissionError = 
    (integrationsError as any)?.response?.status === 403 ||
    (availabilityError as any)?.response?.status === 403;

  const createIntegrationMutation = useCreateCalendarIntegrationMutation();
  const createAvailabilityMutation = useCreateInterviewerAvailabilityMutation();

  const integrations = integrationsData?.data || [];
  const availability = availabilityData?.data || [];

  const handleCreateIntegration = async () => {
    // In a real implementation, this would trigger OAuth flow
    // For now, we'll show a placeholder
    toast.info("Calendar integration setup will open OAuth flow");
    setIsIntegrationModalOpen(false);
  };

  const handleCreateAvailability = async (data: {
    day_of_week: number;
    start_time: string;
    end_time: string;
  }) => {
    try {
      await createAvailabilityMutation.mutateAsync(data);
      setIsAvailabilityModalOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (hasPermissionError && !isLoadingIntegrations && !isLoadingAvailability) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Permission Denied</CardTitle>
            <CardDescription>
              You don't have permission to view calendar integrations. Please contact your administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar Integration</h1>
          <p className="text-muted-foreground">Manage calendar sync and availability</p>
        </div>
      </div>

      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">Calendar Integrations</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Connected Calendars</CardTitle>
                  <CardDescription>Manage your calendar integrations</CardDescription>
                </div>
                <Dialog open={isIntegrationModalOpen} onOpenChange={setIsIntegrationModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Connect Calendar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Connect Calendar</DialogTitle>
                      <DialogDescription>
                        Connect your calendar to sync interviews automatically
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="calendar-type">Calendar Type</Label>
                        <Select
                          value={selectedCalendarType}
                          onValueChange={(v) => setSelectedCalendarType(v as TCalendarType)}
                        >
                          <SelectTrigger id="calendar-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="google">Google Calendar</SelectItem>
                            <SelectItem value="outlook">Outlook</SelectItem>
                            <SelectItem value="apple">Apple Calendar</SelectItem>
                            <SelectItem value="calendly">Calendly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsIntegrationModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateIntegration}>Connect</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingIntegrations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : integrations.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No calendar integrations connected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {integrations.map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium capitalize">{integration.calendar_type} Calendar</p>
                          <p className="text-sm text-gray-500">{integration.calendar_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {integration.sync_enabled ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Syncing
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Paused
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Interviewer Availability</CardTitle>
                  <CardDescription>Set your available times for interviews</CardDescription>
                </div>
                <Dialog open={isAvailabilityModalOpen} onOpenChange={setIsAvailabilityModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Availability
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Availability Slot</DialogTitle>
                      <DialogDescription>
                        Set your regular availability for interviews
                      </DialogDescription>
                    </DialogHeader>
                    <AvailabilityForm
                      onSubmit={(data) => handleCreateAvailability(data)}
                      onCancel={() => setIsAvailabilityModalOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAvailability ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : availability.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No availability slots set</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availability.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{DAYS_OF_WEEK[slot.day_of_week]}</p>
                          <p className="text-sm text-gray-500">
                            {slot.start_time} - {slot.end_time} ({slot.timezone})
                          </p>
                        </div>
                      </div>
                      {slot.is_active ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AvailabilityForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: { day_of_week: number; start_time: string; end_time: string }) => void;
  onCancel: () => void;
}) {
  const [dayOfWeek, setDayOfWeek] = useState<number>(0);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="day-of-week">Day of Week</Label>
        <Select value={dayOfWeek.toString()} onValueChange={(v) => setDayOfWeek(parseInt(v))}>
          <SelectTrigger id="day-of-week">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DAYS_OF_WEEK.map((day, index) => (
              <SelectItem key={index} value={index.toString()}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-time">Start Time</Label>
          <Input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="end-time">End Time</Label>
          <Input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Availability</Button>
      </div>
    </form>
  );
}

