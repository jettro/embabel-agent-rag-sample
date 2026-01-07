export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export async function sendChatMessage(message: string): Promise<string> {
  const response = await fetch('/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }

  return await response.text();
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
  name: string;
  username: string;
  email: string;
}

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/users');
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  return await response.json();
}

export async function selectUser(userId: string): Promise<void> {
  const response = await fetch(`/users/${userId}`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to select user: ${response.statusText}`);
  }
}
