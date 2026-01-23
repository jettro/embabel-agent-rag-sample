export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface InitSessionRequest {
  conversationId?: string;
}

export interface InitSessionResponse {
  conversationId: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  answer: string;
  conversationId: string;
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

export async function initializeSession(): Promise<InitSessionResponse> {
  const response = await fetch('/chat/init', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to initialize session: ${response.statusText}`);
  }

  return await response.json();
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const response = await fetch('/chat/message', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message }),
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

export interface Proposition {
  id: string;
  contextId: string;
  text: string;
  mentions: Array<{
    entityId: string;
    role: string;
    span?: { start: number; end: number };
  }>;
  confidence: number;
  decay: number;
  reasoning?: string;
  grounding: string[];
  created: string;
  revised: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DEPRECATED';
  level: number;
  sourceIds: string[];
  metadata: Record<string, any>;
  uri?: string;
}

export async function getPropositions(): Promise<Proposition[]> {
  const response = await fetch('/api/v1/propositions', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch propositions: ${response.statusText}`);
  }

  return await response.json();
}

export async function getContextId(): Promise<string> {
  const response = await fetch('/api/v1/propositions/contextId', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch context ID: ${response.statusText}`);
  }

  return await response.text();
}

export interface PropositionDto {
  id: string;
  contextId: string;
  text: string;
  mentions: Array<{
    entityId: string;
    role: string;
    span?: { start: number; end: number };
  }>;
  confidence: number;
  decay: number;
  reasoning?: string;
  grounding: string[];
  created: string;
  revised: string;
  status: string;
  level: number;
  sourceIds: string[];
}

export interface EntitySummary {
  created: number;
  updated: number;
  linked: number;
}

export interface RevisionSummary {
  updated: number;
  deprecated: number;
}

export interface ExtractResponse {
  chunkId: string;
  contextId: string;
  propositions: PropositionDto[];
  entities: EntitySummary;
  revision?: RevisionSummary;
}

export async function extractPropositions(
  contextId: string,
  text: string
): Promise<ExtractResponse> {
  const response = await fetch(`/api/v1/contexts/${contextId}/extract`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`Failed to extract propositions: ${response.statusText}`);
  }

  return await response.json();
}
