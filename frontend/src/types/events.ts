export interface AgentProcessEvent {
  processId: string;
  timestamp: string;
  eventType: string;
  [key: string]: unknown;
}

export interface ConnectedEvent {
  message: string;
}
