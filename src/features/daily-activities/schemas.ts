import { z } from "zod";

export const measurementSchema = z.enum([
  "boolean",
  "counter",
  "duration",
  "quantity",
]);
export const frequencySchema = z.enum(["daily", "selected_days"]);

const text = (maximum: number) => z.string().trim().max(maximum);

export const activityDefinitionSchema = z
  .object({
    name: text(80).min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে।"),
    description: text(300),
    category: text(40).min(1, "Category নির্বাচন করুন।"),
    measurement: measurementSchema,
    target: z.coerce.number().finite().positive().max(1_000_000),
    unit: text(24),
    frequency: frequencySchema,
    days: z.array(z.coerce.number().int().min(0).max(6)).max(7),
    preferredTime: z
      .union([z.literal(""), z.string().regex(/^\d{2}:\d{2}$/)])
      .default(""),
    reminderEnabled: z.boolean().default(false),
  })
  .superRefine((value, context) => {
    if (value.measurement === "boolean" && value.target !== 1) {
      context.addIssue({
        code: "custom",
        path: ["target"],
        message: "Done/Not Done Activity-এর target ১ হতে হবে।",
      });
    }
    if (value.measurement === "duration" && !value.unit) value.unit = "মিনিট";
    if (value.measurement === "quantity" && !value.unit) {
      context.addIssue({
        code: "custom",
        path: ["unit"],
        message: "Quantity Activity-এর unit দিন।",
      });
    }
    if (value.frequency === "selected_days" && value.days.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["days"],
        message: "অন্তত একটি দিন নির্বাচন করুন।",
      });
    }
    if (value.reminderEnabled && !value.preferredTime) {
      context.addIssue({
        code: "custom",
        path: ["preferredTime"],
        message: "Reminder চালু করতে একটি সময় দিন।",
      });
    }
  });

export const activityIdSchema = z
  .string()
  .length(24)
  .regex(/^[a-f\d]{24}$/i);
export const progressValueSchema = z.coerce
  .number()
  .finite()
  .min(0)
  .max(1_000_000);
export const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const reorderDirectionSchema = z.enum(["up", "down"]);

type ParsedActivityDefinition = z.output<typeof activityDefinitionSchema>;
export type ActivityDefinitionInput = Omit<
  ParsedActivityDefinition,
  "preferredTime" | "reminderEnabled"
> &
  Partial<Pick<ParsedActivityDefinition, "preferredTime" | "reminderEnabled">>;
