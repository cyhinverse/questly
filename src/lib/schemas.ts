import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Quiz schemas
export const quizSchema = z.object({
  title: z
    .string()
    .min(1, "Quiz title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_.,!?]+$/, "Title contains invalid characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

export const questionSchema = z.object({
  content: z
    .string()
    .min(1, "Question content is required")
    .min(10, "Question must be at least 10 characters")
    .max(1000, "Question must be less than 1000 characters"),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .length(4, "Must have exactly 4 options"),
  correct_answer: z
    .number()
    .min(0, "Invalid correct answer")
    .max(3, "Invalid correct answer"),
});

export const createQuizSchema = z.object({
  quiz: quizSchema,
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required")
    .max(50, "Maximum 50 questions allowed"),
});

// AI Generation schemas
export const aiGenerationSchema = z.object({
  topic: z
    .string()
    .min(1, "Topic is required")
    .min(3, "Topic must be at least 3 characters")
    .max(100, "Topic must be less than 100 characters"),
  questionCount: z
    .number()
    .min(1, "At least 1 question required")
    .max(20, "Maximum 20 questions allowed"),
});

// Room schemas
export const joinRoomSchema = z.object({
  roomCode: z
    .string()
    .min(1, "Room code is required")
    .length(6, "Room code must be 6 characters")
    .regex(/^[A-Z0-9]+$/, "Room code must contain only uppercase letters and numbers"),
  nickname: z
    .string()
    .min(1, "Nickname is required")
    .min(2, "Nickname must be at least 2 characters")
    .max(20, "Nickname must be less than 20 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Nickname contains invalid characters"),
});

// Profile schemas
export const profileSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Display name contains invalid characters"),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type QuizFormData = z.infer<typeof quizSchema>;
export type QuestionFormData = z.infer<typeof questionSchema>;
export type CreateQuizFormData = z.infer<typeof createQuizSchema>;
export type AIGenerationFormData = z.infer<typeof aiGenerationSchema>;
export type JoinRoomFormData = z.infer<typeof joinRoomSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
