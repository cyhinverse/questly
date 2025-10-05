import Link from "next/link";
import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-black mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-black mb-4">Page Not Found</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-md mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or doesn&apos;t exist.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="primary" className="px-6 py-3">
              Go Home
            </Button>
          </Link>
          <Link href="/quiz">
            <Button variant="outline" className="px-6 py-3">
              Browse Quizzes
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          If you believe this is an error, please contact support.
        </div>
      </div>
    </div>
  );
}
