'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Ticket } from '@/types';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import ActivityTimeline from '@/components/tickets/ActivityTimeline';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import TicketForm from '@/components/tickets/TicketForm';
import { TicketFormData } from '@/types';

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/tickets/${id}`);
    if (res.ok) setTicket(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function handleEdit(data: TicketFormData) {
    const res = await fetch(`/api/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update ticket');
    setEditOpen(false);
    load();
  }

  async function handleStatusChange(newStatus: string) {
    setStatusLoading(true);
    await fetch(`/api/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatusLoading(false);
    load();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Ticket not found.</p>
        <Button variant="secondary" onClick={() => router.push('/dashboard')}>Back to dashboard</Button>
      </div>
    );
  }

  const statuses = ['open', 'in-progress', 'closed'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-semibold text-gray-900 truncate">{ticket.title}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl font-bold text-gray-900">{ticket.title}</h1>
                <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>Edit</Button>
              </div>
              <p className="text-gray-600 leading-relaxed">{ticket.description}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{ticket.category}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <h2 className="font-semibold text-gray-900 mb-4">Activity Timeline</h2>
              <ActivityTimeline activity={ticket.activity} />
            </motion.div>
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4"
            >
              <h2 className="font-semibold text-gray-900">Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Assigned to</span>
                  <span className="font-medium text-gray-800">{ticket.assignedPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium text-gray-800">{ticket.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="font-medium text-gray-800">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Updated</span>
                  <span className="font-medium text-gray-800">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3"
            >
              <h2 className="font-semibold text-gray-900">Change Status</h2>
              <div className="space-y-2">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={statusLoading || ticket.status === s}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      ticket.status === s
                        ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent'
                    } disabled:cursor-not-allowed`}
                  >
                    {s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                    {ticket.status === s && <span className="float-right text-indigo-400">✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Ticket">
        <TicketForm initial={ticket} onSubmit={handleEdit} onCancel={() => setEditOpen(false)} />
      </Modal>
    </div>
  );
}
