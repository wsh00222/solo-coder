import React, { useState, useEffect } from 'react';
import { getCountdownTime, padZero } from '../utils/helpers';

export default function CountdownBar({ deadline }) {
  const [time, setTime] = useState(getCountdownTime(deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = getCountdownTime(deadline);
      setTime(newTime);
      if (newTime.expired) {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (time.expired) return null;

  return (
    <div className="countdown-bar">
      <span>⏰ 距离报名截止还有：</span>
      <span className="countdown-time">
        {padZero(time.minutes)}分{padZero(time.seconds)}秒
      </span>
    </div>
  );
}
