export type Conversation = {
  role: string;
  parts: { text: string; thounght?: boolean }[];
};
