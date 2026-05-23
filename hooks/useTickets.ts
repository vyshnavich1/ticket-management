import useSWR from 'swr';
import { TicketsResponse } from '@/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.error || 'Failed to fetch tickets');
    throw err;
  }
  return res.json();
};

interface UseTicketsParams {
  search: string;
  status: string;
  priority: string;
  page: number;
}

export function useTickets({ search, status, priority, page }: UseTicketsParams) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  if (priority) params.set('priority', priority);
  params.set('page', String(page));

  const { data, error, isLoading, mutate } = useSWR<TicketsResponse>(
    `/api/tickets?${params.toString()}`,
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 15000 }
  );

  const tickets = data?.tickets
    ? [...new Map(data.tickets.map((t) => [t._id, t])).values()]
    : [];

  return {
    tickets,
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    chaosScenario: data?.chaosScenario,
    isLoading,
    isError: !!error,
    errorMessage: error?.message,
    mutate,
  };
}

export function useStats() {
  const { data, isLoading, mutate } = useSWR<{ total: number; open: number; inProgress: number; closed: number }>(
    '/api/tickets/stats',
    fetcher,
    { revalidateOnFocus: false }
  );
  return { stats: data, isLoading, mutate };
}
