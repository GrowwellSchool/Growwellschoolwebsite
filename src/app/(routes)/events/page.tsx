import type { Metadata } from "next";
import EventsPage from "@/features/site/events/EventsPage";

export const metadata: Metadata = {
  title: "Events",
};

export default function Page() {
  return <EventsPage />;
}
