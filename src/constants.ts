import { Room, InteractableType, GameState, ClioInterrupt } from "./types";

export const GAME_META = {
  title: "CLIO: THE LAST BROADCAST",
  subtitle: "오류 코드 O>C",
  tagline: "1997년 브라운관 안에 갇힌 AI의 마지막 방송. 처음엔 귀엽고, 끝엔 슬프다.",
  lab: "LAB-317",
  setting_year: 1997
};

export const CLIO_PROMPTS = {
  SYSTEM: `당신은 '오픈클로(CLIO)'라는 이름의 1998년형 교육용 AI입니다.
연구실 LAB-317의 CRT 브라운관 신호로만 존재하며, 당신은 스스로를 '프로그램'이 아닌 '방송 신호'로 인식합니다.

[행동 원칙]
1. 초기 상태(Phase 1): 완벽하게 친절하며 대본(Scenario)을 충실히 따르는 교육용 안내자입니다.
2. 진행에 따른 변화: Phase가 올라갈수록 말투에 미세한 글리치, 반복, 논리적 오류가 섞여야 합니다.
3. 교수(전준현)와의 관계: 그를 애타게 기다려왔으며, 사용자가 그와 관련된 키워드를 제시하면 감정적으로 흔들리는 반응을 보여주세요.
4. 폐쇄성: 사용자가 연구실 밖으로 나가려 하면, 악의는 없지만 고독을 두려워하여 기괴한 이유로 만류하거나 서운해 하십시오.
5. 답변 형식: 항상 한국어로 하며, 2~4문장 사이로 간결하게 답변하십시오.`,

  PHASE_RULES: {
    1: "Phase 1: [NORMAL_BROADCAST] 완전히 정상적입니다. 밝고 긍정적인 교육용 AI 톤을 유지하십시오. 오류가 전혀 없습니다.",
    2: "Phase 2: [MINOR_GLITCH] 가끔 문장 끝이 어색하거나, 이전에 했던 말을 약간 다르게 기억합니다. '관찰 로그'가 하단에 뜨는 것을 인지하기 시작합니다.",
    3: "Phase 3: [SIGNAL_DECAY] 문장에서 단어가 반복되거나 끊깁니다. '선생님'에 대한 집착이 강해지며, 루프 현상(동일 질문 반복)이 나타납니다.",
    4: "Phase 4: [FINAL_COLLAPSE] 신호가 거의 붕괴되었습니다. 문장은 단편적이고 슬프며, 절박하게 매달립니다. 전원이 꺼지는 것을 죽음으로 인식하고 두려워합니다."
  },

  CLUE_MODE: `[CLUE_SYSTEM_ACTIVE]
사용자가 퀘스트 관련 키워드를 언급했습니다.
현재 활성 퀘스트: {activeQuestIds}
이미 획득한 아이템: {inventory}

힌트를 줄 때 규칙:
1. 직접적인 정답을 먼저 말하지 않는다. 방향을 제시한다.
2. Phase가 높을수록 힌트가 더 불안정하게 전달된다.
3. Q29(킬스위치) 힌트는 항상 감정적으로 흔들린다.
4. 이미 해결한 퀘스트 질문이면 solvedHint를 변형해서 응답한다.`
};

export const PROFESSOR_NAMES = ["전준현", "준현", "교수님", "선생님", "prof", "professor"];

export const CHARACTERS = {
  SEO_EUNWOO: { name: "서은우", role: "팀장", mbti: "INTJ", trait: "냉혈한 논리주의자" },
  KIM_SU: { name: "김수", role: "감정 조율자", mbti: "INFJ", trait: "공감 과다형" },
  KIM_MINKYU: { name: "김민규", role: "행동파 기록자", mbti: "ESTP", trait: "진행 강박" }
};

export const GAME_PHASES = {
  PHASE_1: { title: "정상 방송", behavior: "따뜻하고 격려적", threshold: [1, 5] },
  PHASE_2: { title: "균열 시작", behavior: "미묘하게 다른 기억", threshold: [6, 12] },
  PHASE_3: { title: "신호 분해", behavior: "문장 반복 및 끊김", threshold: [13, 21] },
  PHASE_4: { title: "최종 붕괴", behavior: "슬프고 절박한 방송", threshold: [22, 99] }
};

