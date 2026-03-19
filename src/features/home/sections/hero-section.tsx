"use client";

import { Briefcase, MapPin, Search, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useRouter } from "next/navigation";

export const HeroSection = () => {
  const [searchValue, setSearchValue] = useState("");
  const [locationValue, setLocationValue] = useState("");

  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchValue.trim()) {
      params.append('search', searchValue.trim());
    }
    if (locationValue.trim()) {
      params.append('location', locationValue.trim());
    }

    const queryString = params.toString();
    const url = queryString ? `/jobs?${queryString}` : '/jobs';

    router.push(url);
  }

  return (
    <section className="relative overflow-hidden py-24 px-4 bg-background">
      {/* Decorative blurred background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[70%] rounded-full bg-primary/20 blur-[120px] mix-blend-multiply opacity-50 animate-pulse" />
        <div className="absolute top-[10%] -right-[10%] w-[50%] h-[60%] rounded-full bg-indigo-500/20 blur-[100px] mix-blend-multiply opacity-50" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-violet-400/20 blur-[120px] mix-blend-multiply opacity-50" />
      </div>

      <div className="container mx-auto text-center max-w-4xl relative z-10 pt-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 border border-primary/20 backdrop-blur-md shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          The New Standard in Hiring
        </div>

        <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 tracking-tight text-foreground/90">
          Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-violet-500">Dream Job</span> Today
        </h1>
        <p className="text-xl lg:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light">
          Connect with top companies and discover opportunities that match your skills and aspirations.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 p-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 max-w-3xl mx-auto mb-16 relative">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Job title, keywords, or company"
              className="h-14 pl-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base shadow-none rounded-2xl"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <div className="hidden sm:block w-px bg-slate-200 dark:bg-slate-700 my-2" />
          <div className="relative flex-1 group">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Location"
              className="h-14 pl-12 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base shadow-none rounded-2xl"
              value={locationValue}
              onChange={(e) => setLocationValue(e.target.value)}
            />
          </div>
          <Button size="lg" className="h-14 px-8 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5" onClick={handleSearch}>
            Search Jobs
          </Button>
        </div>

        <div className="flex flex-wrap gap-6 justify-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>10,000+ Jobs</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>5,000+ Companies</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>95% Success Rate</span>
          </div>
        </div>
      </div>
    </section>
  )
}
