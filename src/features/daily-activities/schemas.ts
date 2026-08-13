import { z } from "zod";

export const measurementSchema = z.enum([
  "boolean",
  "counter",
  "duration",
  "quantity",
]);

const text = (maximum: number) => z.string().trim().max(maximum);

export const activityDefinitionSchema = z
  .object({
    name: text(80).min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে।"),
    description: text(300),
    category: text(40).min(1, "Category নির্বাচন করুন।"),
    measurement: measurementSchema,
    target: z.coerce.number().finite().positive().max(1_000_000),
    unit: text(24),
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

export type ActivityDefinitionInput = z.infer<typeof activityDefinitionSchema>;
