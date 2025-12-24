'use client';

import { BriefcaseIcon, ClockIcon, DollarSignIcon, MapPinIcon } from 'lucide-react';
import Link from 'next/link';
import { FaCircleCheck } from 'react-icons/fa6';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { useGetJobsQuery } from '~/apis/jobs/queries';
import { TJob } from '~/apis/jobs/schemas';
import { JobSkeletonGrid } from '../job-skeleton-grid';

export const TrendingJobsSection = () => {
  // const jobs = [
  //   {
  //     id: "c07d9e2e-8b43-4f9f-a211-1b32f8d44e23",
  //     title: "Frontend Engineer",
  //     company: "Must Company",
  //     department: "Engineering",
  //     description: "We are looking for a passionate Frontend Engineer to join our dynamic team. You’ll work on building high-performance, visually stunning, and user-friendly web applications. Our ideal candidate has a keen eye for detail, strong problem-solving skills, and a drive for creating seamless digital experiences.",
  //     education_requirements: "Bachelor’s degree in Computer Science, Software Engineering, or a related field.;",
  //     experience_level: "mid",
  //     experience_range: "5-8 years",
  //     required_skills: [
  //       "Strong proficiency in React.js and Next.js.",
  //       "Experience with modern JavaScript (ES6+).",
  //       "Proficiency in Tailwind CSS or similar CSS frameworks.",
  //       "Experience integrating RESTful or GraphQL APIs.",
  //       "Knowledge of version control systems (Git, GitHub).",
  //       "Strong debugging and performance optimization skills."
  //     ],
  //     responsibilities: [
  //       "Develop responsive and interactive user interfaces using React and Next.js.",
  //       "Collaborate with backend developers and UI/UX designers to implement new features.",
  //       "Ensure code quality through unit testing and code reviews.",
  //       "Optimize web applications for speed, scalability, and cross-browser compatibility.",
  //       "Contribute to improving the frontend architecture and tooling.",
  //       "Stay updated with emerging frontend technologies and trends.",
  //       "Participate in sprint planning, reviews, and agile ceremonies."
  //     ],
  //     benefits: [
  //       "Flexible remote work policy.",
  //       "Health insurance coverage.",
  //       "Annual performance bonus.",
  //       "Professional training and development budget.",
  //       "Paid time off and holidays."
  //     ],
  //     type: "remote",
  //     employmentType: "full_time",
  //     location: "Dhaka, Bangladesh (Hybrid)",
  //     is_remote: true,
  //     salary_currency: "USD",
  //     salary_min: 2000,
  //     salary_max: 3500,
  //     payPeriod: "monthly",
  //     application_deadline: "2025-11-15",
  //     auto_close: true,
  //     tags: ["React", "Next.js", "Tailwind CSS", "JavaScript", "TypeScript"],
  //     target_sources: ["LinkedIn", "Internal", "Referral"],
  //     team_members: ["John Doe", "Jane Smith", "Jim Beam"],
  //     recruiter_email: "john.doe@example.com",
  //     hiring_manager_email: "jane.smith@example.com",
  //     max_applications: 100,
  //     status: "active",
  //     created_at: "2025-10-14",
  //     updated_at: '2025-10-14',
  //     created_by: "63",
  //     updated_by: "63",
  //     bgColor: 'bg-emerald-100',
  //     badgeColor: 'bg-emerald-200',
  //     logo: '🟩',
  //   },
  //   {
  //     id: "c07d9e2e-8b43-4f9f-a211-1b32f8d64e23",
  //     title: "Backend Engineer",
  //     department: "Engineering",
  //     company: "Must Company",
  //     description: "We are looking for a passionate Frontend Engineer to join our dynamic team. You’ll work on building high-performance, visually stunning, and user-friendly web applications. Our ideal candidate has a keen eye for detail, strong problem-solving skills, and a drive for creating seamless digital experiences.",
  //     education_requirements: "Bachelor’s degree in Computer Science, Software Engineering, or a related field.;",
  //     experience_level: "mid",
  //     experience_range: "5-8 years",
  //     required_skills: [
  //       "Strong proficiency in React.js and Next.js.",
  //       "Experience with modern JavaScript (ES6+).",
  //       "Proficiency in Tailwind CSS or similar CSS frameworks.",
  //       "Experience integrating RESTful or GraphQL APIs.",
  //       "Knowledge of version control systems (Git, GitHub).",
  //       "Strong debugging and performance optimization skills."
  //     ],
  //     responsibilities: [
  //       "Develop responsive and interactive user interfaces using React and Next.js.",
  //       "Collaborate with backend developers and UI/UX designers to implement new features.",
  //       "Ensure code quality through unit testing and code reviews.",
  //       "Optimize web applications for speed, scalability, and cross-browser compatibility.",
  //       "Contribute to improving the frontend architecture and tooling.",
  //       "Stay updated with emerging frontend technologies and trends.",
  //       "Participate in sprint planning, reviews, and agile ceremonies."
  //     ],
  //     benefits: [
  //       "Flexible remote work policy.",
  //       "Health insurance coverage.",
  //       "Annual performance bonus.",
  //       "Professional training and development budget.",
  //       "Paid time off and holidays."
  //     ],
  //     type: "onsite",
  //     employmentType: "full_time",
  //     location: "Dhaka, Bangladesh (Hybrid)",
  //     is_remote: true,
  //     salary_currency: "USD",
  //     salary_min: 2000,
  //     salary_max: 3500,
  //     payPeriod: "monthly",
  //     application_deadline: "2025-11-15",
  //     auto_close: true,
  //     tags: ["React", "Next.js", "Tailwind CSS", "JavaScript", "TypeScript"],
  //     target_sources: ["LinkedIn", "Internal", "Referral"],
  //     team_members: ["John Doe", "Jane Smith", "Jim Beam"],
  //     recruiter_email: "john.doe@example.com",
  //     hiring_manager_email: "jane.smith@example.com",
  //     max_applications: 100,
  //     status: "active",
  //     created_at: "2025-10-14",
  //     updated_at: '2025-10-14',
  //     created_by: "63",
  //     updated_by: "63",
  //     bgColor: 'bg-blue-100',
  //     badgeColor: 'bg-blue-200',
  //     logo: '🔵',
  //   },
  //   {
  //     id: "c07d9e2e-8b44-4f9f-a211-1b32f8d44e23",
  //     title: "Product Designer",
  //     company: "Must Company",
  //     department: "Design",
  //     description: "The Sr Product Designer will be responsible for creating production assets for our products.",
  //     education_requirements: "Bachelor’s degree in Computer Science, Software Engineering, or a related field.;",
  //     experience_level: "mid",
  //     experience_range: "5-8 years",
  //     required_skills: [
  //       "Strong proficiency in React.js and Next.js.",
  //       "Experience with modern JavaScript (ES6+).",
  //       "Proficiency in Tailwind CSS or similar CSS frameworks.",
  //       "Experience integrating RESTful or GraphQL APIs.",
  //       "Knowledge of version control systems (Git, GitHub).",
  //       "Strong debugging and performance optimization skills."
  //     ],
  //     responsibilities: [
  //       "Develop responsive and interactive user interfaces using React and Next.js.",
  //       "Collaborate with backend developers and UI/UX designers to implement new features.",
  //       "Ensure code quality through unit testing and code reviews.",
  //       "Optimize web applications for speed, scalability, and cross-browser compatibility.",
  //       "Contribute to improving the frontend architecture and tooling.",
  //       "Stay updated with emerging frontend technologies and trends.",
  //       "Participate in sprint planning, reviews, and agile ceremonies."
  //     ],
  //     benefits: [
  //       "Flexible remote work policy.",
  //       "Health insurance coverage.",
  //       "Annual performance bonus.",
  //       "Professional training and development budget.",
  //       "Paid time off and holidays."
  //     ],
  //     location: 'Andover, MA',
  //     type: "hybrid",
  //     employmentType: "part_time",
  //     is_remote: true,
  //     salary_currency: "USD",
  //     salary_min: 2000,
  //     salary_max: 3500,
  //     payPeriod: "monthly",
  //     application_deadline: "2025-11-15",
  //     auto_close: true,
  //     tags: ["React", "Next.js", "Tailwind CSS", "JavaScript", "TypeScript"],
  //     target_sources: ["LinkedIn", "Internal", "Referral"],
  //     team_members: ["John Doe", "Jane Smith", "Jim Beam"],
  //     recruiter_email: "john.doe@example.com",
  //     hiring_manager_email: "jane.smith@example.com",
  //     max_applications: 100,
  //     status: "active",
  //     created_at: "2025-10-14",
  //     updated_at: '2025-10-14',
  //     created_by: "63",
  //     updated_by: "63",
  //     bgColor: 'bg-green-100',
  //     badgeColor: 'bg-green-200',
  //     logo: '⭐',
  //   },
  // ];

  const { data: jobsData, isLoading, error, refetch } = useGetJobsQuery({ is_trending: true });

  const jobs = jobsData?.data ?? [];

  return (
    <section className="w-full px-4 py-16">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Trending Jobs</h2>
          <Link href="/jobs" className="text-primary font-semibold text-lg hover:text-primary/80 hover:underline underline-offset-4 flex items-center gap-1">
            See All Jobs
          </Link>
        </div>

        {error && (
          <div className="flex flex-col gap-2 justify-center items-center h-full">
            <p className="text-gray-500">Error fetching Trending jobs: {error.message}</p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}
        {isLoading ? <JobSkeletonGrid /> : (
          jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.slice(0, 3).map((job, idx) => (
                <TrendingJobCard key={job.id} job={job} idx={idx} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No Trending jobs found</p>
            </div>
          ))
        }
      </div>
    </section>
  );
};


const TrendingJobCard = ({ job, idx }: { job: TJob, idx: number }) => {
  return (
    <div
      key={job.id}
      className={cn("flex flex-col rounded-2xl p-6 justify-between transition-transform hover:shadow-lg", {
        "bg-emerald-100": idx === 0,
        "bg-blue-100": idx === 1,
        "bg-green-100": idx === 2,
      })}
    >
      {/* Top Section */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {job.title}
            </h3>
            <p className="flex items-center gap-1 text-gray-700 text-sm font-medium ">
              Must Company
              <FaCircleCheck className="text-green-600 size-3.5" />
            </p>
          </div>
          {/* <div className={`${job.badgeColor} rounded-lg p-2 text-xl`}>
                    {job.logo}
                  </div> */}
        </div>

        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
          {job.description}
        </p>
      </div>

      {/* Details Section */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
          <MapPinIcon className="size-4" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
          <BriefcaseIcon className="size-4" />
          <span>{job.job_type}</span>
        </div>
      </div>

      {/* Salary and Button */}
      <div className="flex gap-4 justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-lg font-medium text-emerald-900">
            <DollarSignIcon className="size-4" />
            <span>{job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max} ${job.salary_currency}` : 'Not Specified'}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <ClockIcon className="size-3.5" />
            <span>Monthly</span>
          </div>
        </div>
        <Button variant="outline" size="lg" className="rounded-full" asChild>
          <Link href={`/jobs/${job.id}`}>
            Apply Now
          </Link>
        </Button>
      </div>
    </div>
  )
}