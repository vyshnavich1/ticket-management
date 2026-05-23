import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Ticket from '@/models/Ticket';
import { pickChaosScenario, applyChaos } from '@/lib/chaos';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scenario = pickChaosScenario();

    if (scenario === 'failure') {
      return NextResponse.json(
        { error: 'Service temporarily unavailable', chaosScenario: 'failure' },
        { status: 503 }
      );
    }

    await applyChaos(scenario);
    await connectDB();

    if (scenario === 'empty') {
      return NextResponse.json({ tickets: [], total: 0, page: 1, totalPages: 0, chaosScenario: 'empty' });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { assignedPerson: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const [tickets, total] = await Promise.all([
      Ticket.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Ticket.countDocuments(query),
    ]);

    let resultTickets = tickets;
    if (scenario === 'duplicate' && tickets.length > 0) {
      const dupes = tickets.slice(0, Math.min(3, tickets.length));
      resultTickets = [...tickets, ...dupes];
    }

    return NextResponse.json({
      tickets: resultTickets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      chaosScenario: scenario,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, priority, category, assignedPerson, status } = body;

    if (!title || !description || !category || !assignedPerson) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    await connectDB();

    const userId = (session.user as { id?: string }).id;
    const ticket = await Ticket.create({
      title,
      description,
      priority: priority || 'medium',
      category,
      assignedPerson,
      status: status || 'open',
      createdBy: userId,
      activity: [{ action: 'Ticket created', timestamp: new Date() }],
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
