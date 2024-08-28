import { useEffect, useState } from "react";

type Props = {
  className?: string;
  timeSince: number;
  penaltyTime?: number;
  staticTime?: number;
};

export default function Timer({ className, timeSince, penaltyTime, staticTime }: Props) {
  const [time, setTime] = useState<Date>(new Date(Date.now() - timeSince + (penaltyTime ?? 0)));

  useEffect(() => {
    const interval = setInterval(() => {
      if (staticTime) {
        setTime(new Date(staticTime));
      } else {
        setTime(new Date(Date.now() - timeSince + (penaltyTime ?? 0)));
      }
    }, 200);
    return () => clearInterval(interval);
  }, [timeSince, penaltyTime, staticTime]);

  return (
    <div className={`flex flex-row gap-2 font-mono text-black dark:text-gray-200 ${className}`}>
      <span>
        {time.getUTCMinutes()}:{time.getUTCSeconds().toString(10).padStart(2, "0")}
      </span>
      {penaltyTime && penaltyTime > 0 ? <div className="text-red-500">+{penaltyTime / 1000}s</div> : <></>}
    </div>
  );
}
