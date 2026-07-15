import { z } from "zod";

export const rsvpSchema = z.object({
    firstName: z.string().trim().min(1, "Enter your first name."),
    lastName: z.string().trim().min(1, "Enter your last name."),
    email: z.email("Enter a valid email address.").trim(),
    phone: z.string().trim().min(1, "Enter your phone number."),
    attendance: z.enum(["yes", "no", "maybe"], { error: "Select your attendance." }),
    guestCount: z.number().int().min(1, 'Guest count must be at least 1.').max(10, 'Guest count cannot exceed 10.'),
    message: z.string().trim().max(500, "Message cannot exceed 500 characters.").optional(),
});

export type RSVPInput = z.infer<typeof rsvpSchema>;
