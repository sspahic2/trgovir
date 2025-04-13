export default function SuperAdminSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
      <div className="flex gap-2">
        <div className="h-10 bg-gray-300 rounded w-full"></div>
        <div className="h-10 bg-gray-300 rounded w-20"></div>
      </div>
      <div className="space-y-2">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="h-10 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
}
