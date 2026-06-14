import { useState, MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GameState } from "../types";
import { QUESTS, getQuestStatus } from "../constants";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

interface QuestPanelProps {
  state: GameState;
  currentRoomId: string;
  blackoutTriggered?: boolean;
}

// Custom tactical objectives that guide the user on *what* to do conceptually
// without giving away the exact solution strings directly.
const TACTICAL_OBJECTIVES: Record<string, string> = {
  Q00: "정전 복구: 어둠 속에 숨겨진 비상 퓨즈 레버를 마우스 배정 필드로 밝혀 클릭하세요.",
  Q11: "테이프 수집: 연구실 바닥에 놓여 있는 백업용 VHS 비디오 테이프를 획득하세요.",
  Q01: "분석 목표: 모니터 속 눈동자가 가리키는 시계 방향 힌트를 통해 4자리 연도 부호를 찾아내십시오.",
  Q06: "일기장 열기: 4자리 비밀번호 '3790'을 다이어리 다이얼에 입력해 교수님의 마지막 일기를 확인해 보세요.",
  Q16: "프린터 복구: 복구 프린터 기기를 가동하여 과거 구성원들의 카카오톡 복원 내역을 인쇄하세요.",
  Q04: "보관함 해제: Key_01 캐비닛 열쇠를 잠긴 철문 위로 드롭해 천공 카드를 발견하세요.",
  Q02: "책장 정렬: 책들에 적힌 알파벳을 하나씩 정렬해서 'V-I-R-U-S' 단어를 완성해 밀실 격벽을 여세요.",
  Q23: "단말기 점검: 김정웅 교수의 연구실 신호 교신 장비 화면을 마우스로 클릭해 에러 데이터를 검토하세요.",
  Q09: "금고 개방: 찢어진 회로 설계도 조각들의 원래 모양을 맞춘 후 금고 번호 '5137'을 풀어서 문서를 얻으세요.",
  Q21: "천공 대조: 천공 카드를 마스터 기밀 문서 위로 겹쳐 구멍 틈새로 보이는 백신 암호 연도를 찾아 일치시키십시오."
};

