export function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{label}</div>
    </div>
  );
}
