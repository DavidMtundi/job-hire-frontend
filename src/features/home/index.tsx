import { CallToActionSection } from "./sections/call-to-action-section";
import { FeaturedJobsSection } from "./sections/featured-jobs-section";
import { HeroSection } from "./sections/hero-section";
import { JobCategorySection } from "./sections/job-category-section";
import { TrendingJobsSection } from "./sections/trending-jobs-section";

export default function HomeScreen() {
  return (
    <div>      
      <HeroSection />
      <TrendingJobsSection />
      <JobCategorySection />
      <FeaturedJobsSection />
      <CallToActionSection />
    </div>
  );
};
