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
    <div className={className}>
      {time.getUTCMinutes()}:{time.getUTCSeconds()}
    </div>
  );
}
