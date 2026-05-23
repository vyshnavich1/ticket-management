import { Server } from 'socket.io';

export function getIO(): Server | null {
  return (global as unknown as { io?: Server }).io ?? null;
}

export function emitTicketUpdate(ticketId: string) {
  const io = getIO();
  io?.emit('ticket:updated', { ticketId });
}
