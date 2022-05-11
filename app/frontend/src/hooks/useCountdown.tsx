import { useEffect, useState } from 'react';

const useCountdown = (to: Date, refresh: number = 1000) => {
  const time = new Date(to).getTime();

  const [countdown, setCountdown] = useState(
    time - new Date().getTime()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      let el = time - new Date().getTime();
      if (el < 0)
        el = 0;
      setCountdown(el);
    }, refresh);

    return () => clearInterval(interval);
  }, [time, refresh]);

  return countdown ? getTime(countdown) : { hours: 0, days: 0, minutes: 0, seconds: 0, done: true };
};

const getTime = (countdown: number) => {
  return {
    days: Math.floor(countdown / (1000 * 60 * 60 * 24)),
    hours: Math.floor((countdown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((countdown % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((countdown % (1000 * 60)) / 1000),
    done: false
  };
}

export { useCountdown };
