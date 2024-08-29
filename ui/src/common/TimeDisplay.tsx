export default function TimeDisplay({ className, totalTime, penalties }: { className?: string; totalTime: number; penalties: number }) {
  const date = new Date(totalTime);
  const penaltyTime = penalties * 10;
  return (
    <div className={`inline-flex gap-1 font-mono text-black dark:text-gray-200 ${className}`}>
      <span>
        {date.getUTCMinutes()}:{date.getUTCSeconds().toString(10).padStart(2, "0")}
      </span>
      {penaltyTime && penaltyTime > 0 ? <div className="text-red-500">(+{penaltyTime}s)</div> : <></>}
    </div>
  );
}
