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
    <section className="py-16 px-4 bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto text-center max-w-4xl pt-8">
        <h1 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
          Find Your Dream Job Today
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Connect with top companies and discover opportunities that match your skills and aspirations. Your next career move starts here.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Job title, keywords, or company"
              className="h-12 pl-10 bg-background"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <div className="relative flex-1 max-w-md w-full">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Location"
              className="h-12 pl-10 bg-background"
              value={locationValue}
              onChange={(e) => setLocationValue(e.target.value)}
            />
          </div>
          <Button size="lg" onClick={handleSearch}>
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
