
export enum BiologyTheme {
  INLEIDING = 'Thema 1: Inleiding in de biologie',
  ERFELIJKHEID = 'Thema 3: Erfelijkheid',
  STOFWISSELING = 'Thema 8: Stofwisseling in de cel',
  DNA = 'Thema 9: DNA'
}

export interface Question {
  id: string;
  theme: BiologyTheme;
  content: string; // The "Noem 3..." prompt
}

export type GameState = 'START' | 'THEME_SELECTION' | 'READY' | 'PLAYING' | 'RESULT' | 'SUMMARY';

export interface Score {
  correct: number;
  total: number;
}
