import { z } from "zod";

export const supportedTimezones = [
  { value: "Asia/Dhaka", label: "ঢাকা (UTC+৬)" },
  { value: "Asia/Kolkata", label: "কলকাতা (UTC+৫:৩০)" },
  { value: "Asia/Karachi", label: "করাচি (UTC+৫)" },
  { value: "Asia/Dubai", label: "দুবাই (UTC+৪)" },
  { value: "Europe/London", label: "লন্ডন" },
  { value: "America/New_York", label: "নিউ ইয়র্ক" },
  { value: "America/Los_Angeles", label: "লস অ্যাঞ্জেলেস" },
  { value: "UTC", label: "UTC" },
] as const;

const timezoneValues = supportedTimezones.map((timezone) => timezone.value);

export const profileSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে।")
    .max(80, "নাম সর্বোচ্চ ৮০ অক্ষরের হতে পারে।"),
  timezone: z
    .string()
    .refine(
      (value) =>
        timezoneValues.includes(value as (typeof timezoneValues)[number]),
      "অনুমোদিত timezone নির্বাচন করুন।",
    ),
});

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;
