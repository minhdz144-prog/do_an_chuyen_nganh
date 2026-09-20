import axiosInstance, { ApiResponse } from '../axios';
import { Company } from '@/types/company';

export const companiesApi = {
  getCompanyById: (id: string): Promise<ApiResponse<{ company: Company }>> => {
    return axiosInstance.get(`/companies/${id}`) as Promise<any>;
  },

  updateCompany: (id: string, data: Partial<Company>): Promise<ApiResponse<{ company: Company }>> => {
    return axiosInstance.patch(`/companies/${id}`, data) as Promise<any>;
  },

  getMyCompany: (): Promise<ApiResponse<{ company: Company }>> => {
    return axiosInstance.get('/companies/me') as Promise<any>;
  }
};
