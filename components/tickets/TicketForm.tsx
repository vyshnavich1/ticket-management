'use client';

import { useState, FormEvent } from 'react';
import { Ticket, TicketFormData, Priority, Status } from '@/types';
import Button from '@/components/ui/Button';

interface TicketFormProps {
  initial?: Ticket;
  onSubmit: (data: TicketFormData) => Promise<void>;
  onCancel: () => void;
}

const CATEGORIES = ['Bug', 'Feature', 'Support', 'Security', 'Performance', 'Other'];

export default function TicketForm({ initial, onSubmit, onCancel }: TicketFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<TicketFormData>({
    title: initial?.title || '',
    description: initial?.description || '',
    priority: initial?.priority || 'medium',
    category: initial?.category || '',
    assignedPerson: initial?.assignedPerson || '',
    status: initial?.status || 'open',
  });
  const [error, setError] = useState('');

  const set = (field: keyof TicketFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.category || !form.assignedPerson.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit(form);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div>
        <label className={labelClass}>Title *</label>
        <input className={inputClass} value={form.title} onChange={set('title')} placeholder="Brief summary of the issue" maxLength={100} />
      </div>

      <div>
        <label className={labelClass}>Description *</label>
        <textarea className={`${inputClass} resize-none`} rows={3} value={form.description} onChange={set('description')} placeholder="Detailed description..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Priority</label>
          <select className={inputClass} value={form.priority} onChange={set('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={form.status} onChange={set('status')}>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category *</label>
          <select className={inputClass} value={form.category} onChange={set('category')}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Assigned Person *</label>
          <input className={inputClass} value={form.assignedPerson} onChange={set('assignedPerson')} placeholder="Name" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial ? 'Update Ticket' : 'Create Ticket'}</Button>
      </div>
    </form>
  );
}
