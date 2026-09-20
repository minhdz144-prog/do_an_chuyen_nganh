import axiosInstance, { PaginatedResponse, ApiResponse } from '../axios';
import { Job, JobFilters, JobCreatePayload } from '@/types/job';

export const jobsApi = {
  getJobs: (filters?: JobFilters & { skills?: string }): Promise<PaginatedResponse<{ jobs: Job[] }>> => {
    console.log('getJobs filters:', filters);
    if (filters?.skills) {
      console.log('Routing to AI Search');
      return axiosInstance.get('/jobs/ai-search', { params: filters }) as Promise<any>;
    }
    console.log('Routing to Fulltext Search');
    return axiosInstance.get('/jobs', { params: filters }) as Promise<any>;
  },

  getJobById: (id: string): Promise<ApiResponse<{ job: Job; relatedJobs?: Job[] }>> => {
    return axiosInstance.get(`/jobs/${id}`) as Promise<any>;
  },

  createJob: (data: JobCreatePayload): Promise<ApiResponse<{ job: Job }>> => {
    return axiosInstance.post('/jobs', data) as Promise<any>;
  },

  updateJob: (id: string, data: Partial<JobCreatePayload>): Promise<ApiResponse<{ job: Job }>> => {
    return axiosInstance.patch(`/jobs/${id}`, data) as Promise<any>;
  },

  deleteJob: (id: string): Promise<ApiResponse<null>> => {
    return axiosInstance.delete(`/jobs/${id}`) as Promise<any>;
  }
};

// Backward compatibility
export const getJobs = jobsApi.getJobs;
export const getJobById = jobsApi.getJobById;

