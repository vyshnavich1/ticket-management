import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Ticket from '@/models/Ticket';
import { emitTicketUpdate } from '@/lib/socket';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const ticket = await Ticket.findById(id).lean();
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    return NextResponse.json(ticket);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const ticket = await Ticket.findById(id);
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    const body = await req.json();
    const { title, description, priority, category, assignedPerson, status } = body;

    const activityEntries: { action: string; timestamp: Date }[] = [];

    if (status && status !== ticket.status) {
      activityEntries.push({
        action: `Status changed from "${ticket.status}" to "${status}"`,
        timestamp: new Date(),
      });
    }

    const hasFieldChange =
      (title && title !== ticket.title) ||
      (description && description !== ticket.description) ||
      (priority && priority !== ticket.priority) ||
      (category && category !== ticket.category) ||
      (assignedPerson && assignedPerson !== ticket.assignedPerson);

    if (hasFieldChange) {
      activityEntries.push({ action: 'Ticket edited', timestamp: new Date() });
    }

    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (priority) ticket.priority = priority;
    if (category) ticket.category = category;
    if (assignedPerson) ticket.assignedPerson = assignedPerson;
    if (status) ticket.status = status;

    ticket.activity.push(...activityEntries);
    await ticket.save();

    emitTicketUpdate(id);
    return NextResponse.json(ticket);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const ticket = await Ticket.findByIdAndDelete(id);
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    return NextResponse.json({ message: 'Ticket deleted' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
