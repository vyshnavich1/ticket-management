'use client';

import { motion } from 'framer-motion';
import { Ticket } from '@/types';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface TicketCardProps {
  ticket: Ticket;
  onEdit: (ticket: Ticket) => void;
  onDelete: (id: string) => void;
  onView: (ticket: Ticket) => void;
}

export default function TicketCard({ ticket, onEdit, onDelete, onView }: TicketCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => onView(ticket)}
          className="text-left font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 flex-1"
        >
          {ticket.title}
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      <p className="text-sm text-gray-500 line-clamp-2">{ticket.description}</p>

      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span className="bg-gray-50 px-2 py-1 rounded-lg">{ticket.category}</span>
        <span>·</span>
        <span>{ticket.assignedPerson}</span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <StatusBadge status={ticket.status} />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(ticket)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(ticket._id)}>Delete</Button>
        </div>
      </div>
    </motion.div>
  );
}

export function TicketCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="h-5 bg-gray-100 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-100 rounded w-full mb-1" />
      <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
      <div className="flex gap-2">
        <div className="h-6 bg-gray-100 rounded-full w-16" />
        <div className="h-6 bg-gray-100 rounded-full w-20" />
      </div>
    </div>
  );
}
