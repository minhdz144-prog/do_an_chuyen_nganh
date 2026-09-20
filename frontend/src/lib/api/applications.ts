import axiosInstance, { ApiResponse, PaginatedResponse } from '../axios';
import { Application } from '@/types/application';

export const applicationsApi = {
  applyToJob: (jobId: string, data: { coverLetter?: string; resumeUrl?: string }): Promise<ApiResponse<{ application: Application }>> => {
    return axiosInstance.post(`/jobs/${jobId}/apply`, data) as Promise<any>;
  },

  getMyApplications: (params?: any): Promise<PaginatedResponse<{ applications: Application[] }>> => {
    return axiosInstance.get('/applications/me', { params }) as Promise<any>;
  },

  getJobApplications: (jobId: string, params?: any): Promise<PaginatedResponse<{ applications: Application[] }>> => {
    return axiosInstance.get(`/jobs/${jobId}/applications`, { params }) as Promise<any>;
  },

  updateApplicationStatus: (id: string, data: { status: string; note?: string; interviewDate?: string }): Promise<ApiResponse<{ application: Application }>> => {
    return axiosInstance.patch(`/applications/${id}/status`, data) as Promise<any>;
  }
};
