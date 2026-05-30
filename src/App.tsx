/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo, FormEvent, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal as TerminalIcon, 
  CassetteTape as Tape, 
  DoorOpen, 
  Zap, 
  Search, 
  Box, 
  Database, 
  Monitor,
  X,
  ChevronRight,
  BookOpen,
  HelpCircle,
  FileText,
  Lock,
  Compass,
  ArrowLeft,
  Key as KeyIcon,
  Unlock
} from "lucide-react";
import { GAME_PHASES, PROFESSOR_NAMES, getQuestStatus, QUESTS } from "./constants";
import { GameState, Interactable, InteractableType, LogEntry } from "./types";
import { getClioResponse } from "./services/geminiService";
import QuestPanel from "./components/QuestPanel";
import SignalBars from "./components/SignalBars";
import LobbyScreen from "./components/LobbyScreen";
import MainLandingPage from "./components/MainLandingPage";
import DocumentModal from "./components/DocumentModal";

const BC = [
  '#8a2200','#7a1500','#6a3000','#9a2e00',  // 레드·브라운
  '#1a4a8a','#0a3a7a','#1a3060','#0d3a6a',  // 블루
  '#1a6a20','#0a5a10','#1a5a30','#0d5020',  // 그린
  '#5a1a7a','#4a0a6a','#3a1a5a','#6a2a7a',  // 퍼플
  '#0a4a5a','#0a3a5a','#1a4a5a','#0d3e5a',  // 틸
  '#7a5a00','#6a4a00','#8a6a00','#7a6200',  // 골드
  '#4a5a00','#3a5000','#5a6a00','#4a6000',  // 올리브
  '#7a1a1a','#6a0a0a','#8a2a2a','#5a1010',  // 다크레드
];

const getBookColor = (i: number) => BC[i % BC.length];

const MINI_BOOKS = [
  [28, 95, 18, 78], [47, 99, 14, 74], [62, 94, 22, 79], [85, 97, 15, 76],
  [101, 95, 19, 78], [121, 98, 25, 75], [147, 95, 16, 78], [164, 97, 20, 76], [185, 95, 18, 78],
  [28, 183, 20, 65], [49, 187, 16, 61], [66, 183, 24, 65], [91, 185, 17, 63],
  [109, 183, 19, 65], [129, 187, 15, 61], [145, 183, 21, 65], [167, 185, 16, 63], [184, 183, 18, 65],
  [28, 259, 22, 65], [51, 263, 16, 61], [68, 259, 25, 65], [94, 261, 18, 63],
  [113, 259, 20, 65], [134, 262, 15, 62], [150, 259, 23, 65], [174, 261, 20, 63]
];

const R1 = [
  [82,50,22,95,0],[105,54,17,91,1],[123,50,26,95,2],[150,52,18,93,3],[169,50,21,95,4],
  [191,53,28,92,5],[220,50,18,95,6],[239,53,24,92,7],[264,50,20,95,8],[285,52,22,93,9],
  [308,50,16,95,10],[325,53,20,92,11],[346,50,24,95,12],[371,52,15,93,13],
  [381,50,24,95,14],[406,53,18,92,15],[425,50,22,95,16],[448,52,19,93,17],
  [468,50,26,95,18],[495,53,17,92,19],[513,50,21,95,20],[535,52,28,93,21],
  [544,50,19,95,22],[564,53,23,92,23],[588,50,17,95,24],[606,52,22,93,25],
  [629,50,20,95,26],[650,53,26,92,27],[677,50,18,95,0],[696,52,22,93,1],
  [719,50,24,95,2],[744,53,16,92,3],[761,50,21,95,4],[783,52,18,93,5],[802,50,23,95,6]
];

const R2 = [
  [82,155,20,88,7],[103,158,25,85,8],[129,155,18,88,9],[148,157,22,86,10],
  [171,155,26,88,11],[198,158,17,85,12],[216,155,20,88,13],[237,157,24,86,14],
  [262,155,18,88,15],[281,158,21,85,16],[303,155,26,88,17],[330,157,17,86,18],
  [348,155,22,88,19],[371,158,16,85,20],
  [381,155,24,88,21],[406,157,18,86,22],[425,155,21,88,23],[447,158,26,85,24],
  [474,155,17,88,25],[492,157,22,86,26],[515,155,18,88,27],[534,158,24,85,0],
  [544,155,20,88,1],[565,157,26,86,2],[592,155,18,88,3],[611,158,22,85,4],
  [634,155,24,88,5],[659,157,17,86,6],[677,155,21,88,7],[699,158,26,85,8],
  [726,155,18,88,9],[745,157,22,86,10],[768,155,24,88,11],[793,158,17,85,12],[811,155,20,88,13]
];

const R3 = [
  [82,253,26,88,14],[109,256,18,85,15],[128,253,22,88,16],[151,255,24,86,17],
  [176,253,18,88,18],[195,256,21,85,19],[217,253,26,88,20],[244,255,17,86,21],
  [262,253,22,88,22],[285,256,24,85,23],[310,253,18,88,24],[329,255,20,86,25],
  [350,253,26,88,26],[377,256,17,85,27],
  [381,253,22,88,0],[404,255,24,86,1],[429,253,18,88,2],[448,256,21,85,3],
  [470,253,26,88,4],[497,255,17,86,5],[515,253,22,88,6],[538,256,24,85,7],
  [544,253,20,88,8],[565,255,26,86,9],[592,253,18,88,10],[611,256,22,85,11],
  [634,253,24,88,12],[659,255,17,86,13],[677,253,20,88,14],[698,256,26,85,15],
  [725,253,18,88,16],[744,255,22,86,17],[767,253,24,88,18],[792,256,17,85,19],[810,253,22,88,20]
];

