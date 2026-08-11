export type CoachingMessageAuthor = "customer" | "specialist";

export type CoachingMessage = Readonly<{
  author: CoachingMessageAuthor;
  body: string;
  createdAt: string;
  id: string;
}>;
export type CoachingConversationSummary = Readonly<{
  customerEmail: string;
  id: string;
  lastMessage: string;
  updatedAt: string;
}>;
