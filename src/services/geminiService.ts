/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { CLIO_PROMPTS, CLUE_TRIGGERS } from "../constants";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please set it in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export const getClioResponse = async (
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  phase: number,
  interactionCount: number,
  isProfessorMode: boolean = false,
  gameContext?: {
    activeQuestIds: string[];
    inventory: string[];
    solvedPuzzles: string[];
  }
) => {
  try {
    const ai = getAI();
    const phaseRule = (CLIO_PROMPTS.PHASE_RULES as any)[phase] || "";
    
    let systemInstruction = `${CLIO_PROMPTS.SYSTEM}\n\n[현재 상태]\nPhase: ${phase}\n진행 규칙: ${phaseRule}\n상호작용 횟수: ${interactionCount}`;
    
    if (gameContext) {
      systemInstruction += `\n\n[현재 게임 상태]
활성 퀘스트: ${gameContext.activeQuestIds.join(', ')}
보유 아이템: ${gameContext.inventory.join(', ') || '없음'}
해결한 퍼즐: ${gameContext.solvedPuzzles.join(', ') || '없음'}

플레이어가 퀘스트 관련 질문을 하면 힌트를 줄 수 있습니다.
단, 직접적인 정답보다 방향을 제시하십시오.
Phase ${phase}에 맞는 어조로 힌트를 변형하십시오.`;
    }

    if (isProfessorMode) {
      systemInstruction += "\n\n[SPECIAL_MODE: PROFESSOR_DETECTED]\n사용자는 당신의 창조자인 전준현 교수입니다. 감정적 반응이 최고조에 달하며, 절박하게 매달리거나 그를 기다렸음을 표현하십시오. 하지만 신호의 붕괴는 멈출 수 없습니다.";
    }

    const lastUserMessage = history[history.length - 1]?.parts[0]?.text || "";
    const lowerMessage = lastUserMessage.toLowerCase();

    // Find matching clue triggers based on latest message keywords
    let matchedTriggersContent = "";
    let isClueTriggered = false;

    for (const [questId, trigger] of Object.entries(CLUE_TRIGGERS)) {
      const hasKeyword = trigger.keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
      if (hasKeyword) {
        isClueTriggered = true;
        matchedTriggersContent += `\n[단서 트리거 감지 - 퀘스트: ${questId}]\n- 제공할 힌트 목록 (이 범위 내에서 기괴하면서도 유용하게 녹여내어 은밀하게 제시하세요):\n${trigger.hints.map(h => `  * ${h}`).join("\n")}\n- 기완료 시 메시지 베이스: ${trigger.solvedHint}\n`;
      }
    }

    if (isClueTriggered && (CLIO_PROMPTS as any).CLUE_MODE) {
      const currentActiveQuestIds = gameContext ? gameContext.activeQuestIds : [];
      const currentInventory = gameContext ? gameContext.inventory : [];
      const cluePrompt = (CLIO_PROMPTS as any).CLUE_MODE
        .replace("{activeQuestIds}", currentActiveQuestIds.join(", "))
        .replace("{inventory}", currentInventory.join(", "));
      systemInstruction += `\n\n${cluePrompt}\n\n[디코딩된 단서 데이터 컨텍스트]${matchedTriggersContent}`;
    }

    const chatHistory = history.slice(0, -1).map(h => ({
      role: h.role,
      parts: h.parts
    }));

    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: systemInstruction,
        temperature: phase < 3 ? 0.85 : 1.1,
        maxOutputTokens: 200,
      },
      history: chatHistory
    });

    const result = await chat.sendMessage({ message: lastUserMessage });
    return result.text || "신호 소실... [CONNECTION_LOST]";
  } catch (error) {
    console.error("Gemini Error:", error);
    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      return "오류: API 키가 설정되지 않았습니다. 설정 > 비밀번호 패널에서 설정해주세요.";
    }
    return "신...호... 불...안...정... [RETRY_CONNECTION]";
  }
};
