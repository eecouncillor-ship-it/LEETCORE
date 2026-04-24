"use client";

import React from "react";

export default function ClientTimer({ endTime }: { endTime: string }) {
  const [remaining, setRemaining] = React.useState(() => {
    const ms = new Date(endTime).getTime() - Date.now();
    return Math.max(0, Math.floor(ms / 1000));
  });

  React.useEffect(() => {
    const id = setInterval(() => {
      const ms = new Date(endTime).getTime() - Date.now();
      setRemaining(Math.max(0, Math.floor(ms / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return <div className="rounded-2xl bg-white/5 px-3 py-2 text-sm font-semibold text-white w-max">Time left: {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</div>;
}
