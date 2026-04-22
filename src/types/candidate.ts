export type CandidateStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'INTERESTED'
  | 'DOCUMENTS_PENDING'
  | 'INTERVIEW_SCHEDULED'
  | 'FOLLOW_UP_REQUIRED'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export interface CandidateAssignment {
  user: { id: string; name: string; email: string };
  assignedAt: string;
}

export interface Candidate {
  id: string;
  fullName: string;
  phoneNumber: string;
  whatsappNumber?: string | null;
  email?: string | null;
  city?: string | null;
  qualification?: string | null;
  skills?: string | null;
  experience?: string | null;
  preferredRole?: string | null;
  status: CandidateStatus;
  source?: string | null;
  createdAt: string;
  updatedAt: string;
  assignments: CandidateAssignment[];
}

export interface CandidateDetail extends Candidate {
  notes: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string };
  }>;
  followUps: Array<{
    id: string;
    dueAt: string;
    status: string;
    remarks?: string | null;
    completedAt?: string | null;
    createdAt: string;
    user: { id: string; name: string };
  }>;
  statusHistory: Array<{
    id: string;
    oldStatus: CandidateStatus;
    newStatus: CandidateStatus;
    changedAt: string;
    changedBy: { id: string; name: string };
  }>;
}

export interface PaginatedCandidates {
  candidates: Candidate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
