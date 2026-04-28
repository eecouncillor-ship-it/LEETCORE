"use client";

import React from "react";

export default function ClientTimer({ endTime }: { endTime: string }) {
  const [remaining, setRemaining] = React.useState(() => {
    const end = new Date(endTime);
    const now = new Date();
    const ms = end.getTime() - now.getTime();
    return Math.max(0, Math.floor(ms / 1000));
  });

  React.useEffect(() => {
    if (remaining <= 0) return;

    const id = setInterval(() => {
      const end = new Date(endTime);
      const now = new Date();
      const ms = end.getTime() - now.getTime();
      const newRemaining = Math.max(0, Math.floor(ms / 1000));

      setRemaining(newRemaining);

      // Clear interval when time is up
      if (newRemaining <= 0) {
        clearInterval(id);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [endTime, remaining]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const isExpired = remaining <= 0;

  return (
    <div className={`rounded-2xl px-3 py-2 text-sm font-semibold w-max ${
      isExpired
        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
        : 'bg-white/5 text-white'
    }`}>
      {isExpired ? 'Time Expired' : `Time left: ${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`}
    </div>
  );
}