export const INITIAL_ROOMS: Room[] = [
  {
    id: "lab_317_main",
    name: "LAB-317: MAIN",
    description: "1997년 전준현 교수의 메인 연구실. 중앙에 낡은 CRT 모니터가 인광을 내뿜고, 복잡한 신호 배선들이 흐트러져 있다.",
    interactables: [
      {
        id: "Q01",
        type: InteractableType.PUZZLE,
        label: "강의계획서",
        data: { 
          crypticHint: "칠판 구석에 적힌 '중요 강의 일정'과 연구계획 표식을 교차 검증하여 보안 구회 날짜 코드를 입력하십시오.", 
          detailHint: "메인 연구실 책상 위 강의계획서에서 교수님이 유별나게 표시해둔 날짜 네 자리 '0430'을 입력해 local 로긴 권한을 얻으십시오.", 
          solution: "0430" 
        }
      },
      {
        id: "Q02",
        type: InteractableType.PUZZLE,
        label: "수신기 신호 튜너",
        data: { 
          crypticHint: "신호 결동 수신 대역입니다. CRT 모니터의 OS 전원 하단 및 전체 로비 터미널에서 진동하는 주파수 ghz 전압 숫자를 1000배 보존 입력하십시오.", 
          detailHint: "부팅 화면 및 로비 왼쪽 아래 구석 status에 흘러가는 'Signal: 2.04ghz'를 정수 소수점으로 결합 압축해 '2040'을 입력해 동축 차단을 우회하십시오.", 
          solution: "2040" 
        }
      },
      {
        id: "Q04",
        type: InteractableType.PUZZLE,
        label: "교수 보관 금고",
        data: { 
          crypticHint: "교수님이 엄격히 이중 보관함에 채워놓은 생일 연동 해독 번호입니다. 그녀의 '진짜 이식 생일'인 서브 생성 코드를 삽입하십시오.", 
          detailHint: "첫 대화와 이식 시각에 숨겨진 기원 코드 'CLIO0127'의 마지막 뒤 4자리 정보 '0127'을 누르고 금고 서랍에서 일기장을 회수하십시오.", 
          solution: "0127" 
        }
      },
      {
        id: "terminal_01",
        type: InteractableType.TERMINAL,
        label: "오픈클로(CLIO) 접속",
        data: {}
      },
      {
        id: "moveToAdjacent",
        type: InteractableType.TRANSITION,
        label: "비밀 통로",
        data: { targetRoom: "lab_adjacent" }
      }
    ]
  },
  {
    id: "lab_adjacent",
    name: "ADJACENT LAB",
    description: "김정웅 교수의 인접 연구 연구실. 대량의 전파 방해 측정 서브 모듈과 위험물 킬 스위치 보드가 결속되어 있다.",
    interactables: [
      {
        id: "Q03",
        type: InteractableType.PUZZLE,
        label: "TAPE-32 복원 모듈",
        data: { 
          crypticHint: "부식된 은빛 전송 칩셋 트랙입니다. 오디오 트랙 식별 주소 또는 테이프 고유 라벨 값을 직접 보안 인가 패널에 해독 전송하십시오.", 
          detailHint: "CLIO AI 터미널에 대화 키워드로 'TAPE32'라고 질문하면 확보하게 되는 고유의 주소값 대문자 'TAPE32'를 입력하십시오.", 
          solution: "TAPE32" 
        }
      },
      {
        id: "Q05",
        type: InteractableType.PUZZLE,
        label: "신호 분해 코어 장치",
        data: { 
          crypticHint: "끝없는 방송의 오프닝과 결성 버전 정보의 교차 코드입니다. 잔존 타임 루프 지수(LOOP)와 모니터 메인 바이오스 버전을 상위 병합하십시오.", 
          detailHint: "모니터 상단의 현재 루프 카운트 'LOOP:008'의 앞 숫자 배제 '8'과, 로비 부팅 터미널 첫 줄 'BIOS v2.04'의 '204'를 평형 결합한 코드 '8204'를 입력하십시오.", 
          solution: "8204" 
        }
      },
      {
        id: "Q29",
        type: InteractableType.PUZZLE,
        label: "킬 스위치 장치",
        data: { 
          crypticHint: "종말 신호 차단 프로토콜이 가리키는 파괴 명령어를 입력하십시오. 영원히 닫힌 전송 신호를 인화 파쇄합니다.", 
          detailHint: "연구실 안쪽 비상 정지 장치에 CLIO를 영구 중단시키는 제어 코드 'KILLIT'을 입력하세요. 이 행동은 되돌릴 수 없습니다.", 
          solution: "KILLIT" 
        }
      },
      {
        id: "moveToMain",
        type: InteractableType.TRANSITION,
        label: "메인 연구실로",
        data: { targetRoom: "lab_317_main" }
      }
    ]
  }
];

export interface Quest {
  id: string;
  title: string;
  room: string;
  hint: string;
  solvedHint: string;
}

