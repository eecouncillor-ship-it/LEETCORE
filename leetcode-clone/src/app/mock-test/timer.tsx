"use client";

import React from "react";

export default function ClientTimer({ endTime }: { endTime: string }) {
  console.log('[TIMER] ClientTimer rendered with endTime:', endTime);

  const parseEndTime = (value: string) => {
    const end = new Date(value);
    const valid = !isNaN(end.getTime());
    return { end, valid };
  };

  const [remaining, setRemaining] = React.useState(() => {
    if (!endTime) {
      console.log('[TIMER] No endTime provided');
      return 0;
    }

    const { end, valid } = parseEndTime(endTime);
    const now = new Date();

    console.log('[TIMER] Initial parse of endTime:', endTime);
    console.log('[TIMER]   parsed end:', end.toISOString());
    console.log('[TIMER]   valid endTime:', valid);

    if (!valid) {
      console.error('[TIMER] Invalid endTime provided to ClientTimer:', endTime);
      return 0;
    }

    const ms = end.getTime() - now.getTime();
    const initialRemaining = Math.max(0, Math.floor(ms / 1000));

    console.log('[TIMER] Initial calculation:');
    console.log('[TIMER]   now:', now.toISOString());
    console.log('[TIMER]   difference (ms):', ms);
    console.log('[TIMER]   difference (seconds):', initialRemaining);
    console.log('[TIMER]   difference (minutes):', initialRemaining / 60);
    return initialRemaining;
  });

  React.useEffect(() => {
    console.log('[TIMER] useEffect start - endTime:', endTime, 'initial remaining:', remaining);

    if (!endTime) {
      console.log('[TIMER] useEffect exiting because endTime is missing');
      return;
    }

    const { end, valid } = parseEndTime(endTime);
    if (!valid) {
      console.error('[TIMER] useEffect found invalid endTime:', endTime);
      setRemaining(0);
      return;
    }

    const updateRemaining = () => {
      const now = new Date();
      const ms = end.getTime() - now.getTime();
      const newRemaining = Math.max(0, Math.floor(ms / 1000));
      console.log('[TIMER] countdown update - now:', now.toISOString(), 'end:', end.toISOString(), 'remainingSecs:', newRemaining);
      setRemaining(newRemaining);
      return newRemaining;
    };

    const initial = updateRemaining();
    if (initial <= 0) {
      console.log('[TIMER] useEffect exiting because time is already expired');
      return;
    }

    console.log('[TIMER] Setting up timer interval');
    const id = window.setInterval(() => {
      const newRemaining = updateRemaining();
      if (newRemaining <= 0) {
        console.log('[TIMER] Time expired, clearing interval');
        window.clearInterval(id);
      }
    }, 1000);

    return () => {
      console.log('[TIMER] Cleaning up timer interval');
      window.clearInterval(id);
    };
  }, [endTime]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isExpired = remaining <= 0;

  console.log('[TIMER] render - remaining:', remaining, 'isExpired:', isExpired, 'display:', isExpired ? 'Time Expired' : `Time left: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);

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
      {isExpired ? 'Time Expired' : `Time left: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`}
    </div>
  );
}
