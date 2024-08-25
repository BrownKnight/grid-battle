import { useEffect, useState } from "react";

type Props = {
  className?: string;
  timeSince: number;
  penaltyTime?: number;
};

export default function Timer({ className, timeSince, penaltyTime }: Props) {
  const [time, setTime] = useState<Date>(new Date(Date.now() - timeSince + (penaltyTime ?? 0)));

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date(Date.now() - timeSince + (penaltyTime ?? 0))), 200);
    return () => clearInterval(interval);
  }, [timeSince, penaltyTime]);

  return (
    <div className={`flex flex-row gap-2 font-mono ${className}`}>
      <span>
        {time.getUTCMinutes()}:{time.getUTCSeconds().toString(10).padStart(2, "0")}
      </span>
      {penaltyTime && penaltyTime > 0 ? <div className="text-red-500">+{penaltyTime / 1000}s</div> : <></>}
    </div>
  );
}
