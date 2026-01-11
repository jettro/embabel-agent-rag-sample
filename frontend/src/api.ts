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

// Helper to get auth headers
let authCredentials: string | null = null;

export function setAuthCredentials(credentials: string | null) {
  authCredentials = credentials;
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (authCredentials) {
    headers['Authorization'] = `Basic ${authCredentials}`;
  }
  return headers;
}

export async function initializeSession(userId: string, conversationId?: string): Promise<InitSessionResponse> {
  const response = await fetch('/chat/init', {
    method: 'POST',
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
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
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to reindex data: ${response.statusText}`);
  }

  return await response.text();
}

export async function logout(): Promise<void> {
  const response = await fetch('/logout', {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to logout: ${response.statusText}`);
  }
}
