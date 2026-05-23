'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Ticket, TicketFormData } from '@/types';
import { useTickets, useStats } from '@/hooks/useTickets';
import { useDebounce } from '@/hooks/useDebounce';
import StatCard from '@/components/dashboard/StatCard';
import TicketList from '@/components/tickets/TicketList';
import TicketFilters from '@/components/tickets/TicketFilters';
import TicketForm from '@/components/tickets/TicketForm';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const { tickets, totalPages, isLoading, isError, errorMessage, mutate, chaosScenario } = useTickets({
    search: debouncedSearch,
    status,
    priority,
    page,
  });
  const { stats, mutate: mutateStats } = useStats();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);

  const refresh = useCallback(() => {
    mutate();
    mutateStats();
  }, [mutate, mutateStats]);

  useEffect(() => { setPage(1); }, [debouncedSearch, status, priority]);

  useEffect(() => {
    let socket: ReturnType<typeof io> | null = null;
    try {
      socket = io({ path: '/socket.io', timeout: 3000, reconnectionAttempts: 2 });
      socket.on('ticket:updated', () => { mutate(); mutateStats(); });
    } catch {
      // Socket.io unavailable (serverless/Vercel) — SWR polling handles updates
    }
    return () => { socket?.disconnect(); };
  }, [mutate, mutateStats]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCreateOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  async function handleCreate(data: TicketFormData) {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    setCreateOpen(false);
    refresh();
  }

  async function handleEdit(data: TicketFormData) {
    if (!editTicket) return;
    const res = await fetch(`/api/tickets/${editTicket._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    setEditTicket(null);
    refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this ticket?')) return;
    await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
    refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">T</div>
            <span className="font-semibold text-gray-900">TicketFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{session?.user?.name}</span>
            <Button variant="secondary" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track and manage all support tickets</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Ticket
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total" value={stats?.total ?? 0} color="indigo" icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          } />
          <StatCard label="Open" value={stats?.open ?? 0} color="blue" icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          } />
          <StatCard label="In Progress" value={stats?.inProgress ?? 0} color="orange" icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          } />
          <StatCard label="Closed" value={stats?.closed ?? 0} color="gray" icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          } />
        </div>

        {chaosScenario && chaosScenario !== 'normal' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800"
          >
            <span>⚠️</span>
            <span>
              {chaosScenario === 'slow' && 'Response was delayed. Showing cached data.'}
              {chaosScenario === 'empty' && 'Server returned an empty response. No tickets to display.'}
              {chaosScenario === 'duplicate' && 'Duplicate records detected and removed automatically.'}
            </span>
            <Button variant="ghost" size="sm" className="ml-auto text-amber-800" onClick={refresh}>Retry</Button>
          </motion.div>
        )}

        {isError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800"
          >
            <span>⚠️</span>
            <span>{errorMessage || 'Failed to load tickets. Please try again.'}</span>
            <Button variant="ghost" size="sm" className="ml-auto text-red-800" onClick={refresh}>Retry</Button>
          </motion.div>
        )}

        <div className="space-y-4">
          <TicketFilters
            search={search}
            status={status}
            priority={priority}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onPriorityChange={setPriority}
          />

          <TicketList
            tickets={tickets}
            loading={isLoading}
            onEdit={setEditTicket}
            onDelete={handleDelete}
            onView={(t) => router.push(`/tickets/${t._id}`)}
          />

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </main>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Ticket">
        <TicketForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal open={!!editTicket} onClose={() => setEditTicket(null)} title="Edit Ticket">
        {editTicket && (
          <TicketForm initial={editTicket} onSubmit={handleEdit} onCancel={() => setEditTicket(null)} />
        )}
      </Modal>
    </div>
  );
}
