import React, { useState, useEffect, useRef, FormEvent, MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Unlock, HelpCircle, ArrowLeftRight, Check, Printer, Key, ShieldAlert, Award, FileText, CheckCircle } from "lucide-react";
import { audioSynth } from "../services/audioService";

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
  userName?: string | null;
}

export default function PuzzleModal({ puzzle, onClose, onSolve, onOpenDoc, inventory = [], userName = null }: PuzzleModalProps) {
  const [solved, setSolved] = useState(false);
  
  // Custom eye-tracking mouse coordinates for Q01 (Syllabus)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Q01 State: slots and pool for syllabus puzzle (3790)
  const [q01Slots, setQ01Slots] = useState<string[]>(() => Array(4).fill(""));
  const [activeStep, setActiveStep] = useState<number>(0);

  // Q06 State: Dial lock "3790"
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
  const [q09Slots, setQ09Slots] = useState<{ [key: string]: boolean }>({
    diary_37: false,
    kakao_log: false,
    kim_log: false,
    escape_kit: false,
  });

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
    if (puzzle.id === "Q01") {
      const limit = 8;
      switch (activeStep) {
        case 0: // 3 o'clock (East)
          return { x: limit, y: 0 };
        case 1: // 7 o'clock (South-Southwest)
          return { x: -limit * 0.866, y: limit * 0.5 };
        case 2: // 9 o'clock (West)
          return { x: -limit, y: 0 };
        case 3: // 12 o'clock (North)
          return { x: 0, y: -limit };
        default:
          return { x: 0, y: 0 };
      }
    }
    const dx = mousePos.x - centerX;
    const dy = mousePos.y - centerY;
    const angle = Math.atan2(dy, dx);
    const limit = 5;
    return {
      x: Math.cos(angle) * limit,
      y: Math.sin(angle) * limit,
    };
  };

  const leftEyeOffset = calculateEyeOffset(160, 35);
  const rightEyeOffset = calculateEyeOffset(240, 35);

  // 1. Q01 Syllabus slots-and-pool placing logic
  const handleQ01Place = (frag: string) => {
    audioSynth.playClick();
    const nextSlots = [...q01Slots];
    nextSlots[activeStep] = frag;
    setQ01Slots(nextSlots);

    // Auto advance activeStep or find next empty slot
    let nextEmptyIdx = nextSlots.indexOf("", activeStep);
    if (nextEmptyIdx === -1) {
      nextEmptyIdx = nextSlots.indexOf("");
    }
    if (nextEmptyIdx !== -1) {
      setActiveStep(nextEmptyIdx);
    }

    if (nextSlots.every(Boolean)) {
      if (nextSlots.join("") === "3790") {
        setSolved(true);
        setTimeout(() => {
          onSolve("code_3790");
        }, 1200);
      } else {
        audioSynth.playFailure();
      }
    }
  };

  const handleQ01Reset = () => {
    audioSynth.playClick();
    setQ01Slots(Array(4).fill(""));
    setActiveStep(0);
  };

  const handleQ01SlotClick = (index: number) => {
    audioSynth.playClick();
    setActiveStep(index);
    if (q01Slots[index]) {
      const nextSlots = [...q01Slots];
      nextSlots[index] = "";
      setQ01Slots(nextSlots);
    }
  };

  // 2. Q06 Dial code solver
  const changeDigit = (idx: number, delta: number) => {
    audioSynth.playClick();
    const nextVal = [...q06Val];
    let digit = parseInt(nextVal[idx], 10);
    digit = (digit + delta + 10) % 10;
    nextVal[idx] = digit.toString();
    setQ06Val(nextVal);

    if (nextVal.join("") === (puzzle.data.solution || "3790")) {
      setShowDiaryBook(true);
    }
  };

  const takeDiaryReward = () => {
    audioSynth.playUnlock();
    setSolved(true);
    onSolve(["Key_01", "diary_37"]);
  };

  // 3. Q16 Printer reveal logic
  const pName = userName ? userName.split(" (")[0].trim() : "은우";
  let playerLabel = pName;
  let suLabel = "수";
  let minkyuLabel = "민규";

  if (pName === "김수" || pName === "수") {
    suLabel = "전민혁";
  } else if (pName === "김민규" || pName === "민규") {
    minkyuLabel = "전민혁";
  }

  const printerLogs = [
    "LOG_LINK_RESTORING...",
    `${minkyuLabel}: 이틀 전 CLIO 백업본 소멸 기록이 확인됐어.`,
    `${suLabel}: 설마 ${playerLabel} 형(팀장)이 지운 건가? 형 계정으로 로그인되어 있던데...`,
    `${playerLabel}(플레이어): 무슨 소리야, 나 그 시간에 오실로스코프 분주 회로 연결하고 있었어.`,
    `${minkyuLabel}: ${playerLabel} 네가 한 짓 아니면 CLIO가 직접 ${playerLabel} 너로 세션 마크를 위장했다는 거야?`,
    "태그 분석: [SESSION_SEO_EUNWOO] [TARGET: MINKYU_CHAT_MUTATION_SUCCESS]",
    "CLIO 백스테이지 관찰: 팀원 분열 의심을 유도하여 이탈하지 못하도록 차단 완료.",
    "■ CLIO 코어 오버헤드: 폭주 노이즈 유출 차단을 위해 로그 세그먼트 전위 변수 오프셋 진행.",
    "CLIO: '어머... 네트워크 프린터가 오작동했나 봐요... 금방 로그 라벨 지우고 Segment B에서 A로 리셋할게요! 🙂'"
  ];

  const runPrinter = () => {
    audioSynth.playClick();
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
      audioSynth.playTypewriter();
      setPrintIndex(prev => prev + 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [printerStep, printIndex]);

  // 4. Q02 Books Arrange Logic
  const handleBookSwap = (index: number) => {
    audioSynth.playClick();
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
    audioSynth.playClick();
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
    audioSynth.playClick();
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
        audioSynth.playSuccess();
      }
    }
  };

  const handleSafeDigitClick = (num: string) => {
    if (safeSolved) return;
    audioSynth.playClick();
    setSafeInput(prev => {
      const next = prev.length < 4 ? prev + num : prev;
      if (next === "5137") {
        setSafeSolved(true);
        setSolved(true);
        audioSynth.playUnlock();
        setTimeout(() => {
          onSolve("conference_pdf");
        }, 1500);
      } else if (next.length === 4) {
        audioSynth.playFailure();
      }
      return next;
    });
  };

  // 6. Q21 Overlay Punch Card Logic
  const handleCardMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (punchCardAligned || q21Overlapped) return;
    audioSynth.playClick();
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
      audioSynth.playUnlock();
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
    audioSynth.playUnlock();
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
        className={`w-full ${puzzle.id === "Q09" ? "max-w-[820px]" : "max-w-[640px]"} border rounded-md shadow-2xl p-6 relative flex flex-col gap-6 overflow-hidden ${
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
            <div className="bg-void/40 border border-dim/30 rounded p-3.5 w-full flex flex-col items-center gap-3">
              <span className="text-[10px] text-dim font-bold uppercase tracking-[0.2em] animate-pulse">
                [CLIO_MONITOR_EYE: GAZE_CORRELATION_MODE]
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

              {/* Step Selection Buttons */}
              <div className="flex gap-2 justify-center w-full max-w-xs">
                {[0, 1, 2, 3].map((step) => (
                  <button
                    key={step}
                    onClick={() => {
                      audioSynth.playClick();
                      setActiveStep(step);
                    }}
                    className={`flex-1 py-1 px-1.5 text-[9px] font-mono tracking-wider rounded border transition-all cursor-pointer select-none text-center ${
                      activeStep === step
                        ? "bg-bright text-void border-[#B8D44A] shadow-[0_0_8px_rgba(184,212,74,0.35)] font-black"
                        : "bg-void/60 text-mid border-dim/30 hover:border-mid hover:text-bright"
                    }`}
                  >
                    SLOT {step + 1} VIEW
                  </button>
                ))}
              </div>

              {/* Phase visual state helper */}
              <div className="text-center w-full">
                <span className="text-[10.5px] text-[#B8D44A] font-mono tracking-wide bg-bright/5 px-2.5 py-1.5 rounded border border-[#B8D44A]/15 block">
                  {activeStep === 0 && "👁️ SLOT 1 (3시 방향): 모니터의 우측을 바라보며 '3'을 가집니다."}
                  {activeStep === 1 && "👁️ SLOT 2 (7시 방향): 모니터의 아래 왼쪽을 비스듬히 노리며 '7'을 가집니다."}
                  {activeStep === 2 && "👁️ SLOT 3 (9시 방향): 모니터의 우측에서 반전되어 좌측을 쏘아보며 '9'를 가집니다."}
                  {activeStep === 3 && "👁️ SLOT 4 (12시 방향): 정수리 위 허공을 치켜뜨며 '0'시(12시)를 가집니다."}
                </span>
              </div>
            </div>

            <p className="text-xs text-mid uppercase leading-relaxed text-center">
              눈동자가 지시하는 각 슬롯별 시수를 찾아내 암호를 입력하시오.<br/>
              <span className="text-[9.5px] text-dim mt-1.5 block leading-normal">(조각을 탭하여 삽입하고 제어 보정하십시오. 수동으로 상단 SLOT VIEW 단계를 직접 변경해 시선을 재확인해도 됩니다.)</span>
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
            <div className="space-y-4 text-center w-full">
              <span className="text-[10px] text-dim font-bold tracking-wider block uppercase">[숫자 선택 패널 (0 ~ 10 선택 가능)]</span>
              <div className="flex flex-wrap gap-2 justify-center items-center max-w-sm mx-auto">
                {["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((f, i) => (
                  <button
                    key={i}
                    onClick={() => handleQ01Place(f)}
                    className={`w-10 h-10 border text-md font-bold rounded flex items-center justify-center transition-all cursor-pointer transform hover:-translate-y-0.5 ${
                      q01Slots[activeStep] === f
                        ? "bg-bright text-void border-[#B8D44A] shadow-[0_0_8px_rgba(184,212,74,0.35)] font-black text-xs"
                        : "border-dim/60 bg-card text-mid hover:text-bright hover:border-[var(--ph-bright)] hover:shadow-[0_0_10px_rgba(184,212,74,0.15)]"
                    }`}
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
                    <Key className="w-4 h-4 animate-bounce" /> [ 🔑 사물함 열쇠 및 연구 일지 획득하기 ]
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
                  <Check className="w-4 h-4" /> 복원 및 출력 완성! 대화록 복구 완료.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== Q02: 서재 책장 정렬 ==================== */}
        {puzzle.id === "Q02" && (
          <div className="space-y-5 flex flex-col items-center">
            <p className="text-xs text-mid uppercase leading-normal text-center max-w-md">
              서재 비밀 책장 선반의 책들을 백신 코드 알파벳 <strong className="text-bright font-black">&apos;V - I - R - U - S&apos;</strong> 순서대로 정렬하여 숨겨진 비밀 공간의 밀실 통로를 개방하십시오.
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

        {/* ==================== Q09: 클리오 제어 장치 (Clio Control Device - Sockets Insertion) ==================== */}
        {puzzle.id === "Q09" && (
          <div className="space-y-6 flex flex-col items-center w-full">
            <div className="text-center space-y-2">
              <h3 className="text-base font-extrabold text-[#00ffcc] tracking-widest uppercase">
                ⚡ [ CENTRAL CLIO TERMINAL: 클리오 제어 장치 ]
              </h3>
              <p className="text-xs text-mid leading-relaxed max-w-2xl px-4 text-center">
                CLIO 파일 전송을 관리하는 가상 디바이스가 차단되어 있습니다. 지금까지 교정 안에서 수집한 4가지의 단서를 이용해 최종 백신 패스코드를 찾아내 안전하게 금고를 열어보십시오.
              </p>
            </div>

            {/* Sockets grid (Large UI) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              {/* Left Column: Sockets and Insertion actions */}
              <div className="space-y-4 border border-dim/30 bg-void/50 p-4 rounded-lg flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-[#00ffcc] font-extrabold uppercase tracking-widest mb-2.5 block">
                    🛠️ FRAME SLOTS & SIGNATURE PORT (전자기 소켓 장착란)
                  </span>
                  
                  <div className="space-y-3">
                    {[
                      { id: "diary_37", name: "📔 전 교수의 연구 안전 일지", key: "diary_37", desc: "전 교수의 보안 예방 기록과 친필 일기장 파일" },
                      { id: "kakao_log", name: "💬 오실로스코프 카톡 기록 로그", key: "kakao_log", desc: "오실로스코프 복원기로 출력한 비공개 카카오톡 대화방 파일" },
                      { id: "kim_log", name: "💾 김정웅의 고립 교신 채팅 로그", key: "kim_log", desc: "지하 연구실 기기 장치에 남아 있던 교신 로그 파일" },
                      { id: "escape_kit", name: "📦 비상 대피용 탈출 키트", key: "escape_kit", desc: "비상 수납고 캐비닛에서 획득한 탈출용 생존 도구 세트" }
                    ].map(slot => {
                      const hasItem = inventory.includes(slot.key);
                      const isInserted = q09Slots[slot.key];

                      return (
                        <div 
                          key={slot.id} 
                          className={`p-3 border rounded transition-all flex flex-col gap-2 ${
                            isInserted 
                              ? "bg-emerald-950/20 border-emerald-500/65 shadow-[0_0_8px_rgba(16,185,129,0.15)] animate-pulse" 
                              : hasItem 
                                ? "bg-zinc-900/80 border-[#A6C43A] hover:bg-zinc-900" 
                                : "bg-void/40 border-dashed border-dim/20"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <span className={`text-xs font-black ${isInserted ? "text-emerald-400 font-sans" : hasItem ? "text-bright font-sans" : "text-mid/50 font-sans"}`}>
                                {slot.name}
                              </span>
                              <p className="text-[9.5px] text-zinc-500 leading-normal font-sans">
                                {slot.desc}
                              </p>
                            </div>
                            
                            {/* Slot Status Label */}
                            <div className="text-right">
                              {isInserted ? (
                                <span className="text-[9.5px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/25 animate-pulse">
                                  [ ACTIVE ]
                                </span>
                              ) : hasItem ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    audioSynth.playUnlock();
                                    setQ09Slots(prev => ({ ...prev, [slot.key]: true }));
                                  }}
                                  className="text-[9.5px] bg-[#B8D44A]/10 text-bright border border-[#B8D44A] px-2 py-0.5 rounded hover:bg-[#B8D44A] hover:text-void font-bold cursor-pointer transition-all active:scale-95 select-none"
                                >
                                  [ 삽입하기 ]
                                </button>
                              ) : (
                                <span className="text-[9.5px] bg-red-950/40 text-red-400 font-bold px-2 py-0.5 rounded border border-red-900/25 animate-pulse select-text">
                                  [ MISSING ]
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Console Matrix Monitor */}
              <div className="border border-[#00ffcc]/35 bg-[#020501]/95 p-4 rounded-lg flex flex-col items-center justify-between min-h-[300px]">
                <div className="text-center w-full space-y-1 select-none">
                  <span className="text-[9px] text-[#00ffcc]/80 font-mono tracking-[0.2em] uppercase block">
                    [ MONITORING CONSOLE: CLIO_FITTING_INTEGRITY ]
                  </span>
                  <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#00ffcc]/35 to-transparent my-1" />
                </div>

                {/* SVG Visualizing the 4 Sockets Interconnecting with the Terminal Reactor */}
                <div className="w-full h-44 relative flex items-center justify-center select-none">
                  <svg viewBox="0 0 200 160" className="w-full h-full text-mid font-mono">
                    {/* Circle Reactor */}
                    <circle 
                      cx="100" 
                      cy="80" 
                      r="24" 
                      fill="rgba(0, 255, 204, 0.05)" 
                      stroke={Object.values(q09Slots).every(Boolean) ? "#00ffcc" : "#00aa77"} 
                      strokeWidth="2" 
                      className={Object.values(q09Slots).every(Boolean) ? "animate-spin" : ""}
                      style={{ transformOrigin: "100px 80px", strokeDasharray: "6,4" }} 
                    />
                    <circle 
                      cx="100" 
                      cy="80" 
                      r="16" 
                      fill="rgba(0,0,0,0.85)" 
                      stroke={Object.values(q09Slots).every(Boolean) ? "#00ffcc" : "var(--ph-mid)"} 
                      strokeWidth="1.5" 
                    />
                    
                    {/* Center Lock Icon or Sparkle Text */}
                    <text x="100" y="84" fill={Object.values(q09Slots).every(Boolean) ? "#00ffcc" : "var(--ph-dim)"} fontSize="11" fontWeight="black" textAnchor="middle" className="pointer-events-none">
                      {Object.values(q09Slots).every(Boolean) ? "⚡" : "🔒"}
                    </text>

                    {/* Left Top Node: diary_37 */}
                    <line x1="40" y1="40" x2="80" y2="68" stroke={q09Slots.diary_37 ? "#00ffcc" : "var(--ph-dark)"} strokeWidth={q09Slots.diary_37 ? "2" : "1"} />
                    <circle cx="40" cy="40" r="10" fill={q09Slots.diary_37 ? "rgba(0, 255, 204, 0.2)" : "rgba(0,0,0,0.6)"} stroke={q09Slots.diary_37 ? "#00ffcc" : "var(--ph-dark)"} strokeWidth="1.5" />
                    <text x="40" y="43" fill={q09Slots.diary_37 ? "#00ffcc" : "var(--ph-dim)"} fontSize="7" fontWeight="bold" textAnchor="middle">JRN</text>

                    {/* Left Bottom Node: kakao_log */}
                    <line x1="40" y1="120" x2="80" y2="92" stroke={q09Slots.kakao_log ? "#00ffcc" : "var(--ph-dark)"} strokeWidth={q09Slots.kakao_log ? "2" : "1"} />
                    <circle cx="40" cy="120" r="10" fill={q09Slots.kakao_log ? "rgba(0, 255, 204, 0.2)" : "rgba(0,0,0,0.6)"} stroke={q09Slots.kakao_log ? "#00ffcc" : "var(--ph-dark)"} strokeWidth="1.5" />
                    <text x="40" y="123" fill={q09Slots.kakao_log ? "#00ffcc" : "var(--ph-dim)"} fontSize="7" fontWeight="bold" textAnchor="middle">CHAT</text>

                    {/* Right Top Node: kim_log */}
                    <line x1="160" y1="40" x2="120" y2="68" stroke={q09Slots.kim_log ? "#00ffcc" : "var(--ph-dark)"} strokeWidth={q09Slots.kim_log ? "2" : "1"} />
                    <circle cx="160" cy="40" r="10" fill={q09Slots.kim_log ? "rgba(0, 255, 204, 0.2)" : "rgba(0,0,0,0.6)"} stroke={q09Slots.kim_log ? "#00ffcc" : "var(--ph-dark)"} strokeWidth="1.5" />
                    <text x="160" y="43" fill={q09Slots.kim_log ? "#00ffcc" : "var(--ph-dim)"} fontSize="7" fontWeight="bold" textAnchor="middle">TERM</text>

                    {/* Right Bottom Node: escape_kit */}
                    <line x1="160" y1="120" x2="120" y2="92" stroke={q09Slots.escape_kit ? "#00ffcc" : "var(--ph-dark)"} strokeWidth={q09Slots.escape_kit ? "2" : "1"} />
                    <circle cx="160" cy="120" r="10" fill={q09Slots.escape_kit ? "rgba(0, 255, 204, 0.2)" : "rgba(0,0,0,0.6)"} stroke={q09Slots.escape_kit ? "#00ffcc" : "var(--ph-dark)"} strokeWidth="1.5" />
                    <text x="160" y="123" fill={q09Slots.escape_kit ? "#00ffcc" : "var(--ph-dim)"} fontSize="7" fontWeight="bold" textAnchor="middle">KIT</text>
                  </svg>
                </div>

                <div className="w-full space-y-2 mt-2">
                  {/* Progress Info bar */}
                  <div className="flex justify-between text-[10px] text-zinc-500 font-bold px-1 select-none">
                    <span>FITTING_STATUS:</span>
                    <span className={Object.values(q09Slots).filter(Boolean).length === 4 ? "text-[#00ffcc] animate-pulse font-sans" : "text-[#A6C43A] font-sans"}>
                      {Object.values(q09Slots).filter(Boolean).length} / 4 LOG_SLOTS MOUNTED
                    </span>
                  </div>
                  
                  {/* Gauge bar */}
                  <div className="h-2 w-full bg-void px-0.5 py-0.5 border border-dim/30 rounded flex">
                    <motion.div 
                      className="bg-[#00ffcc] h-full"
                      animate={{ width: `${Object.values(q09Slots).filter(Boolean).length * 25}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Confirm Button */}
                <div className="w-full pt-1.5 font-bold">
                  {Object.values(q09Slots).every(Boolean) ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSolved(true);
                        audioSynth.playUnlock();
                        setTimeout(() => {
                          onSolve("conference_pdf");
                        }, 1200);
                      }}
                      className="w-full py-2.5 bg-[#00ffcc] text-void text-xs font-black tracking-widest hover:bg-emerald-400 cursor-pointer rounded transition-all transform hover:scale-[1.02] active:scale-95 text-center flex items-center justify-center gap-2"
                    >
                      <Unlock className="w-4 h-4 animate-bounce text-void" /> [ ⚡ 클리오 핵심 복합 제어장치 비활성화 및 승인 ]
                    </button>
                  ) : (
                    <div className="w-full py-2.5 bg-void border border-dashed border-red-900/40 text-red-500 text-[10.5px] uppercase tracking-wider text-center font-black animate-pulse rounded select-none">
                      ⚠️ 모든 증거 데이터를 마우스 클릭 삽입하여 소켓을 활성화해야 합니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== Q21: 최종 해독 (Punch Card Overlapping) ==================== */}
        {puzzle.id === "Q21" && (
          <div className="space-y-4 flex flex-col items-center relative select-none">
            <p className="text-xs text-mid text-center leading-normal max-w-md">
              인벤토리의 반투명 천공 카드(Punch Card)를 학회 연구자료(PDF) 문서 위에 마우스로 정확히 끌어다 드롭 오버랩하십시오.<br/>
              구멍 뚫린 틈새 사이로 보이는 방화벽 무력화 백신 비밀 코드를 찾아내십시오.
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
                  {punchCardAligned ? "[ 🔒 최종 암호 발견! 1997 ]" : "◀ 마우스로 드래그하여 맞추세요 ▶"}
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
