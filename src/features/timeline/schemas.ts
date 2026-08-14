import { z } from "zod";

const text = (maximum: number) => z.string().trim().max(maximum);
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "সঠিক সময় নির্বাচন করুন।");

export const timelineEntrySchema = z
  .object({
    activity: text(80).min(2, "Activity-এর নাম কমপক্ষে ২ অক্ষরের হতে হবে।"),
    category: text(40).min(1, "Category লিখুন।"),
    startTime: timeSchema,
    endTime: z.union([timeSchema, z.literal("")]),
    note: text(500),
  })
  .superRefine((value, context) => {
    if (value.startTime < "05:00") {
      context.addIssue({
        code: "custom",
        path: ["startTime"],
        message: "০০:০০–০৫:০০ সময়টি ঘুমের জন্য নির্ধারিত।",
      });
    }
    if (value.endTime && value.endTime <= value.startTime) {
      context.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "শেষের সময় শুরুর সময়ের পরে হতে হবে।",
      });
    }
  });

export const timelineEntryIdSchema = z
  .string()
  .length(24)
  .regex(/^[a-f\d]{24}$/i);

export type TimelineEntryInput = z.infer<typeof timelineEntrySchema>;