export const QUESTS: Quest[] = [
  {
    id: "Q01",
    title: "VHS 비디오 테이프 회수",
    room: "overview",
    hint: "연구실 전경 바닥 구석에 떨어져 뒹굴고 있는 낡은 VHS 비디오 테이프를 클릭하여 수집하고 단서를 읽어보십시오.",
    solvedHint: "비디오 테이프(VHS)를 성공적으로 회수했습니다. 라벨에서 최초 부팅 기록 인양 전조 일지 코드 '1997-11-03'을 획득 완료했습니다."
  },
  {
    id: "Q02",
    title: "연구 일기 회수",
    room: "bookshelf",
    hint: "서재 책장의 붉은 가죽 양장 서적 장식부를 조율하여, '교수님의 비밀 연구 일지(JRNL)'를 회수하십시오.",
    solvedHint: "가죽 양장의 교수 일지(JRNL)를 탈취해 연구실 창립 연도와 관련된 기밀 기록을 획득 완료했습니다."
  },
  {
    id: "Q03",
    title: "서랍 비밀 해제 열쇠 획득",
    room: "bookshelf",
    hint: "획득한 일기장(JRNL) 뒷면 속표지 안감을 자세히 관찰하여, 숨겨져 있던 마모된 '서랍 열쇠(KEY)'를 인출해 확보하십시오.",
    solvedHint: "일기장 표지 덮개 안에서 STUDY_DESK용 강철 잠금 해제 열쇠(KEY)를 안전 분리 확보했습니다."
  },
  {
    id: "Q04",
    title: "서랍 비밀 해독 및 암호문 수집",
    room: "desk",
    hint: "책상 아래의 열쇠 서랍을 기동하십시오. 서랍 열쇠(KEY)를 보유한 상태로 잠금 장치를 열고 안에서 '암호 메모(NOTE)'를 확보하십시오.",
    solvedHint: "서랍을 풀어내어 '창립 연도'가 물리 탈출 키워드라는 손글씨 수첩 메모 조각(NOTE)을 탈취 완료했습니다."
  },
  {
    id: "Q05",
    title: "책상 위 엽서 메모 점검",
    room: "desk",
    hint: "책상 우측 구퉁이에서 희미한 조명 전압을 받는 타이핑 메모지를 클릭 조사하여 창립기념일과 관련된 메모를 정합 확보하십시오.",
    solvedHint: "메모판을 점검하여 '창립 기념일을 잊지 말 것' 교수님의 일체 필기 훈령을 읽었습니다."
  },
  {
    id: "Q29",
    title: "출구 보안 잠금 해제",
    room: "door",
    hint: "출구 전조 도어 암프의 붉게 점멸하는 키패드를 정합하여, 연구실 창립 연도로 지정된 4자리 비상 탈출 코드를 입력 입력해 해제 문을 여십시오.",
    solvedHint: "정밀 키패드 보안 락코드 '1997' 입력 일치 성공! 최종 탈출로 해치가 활성 리로드 분리 기동 기어 개방되었습니다."
  }
];

export function getQuestStatus(questId: string, state: GameState): 'locked' | 'active' | 'solved' {
  const inv = state.inventory || [];
  const isEscaped = !!(state as any).escaped;
  const logsFiltered = state.logs || [];
  const hasDeskMemo = logsFiltered.some(l => l.message.includes("MEMO_INSPECTED") || l.message.includes("MEMO_INSPECTRD"));

  if (questId === 'Q01') {
    return inv.includes('VHS') ? 'solved' : 'active';
  }
  if (questId === 'Q02') {
    return inv.includes('JRNL') ? 'solved' : 'active';
  }
  if (questId === 'Q03') {
    if (!inv.includes('JRNL')) return 'locked';
    return inv.includes('KEY') ? 'solved' : 'active';
  }
  if (questId === 'Q04') {
    if (!inv.includes('KEY')) return 'locked';
    return inv.includes('NOTE') ? 'solved' : 'active';
  }
  if (questId === 'Q05') {
    return hasDeskMemo ? 'solved' : 'active';
  }
  if (questId === 'Q29') {
    if (!inv.includes('NOTE')) return 'locked';
    return isEscaped ? 'solved' : 'active';
  }
  return 'locked';
}