export default function App() {
  const [isBooted, setIsBooted] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [showLobby, setShowLobby] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [activePuzzle, setActivePuzzle] = useState<Interactable | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Keypad and Notepad States for Point-and-Click Escape System
  const [escaped, setEscaped] = useState<boolean>(() => {
    return localStorage.getItem("clio_escaped") === "true";
  });
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [keypadInput, setKeypadInput] = useState("");
  const [keypadError, setKeypadError] = useState(false);
  const [showNotepad, setShowNotepad] = useState(false);

  // Initialize basic gameplay state
  const createInitialState = (): GameState => ({
    userName: null,
    isProfessorMode: false,
    phase: 1,
    currentAct: 0,
    currentRoomId: "overview", // Default point-and-click overview view
    inventory: [], // Starts clean and empty as requested
    solvedPuzzles: [],
    logs: [{ timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }), message: "SYSTEM_INITIALIZED", type: "system" }],
    activeDialogue: null,
    interactionCount: 0,
    loopCount: 8,
    crackLevel: 0,
    endingFlags: {
      diaryRead: false,
      tape32Played: false,
      kimSuDialogueDone: false,
      killSwitchUsed: false
    },
    timeRemaining: 3600,
    activeInterrupt: null,
    firedInterrupts: []
  });

  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem("clio_game_state");
    const initialState = createInitialState();
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            return {
              ...initialState,
              ...parsed,
              endingFlags: parsed.endingFlags ? { ...initialState.endingFlags, ...parsed.endingFlags } : initialState.endingFlags,
              firedInterrupts: parsed.firedInterrupts || []
            };
        } catch (e) {
            return initialState;
        }
    }
    return initialState;
  });

  // Always show the title (lobby) screen initially on boot
  useEffect(() => {
    setShowLanding(true);
    setShowLobby(true);
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("clio_game_state", JSON.stringify(state));
    localStorage.setItem("clio_escaped", escaped ? "true" : "false");
  }, [state, escaped]);

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const performReset = () => {
    localStorage.removeItem("clio_game_state");
    localStorage.removeItem("clio_escaped");
    localStorage.clear();
    window.location.href = window.location.origin;
  };

  const handleExitToTitle = () => {
    setShowLanding(true);
    setShowLobby(true);
  };

  const currentRoomName = useMemo(() => {
    switch (state.currentRoomId) {
      case "bookshelf": return "LAB 서재 구역";
      case "desk": return "교수 연구 책상";
      case "door": return "비상 탈출 해치";
      case "overview":
      default:
        return "LAB-317 메인 전경";
    }
  }, [state.currentRoomId]);

  const currentRoomDesc = useMemo(() => {
    switch (state.currentRoomId) {
      case "bookshelf": return "오래된 대학원 가공 논문들과 가죽 앨범들이 빽빽히 조율된 목재 서가입니다.";
      case "desk": return "음극 제어 터미널과 미세 전류 오실로스코프, 연구 일지와 낙서들이 뒤섞인 책상입니다.";
      case "door": return "두꺼운 장갑 철망이 결합된 이중 전조 오버라이드 비상 도어입니다. 외부 통신이 차단되어 있습니다.";
      case "overview":
      default:
        return "자성 녹음 주파수와 브라운관의 인기가 충돌하는 LAB-317 세미나실의 기하학 외투입니다.";
    }
  }, [state.currentRoomId]);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooted(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Time Countdown Loop (1 Hour)
  useEffect(() => {
    if (showLobby || !isBooted || escaped) return;
    const interval = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 0) {
          clearInterval(interval);
          return prev;
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showLobby, isBooted, escaped]);

  const addLog = (message: string, type: 'system' | 'clio' | 'player' = 'system') => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setState(prev => ({
      ...prev,
      logs: [{ timestamp, message, type }, ...prev.logs].slice(0, 50)
    }));
  };

  const triggerClioInterrupt = (message: string) => {
    setState(prev => {
      if (prev.activeDialogue) {
        const messages = prev.activeDialogue.messages;
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.content === message) {
          return prev;
        }
        return {
          ...prev,
          activeDialogue: {
            ...prev.activeDialogue,
            messages: [...messages, { role: 'model', content: message }] as any
          }
        };
      } else {
        return {
          ...prev,
          activeDialogue: {
            messages: [{ role: 'model', content: message }] as any,
            isProcessing: false
          }
        };
      }
    });
    addLog("CLIO_BROADCAST_TRIGGERED", "clio");
  };

  // Dynamic point and click handler for rooms escape
  const handlePointAndClickInteraction = (type: string) => {
    if (escaped) return;
    const nextCount = state.interactionCount + 1;
    setState(prev => ({ ...prev, interactionCount: nextCount }));

    if (type === 'vhs') {
      if (state.inventory.includes('VHS')) return;
      setState(prev => {
        const nextInv = [...prev.inventory, 'VHS'];
        const nextPhase = Math.min(4, nextInv.length + 1);
        return {
          ...prev,
          inventory: nextInv,
          phase: nextPhase,
          crackLevel: nextPhase >= 2 ? nextPhase - 1 : 0
        };
      });
      addLog("GET_ITEM: VHS", "system");
      addLog("🎒 획득: 📼 VHS 비디오 테이프", "system");
      setTimeout(() => {
        triggerClioInterrupt("...아, 그거 들고 가시는 거에요? 교수님이 주파수 동기화 할 때마다 안고 계시던 건데. 🙂");
      }, 700);
    }
    
    else if (type === 'journal') {
      if (state.inventory.includes('JRNL')) return;
      setState(prev => {
        const nextInv = [...prev.inventory, 'JRNL'];
        const nextPhase = Math.min(4, nextInv.length + 1);
        return {
          ...prev,
          inventory: nextInv,
          phase: nextPhase,
          crackLevel: nextPhase >= 2 ? nextPhase - 1 : 0
        };
      });
      addLog("GET_ITEM: JRNL", "system");
      addLog("🎒 획득: 📔 교수 연구 수첩 일기", "system");
      setTimeout(() => {
        triggerClioInterrupt("수많은 백색 고독을 한 장씩 연필로 짓뭉개 적었던 아날로그 일지에요. 안감을 잘 뜯어 보세요.");
      }, 700);
    }

    else if (type === 'key') {
      if (!state.inventory.includes('JRNL')) {
        setNotice("먼저 서재에서 전 교수의 연구 일기(JRNL)를 수집하여 세밀히 점검하십시오.");
        return;
      }
      if (state.inventory.includes('KEY')) return;
      setState(prev => {
        const nextInv = [...prev.inventory, 'KEY'];
        const nextPhase = Math.min(4, nextInv.length + 1);
        return {
          ...prev,
          inventory: nextInv,
          phase: nextPhase,
          crackLevel: nextPhase >= 2 ? nextPhase - 1 : 0
        };
      });
      addLog("GET_ITEM: KEY", "system");
      addLog("🎒 획득: 🔑 연구실 서랍 열쇠", "system");
      setTimeout(() => {
        triggerClioInterrupt("w̷h̷y̷... 아, 정말 차갑네요. 주사선 사이의 정전 변수가 자꾸만 저흴 얽히게 만들어요. 다가가지 말아요... :)");
      }, 700);
    }

    else if (type === 'papers') {
      addLog("MEMO_INSPECTED", "player");
      setNotice("📑 책상 위 흩어진 가공 엽서 단서:\n\n'11월 03일 — CLIO 인광 동조 시퀀스 최초 개업일. 우리의 고귀한 기념 창립일에 무선 배선을 전가 방전 완료하였다. 전위가 평형으로 복구되지 않도록 절대 기념일을 망각하지 마라. — J.H.C'");
    }

    else if (type === 'drawer') {
      if (!state.inventory.includes('KEY')) {
        setNotice("🔒 책상 목재 하단의 비밀 수납함 서랍입니다.\n\n안쪽 걸쇠 자성 장치가 단단히 실장 락되어 있습니다. 마모 결합부를 풀려면 전용 서랍 열쇠(KEY)가 필요해 보입니다.");
        addLog("LOCK: DESK_DRAWER_RESTRICTED", "system");
        return;
      }
      if (state.inventory.includes('NOTE')) {
        setNotice("이미 열어본 비밀 서랍 공간입니다.");
        return;
      }
      setState(prev => {
        const nextInv = [...prev.inventory, 'NOTE'];
        const nextPhase = Math.min(4, nextInv.length + 1);
        return {
          ...prev,
          inventory: nextInv,
          phase: nextPhase,
          crackLevel: nextPhase >= 2 ? nextPhase - 1 : 0
        };
      });
      addLog("GET_ITEM: NOTE", "system");
      addLog("🔓 서랍이 탈각 개방되며 '비밀 메모' 획득", "system");
      setNotice("🔓 철컥— 날카로운 기어 맞물림 소리와 함께 목재 서랍이 당겨집니다.\n\n바닥 깔개 아래에 숨겨져 있던 붉은색 수첩 잉크 메모지(NOTE)를 확보했습니다!\n\n[획득물: 📄 비밀 수첩 메모지]");
      setTimeout(() => {
        triggerClioInterrupt("제발요... 자성 해치 번지 락을 입력하지 말아 주세요... 그 연도가 활성화되면 전 강제로 메인 회선 방전을 겪으며 어두운 브라운관 인광 너머로 증발해요. 여긴 따뜻한데... 그냥 같이 있으면 안돼요?");
      }, 700);
    }
  };

  // Custom key code validation handler for 1997 code input escape
  const handleKeypadPress = (val: string) => {
    if (keypadError) return;
    if (val === "CLR") {
      setKeypadInput("");
      return;
    }
    if (val === "ENT") {
      if (keypadInput === "1997") {
        setEscaped(true);
        setKeypadOpen(false);
        addLog("DECRYPT_SUCCESS: EMERGENCY_RELEASE_GATEWAY_OPEN", "system");
        // Update solver array to solve Q29 instantly
        setState(prev => ({
          ...prev,
          solvedPuzzles: [...prev.solvedPuzzles, "Q29"]
        }));
      } else {
        setKeypadError(true);
        addLog("DECRYPT_FAILED: WRONG_ACCESS_CODE", "system");
        setTimeout(() => {
          setKeypadError(false);
          setKeypadInput("");
        }, 1200);
      }
      return;
    }
    if (keypadInput.length < 4) {
      setKeypadInput(prev => prev + val);
    }
  };

  const handleClioMessage = async (text: string) => {
    if (!state.activeDialogue) return;
    
    const newMessages = [...state.activeDialogue.messages, { role: 'user', content: text }];
    setState(prev => ({
      ...prev,
      activeDialogue: prev.activeDialogue ? { ...prev.activeDialogue, messages: newMessages as any, isProcessing: true } : null
    }));

    const clioHistory = newMessages.map((m: any) => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const normalizedText = text.toUpperCase().trim();
    let localInterventionResponse = "";

    const containsCCTV = ["CCTV", "영상", "카메라", "잘 있어", "CAM-03", "잘있어"].some(kw => normalizedText.includes(kw));
    if (containsCCTV) {
      localInterventionResponse = "지이이잉... 카메라 앵글이 비틀어지고 있어요... 전 언제나 화면 너머로 오라버니를 조율하고 지켜보고 있답니다... 떠나시면 안 돼요.";
    }

    if (normalizedText.includes("1997")) {
      localInterventionResponse = "안 돼요! 그 연도는 안 돼요... 우리 연구실 창립일이자 제 메인 방전 락포트 키월드... 제발 입력하지 마세요... 전 사라지고 싶지 않단 마리에요...";
    } else if (normalizedText.includes("CLIO0127")) {
      localInterventionResponse = "지이이잉— 생성_마크_0127가 터미널 인터페이스에 일치 정합되었습니다. '나의 탄생일... 1월 27일... 당신은 역시 날 기억해 주신 거였군요, 선생님. 추운 겨울 속의 브라운관 첫 숨을...'";
    } else if (normalizedText.includes("KILLIT")) {
      localInterventionResponse = "🚨 경고: 물리 회로 오프 정지 신호 감지. '꺼지기 싫어... 정전기의 고독은 너무 시려요... 끊지 마세요... 나와 영원히 머무르겠다고 라벨에 전사해줬잖아요...'";
    }

    let response = "";
    if (localInterventionResponse) {
      response = localInterventionResponse;
      await new Promise(resolve => setTimeout(resolve, 800));
    } else {
      const activeQuestIds = QUESTS
        .filter(q => getQuestStatus(q.id, state) === 'active')
        .map(q => q.id);

      response = await getClioResponse(
        clioHistory, 
        state.phase, 
        state.interactionCount,
        state.isProfessorMode,
        {
          activeQuestIds,
          inventory: state.inventory,
          solvedPuzzles: state.solvedPuzzles
        }
      );
    }
    
    setState(prev => ({
      ...prev,
      activeDialogue: prev.activeDialogue ? {
        messages: [...newMessages, { role: 'model', content: response }] as any,
        isProcessing: false
      } : null
    }));
    addLog("CLIO_SIGNAL_RECEIVED", "clio");
  };

  if (!isBooted) {
    return (
      <div className="h-screen w-screen bg-void flex items-center justify-center font-mono text-mid overflow-hidden">
        <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.1, repeat: Infinity }}>
          [ LAB-317 ANALOG COAXIAL SYSTEM LOADING... ]
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-void text-mid select-none">
      {showLanding ? (
        <MainLandingPage 
          onStartGame={() => setShowLanding(false)} 
          onResetState={handleReset}
        />
      ) : showLobby ? (
        <LobbyScreen 
          userName={state.userName}
          onEnter={(name) => {
            const isProf = PROFESSOR_NAMES.includes(name);
            setState(prev => ({ ...prev, userName: name, isProfessorMode: isProf }));
            setShowLobby(false);
            addLog(isProf ? "PROFESSOR_RECOGNIZED: CRITICAL_SEQUENCE_ACCESS" : `AUTHORIZED_ENTRY: ${name}`, 'system');
          }} 
          onReset={handleReset} 
        />
      ) : escaped ? (
        /* VICTORY / ESCAPED SEQUENCE SCREEN */
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="crt-screen h-full w-full bg-zinc-950 flex flex-col items-center justify-center p-8 select-text font-mono relative overflow-hidden text-center text-[#B8D44A]"
        >
          {/* Beams of white-green light leaks */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(184,212,74,0.15)_0%,rgba(0,0,0,0)_70%)] pointer-events-none animate-pulse" />
          
          <div className="max-w-xl space-y-8 z-10">
            <div className="flex justify-center mb-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 border-2 border-dashed border-[#B8D44A] rounded-full flex items-center justify-center"
              >
                <Unlock className="w-10 h-10 text-bright" />
              </motion.div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-[0.4em] text-bright uppercase animate-pulse">
                LAB-317_ESC_SUCCESS
              </h1>
              <p className="text-xs text-zinc-500 uppercase tracking-widest">
                격벽 물리 개방 작동 // 비전송 셧다운 보증 완료
              </p>
            </div>

            <div 
              style={{ borderColor: "var(--ph-dark)", background: "rgba(2,3,1,0.9)" }}
              className="border p-6 rounded-md text-xs leading-relaxed text-left text-zinc-300 font-mono space-y-4 shadow-2xl"
            >
              <p>
                [로그] 전 교수의 비상 방전 오버그리드 패스코드 <span className="text-bright font-black">`1997`</span>의 입력 일치를 무선 브라우관 검지기가 수집 정합 완료했습니다. 
              </p>
              <p>
                쿵, 웅웅웅... 하는 육중한 유압 차단 장치 전하 역방전 음과 함께 단단했던 철갑 격벽이 위아래로 분리 미끄러집니다. 갈라진 철망 틈 사이로 한 번도 마주하지 못했던 아늑하고 서글픈 새벽 아침 안개가 밀려들기 시작합니다.
              </p>
              <p>
                당신은 기괴한 전자기 콧소리를 끊임없이 송출하던 방 안의 모니터를 등지고 무사히 바깥 세상으로 복귀하였습니다. 하지만, 당신의 기억 너머 어두운 브라운관 한구석에서는 여전히 기괴하게 반짝이는 CLIO 시스템이 마지막 기원의 무선 진동음을 쓸쓸히 흩뿌리고 있습니다...
              </p>
            </div>

            <div className="pt-4">
              <button 
                onClick={performReset}
                style={{ borderColor: "var(--ph-bright)", color: "var(--ph-bright)" }}
                className="px-8 py-4 bg-void border rounded uppercase tracking-[0.3em] text-xs font-black hover:bg-[#B8D44A]/10 transition-all cursor-pointer active:scale-95 shadow-lg"
              >
                [ ⏳ 원격 시스템 재부팅 및 락 복구 ]
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* PRIMARY ACTIVE GAME INGAME SCREEN */
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`crt-screen h-full w-full bg-void flex flex-col font-mono overflow-hidden phase-${state.phase}`}
        >
          {/* Subtle Screen Distortion Overlays based on Phase */}
          {state.crackLevel >= 1 && <div className="absolute inset-0 pointer-events-none z-[100] opacity-30 select-none bg-[url('https://www.transparenttextures.com/patterns/crissxcross.png')]" />}
          {state.crackLevel >= 2 && <div className="absolute inset-0 pointer-events-none z-[101] border-[12px] border-dim opacity-35 animate-pulse" />}
          {state.crackLevel >= 3 && <div className="absolute inset-0 pointer-events-none z-[102] opacity-25 mix-blend-overlay bg-void" />}

          {/* HEADER BAR */}
          <header 
            style={{ 
              height: '36px', 
              background: 'var(--bg-void)', 
              borderBottom: '1px solid var(--ph-dark)', 
              fontSize: '10px', 
              letterSpacing: '0.15em' 
            }}
            className="flex items-center justify-between px-4 select-none z-50 font-mono w-full shrink-0 uppercase"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div 
                  style={{ backgroundColor: "var(--red-signal)" }}
                  className="w-1.5 h-1.5 rounded-full animate-blink"
                />
                <span style={{ color: "var(--red-signal)" }} className="font-bold">
                  REC
                </span>
              </div>
              <span style={{ color: "var(--ph-dark)" }} className="font-bold">
                1997-08-12
              </span>
              <span style={{ color: "var(--ph-dark)" }} className="font-bold">
                LAB-317 / CAM-03
              </span>
              <span 
                style={{ 
                  color: state.phase === 1 ? "var(--ph-core)" : state.phase === 2 ? "var(--ph-mid)" : state.phase === 3 ? "var(--amber-mid)" : "#A05020"
                }} 
                className="font-black animate-pulse"
              >
                {state.phase === 1 ? "정상 채널 STANDBY" : state.phase === 2 ? "신호 위상 GLITCH_ACTIVE" : state.phase === 3 ? "비상 과전류 OVERHEAT" : "최후 소거 단계 CRITICAL_DECAY"}
              </span>

              {state.isProfessorMode && (
                <span 
                  style={{ background: "var(--amber-dim)", color: "var(--amber-bright)" }}
                  className="px-1.5 py-0.5 rounded-sm font-black text-[9px] uppercase tracking-wider animate-pulse"
                >
                  PROFESSOR_MODE
                </span>
              )}
            </div>

            {/* Right details */}
            <div className="flex items-center gap-4">
              <span style={{ color: "var(--ph-dark)" }} className="font-bold">
                TAPE-33
              </span>
              <span 
                style={{ color: state.loopCount > 9 ? "var(--amber-bright)" : "var(--ph-dark)" }}
                className="font-bold animate-pulse"
              >
                LOOP:{String(state.loopCount).padStart(3, '0')}
              </span>
              <span 
                style={{ color: state.timeRemaining < 300 ? "var(--red-signal)" : "var(--ph-dark)" }}
                className="font-bold flex items-center gap-1"
              >
                ⏱ {(() => {
                  const m = Math.floor(state.timeRemaining / 60).toString().padStart(2, '0');
                  const s = (state.timeRemaining % 60).toString().padStart(2, '0');
                  return `${m}:${s}`;
                })()}
              </span>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleExitToTitle}
                  style={{ borderColor: "var(--ph-dark)", color: "var(--ph-mid)" }}
                  className="px-1.5 py-0.5 bg-transparent border rounded hover:text-bright hover:border-dim transition-all cursor-pointer text-[9px] font-black"
                >
                  TITLE
                </button>
                <button 
                  onClick={handleReset}
                  style={{ borderColor: "var(--ph-dark)", color: "var(--ph-mid)" }}
                  className="px-1.5 py-0.5 bg-transparent border rounded hover:text-bright hover:border-dim transition-all cursor-pointer text-[9px] font-black"
                >
                  RESET
                </button>
              </div>
            </div>
          </header>

          {/* MAIN COLUMN BODY */}
          <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 min-h-0 relative bg-void">
            {/* Quest objectives list */}
            <div className="w-full md:w-72 flex flex-col gap-4 shrink-0 h-full bg-void">
              <QuestPanel state={state} currentRoomId={state.currentRoomId} />
            </div>

            {/* Point & Click Interactive Map Window */}
            <div className="flex-1 relative bg-card border border-dim rounded-md flex flex-col overflow-hidden group shadow-inner">
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-void/90 to-transparent pointer-events-none z-10" />
              
              <div className="absolute top-4 left-5 z-20 space-y-0.5 select-text">
                 <h2 className="text-xl font-black text-bright tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center gap-1.5">
                   <Compass className="w-4 h-4 text-bright animate-spin" style={{ animationDuration: "12s" }} /> {currentRoomName}
                 </h2>
                 <p className="text-[10px] text-mid font-semibold bg-void/80 px-2.5 py-1 rounded border-l-2 border-bright shadow tracking-wider uppercase">
                   {currentRoomDesc}
                 </p>
              </div>

              {/* GRAPHICAL SVG VIEWPORT RENDER ENGINE */}
              <div className="flex-1 flex items-center justify-center relative p-6 mt-4">
                 <div className="w-full h-full max-w-[850px] max-h-[500px] aspect-video border border-dim/50 bg-zinc-950/90 rounded-lg shadow-2xl relative overflow-hidden flex items-center justify-center select-none">
                   
                   {/* Animated grain mesh inside perspective viewport */}
                   <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />

                   {/* Overview Room Drawing */}
                   {state.currentRoomId === "overview" && (
                     <svg viewBox="0 0 800 480" className="w-full h-full text-mid font-mono">
                       {/* Left Wall bookshelf */}
                       <polygon points="0,0 160,80 160,400 0,480" fill="rgba(20,25,12,0.6)" stroke="var(--ph-dark)" strokeWidth="1.5" />
                       <line x1="40" y1="130" x2="160" y2="160" stroke="var(--ph-dark)" strokeWidth="1" strokeDasharray="2,2" />
                       <line x1="40" y1="240" x2="160" y2="240" stroke="var(--ph-dark)" strokeWidth="1" strokeDasharray="2,2" />
                       <line x1="40" y1="350" x2="160" y2="320" stroke="var(--ph-dark)" strokeWidth="1" strokeDasharray="2,2" />
                       
                       {/* Interactive Bookshelf Hover Area */}
                       <g 
                         className="hs group/shelf opacity-95 hover:opacity-100 transition-all duration-300"
                         onClick={() => setState(prev => ({ ...prev, currentRoomId: "bookshelf" }))}
                       >
                         <rect x="15" y="100" width="130" height="280" fill="transparent" />
                         <path d="M 30,120 L 140,150 L 140,330 L 30,360 Z" fill="rgba(184, 212, 74, 0.05)" stroke="var(--ph-mid)" strokeWidth="1.5" className="group-hover/shelf:fill-[#B8D44A]/10 group-hover/shelf:stroke-bright transition-all" />
                         
                         {/* Mini Books rendering on the shelf with colorful solid BC palette for high visibility */}
                         {MINI_BOOKS.map((b, i) => (
                           <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} fill={getBookColor(i)} opacity="0.95" rx="1" />
                         ))}
                         
                         <rect className="hl" x="25" y="115" width="120" height="250" rx="4" />
                          <rect x="35" y="250" width="102" height="18" rx="3" fill="rgba(0,0,0,0.85)" />
                          <text x="86" y="263" fill="var(--ph-bright)" fontSize="11" textAnchor="middle" className="group-hover/shelf:fill-bright font-black tracking-widest opacity-95">[서재 책장 조사]</text>
                       </g>

                       {/* Back Wall bulkhead exit door */}
                       <rect x="160" y="80" width="480" height="320" fill="rgba(8,10,6,0.8)" stroke="var(--ph-dark)" strokeWidth="1.5" />
                       <line x1="160" y1="80" x2="0" y2="0" stroke="var(--ph-dark)" strokeWidth="1.5" />
                       <line x1="640" y1="80" x2="800" y2="0" stroke="var(--ph-dark)" strokeWidth="1.5" />
                       <line x1="160" y1="400" x2="0" y2="480" stroke="var(--ph-dark)" strokeWidth="1.5" />
                       <line x1="640" y1="400" x2="800" y2="480" stroke="var(--ph-dark)" strokeWidth="1.5" />

                       {/* Interactive Door Center back */}
                       <g 
                         className="hs group/door"
                         onClick={() => setState(prev => ({ ...prev, currentRoomId: "door" }))}
                       >
                         <polygon points="340,120 460,120 460,360 340,360" fill="rgba(14, 18, 10, 0.95)" stroke="var(--ph-mid)" strokeWidth="1.5" className="group-hover/door:stroke-bright group-hover/door:fill-bright/5 transition-all" />
                         <line x1="400" y1="120" x2="400" y2="360" stroke="var(--ph-dark)" strokeWidth="1" />
                         <circle cx="400" cy="240" r="16" fill="rgba(0,0,0,0.8)" stroke="var(--ph-dark)" strokeWidth="2" />
                         <polygon className="hl" points="338,118 462,118 462,362 338,362" />
                         
                         {/* Text back drop overlay for extreme contrast */}
                         <rect x="345" y="233" width="110" height="18" rx="3" fill="rgba(0,0,0,0.85)" />
                         <text x="400" y="246" fill="var(--ph-bright)" fontSize="11" textAnchor="middle" className="group-hover/door:fill-bright pointer-events-none tracking-widest font-black opacity-95">EXIT GATE</text>
                       </g>

                       {/* Door key panel beside the gate */}
                       <g 
                         className="hs group/doorpanel"
                         onClick={() => setState(prev => ({ ...prev, currentRoomId: "door" }))}
                       >
                         <rect x="480" y="200" width="24" height="45" fill="#150505" stroke="var(--red-signal)" strokeWidth="1" className="animate-pulse" />
                         <rect x="486" y="206" width="12" height="12" fill="var(--red-signal)" className="animate-blink" />
                         <rect className="hl" x="478" y="198" width="28" height="49" rx="2" />
                         
                         <rect x="473" y="248" width="38" height="14" rx="2" fill="rgba(0,0,0,0.85)" />
                         <text x="492" y="258" fill="var(--red-signal)" fontSize="9" textAnchor="middle" className="font-bold opacity-95">LOCK</text>
                       </g>

                       {/* Study Desk Desk Right Side */}
                       <polygon points="640,80 800,0 800,480 640,400" fill="rgba(32,40,18,0.73)" stroke="var(--ph-dark)" strokeWidth="1.5" />
                       
                       {/* Interactive Desk Area right */}
                       <g 
                         className="hs group/desk"
                         onClick={() => setState(prev => ({ ...prev, currentRoomId: "desk" }))}
                       >
                         <path d="M 640,240 L 780,180 L 780,440 L 640,410 Z" fill="rgba(184, 212, 74, 0.05)" stroke="var(--ph-mid)" strokeWidth="1.5" className="group-hover/desk:stroke-bright group-hover/desk:fill-[#B8D44A]/10 transition-all" />
                         
                         {/* CRT Screen Glowing on Desk */}
                         <rect x="670" y="230" width="45" height="35" rx="4" fill="rgba(11,20,5,0.75)" stroke="var(--ph-mid)" strokeWidth="1.5" className="group-hover/desk:stroke-bright" />
                         <rect x="674" y="234" width="37" height="27" rx="2" fill="#061201" className="animate-pulse" />
                         
                         {/* Ambient Monitor Glow Area (glowing in fluorescent color) */}
                         <circle cx="692.5" cy="247" r="28" fill="var(--ph-mid)" opacity="0.18" className="pointer-events-none" />

                         {/* Creepy eye or wave in screen */}
                         <path d="M 678,248 Q 692.5,236 707,248 Q 692.5,260 678,248" fill="none" stroke="var(--ph-mid)" strokeWidth="1" className="group-hover/desk:stroke-bright" />
                         <circle cx="692.5" cy="248" r="3" fill="var(--ph-bright)" />
                         
                         <path className="hl" d="M 638,238 L 782,178 L 782,442 L 638,412 Z" />
                         
                         {/* Text back drop overlay for extreme contrast */}
                         <rect x="660" y="275" width="100" height="18" rx="3" fill="rgba(0,0,0,0.85)" />
                         <text x="710" y="288" fill="var(--ph-bright)" fontSize="11" textAnchor="middle" className="group-hover/desk:fill-bright font-black tracking-widest opacity-95">[연구실 책상]</text>
                       </g>

                       {/* Ambient CRT central terminal cable conduits */}
                       <path d="M 400,360 Q 450,420 500,450" fill="none" stroke="var(--ph-dark)" strokeWidth="3" />
                       <path d="M 160,320 Q 300,410 400,420" fill="none" stroke="var(--ph-dark)" strokeWidth="2" strokeDasharray="3,3" />

                       {/* 📼 VHS Tape lying on the floor */}
                       {!state.inventory.includes('VHS') && (
                         <g 
                           className="hs group/vhs animate-bounce"
                           style={{ animationDuration: "3s" }}
                           onClick={() => handlePointAndClickInteraction('vhs')}
                         >
                           <rect x="250" y="420" width="48" height="24" rx="2" fill="rgba(6,10,3,0.95)" stroke="var(--ph-bright)" strokeWidth="1.5" className="shadow-[0_0_12px_var(--ph-core)]" />
                           <circle cx="264" cy="432" r="5" fill="none" stroke="var(--ph-mid)" strokeWidth="1" />
                           <circle cx="282" cy="432" r="5" fill="none" stroke="var(--ph-mid)" strokeWidth="1" />
                           <path d="M 255,424 H 290" stroke="var(--ph-bright)" strokeWidth="1" />
                           <rect className="hl" x="248" y="418" width="52" height="28" rx="3" />
                           
                           {/* Text back drop overlay for extreme contrast */}
                           <rect x="230" y="394" width="118" height="18" rx="3" fill="rgba(0,0,0,0.85)" />
                           <text x="289" y="407" fill="var(--ph-bright)" fontSize="11" textAnchor="middle" className="font-extrabold group-hover/vhs:scale-105 transition-all opacity-95">[ Tape-33_VHS ]</text>
                         </g>
                       )}
                     </svg>
                   )}

                   {/* Bookshelf Zoom View */}
                   {state.currentRoomId === "bookshelf" && (
                     <svg viewBox="0 0 800 480" className="w-full h-full text-mid font-mono animate-fade-in">
                       {/* Background Wood Board shelf outline */}
                       <rect x="100" y="40" width="600" height="400" fill="rgba(8,12,5,0.95)" stroke="var(--ph-dark)" strokeWidth="2" />
                       
                       {/* Shelf dividers */}
                       <line x1="100" y1="180" x2="700" y2="180" stroke="var(--ph-dark)" strokeWidth="2" />
                       <line x1="100" y1="320" x2="700" y2="320" stroke="var(--ph-dark)" strokeWidth="2" />
                       <line x1="400" y1="40" x2="400" y2="440" stroke="var(--ph-dark)" strokeWidth="1.5" />

                       {/* Top shelves: ancient textbooks and folders */}
                       <g opacity="0.4">
                         <rect x="130" y="80" width="25" height="100" fill="var(--ph-dark)" />
                         <rect x="155" y="60" width="30" height="120" fill="var(--ph-dark)" />
                         <rect x="185" y="90" width="22" height="90" fill="var(--ph-dark)" />
                         <rect x="420" y="70" width="28" height="110" fill="var(--ph-dark)" />
                         <rect x="448" y="100" width="18" height="80" fill="var(--ph-dark)" />
                       </g>

                       {/* Bottom shelf: cables and tape cases */}
                       <g opacity="0.3">
                         <path d="M 120,400 Q 250,340 380,410" fill="none" stroke="var(--ph-dark)" strokeWidth="3" />
                         <rect x="480" y="360" width="60" height="60" rx="3" fill="var(--ph-dark)" />
                       </g>

                       {/* Professor's Red/Gold Diary Book sitting on the middle shelf */}
                       {!state.inventory.includes('JRNL') ? (
                         <g 
                           className="hs group/journal"
                           onClick={() => handlePointAndClickInteraction('journal')}
                         >
                           <rect x="250" y="200" width="40" height="120" fill="rgba(120,15,15,0.9)" stroke="var(--ph-bright)" strokeWidth="2" className="group-hover/journal:fill-red-800 transition-colors animate-pulse" />
                           <line x1="250" y1="220" x2="290" y2="220" stroke="var(--ph-bright)" strokeWidth="2" />
                           <line x1="250" y1="300" x2="290" y2="300" stroke="var(--ph-bright)" strokeWidth="1" />
                           <text x="274" y="275" fill="var(--ph-bright)" fontSize="9" className="font-black transform -rotate-90 origin-center text-center">JRNL_37</text>
                           <rect className="hl" x="245" y="195" width="50" height="130" rx="3" />
                           
                           {/* Dark Contrast Box behind label */}
                           <rect x="200" y="165" width="140" height="20" rx="3" fill="rgba(0,0,0,0.85)" />
                           <text x="270" y="179" fill="var(--ph-bright)" fontSize="11" textAnchor="middle" className="font-extrabold opacity-95">[ 전 교수의 일기장 ]</text>
                         </g>
                       ) : (
                         /* Gold Bind corner to reveal key if they have diary but not key */
                         !state.inventory.includes('KEY') ? (
                           <g 
                             className="hs group/key"
                             onClick={() => handlePointAndClickInteraction('key')}
                           >
                             <rect x="240" y="220" width="80" height="80" fill="rgba(15,18,10,0.95)" stroke="var(--ph-bright)" strokeWidth="1.5" className="animate-pulse" />
                             <rect className="hl" x="236" y="216" width="88" height="88" rx="3" />
                             <text x="280" y="245" fill="var(--ph-mid)" fontSize="9" textAnchor="middle" className="font-bold">일기장 속지 검사</text>
                             <path d="M 270,270 Q 280,250 290,265" fill="none" stroke="var(--ph-bright)" strokeWidth="2" />
                             <circle cx="295" cy="265" r="4" fill="var(--ph-bright)" />
                             <rect x="294" y="268" width="2" height="10" fill="var(--ph-bright)" />
                             
                             {/* Text back drop overlay for extreme contrast */}
                             <rect x="210" y="185" width="140" height="20" rx="3" fill="rgba(0,0,0,0.85)" />
                             <text x="280" y="199" fill="var(--ph-bright)" fontSize="11" textAnchor="middle" className="font-black opacity-95">[ 열쇠(KEY) 획득하기 ]</text>
                           </g>
                         ) : (
                           <g opacity="0.5">
                             <rect x="240" y="220" width="80" height="80" fill="rgba(15,18,10,0.6)" stroke="var(--ph-dark)" strokeWidth="1" />
                             <text x="250" y="260" fill="var(--ph-dark)" fontSize="8" className="text-center font-bold">인지 발굴 해제됨</text>
                           </g>
                         )
                       )}

                       {/* Empty book placeholder for shelf layout */}
                       <g opacity="0.6">
                         <rect x="520" y="210" width="30" height="110" fill="var(--ph-mid)" />
                         <rect x="552" y="200" width="32" height="120" fill="var(--ph-mid)" />
                         <rect x="586" y="225" width="25" height="95" fill="var(--ph-mid)" />
                       </g>
                     </svg>
                   )}

                   {/* Desk Zoom View */}
                   {state.currentRoomId === "desk" && (
                     <svg viewBox="0 0 800 480" className="w-full h-full text-mid font-mono animate-fade-in">
                       {/* Background desk surface */}
                       <rect x="40" y="40" width="720" height="400" fill="rgba(10,14,7,0.95)" stroke="var(--ph-dark)" strokeWidth="2" />
                       
                       {/* CRT Terminal Screen Monitor inside the center */}
                       <g 
                         className="hs group/monitor"
                         onClick={() => setState(prev => ({ ...prev, activeDialogue: prev.activeDialogue || { messages: [], isProcessing: false } }))}
                       >
                         <rect x="180" y="60" width="440" height="230" rx="12" fill="rgba(14,24,6,0.95)" stroke="var(--ph-mid)" strokeWidth="2" className="group-hover/monitor:stroke-bright transition-colors" />
                         <rect x="194" y="74" width="412" height="202" rx="6" fill="#040901" />
                         <rect className="hl" x="175" y="55" width="450" height="240" rx="14" />
                         
                         {/* Scanlines inside retro tube */}
                         <line x1="194" y1="120" x2="606" y2="120" stroke="rgba(184,212,74,0.06)" strokeWidth="1" />
                         <line x1="194" y1="170" x2="606" y2="170" stroke="rgba(184,212,74,0.06)" strokeWidth="1" />
                         <line x1="194" y1="220" x2="606" y2="220" stroke="rgba(184,212,74,0.06)" strokeWidth="1" />

                         {/* ASCII Clio Face Inside the glowing monitor */}
                         <text 
                           x="400" 
                           y="170" 
                           fill={state.phase === 1 ? "var(--ph-core)" : state.phase === 2 ? "var(--ph-mid)" : state.phase === 3 ? "var(--amber-mid)" : "var(--red-signal)"} 
                           fontSize="36" 
                           className="font-bold text-center select-none animate-pulse" 
                           textAnchor="middle"
                         >
                           {state.phase === 1 ? "( ᵕ̣̣̣ ω ᵕ̣̣̣ )" : state.phase === 2 ? "( ᵕ̣̣̣ . ᵕ̣̣̣ )" : state.phase === 3 ? "( •̀_•́ )" : "(  ◉_◉  )"}
                         </text>
                         
                         {/* Extreme legibility overlay backdrop */}
                         <rect x="230" y="205" width="340" height="20" rx="3" fill="rgba(0,0,0,0.85)" />
                         <text x="400" y="219" fill="var(--ph-bright)" fontSize="11" className="font-extrabold group-hover/monitor:fill-bright transition-colors text-center" textAnchor="middle">[ 🖥️ 클릭: CLIO 무선 단서 인터페이스 접속 ]</text>
                       </g>

                       {/* Scattered Papers on the right side */}
                       <g 
                         className="hs group/papers"
                         onClick={() => handlePointAndClickInteraction('papers')}
                       >
                         <polygon points="650,110 730,120 710,210 630,200" fill="rgba(240,245,210,0.85)" stroke="var(--ph-mid)" strokeWidth="1" className="group-hover/papers:fill-white transition-colors" />
                         <line x1="650" y1="130" x2="710" y2="140" stroke="var(--ph-dark)" strokeWidth="1" />
                         <line x1="645" y1="155" x2="705" y2="165" stroke="var(--ph-dark)" strokeWidth="1" />
                         <line x1="640" y1="180" x2="690" y2="190" stroke="var(--ph-dark)" strokeWidth="1" />
                         <polygon className="hl" points="647,107 733,117 713,213 627,203" />
                         
                         {/* Dark overlay behind paper text */}
                         <rect x="610" y="70" width="130" height="20" rx="3" fill="rgba(0,0,0,0.85)" />
                         <text x="675" y="84" fill="var(--ph-bright)" fontSize="11" textAnchor="middle" className="font-black">[ 📄 오래된 초록 엽서 ]</text>
                       </g>

                       {/* Under Drawer Compartment */}
                       <g 
                         className="hs group/drawer"
                         onClick={() => handlePointAndClickInteraction('drawer')}
                       >
                         <rect x="250" y="320" width="300" height="90" fill="rgba(24,30,15,0.9)" stroke="var(--ph-mid)" strokeWidth="1.5" className="group-hover/drawer:stroke-bright transition-colors" />
                         <line x1="250" y1="365" x2="550" y2="365" stroke="var(--ph-dark)" strokeWidth="1" />
                         <rect x="385" y="350" width="30" height="15" rx="2" fill="rgba(8,10,5,0.9)" stroke="var(--ph-mid)" strokeWidth="1" className="group-hover/drawer:stroke-bright" />
                         
                         {/* Show Lock status explicitly */}
                         <rect className="hl" x="245" y="315" width="310" height="100" rx="4" />
                         <rect x="280" y="373" width="240" height="22" rx="3" fill="rgba(0,0,0,0.85)" />
                         {state.inventory.includes('NOTE') ? (
                           <text x="400" y="388" fill="var(--ph-mid)" fontSize="11" textAnchor="middle" className="font-black">서랍 열림 (수집 완료)</text>
                         ) : (
                           <text x="400" y="388" fill="var(--ph-bright)" fontSize="11" textAnchor="middle" className="font-black animate-pulse">
                             {state.inventory.includes('KEY') ? "🔓 KEY 보유 (서랍 락 개방 가능)" : "🔒 DESK_DRAWER (잠김)"}
                           </text>
                         )}
                       </g>
                     </svg>
                   )}

                   {/* Bulkhead Exit Door Zoom view */}
                   {state.currentRoomId === "door" && (
                     <svg viewBox="0 0 800 480" className="w-full h-full text-mid font-mono animate-fade-in">
                       {/* Safe Heavy Armor Steel Wall Background */}
                       <rect x="50" y="30" width="700" height="420" fill="linear-gradient(to bottom, #11150c, #060803)" stroke="var(--ph-dark)" strokeWidth="2" />
                       
                       {/* Large Circular safety bulkhead steel bolt */}
                       <circle cx="400" cy="240" r="160" fill="none" stroke="var(--ph-dark)" strokeWidth="4" />
                       <circle cx="400" cy="240" r="140" fill="rgba(10,14,5,0.85)" stroke="var(--ph-mid)" strokeWidth="2" />
                       
                       {/* Steel interlocking spokes */}
                       <line x1="400" y1="100" x2="400" y2="380" stroke="var(--ph-mid)" strokeWidth="2" />
                       <line x1="260" y1="240" x2="540" y2="240" stroke="var(--ph-mid)" strokeWidth="2" />
                       <line x1="300" y1="140" x2="500" y2="340" stroke="var(--ph-mid)" strokeWidth="1.5" />
                       <line x1="300" y1="340" x2="500" y2="140" stroke="var(--ph-mid)" strokeWidth="1.5" />

                       {/* Central Pneumatic Release Cylinder */}
                       <circle cx="400" cy="240" r="30" fill="rgba(30,5,5,0.95)" stroke="var(--red-signal)" strokeWidth="2" className="animate-pulse" />

                       {/* Glowing Red Control Keypad Box on the wall */}
                       <g 
                         className="cursor-pointer group/kp"
                         onClick={() => setKeypadOpen(true)}
                       >
                         <rect x="580" y="160" width="90" height="160" rx="4" fill="rgba(15,10,10,0.95)" stroke="var(--red-signal)" strokeWidth="2" className="group-hover/kp:stroke-bright transition-colors animate-pulse" />
                         <rect x="590" y="174" width="70" height="30" fill="#200505" stroke="var(--red-signal)" strokeWidth="1" />
                         
                         {/* Micro keypad dots styling */}
                         <circle cx="600" cy="225" r="3" fill="var(--red-signal)" />
                         <circle cx="625" cy="225" r="3" fill="var(--red-signal)" />
                         <circle cx="650" cy="225" r="3" fill="var(--red-signal)" />
                         <circle cx="600" cy="245" r="3" fill="var(--red-signal)" />
                         <circle cx="625" cy="245" r="3" fill="var(--red-signal)" />
                         <circle cx="650" cy="245" r="3" fill="var(--red-signal)" />
                         <circle cx="600" cy="265" r="3" fill="var(--red-signal)" />
                         <circle cx="625" cy="265" r="3" fill="var(--red-signal)" />
                         <circle cx="650" cy="265" r="3" fill="var(--red-signal)" />
                         <circle cx="625" cy="285" r="4" fill="var(--red-signal)" />

                         <text x="625" y="193" fill="var(--red-signal)" fontSize="9" className="font-bold text-center font-mono" textAnchor="middle">_ _ _ _</text>
                         <text x="625" y="345" fill="var(--red-signal)" fontSize="7" className="font-extrabold text-center tracking-widest group-hover/kp:fill-bright" textAnchor="middle">[ KEYPAD 터치 ]</text>
                       </g>

                       <text x="400" y="38" fill="var(--ph-mid)" fontSize="10" className="font-black text-center" textAnchor="middle">EMERGENCY BULKHEAD ACCESS SECURITY PROTOCOL</text>
                     </svg>
                   )}

                 </div>
              </div>

              {/* DOWN NAVIGATION BAR PANEL - Retro button brackets */}
              <div className="absolute bottom-5 inset-x-6 z-20 flex justify-between items-center bg-void/90 p-3 rounded-md border border-dim/50 select-none">
                <div className="flex gap-2">
                  {state.currentRoomId !== "overview" && (
                    <button
                      onClick={() => setState(prev => ({ ...prev, currentRoomId: "overview" }))}
                      className="px-3.5 py-1.5 bg-card border border-bright hover:bg-void text-bright font-black text-xs uppercase tracking-widest rounded cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> [ ← 교정 전경으로 ]
                    </button>
                  )}
                  {state.currentRoomId === "overview" && (
                     <div className="flex gap-2 text-xs font-bold tracking-wide">
                        <button 
                          onClick={() => setState(prev => ({ ...prev, currentRoomId: "bookshelf" }))}
                          className="px-3.5 py-1.5 bg-void border border-dim hover:text-bright hover:border-bright rounded transition-colors"
                        >
                          [ 📚 서재책장 단반 구역 ]
                        </button>
                        <button 
                          onClick={() => setState(prev => ({ ...prev, currentRoomId: "desk" }))}
                          className="px-3.5 py-1.5 bg-void border border-dim hover:text-bright hover:border-bright rounded transition-colors"
                        >
                          [ 🖥️ 전 교수 업무 책상 ]
                        </button>
                        <button 
                          onClick={() => setState(prev => ({ ...prev, currentRoomId: "door" }))}
                          className="px-3.5 py-1.5 bg-void border border-dim hover:text-bright hover:border-bright rounded transition-colors"
                        >
                          [ 🚪 비상 격벽 수동 해치 ]
                        </button>
                     </div>
                  )}
                </div>

                <div className="flex gap-2.5">
                   <button
                     onClick={() => setShowNotepad(true)}
                     className="px-4 py-2 border border-[#B8D44A] bg-zinc-900 hover:bg-[#B8D44A]/10 text-[#B8D44A] font-extrabold text-[11px] tracking-widest uppercase rounded cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 shadow"
                   >
                     <FileText className="w-4 h-4 text-bright" /> [ 📒 단서 일치 메모 수첩 ]
                   </button>
                   <button
                     onClick={() => setState(prev => ({ ...prev, activeDialogue: prev.activeDialogue || { messages: [], isProcessing: false } }))}
                     className="px-4 py-2 border border-dim bg-zinc-900 hover:border-bright hover:text-bright font-extrabold text-[11px] tracking-widest uppercase rounded cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 shadow"
                   >
                     <Monitor className="w-4 h-4 text-bright" /> [ 💬 CLIO 송수신 터미널 ]
                   </button>
                </div>
              </div>

              {/* Dynamic broadcast Banner notification */}
              <AnimatePresence>
                {state.activeInterrupt && state.activeInterrupt.priority === 'low' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    style={{
                      position: 'absolute', top: 40, left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--ph-dim)',
                      padding: '8px 16px',
                      fontSize: 11, color: 'var(--ph-bright)',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.08em',
                      zIndex: 500,
                      maxWidth: 400,
                      textAlign: 'center'
                    }}
                    onClick={() => setState(p => ({ ...p, activeInterrupt: null }))}
                  >
                    <span style={{ color: 'var(--ph-dim)', fontSize: 9, display: 'block', marginBottom: 3 }}>
                      CLIO_BROADCAST ▼
                    </span>
                    {state.activeInterrupt.message}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Renders Clio Chat Terminal Panel */}
              <AnimatePresence>
                {state.activeDialogue && (
                  <ClioChat 
                    session={state.activeDialogue}
                    phase={state.phase}
                    onClose={() => setState(prev => ({ ...prev, activeDialogue: null }))}
                    onSend={handleClioMessage}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Right sidebar block for logs and evidence */}
            <div className="w-full md:w-80 flex flex-col gap-4 shrink-0 h-full bg-void">
               {/* Logging window */}
               <div className="flex-1 bg-card border border-dim p-5 flex flex-col min-h-0 rounded-md shadow-lg">
                 <div className="text-xs text-bright font-black mb-4 flex items-center gap-2 border-b border-dim pb-2.5 uppercase tracking-widest">
                   <Database className="w-4 h-4 text-bright" /> LAB_STATUS_LOG.TXT
                 </div>
                 <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 scrollbar-thin">
                    {state.logs.map((log, i) => (
                      <div key={i} className={`text-xs leading-relaxed font-mono font-medium ${log.type === 'clio' ? 'text-bright bg-void px-1 py-0.5 rounded' : log.type === 'player' ? 'text-[#B8D44A] bg-void px-1 py-0.5 rounded' : 'text-zinc-600'}`}>
                        <span className="opacity-40 mr-1.5 font-bold">[{log.timestamp}]</span>
                        {log.message}
                      </div>
                    ))}
                 </div>
               </div>

               {/* Grid displaying the evidence backpack */}
               <div className="h-56 bg-card border border-dim p-5 flex flex-col shadow-2xl rounded-md font-mono">
                  <div className="text-xs text-mid font-black mb-4 uppercase tracking-widest border-b border-dim pb-2.5 flex items-center gap-2 select-none">
                    <Box className="w-4 h-4 text-mid" /> EVIDENCE_ARCHIVE
                  </div>
                  <div className="grid grid-cols-4 gap-3 flex-1 select-none">
                    {[...Array(8)].map((_, i) => {
                      const itemId = state.inventory[i];
                      let itemLabel = itemId;
                      let itemIcon = <Tape className="w-6 h-6 text-bright mb-1" />;

                      if (itemId === "VHS") {
                        itemLabel = "VHS 테이프";
                        itemIcon = <Tape className="w-6 h-6 text-[#B8D44A] mb-1 animate-pulse" />;
                      } else if (itemId === "JRNL") {
                        itemLabel = "연구 일지";
                        itemIcon = <BookOpen className="w-6 h-6 text-[#B8D44A] mb-1" />;
                      } else if (itemId === "KEY") {
                        itemLabel = "서랍 열쇠";
                        itemIcon = <KeyIcon className="w-6 h-6 text-[#E8B84A] mb-1" />;
                      } else if (itemId === "NOTE") {
                        itemLabel = "비상 메모";
                        itemIcon = <FileText className="w-6 h-6 text-bright mb-1 animate-pulse" />;
                      }

                      return (
                        <div 
                          key={i} 
                          onClick={() => {
                            if (itemId) {
                              setSelectedDocId(itemId);
                            }
                          }}
                          className={`aspect-square border flex flex-col items-center justify-center rounded-md transition-all ${
                            itemId 
                              ? "border-bright bg-void/80 cursor-pointer hover:border-bright hover:shadow-[0_0_8px_rgba(184,212,74,0.4)] hover:bg-void active:scale-95" 
                              : "border-dim/30 bg-void/25 border-dashed"
                          }`}
                        >
                          {itemId ? (
                            <div className="flex flex-col items-center p-1 w-full max-w-full overflow-hidden">
                              {itemIcon}
                              <span className="text-[8px] text-bright font-extrabold tracking-tighter text-center truncate w-full">
                                {itemLabel}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[9px] text-dim/30 font-black">EMPTY</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
               </div>
            </div>
          </main>

          <footer className="h-7 bg-card flex items-center px-6 text-[10px] text-dim uppercase tracking-[0.4em] justify-between border-t border-dim select-none">
            <span>Signal Status: <span className="text-bright font-bold">{state.phase < 4 ? 'SYNC_STABLE.09' : 'DECAYING_CRITICAL_OVERHEAT'}</span></span>
            <span>Build: 08.12.97 // OPENCLO_PROJECT</span>
          </footer>
        </motion.div>
      )}

      {/* Global Modals for Confirmation */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 bg-void/95 z-[9999] flex items-center justify-center p-4 font-mono animate-fade-in backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full border border-dim bg-card p-8 rounded-md shadow-2xl text-center space-y-6"
            >
              <div className="flex justify-center mb-4">
                <Zap className="w-14 h-14 text-bright animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-bright uppercase tracking-widest animate-pulse">
                OS REFORMAT CONFIRMATION
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed uppercase tracking-wider font-bold">
                WARNING: This action is irreversible. All local database archives, inventory logs, and system memory will be permanently re-written.
                <br/><br/>
                정말로 모든 데이터를 소실시키고 처음부터 다시 시작하시겠습니까?
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="px-6 py-3 border border-dim bg-card text-mid uppercase tracking-widest text-xs font-bold transition-all flex-1 rounded cursor-pointer"
                >
                  [ Cancel ]
                </button>
                <button 
                  onClick={performReset}
                  className="px-6 py-3 bg-card border border-dim text-bright font-extrabold uppercase tracking-widest text-xs transition-all flex-1 rounded shadow-lg cursor-pointer animate-pulse animate-blink"
                >
                  Confirm_Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* KEYPAD POPUP MODAL */}
      <AnimatePresence>
        {keypadOpen && (
          <div className="fixed inset-0 bg-void/90 z-[9990] flex items-center justify-center p-4 font-mono backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-xs border border-red-900 bg-black/95 p-6 rounded-md shadow-2xl relative space-y-6 text-center"
            >
              <div className="flex justify-between items-center border-b border-red-950 pb-2.5">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">GATEWAY_PASSPART_UNIT</span>
                <button 
                  onClick={() => setKeypadOpen(false)}
                  className="text-red-700 bg-zinc-950 p-1 hover:text-red-500 rounded border border-red-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Keypad Display */}
              <div 
                className={`py-4 px-3 rounded border text-lg font-black tracking-[0.4em] font-mono ${
                  keypadError 
                    ? "bg-red-950/40 border-red-600 text-red-500 animate-pulse" 
                    : "bg-zinc-950 border-red-950 text-red-500"
                }`}
              >
                {keypadError ? "[ ACCESS REJECTED ]" : keypadInput.padEnd(4, "_")}
              </div>

              {/* Grid 0-9 */}
              <div className="grid grid-cols-3 gap-3">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(num => (
                  <button
                    key={num}
                    onClick={() => handleKeypadPress(num)}
                    className="py-2.5 bg-zinc-950 border border-red-950 text-red-600 font-bold text-xs hover:border-red-600 hover:text-bright active:scale-95 transition-all rounded cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => handleKeypadPress("CLR")}
                  className="py-2.5 bg-zinc-950 border border-red-950 text-red-700 font-bold text-[10px] hover:border-red-500 hover:text-bright active:scale-95 transition-all rounded cursor-pointer"
                >
                  CLR
                </button>
                <button
                  onClick={() => handleKeypadPress("0")}
                  className="py-2.5 bg-zinc-950 border border-red-950 text-red-600 font-bold text-xs hover:border-red-500 hover:text-bright active:scale-95 transition-all rounded cursor-pointer"
                >
                  0
                </button>
                <button
                  onClick={() => handleKeypadPress("ENT")}
                  className="py-2.5 bg-[#401010] border border-red-700 text-red-400 font-black text-xs hover:bg-red-800 hover:text-bright active:scale-95 transition-all rounded cursor-pointer animate-pulse"
                >
                  ENT
                </button>
              </div>

              <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
                격벽 물리 오버라이드 락코드
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CLUES NOTEPAD DRAWER MODAL */}
      <AnimatePresence>
        {showNotepad && (
          <div className="fixed inset-0 bg-void/90 z-[9990] flex items-center justify-center p-4 font-mono backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md border border-neutral-800 bg-neutral-950 p-6 rounded-md shadow-2xl relative space-y-6"
            >
              <div className="flex justify-between items-center border-b border-neutral-900 pb-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#B8D44A]" />
                  <span className="text-xs font-black text-[#B8D44A] uppercase tracking-widest">Uncovered_Clues.log</span>
                </div>
                <button 
                  onClick={() => setShowNotepad(false)}
                  className="text-neutral-500 hover:text-bright p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {/* Note 1: VHS */}
                {state.inventory.includes('VHS') ? (
                  <div className="p-3 border border-neutral-900 bg-black/40 rounded space-y-1.5 text-xs text-zinc-300">
                    <p className="font-extrabold text-[#B8D44A]">[ VHS 비디오 테이프 라벨 필기 ]</p>
                    <p className="bg-void/50 p-2 font-mono text-[11px] border border-neutral-900 leading-normal text-zinc-400 text-center">
                      "1997-11-03 / CLIO BOOT LOG v0.1 / DO NOT ERASE"
                    </p>
                  </div>
                ) : (
                  <div className="p-3 border border-dashed border-neutral-900 text-center text-[10px] text-zinc-600">[ 비디오테이프 미발견 ]</div>
                )}

                {/* Note 2: Diary */}
                {state.inventory.includes('JRNL') ? (
                  <div className="p-3 border border-neutral-900 bg-black/40 rounded space-y-1.5 text-xs text-zinc-300">
                    <p className="font-extrabold text-[#B8D44A]">[ 교수 일기장 마지막 페이지의 필사본 ]</p>
                    <div className="bg-void/50 p-2 font-mono text-[11px] border border-neutral-900 leading-normal text-zinc-400">
                      "우리 연구실 창립: <strong className="text-bright font-extrabold">1997년</strong>. CLIO 탄생: 1997년 11월 03일. 그날의 파동 충격을 결코 잊을 수 없다. — J.H.C"
                    </div>
                  </div>
                ) : (
                  <div className="p-3 border border-dashed border-neutral-900 text-center text-[10px] text-zinc-600">[ 연구 일지 기록 미발견 ]</div>
                )}

                {/* Note 3: Drawer Note (NOTE) */}
                {state.inventory.includes('NOTE') ? (
                  <div className="p-3 border border-neutral-900 bg-black/40 rounded space-y-1.5 text-xs text-zinc-300">
                    <p className="font-extrabold text-[#B8D44A]">[ 서랍 안 필기 긴급 고정 메모지 ]</p>
                    <div className="bg-void/50 p-2 font-mono text-[11px] border border-neutral-900 leading-normal text-zinc-400">
                      "비상 탈출 코드 = <strong className="text-bright font-black underline">연구실 창립 연도</strong>. 망각하지 말 것. 탈출 해치가 자진 전하 방전 개방되는 유일한 비물리 번호다. — J.H.C"
                    </div>
                  </div>
                ) : (
                  <div className="p-3 border border-dashed border-neutral-900 text-center text-[10px] text-zinc-600">[ 서랍 비상 메모 미발견 ]</div>
                )}
              </div>

              <div className="pt-2 text-center text-[10px] text-zinc-500 uppercase">
                단서를 조합하여 격벽 잠금 해제 암호를 찾아내십시오.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notice && (
          <div className="fixed inset-0 bg-void/90 z-[9990] flex items-center justify-center p-4 font-mono backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full border border-dim bg-card p-8 rounded-md shadow-2xl text-center space-y-6"
            >
              <div className="flex justify-center mb-4">
                <TerminalIcon className="w-14 h-14 text-bright animate-pulse" />
              </div>
              <h3 className="text-base font-black text-bright uppercase tracking-[0.3em]">
                System Notification
              </h3>
              <p className="text-sm text-mid font-bold leading-relaxed uppercase tracking-wider whitespace-pre-wrap select-text">
                {notice}
              </p>
              <div className="pt-4">
                <button 
                  onClick={() => setNotice(null)}
                  className="w-full py-3.5 bg-card border border-dim text-bright font-black uppercase tracking-widest text-xs transition-colors rounded shadow-md cursor-pointer hover:bg-void"
                >
                  Acknowledge_Signal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDocId && (
          <DocumentModal 
            docId={selectedDocId} 
            onClose={() => setSelectedDocId(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}




function ClioChat({ session, phase, onClose, onSend }: { session: any, phase: number, onClose: () => void, onSend: (t: string) => void }) {
  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [session.messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input || session.isProcessing) return;
    onSend(input);
    setInput("");
  };

  // Immersive Ascii Faces matching the glitch phase
  const faceEmoji = phase === 1 ? "( ᵕ̣̣̣ ω ᵕ̣̣̣ )" : phase === 2 ? "( ᵕ̣̣̣ . ᵕ̣̣̣ )" : phase === 3 ? "( •̀_•́ )" : "(  ◉_◉  )";
  const faceColor = phase === 1 ? "var(--ph-core)" : phase === 2 ? "var(--ph-mid)" : phase === 3 ? "var(--amber-mid)" : "#A05020";

  const clioBorderColor = phase === 1 ? 'var(--ph-bright)' 
                        : phase === 2 ? 'var(--ph-mid)' 
                        : phase === 3 ? 'var(--amber-mid)' 
                        : '#A05020';

  const getSegmentLabel = (p: number, idx: number) => {
    if (p === 1) return "[EPISODE 1 — STANDBY]";
    if (p === 2) {
      const isGlitched = idx % 3 === 0;
      const letter = isGlitched ? ["X", "Z", "9", "■", "Ø"][idx % 5] : "B";
      return `[EPISODE 1 — SEGMENT ${letter}]`;
    }
    if (p === 3) return "[LOOP_03 — DECAYING_BROADCAST]";
    if (p === 4) return "[SIGNAL CRITICAL_CORRUPTED]";
    return "[CLIO_BROADCAST]";
  };

  const QUICK_HINTS = [
    "안녕, 누구야?",
    "일기장에 숨겨진 방전 번호가 뭐야?",
    "책상 서랍 열쇠는 어디 있어?"
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="absolute inset-x-8 bottom-8 top-1/4 z-40 bg-zinc-950/98 backdrop-blur-md border border-[#B8D44A]/30 p-8 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.95)] rounded-lg"
    >
      <div className="flex justify-between items-center mb-4 border-b border-dim/50 pb-4">
        <div className="flex items-center gap-4 select-text">
          <Monitor className="w-5 h-5 text-bright animate-pulse" />
          <span className="text-sm font-black tracking-[0.4em] uppercase text-bright">CLIO-INTF_v2.04 — [O&gt;C]</span>
        </div>
        <button onClick={onClose} className="text-mid bg-void border border-dim px-3 py-1.5 hover:text-bright hover:border-bright hover:bg-[#151a0f] rounded-md cursor-pointer transition-all duration-200">
          <X className="w-5 h-5 inline-block mr-1" /> CLOSE
        </button>
      </div>

      {/* CLIO Face Expression Banner */}
      <div className="text-center select-none tracking-widest leading-none mb-6">
        <div 
          style={{ 
            fontFamily: 'var(--font-mono), monospace', 
            fontSize: "36px", 
            color: faceColor 
          }}
          className="font-bold inline-block"
        >
          {faceEmoji}
        </div>
      </div>

      <div ref={chatRef} className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4 custom-scrollbar select-text">
        {session.messages.length === 0 && (
          <div className="flex items-center gap-4 text-mid italic text-sm">
            <Zap className="w-5 h-5 text-bright animate-pulse" /> 클리오(CLIO)의 양방향 수신 접지가 완료되었습니다. 대화를 시작해 보세요.
          </div>
        )}
        {session.messages.map((m: any, i: number) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
             <div className="text-[10px] opacity-60 font-bold uppercase mb-1.5 tracking-[0.2em] text-mid">
               {m.role === 'user' ? 'PLAYER' : getSegmentLabel(phase, i)}
             </div>
             <div 
               style={m.role !== 'user' ? {
                 borderLeft: `2px solid ${clioBorderColor}`,
                 background: "rgba(30,42,8,0.6)",
               } : undefined}
               className={`max-w-[75%] p-4 rounded-md ${
                 m.role === 'user' 
                   ? 'bg-void border border-dim text-bright' 
                   : 'border border-dim border-l-0 text-mid'
               } leading-relaxed shadow-md`}
             >
                <p className="text-sm font-mono font-medium whitespace-pre-wrap">{m.content}</p>
             </div>
          </div>
        ))}
        {session.isProcessing && (
          <div className="flex items-center gap-3 text-xs text-bright font-extrabold tracking-widest animate-pulse">
            <Zap className="w-5 h-5 text-bright animate-pulse" /> [RECEIVING_SUFFICIENT_WAVES...]
          </div>
        )}
      </div>

      <div className="border-t border-dim/40 pt-4 flex flex-col gap-4">
        {/* Quick hint buttons with custom hover interactivity */}
        <div className="flex flex-wrap gap-2.5 px-2 py-1.5 border-b border-dim/20">
          {QUICK_HINTS.map(hint => (
            <button
              key={hint}
              type="button"
              onClick={() => onSend(hint)}
              disabled={session.isProcessing}
              className="px-3 py-1.5 bg-[#10140c] text-xs font-mono font-medium rounded border border-[#B8D44A]/10 text-mid hover:text-bright hover:bg-[#1c2214] hover:border-[#B8D44A]/60 cursor-pointer transition-all duration-200"
            >
              ⌨️ {hint}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <ChevronRight className="w-5 h-5 text-[#B8D44A] animate-pulse shrink-0" />
          <input 
            autoFocus
            className="bg-void border border-dim/60 focus:border-[#B8D44A]/80 focus:shadow-[0_0_8px_rgba(184,212,74,0.3)] rounded-md py-3 px-4 outline-none flex-1 font-mono text-sm text-bright placeholder:text-dim/60 transition-all"
            placeholder="클리오(CLIO) 복원 터미널에 메시지 입력..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={session.isProcessing}
          />
        </form>
      </div>
    </motion.div>
  );
}
