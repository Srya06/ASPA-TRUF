export default function AdminLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-truf-lime"></div>
      <p className="text-sm font-medium text-white/50 animate-pulse uppercase tracking-widest">
        Loading Data...
      </p>
    </div>
  );
}
