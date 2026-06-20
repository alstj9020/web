/** ISO 날짜 문자열이 KST(Asia/Seoul) 기준 오늘 날짜인지 확인한다. */
export function isTodayKST(isoString: string): boolean {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" });
  return fmt.format(new Date(isoString)) === fmt.format(new Date());
}
