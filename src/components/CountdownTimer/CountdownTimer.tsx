interface CountdownTimerProps {
  count: number | null;
}

export function CountdownTimer({ count }: CountdownTimerProps) {
  if (count === null) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="text-[200px] font-bold text-white animate-pulse">
        {count}
      </div>
    </div>
  );
}
