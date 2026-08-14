export type ActivityProgressValue = {
  value: number;
  target: number;
};

export function proportionalActivityScore(
  activities: ActivityProgressValue[],
): number | null {
  if (activities.length === 0) return null;
  const completionPoints = activities.reduce(
    (total, activity) =>
      total +
      Math.min(1, Math.max(0, activity.value) / Math.max(activity.target, 1)),
    0,
  );
  return Math.round((completionPoints / activities.length) * 100);
}
