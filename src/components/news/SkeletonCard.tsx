export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#e8eaed] overflow-hidden animate-pulse">
      <div className="bg-[#1e2235] h-10" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-3 bg-[#e8eaed] rounded w-1/3" />
        <div className="h-5 bg-[#e8eaed] rounded w-4/5" />
        <div className="h-3 bg-[#e8eaed] rounded w-full" />
        <div className="h-3 bg-[#e8eaed] rounded w-3/4" />
        <div className="h-10 bg-[#f5f6f8] rounded-lg mt-1" />
      </div>
    </div>
  );
}
