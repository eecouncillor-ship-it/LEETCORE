"use client";

import React from "react";

export default function ClientTimer({ endTime }: { endTime: string }) {
  console.log('ClientTimer rendered with endTime:', endTime);

  const [remaining, setRemaining] = React.useState(() => {
    if (!endTime) return 0;

    try {
      const end = new Date(endTime);
      const now = new Date();

      // Check if endTime is a valid date
      if (isNaN(end.getTime())) {
        console.error('Invalid endTime provided to ClientTimer:', endTime);
        return 0;
      }

      const ms = end.getTime() - now.getTime();
      const initialRemaining = Math.max(0, Math.floor(ms / 1000));
      console.log('Initial remaining time:', initialRemaining, 'seconds');
      return initialRemaining;
    } catch (error) {
      console.error('Error parsing endTime in ClientTimer:', error, endTime);
      return 0;
    }
  });

  React.useEffect(() => {
    console.log('useEffect running with remaining:', remaining, 'endTime:', endTime);
    if (remaining <= 0 || !endTime) {
      console.log('useEffect exiting early');
      return;
    }

    console.log('Setting up timer interval');
    const id = setInterval(() => {
      try {
        const end = new Date(endTime);
        const now = new Date();

        if (isNaN(end.getTime())) {
          console.error('Invalid endTime during countdown:', endTime);
          setRemaining(0);
          return;
        }

        const ms = end.getTime() - now.getTime();
        const newRemaining = Math.max(0, Math.floor(ms / 1000));

        console.log('Timer tick - new remaining:', newRemaining);
        setRemaining(newRemaining);

        // Clear interval when time is up
        if (newRemaining <= 0) {
          console.log('Time expired, clearing interval');
          clearInterval(id);
        }
      } catch (error) {
        console.error('Error during timer countdown:', error);
        setRemaining(0);
        clearInterval(id);
      }
    }, 1000);

    return () => {
      console.log('Cleaning up timer interval');
      clearInterval(id);
    };
  }, [endTime, remaining]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const isExpired = remaining <= 0;

  console.log('Timer rendering - remaining:', remaining, 'isExpired:', isExpired, 'display:', isExpired ? 'Time Expired' : `Time left: ${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`);

  // If endTime is invalid, show error state
  if (!endTime) {
    return (
      <div className="rounded-2xl px-3 py-2 text-sm font-semibold w-max bg-red-500/20 text-red-400 border border-red-500/30">
        Timer Error: No end time provided
      </div>
    );
  }

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
