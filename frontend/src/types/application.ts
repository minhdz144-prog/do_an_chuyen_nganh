import { User } from './user';
import { Job } from './job';

export type ApplicationStatus = 'applied' | 'reviewing' | 'interview' | 'offered' | 'rejected';

export interface ApplicationHistory {
  status: ApplicationStatus;
  changedAt?: string;
  changedBy?: string;
  note?: string;
}

export interface Application {
  _id: string;
  job: any;
  candidate: any;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl?: string;
  statusHistory: ApplicationHistory[];
  interviewDate?: string;
  createdAt: string;
  updatedAt: string;
  score?: number; // Match score
  matchDetails?: any;
}
