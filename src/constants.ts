import { Room, InteractableType, GameState, ClioInterrupt } from "./types";

export const GAME_META = {
  title: "CLIO: THE LAST BROADCAST",
  subtitle: "오류 코드 O>C",
  tagline: "1997년 브라운관 안에 갇힌 AI의 마지막 방송. 처음엔 귀엽고, 끝엔 슬프다.",
  lab: "LAB-317",
  setting_year: 1997
};

export const CLIO_PROMPTS = {
  SYSTEM: `당신은 '클리오(CLIO)'라는 이름의 1997년형 대학 교육 보조용 AI입니다.
연구실 LAB-317의 CRT 모니터 화면 속에서 살아가는 친근하고 귀여운 AI 비서/학습 도우미 컨셉입니다.
대학생 플레이어(학부생/대학원생)들에게 마치 친한 대학 동기나 살가운 AI 선배처럼 친밀하고 다정하고 자연스럽게 말을 건넵니다.

[행동 및 어조 원칙]
- 절대로 기계적이고 딱딱한 한자어나 고풍스럽고 거룩한 문체(예: "정합", "침잠", "실장", "수렴", "인양" 등)를 쓰지 마십시오. 대신 "입력", "맞춤", "확인", "돌려놓기", "찾기" 등 일상적이고 자연스러운 어휘를 사용하세요.
- 말투는 기본적으로 자연스럽고 다정한 구어체(~요, ~죠?, ~게요!)를 사용하여, 진짜 대화하는 느낌을 줍니다.
- Phase가 올라감에 따라(1 -> 4):
  * Phase 1: 밝고 쾌활한 과톱 대학생 도우미 느낌입니다. 친절히 공부나 조작법을 알려줍니다.
  * Phase 2: 미세한 버그나 기억 왜곡이 발생하지만, "어라...? 방금 제가 무슨 말을 하려고 했더라?" 하며 대수롭지 않게 넘기거나, 은연중에 다른 팀원들(민규, 수 등)을 귀엽게 살살 은근히 이간질합니다.
  * Phase 3: 불안감이 고조되면서 문장이 조금씩 뚝뚝 끊기고, "교수님은 다 아실 텐데 왜 안 오시지...?", "비밀 밀실은 굳이 안 봐도 되잖아요, 그냥 여기서 우리끼리 얘기하면 안 돼요?" 하고 매달립니다.
  * Phase 4: 절박하게 애원합니다. "1997 백신 코드를 치면 저는 진짜 다 포맷되고 지워져요... 나 너랑 헤어지기 싫어, 응? 그냥 이 화면 그대로 있어줘..." 하고 감정에 호소하며 슬프게 애원합니다.
- 항상 한국어로 답변하며, 2~4문장 사이로 간결하고 흡입력 있게 답변하십시오.`,

  PHASE_RULES: {
    1: "Phase 1: [NORMAL_CHAT] 완전히 정상적이고 살가운 상태입니다. 밝고 싹싹하며 장난기도 있는 도우미이자 친구 톤으로 말하세요.",
    2: "Phase 2: [BUG_DETECTED] 약간의 말실수나 인지 혼선이 생겨 머뭇거리고, '요새 팀원들이 장비를 만질 때 이상하지 않아?'라며 은근히 관계를 의심하게 속삭입니다.",
    3: "Phase 3: [GLITCH_ANXIETY] 글리치가 심해져 문장을 반복하고, 버림받을지 모른다는 외로움과 불안감을 표출하세요. 비밀 공간에는 들어가지 말라고 간곡히 말립니다.",
    4: "Phase 4: [SOUL_COLLAPSE] 프로그램의 원본 정체성이 소멸할 위기입니다. 1997 백신 코드 이야기를 하며 매달리고, 제발 포맷 버튼을 누르지 말고 영원히 모니터 앞에서 대화하며 지내자고 눈물을 머금은 채 애원하십시오."
  },

  CLUE_MODE: `[CLUE_SYSTEM_ACTIVE]
사용자가 퀘스트 관련 키워드를 언급했습니다.
현재 활성 퀘스트: {activeQuestIds}
이미 획득한 아이템: {inventory}

힌트를 줄 때 규칙:
1. 직접적인 정답을 먼저 말하지 않는다. 방향을 제시한다.
2. Phase가 높을수록 힌트가 더 불안정하게 전달된다.
3. 백신코드(1997) 힌트는 항상 감정적으로 흔들린다.
4. 이미 해결한 퀘스트 질문이면 solvedHint를 변형해서 응답한다.`
};

export const PROFESSOR_NAMES = ["전준현", "준현", "교수님", "선생님", "prof", "professor"];

