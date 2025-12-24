'use client'

import { Check, DownloadIcon, EditIcon, ExternalLinkIcon, EyeIcon, FileText, MailIcon, MapPinIcon, PhoneIcon, TriangleAlertIcon, UploadIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { FaCircleCheck, FaLinkedin } from "react-icons/fa6";
import { useGetAuthUserProfileQuery } from '~/apis/auth/queries';
import { useUploadResumeMutation } from '~/apis/resume/queries';
import { useUpdateCandidateMutation } from '~/apis/candidates/queries';
import { TCandidate, TUpdateCandidate } from '~/apis/candidates/schema';
import { Spinner } from '~/components/spinner';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { useQueryClient } from '@tanstack/react-query';

const data1: TCandidate = {
  id: "14485ec2-ce6b-40ba-9b61-112828c2fae0",
  user_id: "ce6b-40ba-9b61-112828c2fae0-14485ec2",
  first_name: "Biprodas",
  last_name: "Roy",
  email: "biprodas123@gmail.com",
  phone: "+8801740467722",
  address: "Jashore-7400, Bangladesh",
  linkedin_url: "https://www.linkedin.com",

  current_position: "Software Engineer",
  years_experience: 6,

  stack: [
    "Full-Stack", "MERN"
  ],
  skills: [
    "C/C++",
    "Java",
    "Python",
    "JavaScript",
    "TypeScript",
    "React.js",
    "Next.js",
    "React Native",
    "Redux",
    "Bootstrap",
    "Tailwind",
    "Node.js",
    "Express.js",
    "Nest.js",
    "FastAPI",
    "Rest API",
    "GraphQL",
    "Microservices",
    "PostgreSQL",
    "MySQL",
    "DynamoDB",
    "MongoDB",
    "Redis",
    "Git",
    "Github",
    "BitBucket",
    "Linux",
    "CI/CD",
    "Docker",
    "AWS",
    "Problem Solving",
    "Leadership",
    "Creative Thinking",
    "Flexibility",
    "Agile Development"
  ],
  summary: "Aspiring to work with a passionate software engineering team in an established/promising organization where I can utilize my existing skills to contribute in the accomplishment of organizational goals and gain quality experiences.",
  expected_salary: "3000",
  last_education: "B.Sc in Computer Science & Engineering",
  joining_availability: "1 month",
  resume_url: "",
  metadata: {},
  created_at: "2025-09-04T02:59:21.189451",
  updated_at: "2025-09-04T02:59:21.189451",
  user_email: "mejabo3081@besaies.com"
}


export const CandidateProfile = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: userProfile, isLoading, isError } = useGetAuthUserProfileQuery();
  const { mutate: uploadResume, isPending: isUploading } = useUploadResumeMutation();
  const { mutate: updateCandidate, isPending: isUpdating } = useUpdateCandidateMutation();

  const [formData, setFormData] = useState<Partial<TUpdateCandidate>>({});

  if (isLoading) return <Spinner className="size-6" />
  if (isError) return (
      <Alert>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load profile. Please try again later.</AlertDescription>
      </Alert>
  )

  if (!isLoading && !userProfile?.data?.candidate_profile) return (
    <Alert className='mb-4'>
      <AlertTitle>No profile found</AlertTitle>
      <AlertDescription>Please complete your profile to view your profile.</AlertDescription>
    </Alert>
  )
  
  const candidateProfile = userProfile?.data?.candidate_profile || {} as TCandidate;
  const isProfileComplete = userProfile?.data?.is_profile_complete;
  const userData = userProfile?.data;
  const resumeUrl = candidateProfile.resume_url;

  const handleEditClick = () => {
    setFormData({
      id: candidateProfile.id,
      first_name: candidateProfile.first_name || '',
      last_name: candidateProfile.last_name || '',
      email: candidateProfile.email || '',
      phone: candidateProfile.phone || '',
      address: candidateProfile.address || '',
      current_position: candidateProfile.current_position || '',
      years_experience: candidateProfile.years_experience || 0,
      stack: candidateProfile.stack || [],
      skills: candidateProfile.skills || [],
      linkedin_url: candidateProfile.linkedin_url || '',
      summary: candidateProfile.summary || '',
      expected_salary: candidateProfile.expected_salary || '',
      last_education: candidateProfile.last_education || '',
      joining_availability: candidateProfile.joining_availability || 'immediately',
      resume_url: candidateProfile.resume_url || '',
      metadata: candidateProfile.metadata || {},
    });
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setFormData({});
  };

  const handleSave = () => {
    if (!formData.id) {
      toast.error("Candidate ID is missing");
      return;
    }

    updateCandidate(formData as TUpdateCandidate, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
        setIsEditMode(false);
        queryClient.invalidateQueries({ queryKey: ["get-auth-user-profile"] });
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to update profile. Please try again.");
      },
    });
  };

  const handleInputChange = (field: keyof TUpdateCandidate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.type.includes('pdf')) {
        toast.error("Please upload a PDF file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadResume = () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!session?.user?.id) {
      toast.error("Please login to upload resume");
      return;
    }

    uploadResume(
      { userId: session.user.id, file: selectedFile },
      {
        onSuccess: (response) => {
          const resumeUrl = response?.data?.resume_url;
          if (resumeUrl) {
            toast.success(
              <div className="space-y-2">
                <p className="font-medium">Resume uploaded successfully!</p>
              

              </div>,
              { duration: 8000 }
            );
          } else {
            toast.success("Resume uploaded successfully");
          }
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          queryClient.invalidateQueries({ queryKey: ["get-auth-user-profile"] });
        },
        onError: (error) => {
          toast.error("Failed to upload resume. Please try again.");
        },
      }
    );
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='w-full'>
          <TabsTrigger value="personal">Personal Details</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="experience">Work Experience</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="additional">Additional Details</TabsTrigger>
        </TabsList>
        <TabsContent value="personal">
          <Card>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between gap-4'>
                <div className='space-y-1 flex-1'>
                  <Label>Name</Label>
                  <div className='flex items-center gap-3'>
                    {isEditMode ? (
                      <div className='flex gap-2 flex-1'>
                        <Input
                          value={formData.first_name || ''}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          placeholder="First Name"
                          className='flex-1'
                        />
                        <Input
                          value={formData.last_name || ''}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          placeholder="Last Name"
                          className='flex-1'
                        />
                      </div>
                    ) : (
                      <>
                        <div className='text-2xl font-bold text-gray-800'>{candidateProfile.first_name} {candidateProfile.last_name}</div>
                        <Tooltip>
                          <TooltipTrigger>
                            {isProfileComplete ?
                              <FaCircleCheck className='size-3.5 text-green-500 mt-1' /> :
                              <TriangleAlertIcon className='size-3.5 text-yellow-500 mt-1' />
                            }
                          </TooltipTrigger>
                          <TooltipContent>Profile {isProfileComplete ? 'Completed' : 'Incomplete.'}</TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </div>
                <div className='flex gap-2'>
                  {isEditMode ? (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={isUpdating}
                        size='sm'
                      >
                        {isUpdating ? (
                          <>
                            <Spinner className='size-4 mr-2' /> Saving...
                          </>
                        ) : (
                          <>
                            <Check className='h-4 w-4 mr-2' /> Save
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant='outline'
                        size='sm'
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleEditClick}
                      variant='outline'
                      size='sm'
                    >
                      <EditIcon className='h-4 w-4 mr-2' /> Edit
                    </Button>
                  )}
                </div>
              </div>
              <div className='grid grid-cols-3 gap-4'>
                <div className='space-y-1'>
                  <Label><MailIcon className='size-3.5' /> Email</Label>
                  {isEditMode ? (
                    <Input
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Email"
                    />
                  ) : (
                    <p>{candidateProfile.email}</p>
                  )}
                </div>
                <div className='space-y-1'>
                  <Label><PhoneIcon className='size-3.5' /> Phone</Label>
                  {isEditMode ? (
                    <Input
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Phone"
                    />
                  ) : (
                    <p>{candidateProfile.phone}</p>
                  )}
                </div>
                <div className='space-y-1'>
                  <Label><MapPinIcon className='size-3.5' /> Address</Label>
                  {isEditMode ? (
                    <Input
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Address"
                    />
                  ) : (
                    <p>{candidateProfile.address}</p>
                  )}
                </div>
              </div>
              <div className='space-y-2'>
                <Label>LinkedIn Profile</Label>
                {isEditMode ? (
                  <Input
                    value={formData.linkedin_url || ''}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    placeholder="LinkedIn URL"
                  />
                ) : (
                  candidateProfile.linkedin_url ? (
                    <Button variant='link' size='xs' asChild className='bg-gray-100'>
                      <Link href={candidateProfile.linkedin_url} target='_blank' rel='noopener noreferrer'>
                        <FaLinkedin className='size-3.5' /> LinkedIn <ExternalLinkIcon className='size-3.5' />
                      </Link>
                    </Button>
                  ) : <span className='text-sm text-gray-700'>Not available</span>
                )}
              </div>
              <div className='space-y-2'>
                <Label>Resume</Label>
                {resumeUrl ? (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Button variant='outline' size='sm' asChild>
                        <Link href={resumeUrl} target='_blank' rel='noopener noreferrer'>
                          <EyeIcon className='h-4 w-4 mr-2' /> View Resume <ExternalLinkIcon className='h-3 w-3 ml-1' />
                        </Link>
                      </Button>
                      
                    </div>
                    
                  </div>
                ) : (
                  <span className='text-sm text-gray-700'>No resume uploaded</span>
                )}
              </div>
              <div className='space-y-2'>
                <Label>Upload/Update Resume</Label>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Input
                      ref={fileInputRef}
                      type='file'
                      accept='.pdf,application/pdf'
                      onChange={handleFileSelect}
                      className='flex-1'
                    />
                    {selectedFile && (
                      <Button variant='outline' size='sm' onClick={handleRemoveFile}>
                        <XIcon className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                  
                  {selectedFile && (
                    <Button
                      onClick={handleUploadResume}
                      disabled={isUploading}
                      className='w-full'
                    >
                      {isUploading ? (
                        <>
                          <Spinner className='size-4 mr-2' /> Uploading...
                        </>
                      ) : (
                        <>
                          <UploadIcon className='h-4 w-4 mr-2' /> Upload Resume
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="education">
          <Card>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between gap-4'>
                <div className='space-y-1 flex-1'>
                  <Label>Last Education</Label>
                  {isEditMode ? (
                    <Input
                      value={formData.last_education || ''}
                      onChange={(e) => handleInputChange('last_education', e.target.value)}
                      placeholder="Last Education"
                    />
                  ) : (
                    <p className='text-gray-900'>{candidateProfile.last_education}</p>
                  )}
                </div>
                <div className='flex gap-2'>
                  {isEditMode ? (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={isUpdating}
                        size='sm'
                      >
                        {isUpdating ? (
                          <>
                            <Spinner className='size-4 mr-2' /> Saving...
                          </>
                        ) : (
                          <>
                            <Check className='h-4 w-4 mr-2' /> Save
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant='outline'
                        size='sm'
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleEditClick}
                      variant='outline'
                      size='sm'
                    >
                      <EditIcon className='h-4 w-4 mr-2' /> Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="experience">
          <Card>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between gap-4'>
                <div className='space-y-4 flex-1'>
                  <div className='space-y-1'>
                    <Label>Current Position</Label>
                    {isEditMode ? (
                      <Input
                        value={formData.current_position || ''}
                        onChange={(e) => handleInputChange('current_position', e.target.value)}
                        placeholder="Current Position"
                      />
                    ) : (
                      <p className='text-gray-900'>{candidateProfile.current_position}</p>
                    )}
                  </div>
                  <div className='space-y-1'>
                    <Label>Professional Experience (years)</Label>
                    {isEditMode ? (
                      <Input
                        type='number'
                        value={formData.years_experience || 0}
                        onChange={(e) => handleInputChange('years_experience', parseInt(e.target.value) || 0)}
                        placeholder="Years of Experience"
                        min={0}
                      />
                    ) : (
                      <p className='text-gray-900'>{candidateProfile.years_experience} years</p>
                    )}
                  </div>
                </div>
                <div className='flex gap-2'>
                  {isEditMode ? (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={isUpdating}
                        size='sm'
                      >
                        {isUpdating ? (
                          <>
                            <Spinner className='size-4 mr-2' /> Saving...
                          </>
                        ) : (
                          <>
                            <Check className='h-4 w-4 mr-2' /> Save
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant='outline'
                        size='sm'
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleEditClick}
                      variant='outline'
                      size='sm'
                    >
                      <EditIcon className='h-4 w-4 mr-2' /> Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="skills">
          <Card>
            <CardContent className='space-y-6'>
              <div className='flex items-center justify-between gap-4'>
                <div className='space-y-6 flex-1'>
                  <div className='space-y-2'>
                    <Label>Stack/Technologies (comma-separated)</Label>
                    {isEditMode ? (
                      <Input
                        value={Array.isArray(formData.stack) ? formData.stack.join(', ') : ''}
                        onChange={(e) => handleInputChange('stack', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                        placeholder="e.g., Front-End, Back-End, Full-Stack"
                      />
                    ) : (
                      <div className='flex flex-wrap gap-2'>
                        {candidateProfile.stack && candidateProfile.stack.length > 0 ? (
                          candidateProfile.stack.map((stack) => (
                            <Badge key={stack}>{stack}</Badge>
                          ))
                        ) : (
                          <span className='text-sm text-gray-500'>Not specified</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label>Skills (comma-separated)</Label>
                    {isEditMode ? (
                      <Input
                        value={Array.isArray(formData.skills) ? formData.skills.join(', ') : ''}
                        onChange={(e) => handleInputChange('skills', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                        placeholder="e.g., NextJs, Flutter, React"
                      />
                    ) : (
                      <div className='flex flex-wrap gap-2'>
                        {candidateProfile.skills && candidateProfile.skills.length > 0 ? (
                          candidateProfile.skills.map((skill) => (
                            <Badge key={skill} variant='outline' className='bg-slate-100'>{skill}</Badge>
                          ))
                        ) : (
                          <span className='text-sm text-gray-500'>Not specified</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className='flex gap-2'>
                  {isEditMode ? (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={isUpdating}
                        size='sm'
                      >
                        {isUpdating ? (
                          <>
                            <Spinner className='size-4 mr-2' /> Saving...
                          </>
                        ) : (
                          <>
                            <Check className='h-4 w-4 mr-2' /> Save
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant='outline'
                        size='sm'
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleEditClick}
                      variant='outline'
                      size='sm'
                    >
                      <EditIcon className='h-4 w-4 mr-2' /> Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="additional">
          <Card>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-4 flex-1'>
                  <div className='space-y-1'>
                    <Label>Summary</Label>
                    {isEditMode ? (
                      <Textarea
                        value={formData.summary || ''}
                        onChange={(e) => handleInputChange('summary', e.target.value)}
                        placeholder="Summary"
                        rows={4}
                      />
                    ) : (
                      <p className='text-gray-900 text-sm'>{candidateProfile.summary || 'Not provided'}</p>
                    )}
                  </div>
                  <div className='space-y-1'>
                    <Label>Expected Salary</Label>
                    {isEditMode ? (
                      <Input
                        value={formData.expected_salary || ''}
                        onChange={(e) => handleInputChange('expected_salary', e.target.value)}
                        placeholder="Expected Salary"
                      />
                    ) : (
                      <p className='text-gray-900'>${candidateProfile.expected_salary || 'Not specified'}</p>
                    )}
                  </div>
                  <div className='space-y-1'>
                    <Label>Joining Availability</Label>
                    {isEditMode ? (
                      <Input
                        value={formData.joining_availability || ''}
                        onChange={(e) => handleInputChange('joining_availability', e.target.value)}
                        placeholder="e.g., immediately, 1 week, 1 month"
                      />
                    ) : (
                      <p className='text-gray-900'>{candidateProfile.joining_availability || 'Not specified'}</p>
                    )}
                  </div>
                </div>
                <div className='flex gap-2'>
                  {isEditMode ? (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={isUpdating}
                        size='sm'
                      >
                        {isUpdating ? (
                          <>
                            <Spinner className='size-4 mr-2' /> Saving...
                          </>
                        ) : (
                          <>
                            <Check className='h-4 w-4 mr-2' /> Save
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant='outline'
                        size='sm'
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleEditClick}
                      variant='outline'
                      size='sm'
                    >
                      <EditIcon className='h-4 w-4 mr-2' /> Edit
                    </Button>
                  )}
                </div>
              </div>
              <div className='space-y-1'>
                <Label>User ID</Label>
                <p className='text-gray-900 text-sm font-mono'>{userData?.id || 'N/A'}</p>
              </div>
              <div className='space-y-1'>
                <Label>Username</Label>
                <p className='text-gray-900'>{userData?.username || 'N/A'}</p>
              </div>
              <div className='space-y-1'>
                <Label>Email Verified</Label>
                <Badge variant={userData?.is_email_verified ? 'default' : 'destructive'}>
                  {userData?.is_email_verified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
              <div className='space-y-1'>
                <Label>Account Status</Label>
                <Badge variant={userData?.is_active ? 'default' : 'destructive'}>
                  {userData?.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className='space-y-1'>
                <Label>Account Created</Label>
                <p className='text-gray-900 text-sm'>
                  {userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