export default function QuestPanel({ state, currentRoomId, blackoutTriggered }: QuestPanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});

  const toggleExpand = (questId: string) => {
    setExpanded(prev => ({
      ...prev,
      [questId]: !prev[questId]
    }));
  };

  const toggleRevealHint = (questId: string, e: MouseEvent) => {
    e.stopPropagation();
    setRevealedHints(prev => ({
      ...prev,
      [questId]: !prev[questId]
    }));
  };

  // Calculate stats
  let solvedCount = 0;
  let activeCount = 0;
  let lockedCount = 0;

  QUESTS.forEach(quest => {
    const status = getQuestStatus(quest.id, state, blackoutTriggered);
    if (quest.id === "Q00" && status === 'locked') {
      return; // Skip hidden sudden quest
    }
    if (status === 'solved') solvedCount++;
    else if (status === 'active') activeCount++;
    else if (status === 'locked') lockedCount++;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-card border border-dim rounded-md shadow-lg p-5">
      {/* Title */}
      <div className="text-sm text-bright font-black mb-4 flex items-center gap-2 border-b border-dim pb-2.5 uppercase tracking-widest">
        <AlertCircle className="w-4 h-4 text-bright" /> Security_Override_Ops.log
      </div>

      {/* Quest list */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
        {QUESTS.map((quest, idx) => {
          const status = getQuestStatus(quest.id, state, blackoutTriggered);
          
          // Completely hide Q00 if it is locked (not yet triggered)
          if (quest.id === "Q00" && status === 'locked') {
            return null;
          }

          const isExpanded = !!expanded[quest.id];
          const isCurrentRoom = quest.room === currentRoomId;
          const isHintRevealed = !!revealedHints[quest.id];

          // Determine styles based on state
          let dotColorClass = "text-stone-500";
          let dotAnimClass = "";
          let itemStyle = {};
          let stateText = "";
          let titlePrefix = "";
          let displayTitle = quest.title;

          if (status === 'locked') {
            dotColorClass = "text-stone-700";
            itemStyle = { opacity: 0.35 };
            stateText = "🔒 LOCKED";
            displayTitle = `🔒 [제 ${idx + 1} 프로토콜: 대기 상태]`;
          } else if (status === 'active') {
            dotColorClass = "text-bright"; // green/bright dot
            dotAnimClass = "animate-pulse-dot inline-block";
            itemStyle = { opacity: 1 };
            stateText = isCurrentRoom ? "◀ HERE" : "";
          } else if (status === 'solved') {
            dotColorClass = "text-dim"; // dark dot
            itemStyle = { opacity: 0.60 };
            titlePrefix = "✓ ";
          }

          const handleCardClick = () => {
            if (status !== 'locked') {
              toggleExpand(quest.id);
            }
          };

          return (
            <div
              key={quest.id}
              onClick={handleCardClick}
              style={itemStyle}
              className={`p-3 border border-dim/50 rounded bg-void/40 transition-all font-mono select-none ${
                status !== 'locked' ? 'cursor-pointer hover:border-dim hover:bg-void/70' : 'cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-base leading-none ${dotColorClass} ${dotAnimClass}`}>●</span>
                  <span className="text-[13px] md:text-[13.5px] font-bold text-bright tracking-wider">
                    {titlePrefix}{displayTitle}
                  </span>
                </div>
                {stateText && (
                  <span className="text-[11.5px] md:text-xs text-bright font-black tracking-widest animate-pulse">
                    {stateText}
                  </span>
                )}
              </div>

              {/* Collapsible Details */}
              <AnimatePresence initial={false}>
                {status !== 'locked' && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2.5 pt-2 border-t border-dim/20 text-[12.5px] text-mid leading-relaxed whitespace-pre-wrap flex flex-col gap-3">
                      {status === 'solved' ? (
                        <div className="text-mid font-semibold">
                          {quest.solvedHint}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2.5">
                          {/* Rich concept objective */}
                          <p className="text-[12.5px] text-mid/95 font-bold leading-relaxed border-l-2 border-bright/30 pl-2.5">
                            {TACTICAL_OBJECTIVES[quest.id] || "탐색 목표: 주변의 힌트를 바탕으로 단서를 해독하세요."}
                          </p>

                          {/* Reveal detailed hint block */}
                          <div className="border border-dim/30 bg-void/60 p-2 rounded flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={(e) => toggleRevealHint(quest.id, e)}
                              className="w-full flex items-center justify-between text-[10px] font-black tracking-widest uppercase hover:text-bright transition-colors cursor-pointer text-mid px-1 py-0.5"
                            >
                              <span className="flex items-center gap-1">
                                {isHintRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                {isHintRevealed ? "도움말 접기 [CLOSE]" : "상세 도움말 읽기 [REVEAL]"}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-dim/20 text-mid border border-dim/30 hover:border-bright">
                                {isHintRevealed ? "HIDE" : "REVEAL"}
                              </span>
                            </button>
                            
                            {isHintRevealed && (
                              <p className="text-[11px] text-[#A6C43A] leading-relaxed select-text font-medium pt-1.5 border-t border-dim/25 whitespace-pre-wrap">
                                {quest.hint}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Statistics */}
      <div className="mt-4 pt-3 border-t border-dim flex items-center justify-between text-xs font-bold tracking-wider select-none font-mono">
        <span className="uppercase text-dim">Task_Stats:</span>
        <div className="flex gap-4">
          <span style={{ color: "var(--ph-mid)" }}>
            SOLVED: {solvedCount}
          </span>
          <span style={{ color: "var(--ph-dark)" }}>
            ACTIVE: {activeCount}
          </span>
          <span style={{ color: "var(--ph-dark)" }}>
            LOCKED: {lockedCount}
          </span>
        </div>
      </div>
    </div>
  );
}