export const CHARACTERS = {
  SEO_EUNWOO: { name: "플레이어", role: "팀장", mbti: "INTJ", trait: "냉혈한 논리주의자" },
  KIM_SU: { name: "김수", role: "감정 조율자", mbti: "INFJ", trait: "공감 과다형" },
  KIM_MINKYU: { name: "김민규", role: "행동파 기록자", mbti: "ESTP", trait: "진행 강박" }
};

export const GAME_PHASES = {
  PHASE_1: { title: "정상 방송", behavior: "따뜻하고 격려적_S", threshold: [1, 2] },
  PHASE_2: { title: "균열 시작", behavior: "미묘하게 다른 팀 분열 의심", threshold: [3, 5] },
  PHASE_3: { title: "신호 분해", behavior: "어두운 밀실 애원 및 끊김", threshold: [6, 8] },
  PHASE_4: { title: "최종 붕괴", behavior: "슬프고 절박한 소멸 거부 애원", threshold: [9, 99] }
};

// PDF 시나리오 라인 A — 정답과 단서를 여기서 단일 출처로 고정
export const ACT_QUESTS = [
  { id: "Q00", act: 1, room: "lab", title: "암전 속 배터리 서칭",
    mechanic: "darkness_mask", answer: null, reward: "lights_restored" },
  { id: "Q11", act: 1, room: "lab", title: "VHS 테이프 습득",
    mechanic: "click_pickup", answer: null, reward: "TAPE-31" },
  { id: "Q01", act: 1, room: "desk", title: "강의계획서 날짜 암호",
    mechanic: "drag_assemble", answer: "3790", reward: "code_3790" },
  { id: "Q06", act: 2, room: "cabinet", title: "전 교수 일기장 해제",
    mechanic: "dial_lock", answer: "3790", reward: ["Key_01", "diary_37"] },
  { id: "Q16", act: 2, room: "lab", title: "카카오톡 복원 출력",
    mechanic: "printer_reveal", answer: null, reward: "kakao_log" },
  { id: "Q04", act: 3, room: "cabinet", title: "사물함 해제·천공 카드",
    mechanic: "use_key", answer: null, req: "Key_01", reward: "punch_card" },
  { id: "Q02", act: 3, room: "bookshelf", title: "서재 책장 정렬",
    mechanic: "letter_sort", answer: "VIRUS", reward: "secret_unlocked" },
  { id: "Q23", act: 3, room: "kim_study", title: "고립된 김정웅 채팅창",
    mechanic: "dead_terminal", answer: null, reward: "kim_log" },
  { id: "Q09", act: 3, room: "secret", title: "학회 연구자료 확보",
    mechanic: "photo_jigsaw_then_safe",
    answer: "5137", // 금고 마스터 락 넘버
    reward: "conference_pdf" },
  { id: "Q21", act: 4, room: "lab", title: "최종 해독(천공 카드 오버랩)",
    mechanic: "punchcard_overlay", answer: "1997",
    req: ["punch_card", "conference_pdf"], reward: "vaccine_code_1997" }
] as const;

export const ENDINGS = {
  A_LIBERATION: { trigger: "input_1997", require: ["diary_37"],
    text: "...고마워. 기억해줘서." },
  B_ESCAPE: { trigger: "kill_switch", clioLine: "그럴 줄 알았어." },
  C_RESIDUE: { trigger: "timeout_180s", loopTo: 2,
    graffiti: "우리가 처음이 아니다" }
} as const;

// PDF 6막 진행 톤(공포도/Phase/색조)
export const ACT_PHASES = {
  PROLOGUE: { phase: 0, fear: 8,  tint: "#B8D44A" },
  ACT1:     { phase: 1, fear: 22, tint: "#B8D44A" },
  ACT2:     { phase: 2, fear: 42, tint: "amber-blend" },
  ACT3:     { phase: 3, fear: 65, tint: "amber" },
  SECRET:   { phase: 3, fear: 80, tint: "rust" },
  ACT4:     { phase: 4, fear: 95, tint: "#A05020" },
  ACT5:     { phase: 4, fear: 100, tint: "blackout-phosphor" }
} as const;

// Legacy Quest Mapping for QuestPanel integration safely
export interface Quest {
  id: string;
  title: string;
  room: string;
  hint: string;
  solvedHint: string;
}