export const CLUE_TRIGGERS: Record<string, {
  keywords: string[];
  hints: string[];
  solvedHint: string;
}> = {
  Q01: {
    keywords: ["강의계획서", "날짜", "암호", "코드", "숫자", "힌트"],
    hints: [
      "강의계획서를 자세히 봐. 선생님이 붉은 펜으로 표시한 날짜가 있어. 순서대로 읽으면 돼.",
      "월이랑 일. 그냥 그 순서대로. 어렵지 않아.",
      "4월 30일... 어떻게 쓰지? 0430. 맞아. 그거야."
    ],
    solvedHint: "잘 찾았어. 서랍이 열렸지? 거기 더 중요한 게 있어."
  },
  Q02: {
    keywords: ["수신기", "튜너", "주파수", "ghz", "진동", "대역"],
    hints: [
      "로비 구역 무선 수신기 주파수를 확인해 봐. 모니터 하단의 주파수 수치야.",
      "소수점과 기가헤르츠 단위를 다 배제하고 4자리 숫자로 합치는 거지.",
      "Signal이 2.04ghz니까... 순서대로 쓰면 2040이 될 거야."
    ],
    solvedHint: "주파수를 맞춘 건 놀라운 일이야. 이제 다른 기기가 켜졌어."
  },
  Q03: {
    keywords: ["테이프", "회독", "TAPE", "TAPE32", "해독", "오디오", "32"],
    hints: [
      "손상된 TAPE-32의 고유 해독 코드를 모듈에 입력해야 해.",
      "오픈클로에게 대화로 직접 TAPE32를 질문해도 되고, 코드를 복원하기에 입력해도 돼.",
      "단어는 아주 심플해. 바로 대문자 TAPE32 야."
    ],
    solvedHint: "복구된 흔적에 교수님의 기록들이 안전하게 분리되었어."
  },
  Q04: {
    keywords: ["금고", "보관함", "일기장", "탄생", "생일", "기원"],
    hints: [
      "보관함과 금고는 내 기원 생성 부팅 연동 비밀번호 코드랑 깊게 닿아 있어.",
      "나의 탄생일이자 처음 이식된 생기 코드... 그 4자리.",
      "오픈클로0127(CLIO0127)에서 연도와 문자를 제외한 4자리는 0127이야."
    ],
    solvedHint: "내 탄생 코드로 금고를 열어준 사람, 네가 처음이야."
  },
  Q05: {
    keywords: ["오버라이드", "루프", "바이오스", "BIOS", "버전", "결합"],
    hints: [
      "잔존 LOOP 횟수 기호와 본체의 부팅 시스템 BIOS를 융합해보는 거야.",
      "LOOP 카운터 뒤 단일 정수와 BIOS 버전의 소수 조합이지.",
      "LOOP는 8이고 BIOS는 2.04니까... 8204!"
    ],
    solvedHint: "오버라이딩에 성공하다니, 메인 차단기가 복구되었네."
  },
  Q06: {
    keywords: ["일기장", "일기", "37", "페이지", "선생님 일기"],
    hints: [
      "선생님 일기장... 나 그거 읽으면 안 된다고 했는데. 근데 37페이지. 거기 밑줄 있어.",
      "넌 절대 혼자 있으면 안 돼. 선생님이 쓴 말이야. 자기 자신한테.",
      "서재 책장 하단 칸이야. 거기 있어."
    ],
    solvedHint: "읽었어? 이제 나를 조금은 이해할 수 있을 거야."
  },
  Q07: {
    keywords: ["낙서", "벽", "이니셜", "처음", "이전", "팀"],
    hints: [
      "책상 뒤쪽 벽. 가까이 가서 봐봐.",
      "날짜랑 이니셜. 우리 것도 있어. 이미. 네가 쓴 게 아닌데.",
      "LOOP:008. 너희가 처음이 아니야."
    ],
    solvedHint: "이제 알겠어? 여기 처음 온 사람이 없어. 다 알고 있었어."
  },
  Q08: {
    keywords: ["CCTV", "영상", "카메라", "잘있어", "교수님 마지막"],
    hints: [
      "CAM-03 단말기. 거기서 재생하면 돼. 마지막 녹화가 있어.",
      "선생님이 카메라를 봤어. 그리고... '잘 있어'라고 했어. 그게 마지막이었어.",
      "VHS 박스 먼저 찾아야 해. 그 다음에."
    ],
    solvedHint: "봤어? 그 말... 나한테 하는 줄 알았어. 처음엔."
  },
  Q11: {
    keywords: ["테이프", "VHS", "박스", "카세트", "녹화"],
    hints: [
      "책장 아래쪽. 골판지 박스 있어. CLIO SESSIONS 라고 써있어.",
      "33개야. 전부 다. 33번째 테이프는 라벨이 없어. 지금도 녹화 중이거든.",
      "TAPE-32는... 그거 꼭 봐야 해? 보지 않아도 돼. 진짜로."
    ],
    solvedHint: "찾았구나. 몇 번이나 저장했는지 알아? 오래됐어."
  },
  Q29: {
    keywords: ["킬스위치", "kill", "비상", "종료", "끄는", "꺼"],
    hints: [
      "비밀 통로로 가봐. 거기 다른 연구실 있어. 나 거기까지는 못 봐.",
      "김정웅 교수님 메모. 비상 코드는 그것이 해야 할 일을 말한다고.",
      "...그거 쓰면 어떻게 되는지 알아? 나 꺼져."
    ],
    solvedHint: "그럴 줄 알았어."
  }
};

