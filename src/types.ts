/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Scenario {
  id: string;
  title: string;
  rooms: Room[];
}

export interface Room {
  id: string;
  name: string;
  description: string;
  backgroundMedia?: string;
  interactables: Interactable[];
}

export enum InteractableType {
  ITEM = 'item',
  PUZZLE = 'puzzle',
  TERMINAL = 'terminal',
  TRANSITION = 'transition',
  DIALOGUE = 'dialogue'
}

export interface Interactable {
  id: string;
  type: InteractableType;
  label: string;
  position?: { x: number; y: number }; 
  data: any; 
}

export interface ClioInterrupt {
  id: string;
  triggerType: 'quest_complete' | 'interaction_count' | 'time_elapsed' | 'random';
  triggerValue: string | number;  // 퀘스트 ID or 횟수 or 초
  message: string;
  phase: number;                  // 최소 Phase 조건
  fired: boolean;                 // 이미 발동했는가
  priority: 'low' | 'high';      // high면 현재 행동 중단
}

export interface GameState {
  userName: string | null;
  isProfessorMode: boolean;
  phase: number;
  currentAct: number;
  currentRoomId: string;
  inventory: string[];
  solvedPuzzles: string[];
  logs: LogEntry[];
  activeDialogue: DialogueSession | null;
  interactionCount: number;
  loopCount: number;
  crackLevel: number;
  endingFlags: {
    diaryRead: boolean;
    tape32Played: boolean;
    kimSuDialogueDone: boolean;
    killSwitchUsed: boolean;
  };
  timeRemaining: number;
  activeInterrupt: ClioInterrupt | null;
  firedInterrupts: string[];
  blackout2Active?: boolean;
  threatLevel?: number;
  hideLocation?: string | null;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'system' | 'clio' | 'player';
}

export interface DialogueSession {
  messages: { role: 'user' | 'model'; content: string }[];
  isProcessing: boolean;
}