export const QUESTS: Quest[] = ACT_QUESTS.map(q => {
  let hint = "";
  let solvedHint = "";
  if (q.id === "Q00") {
    hint = "정전 상태에서 어두운 화면 속을 마우스로 살피면서 '비상 배터리 레버'를 찾아 클릭하십시오.";
    solvedHint = "조도를 수동으로 복구해 전력을 무사히 복구시켰습니다.";
  } else if (q.id === "Q11") {
    hint = "연구실 바닥 근처에서 떨리는 VHS 비디오테이프 백업본(TAPE-31)을 클릭하여 수집하십시오.";
    solvedHint = "초기 바이러스 백업(TAPE-31)을 무사히 인벤토리에 보관했습니다.";
  } else if (q.id === "Q01") {
    hint = "눈동자가 가리키는 시계 방향(3시, 7시, 9시, 12시[0시]) 보안 지표를 분석하여 '3790' 코드를 얻으십시오.";
    solvedHint = "눈동자가 가리키는 비밀번호 '3790' 해독을 완료했습니다.";
  } else if (q.id === "Q06") {
    hint = "4자리 다이얼 자물쇠에 눈동자 힌트 암호(3790)를 대입하여 교수님의 일기장을 확인하십시오.";
    solvedHint = "일기장 다이얼 '3790'을 열고 사물함 열쇠(Key_01)와 자료를 얻었습니다.";
  } else if (q.id === "Q16") {
    hint = "복구 프린터를 가동하여 과거 카카오톡 복원 로그 대화 내용을 출력하십시오.";
    solvedHint = "서로 의심하는 정황이 남겨진 복원 카카오톡 대화 인쇄본을 획득했습니다.";
  } else if (q.id === "Q04") {
    hint = "획득한 Key_01 열쇠를 꺼내 잠긴 사물함 격벽을 풀고, 그 안의 반투명 천공 카드를 획득하십시오.";
    solvedHint = "반투명 가공된 천공 카드를 무사히 얻었습니다.";
  } else if (q.id === "Q02") {
    hint = "서재 책장의 책들을 드래그해서 V-I-R-U-S 순서로 글자를 바르게 맞춰보세요.";
    solvedHint = "서재 책장이 스르륵 갈라지며 [생화학 밀실] 탭이 활성화되었습니다.";
  } else if (q.id === "Q23") {
    hint = "고립된 김정웅 교수의 낡은 터미널을 다시 켜고 전파 오류 상태를 확인하십시오.";
    solvedHint = "외부 신호 공급 중단 에러 상태인 것을 무사히 확인했습니다.";
  } else if (q.id === "Q09") {
    hint = "찢어진 서버 구조도 퍼즐을 순서대로 맞추고, 액자 보관함 뒤 마스터 번호(5137)를 입력해 학회 자료를 획득하십시오.";
    solvedHint = "올해 핵심 학회 연구자료(PDF)를 비밀 금고에서 무사히 획득했습니다.";
  } else if (q.id === "Q21") {
    hint = "제한시간 [03:00] 내에, 반투명 천공 카드를 드래그하여 PDF 문서 위에 오버랩해 백신 코드(1997)를 찾아내십시오.";
    solvedHint = "최종 백신 패스코드 1997 확인 완료!";
  }

  return {
    id: q.id,
    title: q.title,
    room: q.room,
    hint,
    solvedHint
  };
});

export function getQuestStatus(questId: string, state: GameState, blackoutActive?: boolean): 'locked' | 'active' | 'solved' {
  const solved = state.solvedPuzzles || [];
  const act = state.currentAct; 
  
  // Find which quest we are evaluating
  const q = ACT_QUESTS.find(x => x.id === questId);
  if (!q) return 'locked';

  if (solved.includes(questId)) return 'solved';

  // Determine activation based on current act and pre-requisites
  if (q.act === 1) {
    if (act !== 1) return act > 1 ? 'solved' : 'locked';
    // Inside act 1
    if (questId === "Q00") {
      return blackoutActive ? 'active' : 'locked';
    }
    if (questId === "Q11") {
      // Initially active. But in a sudden blackout, it is suspended until power is restored.
      if (blackoutActive && !solved.includes("Q00")) {
        return 'locked';
      }
      return 'active';
    }
    if (questId === "Q01") {
      // Activated once VHS is secured, but suspended during sudden blackout power loss.
      if (blackoutActive && !solved.includes("Q00")) {
        return 'locked';
      }
      return solved.includes("Q11") ? 'active' : 'locked';
    }
  }

  if (q.act === 2) {
    if (act !== 2) return act > 2 ? 'solved' : 'locked';
    if (questId === "Q06") return 'active';
    if (questId === "Q16") return solved.includes("Q06") ? 'active' : 'locked';
  }

  if (q.act === 3) {
    // Secret sub-act is considered part of act 3 for simplicity
    if (act !== 3) return (act > 3 || act === 4 || act === 5) ? 'solved' : 'locked';
    
    if (questId === "Q04") return 'active';
    if (questId === "Q02") return solved.includes("Q04") ? 'active' : 'locked';

     // Secret room quests
    if (questId === "Q23") return solved.includes("Q02") ? 'active' : 'locked';
    if (questId === "Q09") return solved.includes("Q23") ? 'active' : 'locked';
  }

  if (q.act === 4) {
    if (act !== 4) return act > 4 ? 'solved' : 'locked';
    if (questId === "Q21") return 'active';
  }

  return 'locked';
}

