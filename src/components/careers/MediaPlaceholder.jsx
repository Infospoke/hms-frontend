import { Image as ImageIcon, Video } from 'lucide-react';

export default function MediaPlaceholder({ type = 'image', className = '' }) {
  const Icon = type === 'video' ? Video : ImageIcon;
  return (
    <div
      className={`flex aspect-video items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-300 ${className}`}
    >
      <Icon className="h-8 w-8" />
    </div>
  );
}
