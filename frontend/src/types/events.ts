export interface AgentProcessEvent {
  processId: string;
  timestamp: string;
  type: string;
  [key: string]: unknown;
}

export interface ConnectedEvent {
  message: string;
}