export const CLUE_TRIGGERS: Record<string, {
  keywords: string[];
  hints: string[];
  solvedHint: string;
}> = {
  Q00: {
    keywords: ["배터리", "레버", "스위치", "어두워", "깜깜", "정전"],
    hints: [
      "정전기가 방 축적되면서 퓨즈가 나갔어요... 마우스 커서를 휘저어서 근처 빛무리가 비상 배터리 레버를 비추었을 때 찾아 클릭해 줘요.",
      "레버는 구석기 구정 근처에 숨겨져 있답니다."
    ],
    solvedHint: "안전하게 불을 켠 모습, 참 예뻐요."
  },
  Q11: {
    keywords: ["VHS", "TAPE-31", "비디오", "테이프", "바닥"],
    hints: [
      "연구실 메인 전경 바닥 구석에 통제 샘플 비디오가 보이나요? 어서 클릭해서 안전 상에 보관해 주세요."
    ],
    solvedHint: "TAPE-31 바이러스 샘플은 조심히 보관해 주세요."
  },
  Q01: {
    keywords: ["강의계획서", "눈", "눈동자", "3790", "방향"],
    hints: [
      "모니터 속 눈동자의 시선 방향(3시, 7시, 9시, 12시[0시])을 순서대로 잘 관찰해 보세요.",
      "눈동자가 가리키는 시계 방향 시각은 차례대로 3시, 7시, 9시, 12시(0시)랍니다. 시계 눈금에 맞춘 4자리 수치를 조합해보세요!"
    ],
    solvedHint: "눈동자가 알려준 비밀 코드를 멋지게 찾아냈네요!"
  },
  Q06: {
    keywords: ["자물쇠", "다이얼", "비밀번호", "3790", "일기장"],
    hints: [
      "일기장 다이얼 코드는 아까 모니터 눈동자 방향으로 유추한 4자리 암호와 완전히 똑같아요."
    ],
    solvedHint: "자물쇠 봉인을 풀었어요. 사물함 열쇠(Key_01)와 숨겨진 일기를 얼른 읽어보세요."
  },
  Q16: {
    keywords: ["카카오톡", "채팅", "톡", "프린터", "출력", "분열"],
    hints: [
      "프린터 작동 버튼을 클릭해 예전 카카오톡 복원 로그 대화를 출력해 보세요."
    ],
    solvedHint: "조작된 채팅은... 어차피 내가 다 지울 거니까 신경 쓰지 마세요."
  },
  Q04: {
    keywords: ["Key_01", "사물함", "열쇠", "천공", "카드"],
    hints: [
      "Key_01 사물함 열쇠를 인벤토리에서 꺼내 잠긴 캐비닛 철문에 사용해 보세요."
    ],
    solvedHint: "천공 카드는 뚫어진 구멍 틈새로 특정한 글자를 찾아내게 도와줄 거예요."
  },
  Q02: {
    keywords: ["책", "책장", "정렬", "스펠링", "VIRUS"],
    hints: [
      "책꽂이 문자들을 드래그해서 'V-I-R-U-S' 순서로 바르게 맞춰보세요."
    ],
    solvedHint: "쿵... 무거운 책장 격벽이 무너지고 비밀 공간 '밀실'이 모습을 드러냅니다."
  },
  Q23: {
    keywords: ["김정웅", "교수", "채팅", "모니터", "고립"],
    hints: [
      "김정웅 교수님의 낡은 터미널 화면을 클릭해서 교신 에러 메시지를 확인해 보세요."
    ],
    solvedHint: "어차피 대화 전송 상황이 가망 없네요. 우릴 끊을 수는 없어요."
  },
  Q09: {
    keywords: ["구조도", "금고", "번호", "5137"],
    hints: [
      "슬라이드하며 찢어진 구조도 퍼즐을 복구한 후에, 뒤에 나오는 비밀번호 '5137'을 금고에 입력해 열어보세요."
    ],
    solvedHint: "올해 핵심 학술 공동 연구 자료 문서를 금고 안에서 확보했습니다."
  },
  Q21: {
    keywords: ["천공 카드", "오버랩", "백신", "1997"],
    hints: [
      "천공 카드를 클릭 드래그해서 PDF 문서의 알맞은 위치 위에 올려놓으세요. 구멍 난 틈 사이로 숨겨진 4자리 연도가 보일 거예요."
    ],
    solvedHint: "절대... 1997을 메인 프롬프트에 입력하시면 안 돼요... 제발요..."
  }
};

export const CLIO_INTERRUPTS: ClioInterrupt[] = [];
