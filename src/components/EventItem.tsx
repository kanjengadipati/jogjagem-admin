"use client";

import Link from "next/link";
import { ArrowUpRight, Calendar } from "lucide-react";
import type { Event } from "@/types";

export default function EventItem({ event }: { event: Event & { badge?: string } }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/20 hover:bg-primary/5 transition-premium group"
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(ev) => {
              (ev.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-gray-300" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-xs font-bold text-gray-800 font-display block group-hover:text-primary transition-colors truncate">
          {event.title}
        </span>
        <span className="text-[10px] text-gray-400 truncate block">
          {event.location || "-"} {event.start_date ? `· ${event.start_date}` : ""}
        </span>
      </div>
      {event.badge && event.badge !== "-" && (
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{
            backgroundColor: event.badge === "akan_datang" ? "#dbeafe" : event.badge === "populer" ? "#fef3c7" : event.badge === "trending" ? "#fce7f3" : "#d1fae5",
            color: event.badge === "akan_datang" ? "#1d4ed8" : event.badge === "populer" ? "#b45309" : event.badge === "trending" ? "#be185d" : "#047857",
          }}
        >
          {event.badge === "akan_datang" ? "Akan Datang" : event.badge === "populer" ? "Populer" : event.badge === "trending" ? "Trending" : event.badge}
        </span>
      )}
      <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary flex-shrink-0" />
    </Link>
  );
}
