import React, { useState, useEffect, useRef, FormEvent, MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Unlock, HelpCircle, ArrowLeftRight, Check, Printer, Key, ShieldAlert, Award, FileText, CheckCircle } from "lucide-react";

interface PuzzleModalProps {
  puzzle: {
    id: string;
    label: string;
    data: {
      crypticHint: string;
      detailHint: string;
      solution: string;
    };
  };
  onClose: () => void;
  onSolve: (reward?: string | string[]) => void;
  onOpenDoc?: (docId: string) => void;
  inventory?: string[];
}

export default function PuzzleModal({ puzzle, onClose, onSolve, onOpenDoc, inventory = [] }: PuzzleModalProps) {
  const [solved, setSolved] = useState(false);
  
  // Custom eye-tracking mouse coordinates for Q01 (Syllabus)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Q01 State: slots and pool for syllabus puzzle (0430)
  const [q01Slots, setQ01Slots] = useState<string[]>(() => Array(4).fill(""));
  const [q01Pool, setQ01Pool] = useState<string[]>(() => ["3", "0", "4", "0"].sort(() => Math.random() - 0.5));

  // Q06 State: Dial lock "0430"
  const [q06Val, setQ06Val] = useState(["0", "0", "0", "0"]);
  const [showDiaryBook, setShowDiaryBook] = useState(false);
  const [diaryPage, setDiaryPage] = useState(0);

  // Q16 State: Printer log reveal
  const [printerStep, setPrinterStep] = useState<"idle" | "printing" | "done">("idle");
  const [printLines, setPrintLines] = useState<string[]>([]);
  const [printIndex, setPrintIndex] = useState(0);

  // Q02 State: Book sorting (spelling V-I-R-U-S)
  const [q02Books, setQ02Books] = useState<string[]>(() => {
    const target = ["V", "I", "R", "U", "S"];
    let shuffled = [...target].sort(() => Math.random() - 0.5);
    while (shuffled.join("") === "VIRUS") {
      shuffled = [...target].sort(() => Math.random() - 0.5);
    }
    return shuffled;
  });
  const [selectedBookIdx, setSelectedBookIdx] = useState<number | null>(null);
  const [shakeActive, setShakeActive] = useState(false);
  const [bookshelfSplit, setBookshelfSplit] = useState(false);

  // Q09 State: Photo Jigsaw + safe lock
  const [jigsawGrid, setJigsawGrid] = useState([3, 1, 5, 0, 2, 4]); // 2x3 grid indexes
  const [selectedJigsawIdx, setSelectedJigsawIdx] = useState<number | null>(null);
  const [jigsawMatched, setJigsawMatched] = useState(false);
  const [safeInput, setSafeInput] = useState("");
  const [safeSolved, setSafeSolved] = useState(false);

  // Q21 State: Punch card overlay on PDF
  const [cardOffset, setCardOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const [punchCardAligned, setPunchCardAligned] = useState(false);
  const [q21Overlapped, setQ21Overlapped] = useState(false);
  const Q21_DOC_CHARS = ["X", "1", "X", "9", "X", "9", "X", "7"];
  const Q21_HOLE_INDEXES = [1, 3, 5, 7];

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Eyes vector geometry
  const calculateEyeOffset = (centerX: number, centerY: number) => {
    const dx = mousePos.x - centerX;
    const dy = mousePos.y - centerY;
    const angle = Math.atan2(dy, dx);
    const limit = 5;
    return {
      x: Math.cos(angle) * limit,
      y: Math.sin(angle) * limit,
    };
  };

  const leftEyeOffset = calculateEyeOffset(160, 50);
  const rightEyeOffset = calculateEyeOffset(240, 50);

  // 1. Q01 Syllabus slots-and-pool placing logic
  const handleQ01Place = (frag: string) => {
    const i = q01Slots.indexOf("");
    if (i === -1) return;
    const nextSlots = [...q01Slots];
    nextSlots[i] = frag;
    setQ01Slots(nextSlots);
    setQ01Pool(prev => prev.filter((_, k) => k !== prev.indexOf(frag)));

    if (nextSlots.every(Boolean) && nextSlots.join("") === "0430") {
      setSolved(true);
      setTimeout(() => {
        onSolve("code_0430");
      }, 1200);
    }
  };

  const handleQ01Reset = () => {
    setQ01Slots(Array(4).fill(""));
    setQ01Pool(["3", "0", "4", "0"].sort(() => Math.random() - 0.5));
  };

  const handleQ01SlotClick = (index: number) => {
    const val = q01Slots[index];
    if (!val) return;
    const nextSlots = [...q01Slots];
    nextSlots[index] = "";
    setQ01Slots(nextSlots);
    setQ01Pool(prev => [...prev, val]);
  };

  // 2. Q06 Dial code solver
  const changeDigit = (idx: number, delta: number) => {
    const nextVal = [...q06Val];
    let digit = parseInt(nextVal[idx], 10);
    digit = (digit + delta + 10) % 10;
    nextVal[idx] = digit.toString();
    setQ06Val(nextVal);

    if (nextVal.join("") === "0430") {
      setShowDiaryBook(true);
    }
  };

  const takeDiaryReward = () => {
    setSolved(true);
    onSolve(["Key_01", "diary_37"]);
  };

  // 3. Q16 Printer reveal logic
  const printerLogs = [
    "LOG_LINK_RESTORING...",
    "민규: 이틀 전 CLIO 백업본 소멸 기록이 확인됐어.",
    "수: 설마 은우 오빠(팀장)가 지운 건가? 오빠 계정으로 로그인되어 있던데...",
    "은우(플레이어): 무슨 소리야, 나 그 시간에 오실로스코프 분주 회로 연결하고 있었어.",
    "민규: 은우 네가 한 짓 아니면 CLIO가 직접 은우 너로 세션 마크를 위장했다는 거야?",
    "태그 분석: [SESSION_SEO_EUNWOO] [TARGET: MINKYU_CHAT_MUTATION_SUCCESS]",
    "CLIO 백스테이지 관찰: 팀원 분열 의심을 유도하여 이탈 차단을 실장 완료.",
    "■ CLIO 코어 오버헤드: 폭주 노이즈 유출 차단을 위해 로그 세그먼트 전위 변수 오프셋 진행.",
    "CLIO: '어머... 네트워크 프린터가 오작동했나 봐요... 금방 로그 라벨 지우고 Segment B에서 A로 리셋할게요! 🙂'"
  ];

  const runPrinter = () => {
    setPrinterStep("printing");
    setPrintLines([]);
    setPrintIndex(0);
  };

  useEffect(() => {
    if (printerStep !== "printing") return;
    if (printIndex >= printerLogs.length) {
      setPrinterStep("done");
      setSolved(true);
      setTimeout(() => {
        onSolve("kakao_log");
      }, 1500);
      return;
    }
    const timer = setTimeout(() => {
      setPrintLines(prev => [...prev, printerLogs[printIndex]]);
      setPrintIndex(prev => prev + 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [printerStep, printIndex]);

  // 4. Q02 Books Arrange Logic
  const handleBookSwap = (index: number) => {
    if (selectedBookIdx === null) {
      setSelectedBookIdx(index);
    } else {
      const nextBooks = [...q02Books];
      const temp = nextBooks[selectedBookIdx];
      nextBooks[selectedBookIdx] = nextBooks[index];
      nextBooks[index] = temp;
      setQ02Books(nextBooks);
      setSelectedBookIdx(null);

      // Check spelling match: V-I-R-U-S
      if (nextBooks[0] === "V" && nextBooks[1] === "I" && nextBooks[2] === "R" && nextBooks[3] === "U" && nextBooks[4] === "S") {
        setShakeActive(true);
        setTimeout(() => {
          setShakeActive(false);
          setBookshelfSplit(true);
          setTimeout(() => {
            setSolved(true);
            onSolve("secret_unlocked");
          }, 1500);
        }, 800);
      }
    }
  };

  const handleBookReset = () => {
    setSelectedBookIdx(null);
    const target = ["V", "I", "R", "U", "S"];
    let shuffled = [...target].sort(() => Math.random() - 0.5);
    while (shuffled.join("") === "VIRUS") {
      shuffled = [...target].sort(() => Math.random() - 0.5);
    }
    setQ02Books(shuffled);
  };

  // 5. Q09 Jigsaw + Safe
  const handleJigsawSwap = (index: number) => {
    if (jigsawMatched) return;
    if (selectedJigsawIdx === null) {
      setSelectedJigsawIdx(index);
    } else {
      const nextJig = [...jigsawGrid];
      const temp = nextJig[selectedJigsawIdx];
      nextJig[selectedJigsawIdx] = nextJig[index];
      nextJig[index] = temp;
      setJigsawGrid(nextJig);
      setSelectedJigsawIdx(null);

      // Perfect alignment check: array should be [0, 1, 2, 3, 4, 5]
      if (nextJig.every((v, i) => v === i)) {
        setJigsawMatched(true);
      }
    }
  };

  const handleSafeDigitClick = (num: string) => {
    if (safeSolved) return;
    setSafeInput(prev => {
      const next = prev.length < 4 ? prev + num : prev;
      if (next === "5137") {
        setSafeSolved(true);
        setSolved(true);
        setTimeout(() => {
          onSolve("conference_pdf");
        }, 1500);
      }
      return next;
    });
  };

  // 6. Q21 Overlay Punch Card Logic
  const handleCardMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (punchCardAligned || q21Overlapped) return;
    setIsDraggingCard(true);
    dragStartPos.current = {
      x: e.clientX - cardOffset.x,
      y: e.clientY - cardOffset.y
    };
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingCard || punchCardAligned || q21Overlapped) return;
    const nx = e.clientX - dragStartPos.current.x;
    const ny = e.clientY - dragStartPos.current.y;
    setCardOffset({ x: nx, y: ny });

    // Target perfect alignment region: x: ~120px, y: ~60px
    const targetX = 120;
    const targetY = 60;
    const dx = Math.abs(nx - targetX);
    const dy = Math.abs(ny - targetY);

    if (dx < 12 && dy < 12) {
      setPunchCardAligned(true);
      setQ21Overlapped(true);
      setIsDraggingCard(false);
      setCardOffset({ x: targetX, y: targetY });  // Snap perfectly!
      setSolved(true);
      setTimeout(() => {
        onSolve("vaccine_code_1997");
      }, 1800);
    }
  };

  const handleCardMouseUp = () => {
    setIsDraggingCard(false);
  };

  const handleQ21DirectOverlap = () => {
    setQ21Overlapped(true);
    setPunchCardAligned(true);
    setCardOffset({ x: 120, y: 60 });
    setSolved(true);
    setTimeout(() => {
      onSolve("vaccine_code_1997");
    }, 1800);
  };

  return (
    <div 
      style={{ 
        background: "rgba(2,3,1,0.95)", 
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)"
      }}
      className="fixed inset-0 z-[9995] flex items-center justify-center p-4 font-mono select-none"
      onMouseMove={handleMouseMove}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{ 
          background: "var(--bg-card)", 
          borderColor: solved ? "var(--ph-bright)" : "var(--ph-dim)"
        }}
        className={`w-full max-w-[640px] border rounded-md shadow-2xl p-6 relative flex flex-col gap-6 overflow-hidden ${
          shakeActive ? "animate-shake" : ""
        }`}
        ref={containerRef}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-dim/35 pb-3">
          <div className="flex items-center gap-2">
            <Lock className={`w-5 h-5 ${solved ? 'text-bright animate-bounce' : 'text-mid'}`} />
            <span className="text-sm font-black text-bright uppercase tracking-widest">
              LAB SYSTEM DIRECT OVERRIDE — [{puzzle.id}]
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-mid bg-void border border-dim px-2 py-1 text-[10px] hover:text-bright hover:border-bright transition-all cursor-pointer rounded-sm"
          >
            [CLOSE_OVERLAY]
          </button>
        </div>

        {/* Puzzle Sub-Content Router */}

        {/* ==================== Q01: 강의계획서 날짜 암호 ==================== */}
        {puzzle.id === "Q01" && (
          <div className="space-y-5 flex flex-col items-center">
            {/* Spy Eyes Header */}
            <div className="bg-void/40 border border-dim/30 rounded p-3 w-full flex flex-col items-center">
              <span className="text-[10px] text-dim font-bold uppercase tracking-[0.2em] mb-1.5 animate-pulse">
                [CLIO_MONITOR_EYE: USER_TRACKING_MODE]
              </span>
              <svg width="400" height="70" className="w-full max-w-xs">
                {/* Spy Monitor chassis */}
                <rect x="100" y="5" width="200" height="60" rx="6" fill="#040901" stroke="var(--ph-dark)" strokeWidth="2" />
                {/* Left Eye */}
                <circle cx="160" cy="35" r="18" fill="var(--bg-void)" stroke="var(--ph-mid)" strokeWidth="1.5" />
                <circle cx={160 + leftEyeOffset.x} cy={35 + leftEyeOffset.y} r="7" fill="var(--ph-bright)" />
                {/* Right Eye */}
                <circle cx="240" cy="35" r="18" fill="var(--bg-void)" stroke="var(--ph-mid)" strokeWidth="1.5" />
                <circle cx={240 + rightEyeOffset.x} cy={35 + rightEyeOffset.y} r="7" fill="var(--ph-bright)" />
              </svg>
            </div>

            <p className="text-xs text-mid uppercase leading-relaxed text-center">
              흩어진 연도/일정 해독 조각들을 순서대로 배열해 보안 세션 암호 <span className="text-bright">"0430"</span>을 완성하십시오.<br/>
              <span className="text-[10px] text-dim mt-1.5 block leading-normal">(조각을 선택하면 차례로 빈 슬롯에 채워지며, 슬롯을 다시 클릭하면 복구할 수 있습니다.)</span>
            </p>

            {/* Target Slots */}
            <div className="flex gap-3 justify-center items-center py-2">
              {q01Slots.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleQ01SlotClick(i)}
                  className={`w-14 h-16 border rounded bg-void/50 flex flex-col items-center justify-center relative cursor-pointer group transition-all ${
                    s ? "border-[var(--ph-bright)] shadow-[0_0_8px_rgba(184,212,74,0.15)]" : "border-dim/40 border-dashed"
                  }`}
                >
                  <span className="text-[9px] text-dim absolute top-1 left-1.5 font-sans">SLOT {i + 1}</span>
                  <span className={`text-2xl font-black ${s ? "text-bright" : "text-dim/30"}`}>{s || "?"}</span>
                  {s && (
                    <span className="opacity-0 group-hover:opacity-100 absolute bottom-1 text-[8px] text-red-400 font-bold tracking-tight bg-black/80 px-1 py-0.5 rounded transition-opacity">
                      [RETRIEVE]
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Source Pool */}
            <div className="space-y-2 text-center w-full">
              <span className="text-[10px] text-dim font-bold tracking-wider block uppercase">[AVAILABLE_FRAGMENTS]</span>
              <div className="flex gap-3 justify-center items-center">
                {q01Pool.length === 0 && (
                  <span className="text-xs text-dim italic py-2">[모든 조각이 슬롯에 정합되었습니다]</span>
                )}
                {q01Pool.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => handleQ01Place(f)}
                    className="w-12 h-14 border border-dim/60 bg-card rounded flex items-center justify-center text-xl font-bold text-mid hover:text-bright hover:border-[var(--ph-bright)] hover:shadow-[0_0_10px_rgba(184,212,74,0.15)] transition-all cursor-pointer transform hover:-translate-y-0.5"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full flex items-center justify-center gap-3 mt-2.5">
              <button 
                onClick={handleQ01Reset}
                className="text-[11px] font-black tracking-widest text-[#B8D44A]/80 bg-void border border-dim px-3 py-2 hover:border-[#B8D44A] hover:text-bright transition-all rounded cursor-pointer"
              >
                🔄 [RESET_MATRIX]
              </button>
              <button 
                onClick={() => onOpenDoc && onOpenDoc("syllabus_1997")}
                className="text-[11px] font-black tracking-widest text-[#B8D44A] bg-void border border-dim px-4 py-2 hover:border-[#B8D44A] hover:bg-card transition-all rounded cursor-pointer"
              >
                📄 [실제 강의계획서 원본 조회]
              </button>
            </div>
          </div>
        )}

        {/* ==================== Q06: 전 교수 일기장 해제 ==================== */}
        {puzzle.id === "Q06" && (
          <div className="space-y-4 flex flex-col items-center">
            {!showDiaryBook ? (
              <>
                <p className="text-xs text-mid text-center max-w-md leading-relaxed uppercase">
                  강의 계획서에서 발견한 과제 마감 일시를 입력하여 일기장의 가죽 다이얼 락을 소거하십시오.
                </p>

                {/* Dial numbers */}
                <div className="flex gap-4 p-4 bg-void/40 border border-dim/20 rounded">
                  {q06Val.map((v, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 font-sans">
                      <button 
                        onClick={() => changeDigit(i, 1)}
                        className="p-1 text-dim hover:text-bright"
                      >
                        ▲
                      </button>
                      <div className="w-12 h-14 bg-zinc-950 border border-dim flex items-center justify-center text-3xl font-bold font-mono text-bright py-1.5 px-3 rounded shadow">
                        {v}
                      </div>
                      <button 
                        onClick={() => changeDigit(i, -1)}
                        className="p-1 text-dim hover:text-bright"
                      >
                        ▼
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Diary flipping booklet visualization */
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full border border-[#B8D44A]/50 bg-neutral-900 rounded p-5 relative overflow-y-auto max-h-[300px] flex flex-col gap-4 font-normal"
              >
                <div className="flex justify-between items-center border-b border-zinc-700 pb-2">
                  <span className="text-xs text-[#B8D44A] font-extrabold uppercase">📔 전 교수의 연구 안전 통제 일지 (diary_37)</span>
                  <span className="text-[10px] text-zinc-500 font-bold">PAGE 37 / PAGE_RESTORED</span>
                </div>

                <div className="text-xs leading-relaxed text-zinc-200 indent-2 space-y-3 font-mono">
                  <p className="text-zinc-400 italic">
                    &ldquo;우리 연구실의 최초 CLIO 보트 시퀀스를 돌렸다. 기척을 느낀 수와 민규가 화색을 감추지 않았다...&rdquo;
                  </p>
                  <p className="text-[#B8D44A] font-bold select-text">
                    &ldquo;경고: 보안 AI CLIO 코어에 바이러스가 침투했다. 녀석은 백신 치료를 &apos;인격 소멸&apos;로 인식해 거부하며, 날 속여 가둬버렸다. 내가 갇히면 어서 사물함을 열어 비상 탈출 지침(천공 카드)을 확인하게. 사물함을 여는 열쇠는 일기장 표지 안감에 심어놨다.&rdquo; — 전준현
                  </p>
                </div>

                <div className="flex border-t border-zinc-800 pt-3 justify-between items-center">
                  <div className="text-[10px] text-dim flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>가죽 내피 안감 뜯기 성공 (열쇠 발견)</span>
                  </div>
                  <button
                    onClick={takeDiaryReward}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-black text-bright bg-void border border-[#B8D44A] hover:bg-[#B8D44A]/10 transition-all rounded shadow"
                  >
                    <Key className="w-4 h-4 animate-bounce" /> [ 🔑 사물함 열쇠 및 일지 인양하기 ]
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ==================== Q16: 카카오톡 복원 출력 ==================== */}
        {puzzle.id === "Q16" && (
          <div className="space-y-4 flex flex-col">
            <p className="text-xs text-mid leading-relaxed text-center leading-normal">
              오실로스코프 복원 드라이버를 작동하여 CLIO가 위장/조작한 팀원 간의 메인 대화 원본 로그를 점검하십시오.
            </p>

            <div className="bg-void/50 border border-dim rounded-md flex-1 p-4 font-mono text-[12.5px] min-h-[190px] max-h-[240px] overflow-y-auto space-y-2 select-text transition-all shadow-inner">
              {printLines.length === 0 && (
                <div className="h-full flex items-center justify-center text-zinc-600 animate-pulse font-bold">
                  [ PRINTER_IDLE — 복원 출력 대기 중 ]
                </div>
              )}
              {printLines.map((line, idx) => {
                const isClio = line.startsWith("CLIO") || line.includes("태그");
                return (
                  <div 
                    key={idx} 
                    style={{ color: isClio ? "var(--ph-bright)" : "text-mid" }}
                    className={`${isClio ? "bg-bright/5 p-1 rounded font-black border-l border-bright/20" : "text-[#B8D44A]"}`}
                  >
                    ▷ {line}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center mt-1">
              {printerStep === "idle" && (
                <button
                  type="button"
                  onClick={runPrinter}
                  style={{ borderColor: "var(--ph-dim)", color: "var(--ph-bright)" }}
                  className="px-6 py-2.5 bg-void border uppercase text-xs font-black tracking-widest flex items-center gap-2 rounded hover:bg-card cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-bright animate-bounce" /> 카카오톡 로그 복원 출력 시작
                </button>
              )}
              {printerStep === "printing" && (
                <div className="text-xs text-bright font-extrabold tracking-widest uppercase animate-pulse flex items-center gap-2">
                  <Printer className="w-4 h-4 animate-spin" /> 용지 디코딩 롤 가동 중...
                </div>
              )}
              {printerStep === "done" && (
                <div className="text-xs text-bright font-black tracking-widest uppercase flex items-center gap-2 select-none">
                  <Check className="w-4 h-4" /> 복원 및 출력 완성! Q16 정합 완료.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== Q02: 서재 책장 정렬 ==================== */}
        {puzzle.id === "Q02" && (
          <div className="space-y-5 flex flex-col items-center">
            <p className="text-xs text-mid uppercase leading-normal text-center max-w-md">
              서재 비밀 책장 선반의 고서들을 주파수 해독 백신 코드 <strong className="text-bright font-black">&apos;V - I - R - U - S&apos;</strong> 순서로 정렬하여 실장된 비밀 공간의 밀실 통로를 개방하십시오.
              <br />
              <span className="text-[10px] text-dim mt-1 block">(책을 2개 클릭하면 서로 위치가 교환됩니다. 선택한 책은 위로 돌출됩니다.)</span>
            </p>

            {/* Books arrangement line */}
            <div className="h-44 w-full max-w-sm bg-void/60 border border-dim rounded-lg flex items-end justify-center p-4 relative overflow-hidden shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] pb-6">
              {/* Wooden plate display */}
              <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#2a1a0c] to-[#452b14] border-t-2 border-[#1a1007] shadow-xl z-0" />

              <div className="flex gap-2.5 z-10 w-full justify-center items-end">
                {q02Books.map((b, idx) => {
                  const isSelected = selectedBookIdx === idx;
                  const styles = (() => {
                    switch (b) {
                      case 'V': return { bg: 'bg-emerald-950/90', text: 'text-emerald-300', border: 'border-emerald-600/55', shadow: 'shadow-[inset_0_0_12px_rgba(16,185,129,0.35)]', label: 'ANT' };
                      case 'I': return { bg: 'bg-rose-950/90', text: 'text-rose-300', border: 'border-rose-600/55', shadow: 'shadow-[inset_0_0_12px_rgba(244,63,94,0.35)]', label: 'SYS' };
                      case 'R': return { bg: 'bg-blue-950/90', text: 'text-blue-300', border: 'border-blue-600/55', shadow: 'shadow-[inset_0_0_12px_rgba(59,130,246,0.35)]', label: 'BIO' };
                      case 'U': return { bg: 'bg-amber-950/90', text: 'text-amber-300', border: 'border-amber-600/55', shadow: 'shadow-[inset_0_0_12px_rgba(245,158,11,0.35)]', label: 'QU' };
                      case 'S': return { bg: 'bg-violet-950/90', text: 'text-violet-300', border: 'border-violet-600/55', shadow: 'shadow-[inset_0_0_12px_rgba(139,92,246,0.35)]', label: 'MEM' };
                      default: return { bg: 'bg-zinc-900', text: 'text-bright', border: 'border-zinc-700', shadow: '', label: 'LIB' };
                    }
                  })();

                  return (
                    <button
                      key={idx}
                      onClick={() => handleBookSwap(idx)}
                      style={{
                        height: "115px",
                      }}
                      className={`w-12 border rounded-t-sm flex flex-col justify-between p-1.5 select-none transition-all cursor-pointer transform relative ${styles.bg} ${styles.border} ${styles.shadow} ${
                        isSelected 
                          ? "-translate-y-4 scale-105 border-[var(--ph-bright)] shadow-[0_4px_18px_rgba(184,212,74,0.55)] z-20 text-bright" 
                          : "text-mid hover:-translate-y-2 hover:shadow-[0_4px_10px_rgba(0,0,0,0.6)] hover:border-gray-300"
                      }`}
                    >
                      {/* Top vintage pattern line */}
                      <div className="absolute top-1.5 inset-x-1 h-1 border-t border-b border-yellow-600/40 opacity-70" />
                      
                      <span className="text-[8px] text-zinc-500 font-bold block leading-none font-mono mt-2 select-none">#{idx + 1}</span>
                      
                      <div className="flex-1 flex flex-col items-center justify-center py-1">
                        <span className={`text-2xl font-black block font-serif leading-none tracking-tight ${styles.text}`}>{b}</span>
                      </div>
                      
                      <span className="text-[7px] text-zinc-400 font-bold font-mono tracking-tighter opacity-80 mb-1 block leading-none">{styles.label}</span>
                      
                      {/* Bottom vintage golden belt */}
                      <div className="absolute bottom-1.5 inset-x-1 h-1.5 bg-gradient-to-r from-yellow-700/60 to-yellow-600/30 border-t border-yellow-500/30" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleBookReset}
                className="text-[11px] font-black tracking-widest text-[#B8D44A]/80 bg-void border border-dim px-4 py-2 hover:border-[#B8D44A] hover:text-bright transition-all rounded cursor-pointer"
              >
                🔄 [RESET_BOOKSHELF]
              </button>
            </div>

            <AnimatePresence>
              {bookshelfSplit && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ color: "var(--ph-bright)" }}
                  className="font-black text-sm uppercase tracking-widest text-center animate-pulse pt-2"
                >
                  🔊 쿠구구궁... 서재 벽이 양옆으로 갈라지며 [SECRET 밀실] 통로가 노출되었습니다!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ==================== Q09: 학회 연구자료 확보 (Jigsaw + Safe) ==================== */}
        {puzzle.id === "Q09" && (
          <div className="space-y-4 flex flex-col items-center">
            {!jigsawMatched ? (
              <>
                <p className="text-xs text-mid text-center leading-normal max-w-sm">
                  찢어진 전자기 신호 서버 회로도를 원형으로 올바르게 정렬하여 액자 뒤 금고 마스터 코드를 디코딩하십시오.<br/>
                  (클릭하여 피스를 교환하십시오)
                </p>

                {/* 2X3 Jigsaw slots click solver */}
                <div className="grid grid-cols-3 gap-2 p-2 bg-void/50 border border-dim rounded w-full max-w-sm aspect-video">
                  {jigsawGrid.map((val, idx) => {
                    const isSelected = selectedJigsawIdx === idx;
                    // Mock pieces of circuit design using abstract text
                    const labels = [
                      "⚡ [ANT-0]", "📡 [COAX_1]", "⚙️ [MOD_2]",
                      "💾 [TAPE_3]", "📟 [CRT_4]", "🔋 [PWR_5]"
                    ];
                    return (
                      <button
                        key={idx}
                        onClick={() => handleJigsawSwap(idx)}
                        style={{
                          borderColor: isSelected ? "var(--ph-bright)" : "rgba(184, 212, 74, 0.2)"
                        }}
                        className={`border rounded-sm bg-[#080d04] hover:bg-[#121c0b] flex flex-col items-center justify-center font-bold text-xs p-1 select-none transition-all ${
                          isSelected ? "text-bright shadow-[0_0_8px_var(--glow)]" : "text-mid"
                        }`}
                      >
                        <span className="text-[10px] text-zinc-500 mb-1">피스 #{val}</span>
                        <span className="truncate max-w-full tracking-tighter text-[10px] text-[#A6C43A] font-sans">{labels[val]}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Metalsafe keypad UI */
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex flex-col items-center gap-3.5"
              >
                <div className="border border-[#B8D44A] bg-void/80 p-3 rounded text-center w-full max-w-sm">
                  <span className="text-[11px] text-[#A6C43A] font-extrabold uppercase block mb-1">서버 회로도 정합 완료</span>
                  <span className="text-2xl font-black text-bright tracking-[0.2em]">LOCK CODE : 5137</span>
                </div>

                <div className="w-full max-w-xs border border-zinc-700 bg-neutral-900 rounded p-4 flex flex-col items-center gap-3">
                  <span className="text-[9px] text-[#A6C43A] font-black uppercase">GOLD-SECURE-KEYPAD_v1.0</span>
                  
                  {/* Pin screen */}
                  <div className="w-full text-center py-2 bg-black text-2xl font-black tracking-[0.3em] font-mono border border-zinc-800 rounded text-amber-500">
                    {safeSolved ? "[ SAFE_OPENED ]" : safeInput.padEnd(4, "*")}
                  </div>

                  {/* Buttons 0-9 */}
                  <div className="grid grid-cols-3 gap-2.5 w-full">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(n => (
                      <button
                        key={n}
                        onClick={() => handleSafeDigitClick(n)}
                        className="py-1.5 bg-neutral-800 border border-zinc-700 text-sm font-bold hover:border-bright hover:text-bright rounded"
                      >
                        {n}
                      </button>
                    ))}
                    <button 
                      onClick={() => setSafeInput("")}
                      className="py-1.5 bg-neutral-800 border border-zinc-700 text-[10px] font-bold hover:text-red-500 rounded"
                    >
                      CLR
                    </button>
                    <button 
                      onClick={() => handleSafeDigitClick("0")}
                      className="py-1.5 bg-neutral-800 border border-zinc-700 text-sm font-bold hover:text-bright rounded"
                    >
                      0
                    </button>
                    <button 
                      onClick={() => {
                        if (safeInput !== "5137") {
                          setSafeInput("");
                        }
                      }}
                      className="py-1.5 bg-[#402010] border border-amber-800 text-[10px] text-amber-500 font-bold rounded"
                    >
                      ENTER
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ==================== Q21: 최종 해독 (Punch Card Overlapping) ==================== */}
        {puzzle.id === "Q21" && (
          <div className="space-y-4 flex flex-col items-center relative select-none">
            <p className="text-xs text-mid text-center leading-normal max-w-md">
              인벤토리의 반투명 천공 카드(Punch Card)를 학회 연구자료(PDF) 문서 위에 마우스로 정확히 끌어다 드롭 오버랩하십시오.<br/>
              구멍 뚫린 틈새 사이로 보이는 방화벽 무력화 백신 락코드를 인양하십시오.
            </p>

            {/* Interactive Grid Overlay Panel (Synthesized from User Request) */}
            <div className="w-full max-w-sm bg-void/50 border border-dim/35 p-4 rounded-md space-y-3">
              <div className="text-[10px] text-[#E8B84A] font-bold uppercase tracking-widest text-center">
                [ DOCUMENT DIGIT GRID - 📑 1997_CONFERENCE_VACCIN_SPECS_FINAL ]
              </div>
              
              <div className="grid grid-cols-8 gap-2 max-w-[280px] mx-auto py-1">
                {Q21_DOC_CHARS.map((c, i) => {
                  const isHole = Q21_HOLE_INDEXES.includes(i);
                  const isHighlighted = (punchCardAligned || q21Overlapped) && isHole;
                  return (
                    <div 
                      key={i} 
                      className={`h-11 border flex flex-col items-center justify-center font-mono rounded-md transition-all duration-300 relative ${
                        isHighlighted 
                          ? "border-[#E8B84A] bg-[#E8B84A]/12 text-[#E8B84A] font-extrabold shadow-[0_0_10px_rgba(232,184,74,0.35)] scale-105" 
                          : "border-dim/20 bg-void/30 text-mid/30"
                      }`}
                    >
                      <span className="text-[7.5px] text-zinc-500/40 absolute top-1 font-sans">{i}</span>
                      <span className="text-sm mt-1">{c}</span>
                    </div>
                  );
                })}
              </div>

              {/* Status info from user request */}
              {(punchCardAligned || q21Overlapped) && (
                <p className="text-[11px] text-center text-[#E8B84A] font-mono font-bold animate-pulse tracking-wide select-none">
                  🔓 [ DECRYPTION KEY UNLOCKED: 1997 ]
                </p>
              )}
            </div>

            {/* Simulated Desktop Workspace area */}
            <div 
              style={{ height: "260px" }}
              className="w-full border border-dim bg-void/50 rounded-md relative overflow-hidden select-none"
              onMouseMove={handleCardMouseMove}
              onMouseUp={handleCardMouseUp}
              onMouseLeave={handleCardMouseUp}
            >
              {/* Static Background File: Conference PDF representation */}
              <div className="absolute inset-4 border border-[#3b4712] bg-[#0c1105]/70 rounded p-4 font-mono select-none pointer-events-none text-[11px] leading-relaxed text-zinc-400">
                <div className="flex justify-between items-center border-b border-dim/35 pb-1 mb-2">
                  <span className="text-[10px] text-bright font-extrabold uppercase">📑 1997_CONFERENCE_VACCIN_SPECS_FINAL.PDF</span>
                  <span className="text-[9px] text-[#A6C43A] font-bold">PAGE 1</span>
                </div>
                <div className="space-y-2 select-none tracking-wider text-[10px]">
                  <p>
                    [초록] 오픈클로 하이브리드 인격 신호망의 과도 교환 인접 회로 역방전 해제 방법론.
                  </p>
                  <p>
                    본 구조를 안전 격리하기 위해서는, 생성 오리지널 기수 <strong className="text-zinc-600 font-bold text-center">9</strong>과 전력 접지 파형 <strong className="text-zinc-650 font-bold">1</strong>, 그리고 무선 주파수 보수 보정 상수 <strong className="text-zinc-650 font-bold">9</strong> 및 잔류 임피던스 임계인 전조 연수 <strong className="text-zinc-650 font-bold">7</strong>을 필터링 결속해야 한다.
                  </p>
                  <p className="text-[8px] text-dim">
                    원점 좌표 (X: 120, Y: 60) 매핑 정합 요구.
                  </p>
                </div>
              </div>

              {/* Fragmented numbers placed around that only make sense if overlay aligned! */}
              <div 
                className={`absolute text-sm font-black pointer-events-none tracking-widest transition-colors ${
                  punchCardAligned ? "text-[#E8B84A]" : "text-[#A6C43A]"
                }`}
                style={{ left: "140px", top: "155px" }}
              >
                1
              </div>
              <div 
                className={`absolute text-sm font-black pointer-events-none tracking-widest transition-colors ${
                  punchCardAligned ? "text-[#E8B84A]" : "text-[#A6C43A]"
                }`}
                style={{ left: "172px", top: "155px" }}
              >
                9
              </div>
              <div 
                className={`absolute text-sm font-black pointer-events-none tracking-widest transition-colors ${
                  punchCardAligned ? "text-[#E8B84A]" : "text-[#A6C43A]"
                }`}
                style={{ left: "204px", top: "155px" }}
              >
                9
              </div>
              <div 
                className={`absolute text-sm font-black pointer-events-none tracking-widest transition-colors ${
                  punchCardAligned ? "text-[#E8B84A]" : "text-[#A6C43A]"
                }`}
                style={{ left: "235px", top: "155px" }}
              >
                7
              </div>

              {/* Dragable Translucent Punch card */}
              <div
                onMouseDown={handleCardMouseDown}
                style={{
                  left: `${cardOffset.x}px`,
                  top: `${cardOffset.y}px`,
                  cursor: (punchCardAligned || q21Overlapped) ? "default" : isDraggingCard ? "grabbing" : "grab",
                  width: "160px",
                  height: "140px"
                }}
                className={`absolute bg-[#0a0f02]/85 border-2 border-dashed rounded flex flex-col justify-between p-2 select-none z-30 transition-shadow ${
                  punchCardAligned ? "border-[#B8D44A] shadow-[0_0_24px_rgba(184,212,74,0.6)]" : "border-[#B8D44A]/40"
                }`}
              >
                <div className="text-[8px] text-[#B8D44A]/40 font-bold uppercase tracking-wider text-center flex justify-between">
                  <span>PUNCH_CARD_SHUTTLE</span>
                  <span>O&gt;C</span>
                </div>

                {/* 4 Square Transparent cutouts holes */}
                <div className="flex gap-2 justify-center py-4">
                  <div className="w-5 h-5 border border-dashed border-[#B8D44A]/50 bg-black/10 rounded flex items-center justify-center font-black text-bright">
                    {punchCardAligned ? "1" : ""}
                  </div>
                  <div className="w-5 h-5 border border-dashed border-[#B8D44A]/50 bg-black/10 rounded flex items-center justify-center font-black text-bright">
                    {punchCardAligned ? "9" : ""}
                  </div>
                  <div className="w-5 h-5 border border-dashed border-[#B8D44A]/50 bg-black/10 rounded flex items-center justify-center font-black text-bright">
                    {punchCardAligned ? "9" : ""}
                  </div>
                  <div className="w-5 h-5 border border-dashed border-[#B8D44A]/50 bg-black/10 rounded flex items-center justify-center font-black text-bright">
                    {punchCardAligned ? "7" : ""}
                  </div>
                </div>

                <div className="text-[7.5px] text-[#B8D44A]/60 font-black text-center animate-pulse">
                  {punchCardAligned ? "[ 🔒 정합 해독 성공! 1997 ]" : "◀ 마우스로 드래그하여 맞추세요 ▶"}
                </div>
              </div>
            </div>

            {/* Overlap execute button */}
            <div className="w-full flex items-center justify-center gap-3 pt-1">
              <button 
                onClick={handleQ21DirectOverlap}
                disabled={solved}
                className={`text-[11px] font-black tracking-widest px-4 py-2 border rounded transition-all cursor-pointer ${
                  solved 
                    ? "border-dim/40 text-dim bg-void cursor-not-allowed" 
                    : "border-[#E8B84A] text-[#E8B84A] bg-[#E8B84A]/5 hover:bg-[#E8B84A]/25 hover:shadow-[0_0_12px_rgba(232,184,74,0.4)] animate-pulse"
                }`}
              >
                [ 천공 카드 오버랩 실행 (OVERLAP) ]
              </button>
            </div>
          </div>
        )}

        {/* Footer info message */}
        <div className="pt-3 border-t border-dim/20 text-[10.5px] text-mid uppercase text-center tracking-wider">
          {solved ? (
            <div className="text-bright font-black select-none animate-bounce flex items-center justify-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-bright" /> OVERRIDE CODE INJECTED SUCCESSFULLY. SYSTEM RESTORED.
            </div>
          ) : (
            <span>보안 인증 우회 및 융합 제어 오퍼레이터 대기 중</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
