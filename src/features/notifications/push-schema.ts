import { z } from "zod";

const secureEndpoint = z
  .string()
  .url()
  .max(2048)
  .refine((value) => value.startsWith("https://"), "HTTPS endpoint required");

export const pushSubscriptionSchema = z.object({
  endpoint: secureEndpoint,
  keys: z.object({
    p256dh: z.string().min(40).max(256),
    auth: z.string().min(8).max(128),
  }),
});

export const unsubscribeSchema = z.object({ endpoint: secureEndpoint });
