"use client";

import { toggleUserBlockAction } from "@/app/admin/actions";

type Props = {
  userId: string;
  isBlocked: boolean;
};

export function UserBlockButton({ userId, isBlocked }: Props) {
  return (
    <form
      action={toggleUserBlockAction}
      className="inline-flex"
      onClick={(event) => event.stopPropagation()}
      onSubmit={(event) => event.stopPropagation()}
    >
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="block" value={isBlocked ? "0" : "1"} />
      <button
        type="submit"
        className={`rounded-full px-3 py-2 text-sm font-semibold text-white transition ${
          isBlocked
            ? "bg-emerald-600 hover:bg-emerald-500"
            : "bg-rose-500 hover:bg-rose-400"
        }`}
      >
        {isBlocked ? "Unblock" : "Block"}
      </button>
    </form>
  );
}
