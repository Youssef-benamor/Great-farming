export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  image?: string;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
