interface AvatarProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
};

const COLORS = [
  'bg-indigo-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-blue-500',
  'bg-teal-500',
  'bg-orange-500',
];

export function Avatar({ initials, size = 'md' }: AvatarProps) {
  const colorIndex = initials.charCodeAt(0) % COLORS.length;
  return (
    <div
      className={`${SIZE_CLASSES[size]} ${COLORS[colorIndex]} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
    >
      {initials}
    </div>
  );
}
