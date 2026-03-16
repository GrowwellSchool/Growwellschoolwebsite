import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-school-dark flex items-center justify-center text-white pattern-dots">
      <div className="text-center px-4">
        <div className="text-9xl font-heading font-black text-school-gold mb-4">
          404
        </div>
        <h2 className="text-2xl font-heading font-bold mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" className="btn-secondary">
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

