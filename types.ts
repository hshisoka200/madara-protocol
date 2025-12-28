
export type Rank = 'Academy Student' | 'Genin / 1-Tomoe' | 'Chunin / Mangekyō' | 'Eternal Legend / Perfect Susanoo';

export interface Mission {
  id: string;
  label: string;
  completed: boolean;
}

export interface ProtocolState {
  currentDay: number;
  totalDays: number;
  missions: Mission[];
  isLocked: boolean;
}
