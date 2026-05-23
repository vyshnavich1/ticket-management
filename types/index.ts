export type Priority = 'low' | 'medium' | 'high';
export type Status = 'open' | 'in-progress' | 'closed';

export interface ActivityEntry {
  action: string;
  timestamp: string;
}

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  assignedPerson: string;
  status: Status;
  createdBy: string;
  activity: ActivityEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketFormData {
  title: string;
  description: string;
  priority: Priority;
  category: string;
  assignedPerson: string;
  status: Status;
}

export interface TicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  totalPages: number;
  chaosScenario?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}
