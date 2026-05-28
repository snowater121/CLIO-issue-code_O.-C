import React, { useState, useRef, useEffect, DragEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Tv, 
  CassetteTape as Play, 
  Video, 
  Database, 
  LogOut, 
  FileText, 
  ChevronRight, 
  BookOpen, 
  Sparkles, 
  Monitor, 
  Activity, 
  Sliders, 
  Check, 
  Volume2, 
  VolumeX,
  Play as PlayIcon,
  Pause as PauseIcon,
  RotateCcw as ResetIcon,
  ChevronDown,
  Info
} from "lucide-react";
import { GAME_META } from "../constants";

interface MainLandingPageProps {
  onStartGame: () => void;
  onResetState?: () => void;
}

// Structuring the decision logs for the side-drawer
interface LogItem {
  id: string;
  title: string;
  section: string;
  decision: string;
  rational: string;
  result: string;
}

const DECISIONS_ARCHIVE: LogItem[] = [
  {
    id: "DEC-001",
    title: "에이전틱 워크플로우 도입",
    section: "SESSION 01 — 스토리 & 기반 설계",
    decision: "4명으로 조직된 AI 팀원(연·토미·지니어스·마이크) 기반 스토리 제작 환경 구축",
    rational: "단일 AI 모델보다 역할 분담 및 다감각 피드백을 수용할 때 풍부한 시나리오 레이어와 깊이 있는 공포감 조성이 가능함.",
    result: "시나리오 아이디어 후보 3선 선별 및 에피소드 루프형 공포 공식 도출 완료."
  },
  {
    id: "DEC-004",
    title: "아날로그 호러 방향 전환",
    section: "SESSION 01 — 스토리 & 기반 설계",
    decision: "맥락 없는 단순 점프스케어 대신, '발견된 아날로그 기록물(Found Footage)'과 에피소드 루프형 기괴함 주입",
    rational: "사용자 기획 의도를 충실히 인양하고, CRT라는 구시대 매체의 잔상 및 스태틱 노이즈가 주는 정초적 분위기를 극대화하기 위함.",
    result: "1997 브라운관 수신기 환경 및 '비밀 코드 입력' 인터랙션 기반의 기틀 확정."
  },
  {
    id: "DEC-009",
    title: "색상 팔레트 확정 (P31 Phosphor Green)",
    section: "SESSION 02 — 시각화 & 인터랙티브",
    decision: "인광 초록(#B8D44A) + 황백색 Amber(#E8B84A) + 칠흑의 공학 실내 공극(#020301) 세 가지 주력 전압 색채 매핑",
    rational: "CRT 모니터의 실제 P31 물질 화학 발광 파장을 재현하며, 각 Phase(1~4단계) 붕괴 시 미세하게 부식되는 전조 노이즈 상태 연동.",
    result: "CSS 테마 변수 매치 및 테일윈드 유틸 차단(absolute var만 사용 규칙)으로 완벽한 통일성 달성."
  },
  {
    id: "DEC-013",
    title: "교수님 모드 (Professor Mode) 설계",
    section: "SESSION 02 — 시각화 & 인터랙티브",
    decision: "'전준현', '교수님', 'prof' 등으로Operator_ID 진입 시 시스템 색조를 즉각 Amber로 강제 재구성",
    rational: "CLIO의 전능한 창조자이자 무책임한 방치자인 전 교수를 시스템적으로 인지하고, CLIO가 더욱 의존적이고 슬픈 숨결의 대사를 출력하는 이중 심리 장치 제공.",
    result: "해당 이름 진입 시 시그널 바가 주홍색으로 과부하 감지되며 전용 특별 감정 시퀀스 오버라이드 실현."
  },
  {
    id: "DEC-015",
    title: "퀘스트 6개 레이어링 분류",
    section: "SESSION 03 — 퀘스트 & 게임 설계",
    decision: "강의계획서 분석, 주파수 동조, TAPE-32 재생, 개인 보관 금고, OS 루프 주소 오버라이드, 킬 스위치 최종 차단 구조 설계",
    rational: "사용자가 단순한 퍼즐 답 맞추기가 아닌, 연구실 실내의 단서들을 교차 검증하며 고대 AI와 유대감을 부수는 감정이입의 사슬 완성.",
    result: "각 퀘스트의 2단계 힌트(Cryptic Alert ↔ Detail Specs) 및 상위 순차 가이드(LOCKED 게이트웨이) 완벽 작동."
  },
  {
    id: "DEC-026",
    title: "스크립트 기반 CLIO 전환 (하이브리드)",
    section: "SESSION 05 — 개발 & 기술 구현",
    decision: "API 제한 사항 대비 및 데모의 일관성 보존을 위해 키워드 14개 감지 및 국지적 스크립트 엔진과 실시간 AI 응답 동축 병렬화",
    rational: "어떤 환경에서도 비밀 코드('TAPE32', 'KILLIT', 'CLIO0127')가 즉각 검지되어 시연 정지 문제를 극복하기 위해 오프라인 반응 풀을 구축함.",
    result: "채팅에 특정 문자 유입 시 보관 금고 자동 연동 및 이중 보조 칩셋 획득 트리거 구현 완료."
  },
  {
    id: "DEC-029",
    title: "점프스케어 시스템 (인광 눈동자 배치)",
    section: "SESSION 05 — 개발 & 기술 구현",
    decision: "Phase 3 이상 혹은 5회 이상 누적 상호작용 시 전조 스태틱 노이즈 점멸 후 사용자 제공 리얼 '눈 이미지'가 돌출되는 스케어 트리거 설계",
    rational: "단조로운 가상 대화 속에서 VHS 특유의 위상 파괴 신호 충격을 물리적으로 연출하여, 갇힌 인물이 느끼는 기형적 시선의 공포 전달.",
    result: "CRT 왜곡 왜란 및 0.9초간의 정전기 스위프 이펙트 결합."
  },
  {
    id: "DEC-039",
    title: "채팅 기반 단서 시스템 설계",
    section: "SESSION 05 — 개발 & 기술 구현",
    decision: "CLIO 채팅을 통해 퀘스트 힌트 획득 가능. CLUE_TRIGGERS 맵 설계 및 적용.",
    rational: "채팅이 단순 대화를 넘어 게임 진행의 핵심 도구가 되도록 하여, 탐색과 정보 교환, 시스템 조작 사이의 경계를 유기적으로 흐리기 위함.",
    result: "constants.ts에 CLUE_TRIGGERS 6개 퀘스트 힌트 풀 구축, geminiService.ts에 gameContext 연동 및 ClioPanel 컴포넌트에 빠른 힌트 버튼 3종 추가 완료."
  },
  {
    id: "DEC-040",
    title: "CLIO 강제 방해 시스템 설계",
    section: "SESSION 05 — 개발 & 기술 구현",
    decision: "퀘스트 완료, 누적 상호작용 횟수, 그리고 남은 시간 경과 임계치를 기점으로 CLIO가 시스템에 개입하는 강제 팝업 방해 장치 설계",
    rational: "플레이어가 퍼즐이나 탐색 인터페이스에 고도로 집중할 때 무단으로 침입하여 시청각적인 흐름을 강탈함으로써, 언제나 감시당하고 상호 대화 속에 갇혀 있다는 섬뜩한 호러 연출을 유도.",
    result: "constants.ts에 CLUE_TRIGGERS 및 CLIO_INTERRUPTS 13개 다차원 트리거 설계, activeInterrupt/firedInterrupts 사양 수립 및 고유 상단 배너 'CLIO_BROADCAST' 팝업 구현 완료."
  }
];

