export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 flex flex-col h-full">
          <div className="aspect-[2/3] bg-gray-200 animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-gray-200 rounded-lg animate-pulse w-3/4" />
            <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-full" />
            <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
