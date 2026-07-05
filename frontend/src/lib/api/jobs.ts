import axiosInstance, { PaginatedResponse, ApiResponse } from '../axios';

export interface JobListFilters {
  keyword?: string;
  location?: string;
  jobType?: string;
  level?: string;
  page?: string;
  limit?: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  location: string;
  salary: { min: number; max: number };
  jobType: 'full-time' | 'part-time' | 'remote' | 'internship' | 'contract';
  level: 'intern' | 'fresher' | 'junior' | 'middle' | 'senior' | 'lead';
  deadline: string;
  createdAt: string;
  views: number;
  company: {
    _id: string;
    name: string;
    logo?: string;
    location: string;
    industry?: string;
    description?: string;
    website?: string;
    size?: string;
  };
  employer: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

export const getJobs = async (filters?: JobListFilters): Promise<PaginatedResponse<{ jobs: Job[] }>> => {
  // Vì interceptor đã unwrap trả thẳng về payload của backend, nên ta ép kiểu trực tiếp:
  return axiosInstance.get('/jobs', { params: filters }) as unknown as Promise<PaginatedResponse<{ jobs: Job[] }>>;
};

export const getJobById = async (id: string): Promise<ApiResponse<{ job: Job }>> => {
  return axiosInstance.get(`/jobs/${id}`) as unknown as Promise<ApiResponse<{ job: Job }>>;
};
