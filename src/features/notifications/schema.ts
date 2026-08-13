import { z } from "zod";

const clockTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const reminderSettingsSchema = z.object({
  activity: z.boolean(),
  endOfDay: z.boolean(),
  dailySummary: z.boolean(),
  streak: z.boolean(),
  endOfDayTime: clockTime,
  dailySummaryTime: clockTime,
});
