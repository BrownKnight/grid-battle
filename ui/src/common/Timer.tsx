import { useEffect, useState } from "react";
import TimeDisplay from "./TimeDisplay";

type Props = {
  className?: string;
  timeSince: number;
  penalties: number;
  staticTime?: number;
};

export default function Timer({ className, timeSince, penalties, staticTime }: Props) {
  const [time, setTime] = useState<number>(Date.now() - timeSince + (penalties ?? 0) * 10 * 1000);

  useEffect(() => {
    const interval = setInterval(() => {
      if (staticTime) {
        setTime(staticTime);
      } else {
        setTime(Date.now() - timeSince + (penalties ?? 0) * 10 * 1000);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [timeSince, penalties, staticTime]);

  return <TimeDisplay className={className} totalTime={time} penalties={penalties} />;
}
