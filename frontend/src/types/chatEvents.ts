export interface OutputChannelEvent {
  processId: string;
  [key: string]: unknown;
}

export interface MessageOutputChannelEvent extends OutputChannelEvent {
  message: {
    content: string;
    role?: string;
  };
}

export interface ContentOutputChannelEvent extends OutputChannelEvent {
  content: string;
}

export interface ProgressOutputChannelEvent extends OutputChannelEvent {
  message: string;
}

export interface LoggingOutputChannelEvent extends OutputChannelEvent {
  message: string;
}

export type ChatEvent = 
  | MessageOutputChannelEvent 
  | ContentOutputChannelEvent 
  | ProgressOutputChannelEvent 
  | LoggingOutputChannelEvent;
