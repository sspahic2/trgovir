'use client';

export default function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <div className="min-h-32">
      {[...Array(count)].map((_, idx) => (
        <div
          key={idx}
          className="grid grid-cols-[50px_1fr_150px_150px] gap-4 items-center p-4 bg-gray-100 dark:bg-gray-800 animate-pulse"
        >
          <div className="h-6 bg-gray-300 dark:bg-gray-600 w-full"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 w-full"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 w-full"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 w-full"></div>
        </div>
      ))}
    </div>
  );
}