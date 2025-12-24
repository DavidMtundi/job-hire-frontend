'use client';

import { ChevronRight } from 'lucide-react';
import { BriefcaseIcon, CodeIcon, PaletteIcon, UsersIcon, ShieldIcon, DollarSignIcon } from 'lucide-react';
import Link from 'next/link';
import { useGetCategoriesQuery } from '~/apis/categories/queries';
import { TCategory } from '~/apis/categories/schemas';
import { Button } from '~/components/ui/button';
import { CategorySkeletonGrid } from '../category-skeleton-grid';
import { MdOutlineCategory } from "react-icons/md";


const solutions = [
  {
    id: "1",
    slug: 'development',
    title: 'Development',
    description: 'Development jobs are available in this category',
    jobs: 48,
    icon: CodeIcon,
  },
  {
    id: "2",
    slug: 'design',
    title: 'UI/UX Design',
    description: 'UI/UX design jobs are available in this category',
    jobs: 78,
    icon: PaletteIcon,
  },
  {
    id: "3",
    slug: 'product-management',
    title: 'Product Management',
    description: 'Product management jobs are available in this category',
    jobs: 60,
    icon: BriefcaseIcon,
    highlighted: false,
  },
  {
    id: "4",
    slug: 'quality-assurance',
    title: 'Quality Assurance',
    description: 'Quality assurance jobs are available in this category',
    jobs: 70,
    icon: BriefcaseIcon,
    highlighted: false,
  },
  {
    id: "5",
    slug: 'devops-cloud',
    title: 'DevOps & Cloud',
    description: 'DevOps & cloud jobs are available in this category',
    jobs: 80,
    icon: BriefcaseIcon,
    highlighted: false,
  },
  {
    id: "6",
    slug: 'data-analytics',
    title: 'Data & Analytics',
    description: 'Data & analytics jobs are available in this category',
    jobs: 90,
    icon: BriefcaseIcon,
    highlighted: false,
  },
  {
    id: "7",
    slug: 'marketing',
    title: 'Marketing',
    description: 'Marketing jobs are available in this category',
    jobs: 58,
    icon: BriefcaseIcon,
  },
  {
    id: "8",
    slug: 'human-resources',
    title: 'Human Resources',
    description: 'Human resources jobs are available in this category',
    jobs: 120,
    icon: UsersIcon,
  },
  {
    id: "9",
    slug: 'business-development',
    title: 'Business Development',
    description: 'Business development jobs are available in this category',
    jobs: 31,
    icon: BriefcaseIcon,
  },
  {
    id: "10",
    slug: 'management',
    title: 'Management',
    description: 'Management jobs are available in this category',
    jobs: 52,
    icon: UsersIcon,
    highlighted: false,
  },
  {
    id: "11",
    slug: 'finance',
    title: 'Finance',
    description: 'Finance jobs are available in this category',
    jobs: 80,
    icon: DollarSignIcon,
    highlighted: false,
  },

  {
    id: "12",
    slug: 'security',
    title: 'Security',
    description: 'Security jobs are available in this category',
    jobs: 90,
    icon: ShieldIcon,
  },
];

export const JobCategorySection = () => {
  const { data: categoriesData, isLoading, error, refetch } = useGetCategoriesQuery();
  const categories = categoriesData?.data ?? [];

  return (
    <section className="w-full bg-slate-100 py-16 px-4 md:px-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-800">
            One platform Many Solutions
          </h1>
          <Link
            href="/jobs"
            className="text-slate-700 hover:text-slate-900 font-medium text-sm transition-colors hover:underline underline-offset-4"
          >
            See All Platform
          </Link>
        </div>

        {error && (
          <div className="flex flex-col gap-2 justify-center items-center h-full">
            <p className="text-gray-500">Error fetching Categories: {error.message}</p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {isLoading ? <CategorySkeletonGrid /> : (
          categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => {
                return (
                  <JobCategoryCard key={category.id} category={category} />
                );
              })}
            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No Categories found</p>
            </div>
          ))
        }
      </div>
    </section>
  );
};


const JobCategoryCard = ({ category }: { category: TCategory }) => {
  const Icon = MdOutlineCategory;

  return (
    <Link
      key={category.id}
      href={`/jobs?category=${category.slug}`}
      className='flex justify-between items-center gap-3 bg-white rounded-full px-3 py-2 hover:shadow-sm transition-shadow'
    >
      <div className='flex items-center gap-2'>
        <div className='bg-slate-100 p-3 rounded-full'>
          <Icon className='size-5' />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {category.name}
          </h3>
          <p className="text-sm text-gray-600">
            {category.total_jobs} Jobs Available
          </p>
        </div>
      </div>
      <div>
        <ChevronRight className='size-5' />
      </div>
    </Link>
  )
}
