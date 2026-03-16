"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-school-dark flex items-center justify-center text-white pattern-dots">
      <div className="text-center px-4 max-w-xl">
        <div className="text-5xl font-heading font-black text-school-gold mb-4">
          Something went wrong
        </div>
        <p className="text-gray-400 mb-8">
          Please try again, or return to the homepage.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={reset} className="btn-secondary">
            Try again
          </button>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

