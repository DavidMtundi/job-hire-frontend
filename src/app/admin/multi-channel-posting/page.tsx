"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { TbShare, TbBrandLinkedin, TbBrandWhatsapp, TbWorld, TbRocket, TbChartBar, TbCheck, TbBrandFacebook, TbBrandTwitter } from "react-icons/tb"

export default function MultiChannelPostingPage() {
  const channels = [
    {
      id: "linkedin",
      title: "LinkedIn",
      description: "Automatically post to LinkedIn job board and company page. Reach millions of professionals instantly.",
      icon: TbBrandLinkedin,
      color: "text-blue-600",
    },
    {
      id: "whatsapp",
      title: "WhatsApp Groups",
      description: "Send job postings to multiple WhatsApp groups automatically. Perfect for community groups and professional networks.",
      icon: TbBrandWhatsapp,
      color: "text-green-600",
    },
    {
      id: "job-boards",
      title: "Job Listing Platforms",
      description: "Post to Indeed, Glassdoor, ZipRecruiter, and other major job boards with one click. Maximize job visibility.",
      icon: TbWorld,
      color: "text-blue-500",
    },
    {
      id: "social-media",
      title: "Social Media",
      description: "Auto-post to company Facebook, Twitter, and other social media pages. Expand your reach organically.",
      icon: TbBrandFacebook,
      color: "text-blue-500",
    },
  ]

  const features = [
    {
      id: "one-click-posting",
      title: "One-Click Multi-Channel Posting",
      description: "Post a job once, and it automatically syncs to LinkedIn, WhatsApp groups, job boards, and social media platforms.",
      icon: TbShare,
    },
    {
      id: "performance-analytics",
      title: "Channel Performance Analytics",
      description: "Compare performance across channels. See which platforms generate the most views, applications, and quality candidates.",
      icon: TbChartBar,
    },
    {
      id: "automated-sync",
      title: "Automated Sync",
      description: "When you post a job, it automatically syncs with all connected platforms. No manual copying and pasting required.",
      icon: TbCheck,
    },
    {
      id: "posting-templates",
      title: "Customizable Posting Templates",
      description: "Create platform-specific templates. Optimize job descriptions for each channel's format and audience.",
      icon: TbShare,
    },
    {
      id: "real-time-updates",
      title: "Real-Time Updates",
      description: "Update job status once, and it syncs across all platforms. Close a job? It's automatically removed everywhere.",
      icon: TbCheck,
    },
    {
      id: "cost-optimization",
      title: "Cost Optimization",
      description: "Identify which channels perform best and focus your budget there. Reduce job board costs by 30-40%.",
      icon: TbChartBar,
    },
  ]

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <TbRocket className="h-8 w-8 text-primary" aria-label="Coming soon feature" />
        <div>
          <h1 className="text-3xl font-bold">Multi-Channel Job Posting</h1>
          <p className="text-muted-foreground">Coming Soon - Post once, reach everywhere</p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          Coming Soon
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What is Multi-Channel Posting?</CardTitle>
          <CardDescription>
            Stop manually posting jobs to multiple platforms. Multi-Channel Posting automatically distributes your 
            job postings to LinkedIn, WhatsApp groups, job listing platforms (Indeed, Glassdoor, ZipRecruiter), 
            and social media channels. Post once, and your job appears everywhere instantly. Track performance 
            across all channels to optimize your recruitment strategy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Expected Launch: 6-8 weeks</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                We're building integrations with major job boards and social platforms. Once launched, you'll save 
                hours of manual posting and reach 10x more candidates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Supported Channels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((channel) => (
            <Card key={channel.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <channel.icon className={`h-6 w-6 ${channel.color}`} aria-label={channel.title} />
                  <CardTitle className="text-lg">{channel.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{channel.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Create Your Job Posting</h4>
                <p className="text-sm text-muted-foreground">
                  Write your job description once in JobHire platform
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Select Channels</h4>
                <p className="text-sm text-muted-foreground">
                  Choose which platforms to post to: LinkedIn, WhatsApp groups, job boards, social media
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Automatic Sync</h4>
                <p className="text-sm text-muted-foreground">
                  Job automatically posts to all selected channels. Updates sync in real-time across all platforms
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">Track Performance</h4>
                <p className="text-sm text-muted-foreground">
                  See which channels generate the most applications and optimize your strategy
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TbRocket className="h-5 w-5" />
            Benefits for HR Teams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            <li>Save hours of manual posting - post once, reach everywhere</li>
            <li>Maximize job visibility across all channels</li>
            <li>Reduce job board costs by focusing on high-performing channels</li>
            <li>Faster time-to-fill through increased candidate reach</li>
            <li>Data-driven channel optimization</li>
            <li>Consistent messaging across all platforms</li>
            <li>Automatic updates when job status changes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
