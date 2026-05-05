export function getWeekDates(baseDate: Date): Date[] {
  const start = new Date(baseDate);
  const day = start.getDay();
  start.setDate(start.getDate() - day + (day === 0 ? -6 : 1));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function getMonthDates(year: number, month: number): Date[] {
  const dates: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;

  const start = new Date(firstDay);
  start.setDate(start.getDate() - startOffset);

  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }

  return dates;
}

export function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateString(a) === toDateString(b);
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function formatDayShort(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function formatDayNum(date: Date): string {
  return date.getDate().toString();
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export type StatPeriod = "this-week" | "7-days" | "this-month" | "30-days";

export function getPeriodRange(period: StatPeriod): { from: string; to: string } {
  const now = new Date();
  const to = toDateString(now);

  switch (period) {
    case "this-week": {
      const weekDates = getWeekDates(now);
      return { from: toDateString(weekDates[0]), to: toDateString(weekDates[6]) };
    }
    case "7-days": {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      return { from: toDateString(d), to };
    }
    case "this-month": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toDateString(first), to };
    }
    case "30-days": {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      return { from: toDateString(d), to };
    }
  }
}

export function formatWeekRange(dates: Date[]): string {
  if (dates.length === 0) return "";
  const start = dates[0];
  const end = dates[dates.length - 1];
  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()} - ${end.getDate()}`;
  }
  return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
}
