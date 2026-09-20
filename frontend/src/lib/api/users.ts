import axiosInstance, { ApiResponse } from '../axios';
import { Job } from '@/types/job';

export const usersApi = {
  getSavedJobs: (): Promise<ApiResponse<{ savedJobs: Job[] }>> => {
    return axiosInstance.get('/users/saved-jobs') as Promise<any>;
  },

  toggleSavedJob: (jobId: string): Promise<ApiResponse<null>> => {
    return axiosInstance.post(`/users/saved-jobs/${jobId}`) as Promise<any>;
  }
};
