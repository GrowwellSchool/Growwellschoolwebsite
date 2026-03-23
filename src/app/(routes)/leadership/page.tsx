import type { Metadata } from "next";
import LeadershipPage from "@/features/site/leadership/LeadershipPage";

export const metadata: Metadata = {
  title: "Leadership - From The Desk of Our Leaders",
  description: "Meet the visionaries guiding Growwell School towards excellence in education and holistic development. Read messages from our Director and Principal.",
};

export default function Page() {
  return <LeadershipPage />;
}
