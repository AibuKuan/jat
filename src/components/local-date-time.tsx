"use client";

import { useEffect, useState } from "react";

type FormatMode = 'datetime' | 'date' | 'time';

interface LocalDateTimeProps {
    dateTime: Date | string | number;
    mode?: FormatMode;
}

export function LocalDateTime({ dateTime, mode = 'datetime' }: LocalDateTimeProps) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    const dateObj = dateTime instanceof Date ? dateTime : new Date(dateTime);

    if (isNaN(dateObj.getTime())) {
        setFormatted('Invalid date');
        return;
    }

    if (mode == 'date') {
        setFormatted(dateObj.toLocaleDateString());
    } else if (mode == 'time') {
        setFormatted(dateObj.toLocaleTimeString());
    } else {
        setFormatted(dateObj.toLocaleString());
    }
  }, [dateTime, mode]);

  if (!formatted) {
    return <span>Loading date...</span>;
  }
  
  return <span>{formatted}</span>;
}
