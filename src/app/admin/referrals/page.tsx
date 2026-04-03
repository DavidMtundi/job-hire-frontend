"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { TbUsers, TbGift, TbChartLine, TbRocket, TbCheck, TbBell } from "react-icons/tb"

export default function ReferralManagementPage() {
  const features = [
    {
      id: "employee-portal",
      title: "Employee Referral Portal",
      description: "Employees can refer candidates directly through the platform. Simple, intuitive interface for submitting referrals.",
      icon: TbUsers,
    },
    {
      id: "referral-tracking",
      title: "Referral Tracking",
      description: "Track which employees refer which candidates. Complete visibility into your referral pipeline.",
      icon: TbChartLine,
    },
    {
      id: "rewards-management",
      title: "Referral Rewards Management",
      description: "Configure and track referral bonuses. Set different reward amounts for different roles or departments.",
      icon: TbGift,
    },
    {
      id: "status-dashboard",
      title: "Referral Status Dashboard",
      description: "Show employees the status of their referrals. Keep referrers engaged throughout the process.",
      icon: TbChartLine,
    },
    {
      id: "automated-notifications",
      title: "Automated Notifications",
      description: "Notify referrers when their candidate moves through stages. Keep employees informed and engaged.",
      icon: TbBell,
    },
    {
      id: "referral-analytics",
      title: "Referral Analytics",
      description: "Track referral success rates, best referrers, and referral source quality. Data-driven referral program optimization.",
      icon: TbChartLine,
    },
  ]

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <TbRocket className="h-8 w-8 text-primary" aria-label="Coming soon feature" />
        <div>
          <h1 className="text-3xl font-bold">Referral Management System</h1>
          <p className="text-muted-foreground">Coming Soon - Leverage your best source of quality hires</p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          Coming Soon
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What is Referral Management?</CardTitle>
          <CardDescription>
            Referrals are consistently the highest-quality source of hires. This feature will create a complete 
            employee referral program where employees can refer candidates, track their referrals, and earn rewards. 
            The system automates the entire referral workflow from submission to reward payout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-lg border border-primary/20 dark:border-primary/40">
              <h3 className="font-semibold text-primary dark:text-primary-foreground mb-2">Expected Launch: 3-4 weeks</h3>
              <p className="text-sm text-primary dark:text-primary-foreground/90">
                We're building a comprehensive referral system that will help you tap into your employees' networks 
                and reduce cost-per-hire while improving hire quality.
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
            <li>Referrals are the highest-quality source of hires (industry average: 40% better retention)</li>
            <li>Improves employee engagement - employees become advocates</li>
            <li>Reduces cost-per-hire significantly (referrals cost 50% less than job boards)</li>
            <li>Faster time-to-fill (referrals are pre-screened by employees)</li>
            <li>Better cultural fit (employees refer people who fit the culture)</li>
            <li>Automated reward management reduces administrative overhead</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
