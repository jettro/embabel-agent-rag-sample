export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface InitSessionRequest {
  userId: string;
  conversationId?: string;
}

export interface InitSessionResponse {
  conversationId: string;
  processId: string;
}

export interface ChatRequest {
  message: string;
  conversationId: string;
}

export interface ChatResponse {
  answer: string;
  procesId: string;
}

export async function initializeSession(userId: string, conversationId?: string): Promise<InitSessionResponse> {
  const response = await fetch('/chat/init', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, conversationId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to initialize session: ${response.statusText}`);
  }

  return await response.json();
}

export async function sendChatMessage(message: string, conversationId: string): Promise<ChatResponse> {
  const response = await fetch('/chat/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, conversationId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }

  return await response.json();
}

export async function reindexData(): Promise<string> {
  const response = await fetch('/ingest', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Failed to reindex data: ${response.statusText}`);
  }

  return await response.text();
}

export interface User {
  id: string;
  displayName: string;
  username: string;
  email: string;
}

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/users', {
    method: 'GET',
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  return await response.json();
}