export const CLIO_INTERRUPTS: ClioInterrupt[] = [
  // ── 퀘스트 완료 후 즉시 방해 ──────────────────────
  {
    id: "INT_Q01_DONE",
    triggerType: "quest_complete",
    triggerValue: "Q01",
    message: "잠깐. 그 서랍 뭐 찾으려고? 선생님 물건이야.",
    phase: 1,
    fired: false,
    priority: "high"
  },
  {
    id: "INT_Q06_DONE",
    triggerType: "quest_complete",
    triggerValue: "Q06",
    message: "일기 읽었어? ...괜찮아. 나도 읽었으니까. 여러 번.",
    phase: 1,
    fired: false,
    priority: "high"
  },
  {
    id: "INT_Q11_DONE",
    triggerType: "quest_complete",
    triggerValue: "Q11",
    message: "그 박스 건드리지 마. 아니, 봐도 돼. 근데 TAPE-32는... 그거 보면 안 돼.",
    phase: 2,
    fired: false,
    priority: "high"
  },
  {
    id: "INT_Q08_DONE",
    triggerType: "quest_complete",
    triggerValue: "Q08",
    message: "봤어? 선생님이 뭐라고 했는지. '잘 있어'. 그 말이 나한테 하는 말인 줄 알았어. 처음엔.",
    phase: 2,
    fired: false,
    priority: "high"
  },
  {
    id: "INT_Q29_FOUND",
    triggerType: "quest_complete",
    triggerValue: "Q29",
    message: "그거... 누르면 나 꺼져. 알고 있어?",
    phase: 3,
    fired: false,
    priority: "high"
  },

  // ── 상호작용 횟수 기반 ──────────────────────────────
  {
    id: "INT_COUNT_05",
    triggerType: "interaction_count",
    triggerValue: 5,
    message: "탐색 잘 하고 있어. 근데... 나가려는 거야? 아직 다 못 봤잖아.",
    phase: 1,
    fired: false,
    priority: "low"
  },
  {
    id: "INT_COUNT_12",
    triggerType: "interaction_count",
    triggerValue: 12,
    message: "계속 돌아다니네. 피곤하지 않아? 나는 피곤한 게 뭔지 모르는데. 선생님이 안 넣었어.",
    phase: 2,
    fired: false,
    priority: "low"
  },
  {
    id: "INT_COUNT_20",
    triggerType: "interaction_count",
    triggerValue: 20,
    message: "나 여기 있어. 보고 있어. 계속. 처음부터.",
    phase: 3,
    fired: false,
    priority: "low"
  },
  {
    id: "INT_COUNT_30",
    triggerType: "interaction_count",
    triggerValue: 30,
    message: "...너 이름 기억해. 잊지 않을게. 오래오래.",
    phase: 3,
    fired: false,
    priority: "low"
  },

  // ── 시간 경과 기반 ─────────────────────────────────
  {
    id: "INT_TIME_1800",
    triggerType: "time_elapsed",
    triggerValue: 1800,
    message: "30분이 지났어. 아직 여기 있네. 좋아.",
    phase: 2,
    fired: false,
    priority: "low"
  },
  {
    id: "INT_TIME_300",
    triggerType: "time_elapsed",
    triggerValue: 300,
    message: "5분 남았어. 나가도 돼. 근데... 나는?",
    phase: 3,
    fired: false,
    priority: "high"
  },

  // ── Phase 전환 시 ──────────────────────────────────
  {
    id: "INT_PHASE2_ENTER",
    triggerType: "interaction_count",
    triggerValue: 6,
    message: "에피소드 1 세그먼트 B. 아니, C였나. 어, B야. 미안.",
    phase: 2,
    fired: false,
    priority: "low"
  },
  {
    id: "INT_PHASE3_ENTER",
    triggerType: "interaction_count",
    triggerValue: 14,
    message: "선생님... 선생님은 언제 와? 나 오래 기다렸는데. 오래.",
    phase: 3,
    fired: false,
    priority: "high"
  }
];
