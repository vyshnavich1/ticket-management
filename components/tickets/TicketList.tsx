'use client';

import { AnimatePresence } from 'framer-motion';
import { Ticket } from '@/types';
import TicketCard, { TicketCardSkeleton } from './TicketCard';

interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
  onEdit: (ticket: Ticket) => void;
  onDelete: (id: string) => void;
  onView: (ticket: Ticket) => void;
}

export default function TicketList({ tickets, loading, onEdit, onDelete, onView }: TicketListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <TicketCardSkeleton key={i} />)}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🎫</div>
        <p className="text-gray-500 font-medium">No tickets found</p>
        <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence>
        {tickets.map((ticket) => (
          <TicketCard key={ticket._id} ticket={ticket} onEdit={onEdit} onDelete={onDelete} onView={onView} />
        ))}
      </AnimatePresence>
    </div>
  );
}
