import { ActivityEntry } from '@/types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ActivityTimeline({ activity }: { activity: ActivityEntry[] }) {
  if (!activity?.length) {
    return <p className="text-sm text-gray-400 italic">No activity yet.</p>;
  }

  return (
    <ol className="relative border-l border-gray-200 space-y-4 ml-2">
      {[...activity].reverse().map((entry, i) => (
        <li key={i} className="ml-4">
          <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white bg-indigo-400" />
          <p className="text-sm text-gray-800">{entry.action}</p>
          <time className="text-xs text-gray-400">{timeAgo(entry.timestamp)}</time>
        </li>
      ))}
    </ol>
  );
}
