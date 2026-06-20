/** ISO 날짜 문자열이 KST(Asia/Seoul) 기준 오늘 날짜인지 확인한다. */
export function isTodayKST(isoString: string): boolean {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return false;
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" });
  return fmt.format(date) === fmt.format(new Date());
}
