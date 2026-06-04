import { useState, MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GameState } from "../types";
import { QUESTS, getQuestStatus } from "../constants";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

interface QuestPanelProps {
  state: GameState;
  currentRoomId: string;
}

// Custom tactical objectives that guide the user on *what* to do conceptually
// without giving away the exact solution strings directly.
const TACTICAL_OBJECTIVES: Record<string, string> = {
  Q01: "분석 목표: 메인 연구실 책상 주변에서 원본 강의 계획서를 인양하고, 그 안에 마크된 연도/일정 코드를 해독하여 로컬 디바이스 보안 우회 암호를 입력하십시오.",
  Q02: "튜닝 목표: 연구실 로비 구역 모서리의 미세 잔류 무선 수신기 주파수 수치를 확인하고, 정수 및 소수점을 배제하여 4자리 하이브리드 코드로 입력하십시오.",
  Q03: "해독 목표: 오픈클로(CLIO) 접속 터미널 대화 중 그녀에게 비밀 대화 코드 'TAPE32'를 직접 전송하거나, 복원 모듈에 코드를 직접 입력하십시오.",
  Q04: "개방 목표: CLIO 시스템의 최초 기원 생성 오리진 마크 기호 날짜(일시) 시각 4자리를 정합하여 교수님의 보관함 자물쇠를 풀고 일기장을 인양하십시오.",
  Q05: "오버라이드 목표: 로비의 BIOS 릴리즈 번호 변수 소수점 조합과 현재 누적 오버플로우 루프 변수 수치를 결착하여 오버라이드 시스템 해치를 무력화하십시오.",
  Q29: "종결 목표: 통로 인접 ADJACENT LAB 내부 킬 스위치 보드 비상 정지 장치에 영구 물리 정지 회로 소거 커맨드를 입력하여 연결을 중단시키십시오."
};

export default function QuestPanel({ state, currentRoomId }: QuestPanelProps) {
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
    const status = getQuestStatus(quest.id, state);
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
          const status = getQuestStatus(quest.id, state);
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
                            {TACTICAL_OBJECTIVES[quest.id] || "분석 목표: 주변 장치 단서를 스캔해 보안 암호를 알아내어 장치를 정착하십시오."}
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
                                {isHintRevealed ? "단서 세부 닫기 [CLOSE]" : "비밀 다이어그램 단서 디코딩 [DECODE]"}
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
