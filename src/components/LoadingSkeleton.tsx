export function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block w-[232px] shrink-0 border-r border-hairline" />
      <main className="flex-1 min-w-0 px-5 md:px-11 pt-7 pb-24 md:pb-14 max-w-3xl">
        <div className="h-4 w-32 bg-hairline/10 rounded animate-pulse mb-6" />
        <div className="h-7 w-56 bg-hairline/10 rounded animate-pulse mb-8" />
        <div className="flex flex-col gap-3">
          <div className="h-16 bg-hairline/10 rounded-card animate-pulse" />
          <div className="h-16 bg-hairline/10 rounded-card animate-pulse" />
          <div className="h-16 bg-hairline/10 rounded-card animate-pulse" />
        </div>
      </main>
    </div>
  );
}
