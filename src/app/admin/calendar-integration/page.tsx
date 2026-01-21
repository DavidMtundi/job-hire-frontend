"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { TbCalendarEvent, TbClock, TbCheck, TbRocket } from "react-icons/tb"

export default function CalendarIntegrationPage() {
  const features = [
    {
      id: "google-calendar",
      title: "Google Calendar Sync",
      description: "Automatically sync interviews with your Google Calendar. All scheduled interviews will appear in your calendar instantly.",
      icon: TbCalendarEvent,
    },
    {
      id: "outlook-integration",
      title: "Outlook Integration",
      description: "Seamless integration with Microsoft Outlook. Manage interviews directly from your Outlook calendar.",
      icon: TbCalendarEvent,
    },
    {
      id: "apple-calendar",
      title: "Apple Calendar Support",
      description: "Full support for Apple Calendar (iCal). Works seamlessly with Mac, iPhone, and iPad.",
      icon: TbCalendarEvent,
    },
    {
      id: "automated-scheduling",
      title: "Automated Scheduling Links",
      description: "Send candidates a link to book their own interview slots. No more back-and-forth emails - candidates choose their preferred time.",
      icon: TbClock,
    },
    {
      id: "real-time-availability",
      title: "Real-Time Availability",
      description: "Show interviewer availability in real-time. Candidates see only available slots, eliminating double-bookings.",
      icon: TbCheck,
    },
    {
      id: "panel-coordination",
      title: "Panel Interview Coordination",
      description: "Schedule multi-interviewer panels with ease. System finds common availability across all interviewers automatically.",
      icon: TbCalendarEvent,
    },
    {
      id: "automated-reminders",
      title: "Automated Reminders",
      description: "SMS + Email reminders sent automatically 24 hours and 1 hour before interviews. Reduce no-shows significantly.",
      icon: TbClock,
    },
    {
      id: "rescheduling",
      title: "Rescheduling Workflow",
      description: "Allow candidates to reschedule with automatic notifications to all interviewers. Streamlined rescheduling process.",
      icon: TbCheck,
    },
    {
      id: "video-integration",
      title: "Video Interview Integration",
      description: "Direct links to Zoom, Google Meet, Microsoft Teams with auto-creation. Video links generated automatically.",
      icon: TbCalendarEvent,
    },
  ]

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <TbRocket className="h-8 w-8 text-primary" aria-label="Coming soon feature" />
        <div>
          <h1 className="text-3xl font-bold">Calendar Integration</h1>
          <p className="text-muted-foreground">Coming Soon - Streamline your interview scheduling</p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          Coming Soon
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What is Calendar Integration?</CardTitle>
          <CardDescription>
            Calendar Integration eliminates the biggest time-waster in recruitment: scheduling back-and-forth. 
            This feature will sync your interview calendar with Google Calendar, Outlook, and Apple Calendar, 
            allowing candidates to book their own interview slots and automatically managing interviewer availability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Expected Launch: 4-5 weeks</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                We're working hard to bring you this feature. Once launched, you'll save 2-3 hours per week on scheduling coordination.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <Card key={feature.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <feature.icon className="h-5 w-5 text-primary" aria-label={feature.title} />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TbRocket className="h-5 w-5" />
            Benefits for HR Teams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            <li>Eliminate scheduling back-and-forth completely</li>
            <li>Reduce no-shows through automated reminders</li>
            <li>Save 2-3 hours per week on scheduling coordination</li>
            <li>Professional candidate experience</li>
            <li>Automatic conflict detection and resolution</li>
            <li>Multi-timezone support for remote teams</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
