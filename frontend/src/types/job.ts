import { Company } from './company';

export interface Salary {
  min: number;
  max: number;
}

export interface Job {
  _id: string;
  title: string;
  company: any; // populated Company
  employer: any; // populated User
  description: string;
  requiredSkills: string[];
  salary: Salary;
  location: string;
  jobType: 'full-time' | 'part-time' | 'remote' | 'internship' | 'contract';
  level?: 'intern' | 'fresher' | 'junior' | 'middle' | 'senior' | 'lead';
  status: 'active' | 'closed' | 'draft';
  deadline?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  
  // AI Matching metadata
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
}

export interface JobFilters {
  keyword?: string;
  location?: string;
  jobType?: string;
  level?: string;
  salaryMin?: string;
  salaryMax?: string;
  page?: number | string;
  limit?: number | string;
}

export interface JobCreatePayload {
  title: string;
  description: string;
  requiredSkills: string[];
  salary: Salary;
  location: string;
  jobType: string;
  level?: string;
  deadline?: string;
  status?: string;
}