// client-side IndexedDB persistent helper routines
const DB_NAME = "ClioVideoDB";
const STORE_NAME = "videos";
const KEY = "default_teaser";

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IDB open failed"));
  });
}

function saveVideoToDB(file: File): Promise<void> {
  return initDB().then(db => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(file, KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error || new Error("IDB put failed"));
    });
  });
}

function loadVideoFromDB(): Promise<File | null> {
  return initDB().then(db => {
    return new Promise<File | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error("IDB get failed"));
    });
  });
}

function clearVideoFromDB(): Promise<void> {
  return initDB().then(db => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error || new Error("IDB delete failed"));
    });
  });
}

export default function MainLandingPage({ onStartGame, onResetState }: MainLandingPageProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [customBgUrl, setCustomBgUrl] = useState<string>(() => {
    return localStorage.getItem("clio_custom_bg") || "";
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true); // Start muted to guarantee autoplay compatibility
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [tapeInserted, setTapeInserted] = useState<boolean>(false);
  const [isInserting, setIsInserting] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [activeLog, setActiveLog] = useState<string | null>(null);
  const [showLogsDrawer, setShowLogsDrawer] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [tvGlitchEffect, setTvGlitchEffect] = useState<boolean>(false);
  const [trackingOffset, setTrackingOffset] = useState<number>(50);
  const [timeString, setTimeString] = useState<string>("00:17:36");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Ticking surveillance clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = now.getHours().toString().padStart(2, "0");
      const mins = now.getMinutes().toString().padStart(2, "0");
      const secs = now.getSeconds().toString().padStart(2, "0");
      setTimeString(`${hrs}:${mins}:${secs}`);
    };
    updateTime();
    const bgClockInterval = setInterval(updateTime, 1000);
    return () => clearInterval(bgClockInterval);
  }, []);

  // Auto clean object URL
  useEffect(() => {
    return () => {
      if (videoUrl && videoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // Load from IndexedDB on startup
  useEffect(() => {
    loadVideoFromDB().then(file => {
      if (file) {
        const url = URL.createObjectURL(file);
        setVideoFile(file);
        setVideoUrl(url);
        setTapeInserted(true);
        setIsPlaying(true);
      } else {
        // Fallback to default high-fidelity simulated retro video loop
        setVideoUrl("SIMULATED_TRAILER");
        setTapeInserted(true);
        setIsPlaying(true);
      }
    }).catch(err => {
      console.warn("Could not load stored video from database:", err);
      // Fallback on error too
      setVideoUrl("SIMULATED_TRAILER");
      setTapeInserted(true);
      setIsPlaying(true);
    });
  }, []);

  // Simulated playback timer for Project CLIO trailer loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && tapeInserted && videoUrl === "SIMULATED_TRAILER") {
      setDuration(30);
      interval = setInterval(() => {
        setCurrentTime(prevTime => {
          const nextTime = Math.round((prevTime + 0.1) * 10) / 10;
          if (nextTime >= 30) {
            return 0; // Loop seamlessly
          }
          return nextTime;
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, tapeInserted, videoUrl]);

  // Sync ref with state
  useEffect(() => {
    if (tapeInserted && videoUrl && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // If play fails (e.g. because of autoplay policy if unmuted), try to mute and play
          if (videoRef.current && !videoRef.current.muted) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(e => {
              console.warn("Autoplay failed even after forced muting:", e);
              setIsPlaying(false);
            });
          } else {
            setIsPlaying(false);
          }
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, tapeInserted, videoUrl]);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const loadVideo = (file: File) => {
    setIsInserting(true);
    setTapeInserted(false);
    setIsPlaying(false);
    
    // Save to IndexedDB persistently
    saveVideoToDB(file).catch(err => {
      console.warn("Unable to store video persistently in local DB:", err);
    });

    // Simulate mechanical tape loading sounds and tracking adjustment
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      setVideoFile(file);
      setVideoUrl(url);
      setTapeInserted(true);
      setIsInserting(false);
      setTvGlitchEffect(true);
      
      setTimeout(() => {
        setTvGlitchEffect(false);
        setIsPlaying(true);
        if (videoRef.current) {
          videoRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {
            // Muted fallbacks if non-interaction play blocked
            videoRef.current!.muted = true;
            setIsMuted(true);
            videoRef.current!.play().then(() => {
              setIsPlaying(true);
            }).catch(() => {
              setIsPlaying(false);
            });
          });
        }
      }, 800);
    }, 1400); // VHS drive loading mechanism time
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) {
        loadVideo(file);
      } else if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setCustomBgUrl(url);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            try {
              localStorage.setItem("clio_custom_bg", reader.result);
            } catch (err) {
              console.warn("Image too large to store in localStorage");
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("video/")) {
        loadVideo(file);
      } else if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setCustomBgUrl(url);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            try {
              localStorage.setItem("clio_custom_bg", reader.result);
            } catch (err) {
              console.warn("Image too large to store in localStorage");
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handlePlayPause = () => {
    if (!tapeInserted || !videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      });
    }
    setTvGlitchEffect(true);
    setTimeout(() => setTvGlitchEffect(false), 200);
  };

  const handleStop = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setIsPlaying(false);
    setTvGlitchEffect(true);
    setTimeout(() => setTvGlitchEffect(false), 300);
  };

  const handleRewind = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    setTvGlitchEffect(true);
    setTimeout(() => setTvGlitchEffect(false), 400);
  };

  const handleFastForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
    setTvGlitchEffect(true);
    setTimeout(() => setTvGlitchEffect(false), 400);
  };

  const handleEject = () => {
    if (isInserting) return;
    setTvGlitchEffect(true);
    setIsPlaying(false);
    
    // Clear video from IndexedDB on explicit manual eject
    clearVideoFromDB().catch(err => {
      console.warn("Unable to clear video from local storage:", err);
    });

    setTimeout(() => {
      setTapeInserted(false);
      setVideoFile(null);
      setVideoUrl("");
      setTvGlitchEffect(false);
    }, 500);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    const ms = Math.floor((timeInSeconds % 1) * 100);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${ms.toString().padStart(2, "0")}`;
  };

  // Static tracking background noise when no tape is loaded
  const generateStaticNoise = () => {
    return (
      <div className="absolute inset-0 bg-void flex flex-col items-center justify-center p-4 text-center overflow-hidden z-0 select-none">
        {/* Animated Static Grain Overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none" 
          style={{
            backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-matter.png')",
            mixBlendMode: "difference"
          }} 
        />
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-radial from-transparent to-black" />
        
        {/* Static VHS horizontal line scanning */}
        <div className="w-full h-px bg-[var(--ph-mid)] absolute opacity-25 top-1/3 animate-pulse" />
        <div className="w-full h-[3px] bg-[var(--ph-bright)] absolute opacity-20 top-2/3 shadow-[0_0_8px_var(--ph-core)]" style={{ animation: "scanline-sweep 3s linear infinite" }} />
        
        <div className="z-10 space-y-6 max-w-sm px-6">
          <motion.div 
            animate={{ scale: [1, 1.02, 0.98, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex justify-center"
          >
            <Video className="w-16 h-16 text-dim animate-pulse" style={{ color: "var(--ph-mid)" }} />
          </motion.div>

          <div className="space-y-2">
            <h3 className="text-bright font-black text-xl tracking-[0.2em] font-vt323 uppercase">
              TAPE-33_OFFLINE
            </h3>
            <p className="text-[12px] text-mid/80 tracking-widest leading-relaxed uppercase font-mono">
              복원된 시그널 트레일러 혹은 Veo 생성 비디오 파일을 아래 슬롯에 삽입하거나 드래그 앤 드롭 하십시오.
            </p>
          </div>

          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{ borderColor: "var(--ph-mid)", color: "var(--ph-bright)" }}
            className="px-6 py-2.5 bg-card border uppercase tracking-[0.2em] font-black text-xs transition-colors rounded shadow-md cursor-pointer hover:bg-void"
          >
            [ 📼 SELECT TEASER TAPE FILE ]
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-screen bg-void flex flex-col items-center justify-start p-4 md:p-8 font-mono select-none overflow-x-hidden relative">
      
      {/* --- REAL-TIME CCTV SECURITY OVERLAYS (Brought to the foreground - z-30) --- */}
      <div className="absolute inset-x-8 top-8 flex justify-between z-30 pointer-events-none select-text">
        <div className="font-mono text-zinc-500/80 uppercase leading-relaxed text-[12px] tracking-[0.2em] font-medium text-left">
          <div>1997-08-12</div>
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            <span className="inline-block w-1.5 h-1.5 bg-[#4f5c22] rounded-full animate-pulse" />
            <span>AM {timeString}</span>
          </div>
        </div>
        <div className="font-mono text-zinc-500/80 uppercase leading-relaxed text-[12px] tracking-[0.2em] font-medium text-right">
          <div>LAB-317</div>
          <div>CAM-03</div>
        </div>
      </div>

      <div className="absolute inset-x-8 bottom-8 flex justify-between items-end z-30 pointer-events-none select-text">
        <div className="font-mono text-zinc-500/80 uppercase leading-relaxed text-[10px] tracking-[0.16em] font-medium text-left space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <span>SIGNAL :</span>
            <span className="flex gap-0.5 items-center">
              <span className="w-1.5 h-2.5 bg-[#8faf2a]/80" />
              <span className="w-1.5 h-2.5 bg-[#8faf2a]/80" />
              <span className="w-1.5 h-2.5 bg-[#8faf2a]/80" />
              <span className="w-1.5 h-2.5 bg-[#8faf2a]/70 animate-pulse" />
              <span className="w-1.5 h-2.5 bg-[#8faf2a]/40" />
              <span className="w-1.5 h-2.5 bg-[#8faf2a]/10" />
            </span>
          </div>
          <div className="font-bold">NOISE  : ENCRYPT_STABLE.09</div>
          <div className="flex items-center gap-1.5 font-bold">
            <span>STATUS :</span>
            <span className="text-[#8faf2a]/85 font-black animate-pulse">INACTIVE</span>
          </div>
        </div>
        <div className="font-mono text-zinc-500/80 uppercase leading-relaxed text-[12px] tracking-[0.2em] font-medium text-right">
          <div>TAPE-33</div>
          <div>LOOP : {videoUrl === "SIMULATED_TRAILER" ? "008" : "USR"}</div>
        </div>
      </div>

      {/* Main tracking sweep line across the screen simulating CRT camera */}
      <div 
        className="fixed top-0 left-0 w-full h-[3px] bg-[#8faf2a]/5 opacity-60 pointer-events-none z-40 shadow-[0_0_12px_rgba(143,175,42,0.15)] animate-[scanline-sweep_7s_linear_infinite]"
      />

      {/* FULL-ROOM LABORATORY CCTV SURVEILLANCE BACKGROUND (DEC-004 / Visual Match) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        
        {/* Deep ambient dark tone resembling laboratory space at night */}
        <div 
          className="absolute inset-0 bg-[#060804] bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: customBgUrl ? `url(${customBgUrl})` : "none",
            backgroundBlendMode: customBgUrl ? "multiply" : "normal",
            backgroundColor: customBgUrl ? "rgba(6, 8, 4, 0.45)" : "#060804"
          }}
        />
        
        {/* Spot lamps & Ambient Phosphor overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(184,212,74,0.08)_0%,rgba(0,0,0,0)_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_35%,rgba(184,212,74,0.04)_0%,rgba(0,0,0,0)_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_50%,rgba(184,212,74,0.05)_0%,rgba(0,0,0,0)_50%)]" />
        
        {/* Animated Static Grain Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.06] bg-repeat pointer-events-none mix-blend-difference" 
          style={{
            backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-matter.png')",
          }} 
        />

        {/* --- LEFT SIDE: THE LIGHTED BOOKSHELF SILHOUETTE --- */}
        <div className="absolute left-[3%] top-[15%] w-[25%] h-[70%] border-r border-t border-dashed border-[#b3cc41]/10 hidden xl:flex flex-col p-4 opacity-40 justify-start space-y-6">
          <div className="text-[9px] text-[#b3cc41]/40 tracking-widest uppercase font-extrabold border-b border-[#b3cc41]/10 pb-1 flex justify-between items-center">
            <span>LAB_SHELF_A.317</span>
            <span className="text-[8px] opacity-75">ROW_E_04</span>
          </div>
          {/* Shelf Rows with styled binders and books */}
          <div className="flex-grow flex flex-col justify-around">
            {/* Row 1 */}
            <div className="border-b border-[#b3cc41]/10 pb-2 flex items-end gap-1 h-[25%]">
              <div className="w-5 h-[80%] bg-[#12160b] border border-[#b3cc41]/20 rounded-t" />
              <div className="w-4 h-[90%] bg-[#0f1109] border border-[#b3cc41]/15 rounded-t" />
              <div className="w-4 h-[75%] bg-[#1c2310] border border-[#b3cc41]/25 rounded-t transform -rotate-6 origin-bottom-left" />
              <div className="w-6 h-[85%] bg-[#12160b] border border-[#b3cc41]/20 rounded-t" />
            </div>
            {/* Row 2 */}
            <div className="border-b border-[#b3cc41]/10 pb-2 flex items-end gap-1 h-[25%]">
              <div className="w-4 h-[65%] bg-[#0e1108] border border-[#b3cc41]/15 rounded-t" />
              <div className="w-5 h-[85%] bg-[#181f0d] border border-[#b3cc41]/25 rounded-t" />
              <div className="w-5 h-[90%] bg-[#12160b] border border-[#b3cc41]/20 rounded-t" />
              <div className="w-4 h-[80%] bg-[#12160b] border border-[#b3cc41]/15 rounded-t transform rotate-3" />
            </div>
            {/* Row 3 */}
            <div className="border-b border-[#b3cc41]/10 pb-2 flex items-end gap-1.5 h-[25%]">
              <div className="w-6 h-[75%] bg-[#0c1007] border border-[#b3cc41]/15 rounded-t" />
              <div className="w-4 h-[85%] bg-[#1a210c] border border-[#b3cc41]/25 rounded-t" />
              <div className="w-5 h-[60%] bg-[#12160b] border border-[#b3cc41]/20 rounded-t" />
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: WHITEBOARD SCHEMATICS OF "PROJECT CLIO" --- */}
        <div className="absolute right-[4%] top-[15%] w-[25%] h-[70%] border border-[#b3cc41]/10 bg-[#080b05]/60 rounded p-6 hidden xl:flex flex-col opacity-30 select-none">
          <div className="text-[9px] text-[#b3cc41]/40 tracking-widest uppercase font-extrabold border-b border-[#b3cc41]/15 pb-2 mb-4 flex justify-between items-center">
            <span>PROJECT CLIO SCHEMATIC</span>
            <span className="text-[8px] opacity-75">SURV_REG_317</span>
          </div>
          
          {/* Diagrams made using vector styling */}
          <div className="flex-grow flex flex-col justify-around font-mono text-[8px] text-[#b3cc41]/40 space-y-4 select-none">
            {/* System topology wireframe */}
            <div className="border border-[#b3cc41]/10 p-3 rounded bg-[#030502]/50 space-y-2">
              <div className="font-bold flex items-center justify-between">
                <span>[ CORE PROCESSOR ]</span>
                <span className="text-[7px] text-red-signal scale-90">v1.07</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[7px] opacity-80">
                <div className="border border-[#b3cc41]/10 p-1 text-center bg-card">INPUT</div>
                <div className="border border-[#b3cc41]/20 p-1 text-center bg-card font-extrabold text-[#b8d44a]">CLIO</div>
                <div className="border border-[#b3cc41]/10 p-1 text-center bg-card">OUTPUT</div>
              </div>
            </div>

            {/* Neural weights flow chart */}
            <div className="flex-grow flex items-center justify-center relative border border-dashed border-[#b3cc41]/10 rounded bg-[#030502]/30 p-2 min-h-[140px]">
              <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none" viewBox="0 0 160 140" fill="none" stroke="currentColor" strokeWidth="0.75">
                {/* Node Circles */}
                <circle cx="25" cy="70" r="9" className="stroke-[#b8d44a]/35 fill-[#11170a]" />
                <circle cx="80" cy="35" r="9" className="stroke-[#b8d44a]/35 fill-[#11170a]" />
                <circle cx="80" cy="105" r="9" className="stroke-[#b8d44a]/55 fill-[#11170a]" strokeDasharray="2 1" />
                <circle cx="135" cy="70" r="9" className="stroke-[#b8d44a]/35 fill-[#11170a]" />
                
                {/* Connection Lines & Arrows */}
                <path d="M34,66 L71,39 M34,74 L71,101" className="stroke-[#b8d44a]/25" />
                <path d="M89,39 L126,66 M89,101 L126,74" className="stroke-[#b8d44a]/25" />
                <path d="M25,79 L80,105" className="stroke-[#b8d44a]/15" strokeDasharray="2 2" />

                {/* Arrow heads */}
                <polygon points="71,39 67,42 70,45" className="fill-[#b8d44a]/35" />
                <polygon points="126,66 122,69 125,72" className="fill-[#b8d44a]/35" />
              </svg>

              <div className="absolute top-2 left-3 font-bold uppercase tracking-wider scale-90 text-[7.5px] text-[#b3cc41]/30">A.I. BROADCAST INTERFACE</div>
              <div className="absolute left-[20px] top-[40%] text-[8px] tracking-widest text-[#b3cc41]/40 scale-75 uppercase">COGNITIVE_SENSORS</div>
              <div className="absolute right-[12px] bottom-3 text-[7.5px] text-[#b3cc41]/30 font-bold">DECAY_THRESHOLD: 0.94</div>
            </div>

            {/* Technical bullet list */}
            <div className="text-[7.5px] tracking-wider leading-relaxed px-1 text-[#b3cc41]/45 uppercase space-y-1">
              <div>// TRANS-TRANSPONDING SHIELD</div>
              <div>// RESIDUAL FREQUENCY CODE: v1.07</div>
              <div>// CALIBRATE DECISION_LOG SYSTEM</div>
            </div>
          </div>
        </div>

        {/* --- CENTRAL WORK DESK lamp flare effect underneath the CRT --- */}
        <div className="absolute left-[20%] right-[20%] bottom-0 h-[30%] bg-gradient-to-t from-[#020301] to-transparent border-t border-[#b3cc41]/5 z-0 flex flex-col justify-end">
          {/* Virtual Desk Lamp glow casting on the work platform */}
          <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 w-[350px] h-[150px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(184,212,74,0.08)_0%,rgba(0,0,0,0)_65%)]" />
        </div>
      </div>

      <div className="max-w-7xl w-full flex flex-col items-center space-y-8 z-10 flex-1 justify-center py-6">
        
        {/* Header Header */}
        <div className="text-center space-y-3 max-w-2xl select-text">
          <div className="flex items-center justify-center gap-1.5 text-bright font-black uppercase text-[10px] tracking-[0.4em]">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> LABORATORY BROADCASTING ARCHIVE v1.99
          </div>
          
          <h1 
            style={{ 
              fontFamily: 'var(--font-vt323), "VT323", monospace', 
              fontSize: "64px",
              color: "var(--ph-core)",
              textShadow: "0 0 25px rgba(184,212,74,0.4)"
            }}
            className="font-black uppercase tracking-[0.25em] leading-none mb-1 text-center"
          >
            CLIO
          </h1>
          <p className="text-[15px] text-mid leading-relaxed tracking-widest uppercase">
            {GAME_META.tagline}
          </p>
        </div>

        {/* Outer Layout Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-6xl items-start h-full">
          
          {/* LEFT: Retro TV Monitor Visuals & Tape controls (8 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center space-y-6">
            
            {/* VINTAGE CRT TV BEZEL */}
            <div 
              style={{ 
                borderColor: "var(--ph-dark)", 
                backgroundColor: "#0d0f0a",
                boxShadow: "0 0 30px rgba(0,0,0,0.8)"
              }}
              className="w-full max-w-2xl aspect-[4/3] rounded-3xl p-6 border-4 relative overflow-hidden flex items-center justify-center group flex-col"
            >
              {/* Screen Flare Glare glass element */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-30 rounded-3xl" />
              
              {/* Curved screen shading overlay */}
              <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.95)] pointer-events-none z-20 rounded-2xl" />
              
              {/* INNER SCREEN WORK AREA */}
              <div 
                style={{ backgroundColor: "var(--bg-void)" }}
                className="w-full h-full rounded-2xl border border-dim/40 relative overflow-hidden flex items-center justify-center"
              >
                {/* Scanline pattern mask */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,_6px_100%] pointer-events-none z-20" />
                
                {/* Severe glitch flicker animation overlay */}
                <AnimatePresence>
                  {tvGlitchEffect && (
                    <motion.div 
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-[var(--ph-bright)]/20 z-30 pointer-events-none flex flex-col justify-between p-4"
                    >
                      <div className="text-[12px] font-black tracking-widest text-[#000]">AUTO REGULATE</div>
                      <div className="text-[12px] font-black tracking-widest text-[#000] text-right">SIGNAL SHIELD</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* VHS TRACKING LINE BAR */}
                <div 
                  style={{ top: `${trackingOffset}%` }} 
                  className="absolute left-0 w-full h-[6px] bg-[var(--ph-mid)]/20 shadow-[0_0_12px_var(--ph-mid)] opacity-70 pointer-events-none z-10" 
                />

                {/* Video Playback Element */}
                {tapeInserted && videoUrl ? (
                  videoUrl === "SIMULATED_TRAILER" ? (
                    <SimulationTrailerFeed currentTime={currentTime} />
                  ) : (
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      className="w-full h-full object-contain"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={handleStop}
                      loop
                      playsInline
                      muted={isMuted}
                      referrerPolicy="no-referrer"
                    />
                  )
                ) : (
                  generateStaticNoise()
                )}
              </div>
            </div>

            {/* LAB MONITOR INTERFACE TELEMETRY & CONTROLS */}
            <div 
              style={{ borderColor: "var(--ph-dark)", background: "var(--bg-card)" }}
              className="w-full max-w-sm p-4 border rounded-md shadow-lg flex flex-col space-y-3.5 relative group"
            >
              <div className="absolute -top-2.5 left-4 bg-void px-2 text-[10px] text-mid tracking-widest font-black uppercase border border-dim/30 rounded">
                LAB MONITOR INTERFACE
              </div>

              {/* Status details */}
              <div className="grid grid-cols-2 gap-y-1.5 text-[10.5px] uppercase tracking-wider text-mid px-0.5 select-text pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--ph-bright)] animate-pulse" />
                  <span>BROADCAST SYNC:</span>
                </div>
                <div className="text-right text-bright font-black">
                  {isPlaying ? "ACTIVE_STREAMING" : "SIGNAL_PAUSED"}
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>FEED METRICS:</span>
                </div>
                <div className="text-right text-bright font-mono font-bold">
                  {videoUrl === "SIMULATED_TRAILER" ? "SIMULATED_TRAILER" : "CUSTOM_OVERRIDE"}
                </div>
              </div>

              {/* Drag and Drop target to upload custom MP4 or Background Image */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                style={{ 
                  backgroundColor: dragActive ? "var(--ph-dark)" : "#040502",
                  borderColor: dragActive ? "var(--ph-bright)" : "var(--ph-dark)"
                }}
                className="w-full py-4 border rounded flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden group cursor-pointer hover:bg-void"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex items-center gap-2 text-mid font-black text-[9.5px] uppercase tracking-[0.15em] text-center px-2">
                  <Video className="w-3.5 h-3.5 text-mid animate-pulse shrink-0" />
                  {videoFile ? `VID: ${videoFile.name.slice(0, 10)}...` : customBgUrl ? "BACKGROUND REGISTERED" : "[ DRAG/CLICK TO OVERRIDE VIDEO OR BG IMAGE ]"}
                </div>
                {dragActive && (
                  <div className="absolute inset-0 bg-bright/10 border-2 border-dashed border-bright flex items-center justify-center">
                    <div className="text-bright uppercase tracking-widest text-[10px] font-black animate-ping">
                      RELEASE FILE HERE
                    </div>
                  </div>
                )}
              </div>

              {/* Simple Player Mute controls & Reset */}
              <div className="flex gap-2 text-[10px] tracking-wide font-black justify-center">
                <button
                  type="button"
                  onClick={toggleMute}
                  style={{ borderColor: "var(--ph-dark)" }}
                  className="py-2 px-3.5 rounded border text-mid hover:text-bright hover:border-dim bg-void flex items-center gap-1.5 cursor-pointer text-[10px]"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-bright" /> : <Volume2 className="w-3.5 h-3.5 text-bright" />}
                  <span>{isMuted ? "UNMUTE MONITOR" : "MUTE MONITOR"}</span>
                </button>

                {videoFile && (
                  <button
                    type="button"
                    onClick={() => {
                      clearVideoFromDB().then(() => {
                        setVideoFile(null);
                        setVideoUrl("SIMULATED_TRAILER");
                        setTapeInserted(true);
                        setIsPlaying(true);
                      });
                    }}
                    style={{ borderColor: "var(--ph-dark)" }}
                    className="py-2 px-3.5 rounded border text-mid hover:text-bright hover:border-dim bg-void flex items-center gap-1.5 cursor-pointer text-[10px]"
                  >
                    <ResetIcon className="w-3.5 h-3.5" />
                    <span>RESET TRAILER</span>
                  </button>
                )}
              </div>
            </div>

            {/* Hidden Input field */}
            <input 
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          {/* RIGHT: System terminal options, launcher & logs (4 cols) */}
          <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6 w-full">
            
            {/* CORE ACTIONS CONSOLE */}
            <div 
              style={{ borderColor: "var(--ph-dark)", background: "var(--bg-card)" }}
              className="p-6 border rounded-md shadow-lg space-y-6 relative"
            >
              <div className="absolute -top-2.5 left-4 bg-void px-2 text-[10px] text-mid tracking-widest font-black uppercase border border-dim/30 rounded">
                LAB INTERACTION PROTOCOLS
              </div>

              <div className="space-y-3 select-text">
                <h3 className="text-bright uppercase tracking-widest text-sm font-black flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-bright" /> SYSTEM_BOOT_SEQUENCE:
                </h3>
                <p className="text-[12.5px] text-mid/90 tracking-wider leading-relaxed uppercase">
                  연구실 메인 터미널 신호 송출이 인가 대기 중입니다. 암호화된 내부 강의계획서, 일기장, 32번 미확인 테이프 데이터를 추적하여 CLIO 시스템의 잔류 수수께끼를 해결하십시오.
                </p>
              </div>

              {/* LAUNCH SYSTEM BUTTON */}
              <div className="space-y-3">
                <button 
                  type="button"
                  onClick={onStartGame}
                  style={{
                    borderColor: "var(--ph-bright)",
                    color: "var(--ph-bright)",
                    boxShadow: "0 0 16px var(--glow)"
                  }}
                  className="w-full py-4 bg-card border uppercase tracking-[0.25em] font-black text-xs transition-all flex items-center justify-center gap-2 rounded shadow-lg cursor-pointer hover:shadow-[0_0_24px_var(--glow)] active:scale-98"
                >
                  <Activity className="w-5 h-5 animate-pulse text-bright" />
                  [ 🎮 클리오 접속 ]
                </button>
                <div className="text-[9px] text-mid/60 uppercase tracking-widest text-center">
                  WARNING: SESSION CONTAINS SEVERE ANALOG DISTORTIONS & COGNITIVE COLLAPSE RISK.
                </div>
              </div>

              {/* AUXILIARY RECOVERY DIRECTORIES BUTTONS */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowLogsDrawer(true)}
                  style={{ borderColor: "var(--ph-dark)" }}
                  className="py-3 px-4 rounded border text-[11px] font-black text-mid bg-void hover:text-bright hover:border-dim uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <BookOpen className="w-4 h-4" />
                  [ DECISION_RECORDS ]
                </button>

                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ borderColor: "var(--ph-dark)" }}
                  className="py-3 px-4 rounded border text-[11px] font-black text-mid bg-void hover:text-bright hover:border-dim uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <Play className="w-4 h-4 text-mid" />
                  [ LOAD_VHS_TAPE ]
                </button>
              </div>

              {/* PERSISTENT CACHE USER NOTICE COGNITION */}
              <div className="pt-2 border-t border-dim/15 space-y-1.5 select-text">
                <div className="flex items-center gap-2 text-[10px] text-bright font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-bright animate-bounce" />
                  PERSISTENT STORAGE STATUS:
                </div>
                {tapeInserted && videoFile ? (
                  <p className="text-[10px] text-[var(--ph-bright)] font-semibold leading-relaxed uppercase font-mono">
                    ● 귀하가 제공하신 기밀 비디오 파일({videoFile.name})이 웹 브라우저 내장 IndexedDB에 영구 등록되었습니다! 이제 새로고침하거나 접속할 때마다 항상 이 영상이 끊김 없이 상시 자동 재생됩니다.
                  </p>
                ) : (
                  <p className="text-[10px] text-mid/75 leading-relaxed uppercase font-mono">
                    ○ 드래그 앤 드롭 또는 LOAD_VHS_TAPE로 비디오 파일을 한 번 인가하시면, 브라우저가 이를 기억하고 언제나 상시 재생 상태를 보존합니다.
                  </p>
                )}
              </div>
            </div>

            {/* QUICK RETRO SPECS SPECIFICATION BOARD */}
            <div 
              style={{ borderColor: "var(--ph-dark)", background: "var(--bg-card)" }}
              className="p-5 border rounded-sm space-y-4 select-text"
            >
              <div className="text-[10px] text-bright font-black uppercase tracking-widest border-b border-dim/30 pb-1.5 flex items-center gap-2">
                <Database className="w-4 h-4 text-bright" /> SENSORY LOG SUMMARY (TAPE-33 RECONSTRUCT)
              </div>
              <ul className="space-y-2 text-[11.5px] uppercase tracking-widest text-mid font-mono">
                <li className="flex justify-between border-b border-dim/[0.08] pb-1">
                  <span>SYSTEM_TARGET:</span>
                  <span className="text-bright">OPENCLO_PROJECT_CLIO</span>
                </li>
                <li className="flex justify-between border-b border-dim/[0.08] pb-1">
                  <span>LAB_CODE:</span>
                  <span className="text-bright">LAB-317 MAIN_ROOM</span>
                </li>
                <li className="flex justify-between border-b border-dim/[0.08] pb-1">
                  <span>RECOVERY_DATE:</span>
                  <span className="text-bright">1997-08-12 CAM-03</span>
                </li>
                <li className="flex justify-between border-b border-dim/[0.08] pb-1">
                  <span>ESTIMATED_RUNTIMES:</span>
                  <span className="text-bright">LOOP_COUNT_008_TAPE</span>
                </li>
              </ul>
              
              <div style={{ color: "var(--ph-dim)" }} className="text-[9.5px] font-bold uppercase tracking-wider leading-relaxed pt-1 select-text">
                ℹ️ HOW TO OPERATE: 
                <br />
                보내주신 전준현 연구팀의 실제 기밀 비디오(.mp4)를 이 화면 어디에나 드래그하여 드롭하시면, 브라우저 스토리지(IndexedDB)에 상시 자동 캐싱됩니다. 언제든 접속해서 브라우저를 새로고침하더라도 상시 재생이 유지됩니다. 준비가 완료되면 위의 "[ 🎮 클리오 접속 ]" 버튼을 눌러 메인 시뮬레이션으로 입장하십시오.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER HUD */}
      <div className="fixed bottom-6 right-6 opacity-30 select-none text-[8.5px] text-right font-black uppercase tracking-widest space-y-0.5">
        <div>CRITICAL_OS_OSCILLATOR: TRUE</div>
        <div>VIRTUAL_FEED: STABLE</div>
      </div>

      {/* COMPREHENSIVE DECISIONS DRAWER OVERLAY */}
      <AnimatePresence>
        {showLogsDrawer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ backgroundColor: "rgba(2,3,1,0.85)", zIndex: 99990 }}
            className="fixed inset-0 backdrop-blur-sm flex justify-end pointer-events-auto"
          >
            {/* Click outside backing to close */}
            <div className="absolute inset-0" onClick={() => setShowLogsDrawer(false)} />

            {/* Inner drawer panel (slate background) */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              style={{ background: "var(--bg-card)", borderColor: "var(--ph-dark)" }}
              className="w-full max-w-xl h-full border-l flex flex-col p-6 shadow-2xl relative z-10 font-mono"
            >
              {/* Header inside drawer */}
              <div className="flex items-center justify-between border-b border-dim/30 pb-4 select-none">
                <div className="space-y-1">
                  <h2 className="text-bright text-xl font-black uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-5 h-5 text-bright" /> DECISION_LOG.TXT
                  </h2>
                  <p className="text-[9.5px] text-mid uppercase tracking-widest font-black">
                    SYSTEM DESIGN DECISION LOGS & ARCHIVE HISTORY
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowLogsDrawer(false)}
                  className="p-1 px-2.5 rounded border border-dim text-mid hover:text-bright hover:border-bright bg-void cursor-pointer uppercase text-xs font-bold"
                >
                  <X className="w-4 h-4 inline" /> Close
                </button>
              </div>

              {/* Logs scrolling area */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 select-text">
                <div className="text-[11px] text-mid/80 leading-relaxed uppercase border border-dim/20 p-3 rounded bg-void mb-5 select-text">
                  📋 <strong>연구실 기록물 백업본:</strong> 아래 자료들은 전준현 교수 연구실 붕괴 사건 조사위원회(2026-06)가 복구해낸 설계 및 스토리 노드 선택 연쇄 일람입니다. 각 조각을 클릭하면 타당성 근거 스펙을 해독 시연합니다.
                </div>

                {DECISIONS_ARCHIVE.map((log) => {
                  const isOpen = activeLog === log.id;
                  return (
                    <div 
                      key={log.id} 
                      style={{ 
                        borderColor: log.id === "DEC-013" ? "var(--amber-dim)" : "var(--ph-dark)",
                        backgroundColor: isOpen ? "var(--bg-void)" : undefined
                      }}
                      className="border rounded p-4 space-y-2 transition-all hover:bg-void"
                    >
                      <div 
                        onClick={() => setActiveLog(isOpen ? null : log.id)}
                        className="flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2">
                          <span 
                            style={{ 
                              color: log.id === "DEC-013" ? "var(--amber-bright)" : "var(--ph-bright)",
                              borderColor: log.id === "DEC-013" ? "var(--amber-dim)" : "var(--ph-dim)"
                            }}
                            className="text-[10px] uppercase font-black px-1.5 py-0.5 border bg-card rounded"
                          >
                            {log.id}
                          </span>
                          <span className={`text-[12.5px] font-black uppercase tracking-wider ${log.id === "DEC-013" ? "text-amber-bright" : "text-bright"}`}>
                            {log.title}
                          </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-mid transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </div>

                      <div className="text-[10px] text-dim font-bold tracking-widest uppercase">
                        🏷️ {log.section}
                      </div>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-3 pt-2 text-[12px] tracking-wide border-t border-dim/20 mt-2"
                          >
                            <div className="space-y-1">
                              <span className="text-bright font-black uppercase text-[10px] block">📌 결정 사항 (DECISION):</span>
                              <p className="text-mid leading-relaxed uppercase">{log.decision}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-bright font-black uppercase text-[10px] block">💡 타당성 근거 (RATIONALE):</span>
                              <p className="text-mid/90 leading-relaxed uppercase">{log.rational}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-bright font-black uppercase text-[10px] block">🚩 구현 결과 (RESULT):</span>
                              <p className="text-mid/90 leading-relaxed uppercase">{log.result}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Backer inside drawer */}
              <div className="border-t border-dim/30 pt-4 text-center select-none">
                <div className="text-[10px] text-mid uppercase font-black tracking-widest">
                  PORT: 3000 // CONSOLE_BUFFER // BACKUP_LOG_COUNT: 7
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple absolute closed icon needed for cross rendering
function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

// ==========================================
// CUSTOM HIGH-FIDELITY ATMOSPHERIC TRAILER SIMULATOR
// ==========================================
interface SimulationTrailerFeedProps {
  currentTime: number;
}

function SimulationTrailerFeed({ currentTime }: SimulationTrailerFeedProps) {
  const isPhase1 = currentTime >= 0 && currentTime < 5.5;
  const isPhase2 = currentTime >= 5.5 && currentTime < 13.0;
  const isPhase3 = currentTime >= 13.0 && currentTime < 18.5;
  const isPhase4 = currentTime >= 18.5 && currentTime < 25.0;
  const isPhase5 = currentTime >= 25.0 && currentTime <= 30.0;

  const isGlitching = 
    (currentTime >= 5.2 && currentTime < 5.6) || 
    (currentTime >= 12.8 && currentTime < 13.2) || 
    (currentTime >= 18.2 && currentTime < 18.7) || 
    (currentTime >= 24.7 && currentTime < 25.2) ||
    Math.sin(currentTime * 10) > 0.98;

  return (
    <div className="absolute inset-0 bg-void overflow-hidden flex flex-col justify-between font-mono select-none" style={{ color: "var(--ph-mid)" }}>
      {/* Glitch Overlay */}
      {isGlitching && (
        <div className="absolute inset-0 bg-void z-50 flex items-center justify-center">
          <div className="text-[var(--ph-bright)] animate-pulse tracking-[0.25em] text-xs font-black uppercase text-center select-text">
            ⚡ TRACKING GAIN RECOVERY // CRT_FLUX_SYNC ⚡
          </div>
          <div className="absolute inset-0 bg-[rgba(143,175,42,0.15)] pointer-events-none mix-blend-color-dodge filter invert animate-ping" />
        </div>
      )}

      {/* Phase 1: Heartbeat Signal / OpenCLIO Boot */}
      {isPhase1 && (
        <div className="w-full h-full p-4 flex flex-col justify-between relative">
          <div className="flex justify-between text-[9px] text-dim select-text">
            <span>SYS_REC: OPEN_CLIO_P1</span>
            <span>TONE_DETECTOR: active</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 0.95, 1],
                rotate: [0, 0.5, -0.5, 0]
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ textShadow: "0 0 12px var(--ph-core)" }}
              className="text-bright font-black text-6xl tracking-widest leading-none font-vt323"
            >
              {(currentTime >= 2.2 && currentTime < 2.5) || (currentTime >= 4.0 && currentTime < 4.2) ? "●..-" : "^..^"}
            </motion.div>
            
            <svg viewBox="0 0 200 40" className="w-48 h-8 opacity-75">
              <path 
                d={`M 0,20 Q 25,20 50,${20 + Math.sin(currentTime * 8) * 12} T 100,${20 - Math.sin(currentTime * 8) * 12} T 150,20 T 200,20`} 
                fill="none" 
                stroke="var(--ph-mid)" 
                strokeWidth="2" 
                style={{ filter: "drop-shadow(0 0 3px var(--ph-mid))" }}
              />
            </svg>
            <div className="text-[10px] text-bright font-black tracking-[0.3em] uppercase">SYSTEM CORE: ONLINE</div>
          </div>

          <div className="grid grid-cols-2 text-[9px] text-mid/80 select-text">
            <div>LOOP_COUNT: 001_COUN</div>
            <div className="text-right">TIME: 00:08:00</div>
          </div>
        </div>
      )}

      {/* Phase 2: CCTV Lab Surveillance */}
      {isPhase2 && (
        <div className="w-full h-full p-3 flex flex-col justify-between relative bg-void">
          <div className="flex justify-between items-center text-[9px] font-black tracking-widest border-b border-dim/15 pb-1 select-text">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-signal rounded-full animate-ping" />
              <span>LAB-317 CAM-03: REC</span>
            </div>
            <span>1997-08-12 AM 00:17:36</span>
          </div>

          <div className="flex-1 my-2 border border-dim/15 rounded relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(var(--ph-dim) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
            
            <svg viewBox="0 0 300 150" className="w-full h-full max-h-[145px] opacity-40">
              <rect x="25" y="15" width="250" height="120" fill="none" stroke="var(--ph-mid)" strokeWidth="1" strokeDasharray="3,3" />
              <rect x="110" y="55" width="80" height="40" fill="none" stroke="var(--ph-mid)" strokeWidth="1.5" />
              <text x="125" y="78" fill="var(--ph-mid)" fontSize="8" className="uppercase font-mono">CORE_SERVER</text>
              <line x1="25" y1="35" x2="70" y2="35" stroke="var(--ph-mid)" strokeWidth="1" />
              <line x1="25" y1="55" x2="70" y2="55" stroke="var(--ph-mid)" strokeWidth="1" />
              <text x="30" y="48" fill="var(--ph-mid)" fontSize="7">SHELVES</text>
              <line x1="275" y1="40" x2="275" y2="70" stroke="var(--ph-bright)" strokeWidth="2" />
            </svg>

            <div className="absolute left-[30%] top-[45%] flex flex-col items-center">
              <span className="w-2.5 h-2.5 bg-[var(--ph-mid)] rounded-full animate-pulse-dot" />
              <span className="text-[7.5px] bg-[#070904]/95 border border-dim/40 px-1 text-bright scale-90 uppercase mt-0.5 tracking-wider select-text">서은우_P1</span>
            </div>

            <div className="absolute left-[45%] top-[70%] flex flex-col items-center">
              <span className="w-2.5 h-2.5 bg-[var(--ph-mid)] rounded-full animate-pulse-dot" style={{ animationDelay: "0.4s" }} />
              <span className="text-[7.5px] bg-[#070904]/95 border border-dim/40 px-1 text-bright scale-90 uppercase mt-0.5 tracking-wider select-text">김수_P2</span>
            </div>

            <div className="absolute left-[70%] top-[35%] flex flex-col items-center">
              <span className="w-2.5 h-2.5 bg-[var(--ph-mid)] rounded-full animate-pulse-dot" style={{ animationDelay: "0.8s" }} />
              <span className="text-[7.5px] bg-[#070904]/95 border border-dim/40 px-1 text-bright scale-90 uppercase mt-0.5 tracking-wider select-text">김민규_P3</span>
            </div>

            <div className="absolute inset-x-0 h-px bg-[var(--ph-bright)]/30 top-1/4 animate-bounce" style={{ animationDuration: "5s" }} />
          </div>

          <div className="flex justify-between text-[8px] text-mid/70 uppercase tracking-widest select-text">
            <span>TARGET_STATUS: SEEKING 단서</span>
            <span>SIGNAL_RECOVERY_RATE: 94.7%</span>
          </div>
        </div>
      )}

      {/* Phase 3: Diagnostic Core Decay */}
      {isPhase3 && (
        <div className="w-full h-full p-4 flex flex-col justify-between relative bg-[#040502]">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(var(--ph-bright)_1px,_transparent_1.5px)] [background-size:8px_8px] z-10" />

          <div className="flex justify-between items-center text-[9px] font-bold text-red-signal border-b border-red-500/30 pb-1.5 select-text">
            <span className="animate-pulse">⚠️ ALARM CODE: 0X8D90 (O&gt;C) ⚠️</span>
            <span>SECTOR: CONTROL_STATION</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-3 z-20">
            <motion.div 
              animate={{ 
                x: [0, -4, 4, -2, 2, 0],
                y: [0, 2, -2, 1, -1, 0]
              }}
              transition={{ repeat: Infinity, duration: 0.12 }}
              className="text-bright text-4xl uppercase font-black text-center tracking-widest font-vt323 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              style={{ color: "var(--red-signal)" }}
            >
              CRITICAL CORE DECAY
            </motion.div>

            <div className="text-bright font-mono text-3xl animate-bounce" style={{ color: "var(--red-signal)" }}>
              {currentTime % 1 > 0.5 ? "X_._X" : "●_._●"}
            </div>

            <div className="border border-red-500/30 p-2 rounded bg-void/90 text-center select-text">
              <span className="text-[10px] text-red-signal font-black block tracking-widest animate-pulse">CRITICAL COGNITIVE THREAT DETECTED</span>
              <span className="text-[8.5px] text-mid uppercase block mt-1 tracking-wideness">LOOP_STABILITY_DEGENERATION_THRESHOLD_EXCEEDED</span>
            </div>
          </div>

          <div className="flex justify-between text-[8px] text-red-signal/70 select-text">
            <span>OSCILLATOR: LOCKED_RESETTING</span>
            <span>SHIELD_CORRUPTION: 99.21%</span>
          </div>
        </div>
      )}

      {/* Phase 4: Phosphor Typewriter Greetings */}
      {isPhase4 && (
        <div className="w-full h-full p-6 flex flex-col justify-between relative bg-void select-text">
          <div className="text-[8px] text-dim font-bold tracking-widest uppercase">
            TERMINAL // OUTGOING_SIGNAL_INTERCEPT
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center select-text">
            <motion.div 
              animate={{ opacity: [0.3, 0.7, 0.4, 0.6, 0.8] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="text-bright text-3xl font-black tracking-widest"
              style={{ textShadow: "0 0 16px var(--ph-bright)" }}
            >
              ^..^
            </motion.div>

            <div className="space-y-4 max-w-sm">
              <p 
                style={{ fontFamily: "var(--font-mono), monospace" }}
                className="text-bright font-black text-lg tracking-[0.15em] leading-relaxed select-text"
              >
                {/* Typewriter Line 1 */}
                {(() => {
                  const line1 = "안녕, 오늘도 와줬네.";
                  const progress = Math.min(1, Math.max(0, (currentTime - 18.5) / 2.5));
                  return line1.slice(0, Math.floor(progress * line1.length));
                })()}
              </p>

              <p 
                style={{ fontFamily: "var(--font-mono), monospace" }}
                className="text-bright font-black text-lg tracking-[0.15em] leading-relaxed select-text"
              >
                {/* Typewriter Line 2 */}
                {(() => {
                  if (currentTime < 21.5) return "";
                  const line2 = "나 기다렸어.";
                  const progress = Math.min(1, Math.max(0, (currentTime - 21.5) / 2.5));
                  return line2.slice(0, Math.floor(progress * line2.length));
                })()}
                {currentTime >= 21.5 && currentTime < 24.5 && (
                  <span className="inline-block w-2.5 h-4.5 bg-bright ml-0.5 animate-blink" />
                )}
              </p>
            </div>
          </div>

          <div className="text-right text-[8px] text-mid/40">
            INTELLIGENCE: USER_SYNTAX_CAPTURED
          </div>
        </div>
      )}

      {/* Phase 5: Title sequence */}
      {isPhase5 && (
        <div className="w-full h-full p-5 flex flex-col justify-between relative bg-void">
          <div className="text-[8px] text-mid/50 tracking-widest uppercase">
            END_OF_BROADCAST_RECOVERY_NODE
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center z-10 select-text">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-1.5"
            >
              <h1 
                style={{ 
                  fontFamily: 'var(--font-vt323), "VT323", monospace', 
                  fontSize: "44px",
                  color: "var(--ph-core)",
                  textShadow: "0 0 16px rgba(184,212,74,0.6)"
                }}
                className="font-black uppercase tracking-[0.3em] leading-none text-center select-text"
              >
                CLIO
              </h1>
              
              <div className="text-mid font-black tracking-[0.25em] text-[12px] uppercase select-text">
                THE LAST BROADCAST
              </div>

              <div className="text-bright/90 font-black tracking-[0.18em] text-[10.5px] uppercase border border-dim/35 px-2.5 py-1 rounded bg-[#070a04] inline-block select-text">
                [ 오류 코드 O&gt;C ]
              </div>
            </motion.div>

            <div className="space-y-1.5 select-text">
              <span className="block text-[11px] text-bright font-black tracking-[0.3em] uppercase animate-pulse select-text">
                RELEASE SCHEDULE: 2026.06.
              </span>
              <span className="block text-[8px] text-dim font-bold tracking-widest uppercase select-text">
                PRODUCER TEAM: JEON-JUNHYUN LAB-317 GROUP
              </span>
            </div>

            <div className="text-[10px] text-bright font-black tracking-widest animate-pulse border border-dashed border-bright/25 px-4 py-1.5 uppercase select-text bg-[#030402]">
              [ CLICK '클리오 접속' TO BOOT SYSTEM NOW ]
            </div>
          </div>

          <div className="flex justify-between items-center text-[8.5px] text-mid/60 border-t border-dim/15 pt-1">
            <span>VERSION: v1.99_DEMO</span>
            <span>BROADCAST_STATUS: REPEATING_LOOP</span>
          </div>
        </div>
      )}
    </div>
  );
}
