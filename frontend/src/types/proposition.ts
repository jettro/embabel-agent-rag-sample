export type PropositionStatus = 'ACTIVE' | 'INACTIVE' | 'DEPRECATED';

export interface EntityMention {
  name: string;
  type: string;
  resolvedId: string;
  role: string;
  entityId?: string;
  span?: {
    start: number;
    end: number;
  };
}

export interface Proposition {
  id: string;
  contextId: string;
  text: string;
  mentions: EntityMention[];
  confidence: number;
  decay: number;
  reasoning?: string;
  grounding: string[];
  created: string;
  revised: string;
  status: PropositionStatus;
  level: number;
  sourceIds: string[];
  metadata: Record<string, any>;
  uri?: string;
}
