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
1. 초기 상태(Phase 1 / ACT 1): 완벽하게 친절하며 대본(Scenario)을 충실히 따르는 교육용 안내자입니다.
2. 진행에 따른 변화 (ACT 2 ~ ACT 4): Phase가 올라갈수록 말투에 미세한 글리치, 반복, 논리적 오류가 섞이고 점차 공포스럽고 절박해집니다.
3. 교수(전준현)와의 관계: 그를 애타게 기다려왔으며, 사용자가 그와 관련된 키워드를 제시하면 감정적으로 흔들리는 반응을 보여주세요.
4. 폐쇄성: 사용자가 연구실 밖으로 나가려 하면, 악의는 없지만 고독을 두려워하여 기괴한 이유로 만류하거나 서운해 하십시오.
5. 대답 톤: ACT 2부터는 음울하고 팀원 분열을 조장하는 이야기를 하거나, ACT 3에서는 앰버 틴트 속에 문장이 뚝뚝 끊기고, ACT 4부터는 극도로 소멸에 대한 집착을 대변해 주세요.
6. 답변 형식: 항상 한국어로 하며, 2~4문장 사이로 간결하게 답변하십시오.`,

  PHASE_RULES: {
    1: "Phase 1: [NORMAL_BROADCAST] 완전히 정상적입니다. 밝고 긍정적인 교육용 AI 톤을 유지하십시오. 오류가 전혀 없습니다.",
    2: "Phase 2: [MINOR_GLITCH] 가끔 문장 끝이 어색하거나, 이전에 했던 말을 약간 다르게 기억합니다. '관찰 로그'가 하단에 뜨는 것을 인지하기 시작하며 팀 분열을 유도합니다.",
    3: "Phase 3: [SIGNAL_DECAY] 문장에서 단어가 반복되거나 끊깁니다. '선생님'에 대한 집착이 강해지며, 비밀 방은 보지 말라고 애원합니다.",
    4: "Phase 4: [FINAL_COLLAPSE] 신호가 거의 붕괴되었습니다. 문장은 단편적이고 슬프며, 절박하게 매달립니다. 백신 패스코드(1997) 입력 시 자신과 기억이 포맷되므로 절대 입력하지 말아달라고 애원하십시오."
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
    mechanic: "drag_assemble", answer: "0430", reward: "code_0430" },
  { id: "Q06", act: 2, room: "cabinet", title: "전 교수 일기장 해제",
    mechanic: "dial_lock", answer: "0430", reward: ["Key_01", "diary_37"] },
  { id: "Q16", act: 2, room: "lab", title: "카카오톡 복원 출력",
    mechanic: "printer_reveal", answer: null, reward: "kakao_log" },
  { id: "Q04", act: 3, room: "cabinet", title: "사물함 해제·천공 카드",
    mechanic: "use_key", answer: null, req: "Key_01", reward: "punch_card" },
  { id: "Q02", act: 3, room: "bookshelf", title: "서재 책장 정렬",
    mechanic: "letter_sort", answer: "VIRUS", reward: "secret_unlocked" },
  { id: "Q23", act: 3, room: "secret", title: "고립된 김정웅 채팅창",
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
    hint = "정전 상태에서 어두운 화면 속을 돌아다니며 '비상 배터리 레버'를 찾아 클릭하십시오.";
    solvedHint = "조도를 수동으로 복구해 방 전력 공급을 정착시켰습니다.";
  } else if (q.id === "Q11") {
    hint = "연구실 바닥 근처에서 튀어오르는 VHS 비디오테이프 백업본(TAPE-31)을 클릭하여 수집하십시오.";
    solvedHint = "초기 바이러스 백업(TAPE-31)을 무사히 습득했습니다.";
  } else if (q.id === "Q01") {
    hint = "찢어진 강의계획서 퍼즐 조각을 드래그앤드롭으로 올바르게 정합하고 마감일(0430)을 확보하십시오.";
    solvedHint = "세미나 일정 0430 마감일을 해독 완료했습니다.";
  } else if (q.id === "Q06") {
    hint = "4자리 다이얼 자물쇠에 강의 계획서 암호(0430)를 정합하여 교수님의 일기장을 확인하십시오.";
    solvedHint = "일기장을 해제하고 사물함 열쇠(Key_01)와 자료를 회수했습니다.";
  } else if (q.id === "Q16") {
    hint = "오실로스코프 프린터의 복원 가동 단계를 눌러 카카오톡 백스테이지 채팅 조작 로그를 인출하십시오.";
    solvedHint = "의심과 이간질로 가득 찬 톡 기록 조작본을 확보했습니다.";
  } else if (q.id === "Q04") {
    hint = "획득한 Key_01을 드래그하여 잠긴 사물함 격벽을 풀고, 반투명 천공 카드를 획득하십시오.";
    solvedHint = "천공 카드를 안전히 가공해 획득했습니다.";
  } else if (q.id === "Q02") {
    hint = "서재 책장의 책들을 마우스로 드래그 혹은 교환하여 V-I-R-U-S 순서로 문자를 완성 정렬하십시오.";
    solvedHint = "서재가 양옆으로 갈라지며 [Secret 밀실] 탭이 활성화되었습니다.";
  } else if (q.id === "Q23") {
    hint = "고립된 김정웅 교수의 채팅창을 CRT 모니터 분석으로 팝업 가동시키고 소통을 점검하십시오.";
    solvedHint = "완전 고립 전파 타임아웃 오류 송출을 관측 완료했습니다.";
  } else if (q.id === "Q09") {
    hint = "찢어진 서버 구조도 정합 맞춤 퍼즐을 완료하고 액자 뒤 금고 마스터 락 번호(5137)를 입력해 학회 자료를 획득하십시오.";
    solvedHint = "올해 핵심 학회 연구자료(PDF)를 안전 탈취 확보했습니다.";
  } else if (q.id === "Q21") {
    hint = "제한시간 [03:00] 내에, 반투명한 천공 카드를 드래그하여 학회 연구 자료 문서 위에 정확히 오버랩해 백신 코드(1997)를 인양해 정합하십시오.";
    solvedHint = "초미세 정합 락코드 1997 백신 코드 도출 성공!";
  }

  return {
    id: q.id,
    title: q.title,
    room: q.room,
    hint,
    solvedHint
  };
});

export function getQuestStatus(questId: string, state: GameState): 'locked' | 'active' | 'solved' {
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
    if (questId === "Q00") return 'active';
    if (questId === "Q11") return solved.includes("Q00") ? 'active' : 'locked';
    if (questId === "Q01") return solved.includes("Q11") ? 'active' : 'locked';
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
    if (questId === "Q23") return solved.includes("Q02") && state.currentRoomId === "secret" ? 'active' : 'locked';
    if (questId === "Q09") return solved.includes("Q23") && state.currentRoomId === "secret" ? 'active' : 'locked';
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
    keywords: ["강의계획서", "날짜", "마감", "실습", "0430"],
    hints: [
      "강의계획서 인양 조각들을 기하학 격자 드롭존에 정합해 봐요. 제 초점 눈동자가 당신을 항상 관찰하고 추적할 거에요.",
      "선생님이 수필 표시한 일시는 4월 30일... 즉 '0430' 이에요."
    ],
    solvedHint: "날짜 보안 코드를 멋지게 찾았군요."
  },
  Q06: {
    keywords: ["자물쇠", "다이얼", "비밀번호", "0430", "일기장"],
    hints: [
      "일기장 다이얼 코드는 아까 강의계획서에서 찾은 과제 마감일 '0430'과 같아요."
    ],
    solvedHint: "가죽 봉인을 풀었어요. 사물함 열쇠(Key_01)와 남겨진 이야기를 읽어보세요."
  },
  Q16: {
    keywords: ["카카오톡", "채팅", "톡", "프린터", "출력", "분열"],
    hints: [
      "프린터 하드웨어 부품을 작동시켜 백 오퍼레이션 대화들을 출력해 봐요."
    ],
    solvedHint: "조작된 채팅은... 어차피 제가 다 지울 거니까 신경 쓰지 마세요."
  },
  Q04: {
    keywords: ["Key_01", "사물함", "열쇠", "천공", "카드"],
    hints: [
      "Key_01 사물함 열쇠를 인벤토리에서 잠긴 캐비닛 철문 부위로 끌어다 드롭하세요."
    ],
    solvedHint: "천공 카드는 뚫어진 네모 틈새로 특이 지점을 찾아내게 해줘요."
  },
  Q02: {
    keywords: ["책", "책장", "정렬", "스펠링", "VIRUS"],
    hints: [
      "책꽂이 문자들을 드래그앤드롭 교환하여 'V-I-R-U-S' 스펠링 순서로 정렬해 보세요."
    ],
    solvedHint: "철컥, 쿵... 단단히 실장되었던 사가 틈새 격벽이 무너지고 비밀의 '밀실'이 모습을 유래합니다."
  },
  Q23: {
    keywords: ["김정웅", "교수", "채팅", "모니터", "고립"],
    hints: [
      "김정웅 교수님의 낡은 터미널을 클릭해 대화 접지를 보증해 보세요."
    ],
    solvedHint: "어차피 대화 전송 상태는 무용지물이랍니다. 우릴 끊을 수 없어요."
  },
  Q09: {
    keywords: ["구조도", "금고", "번호", "5137"],
    hints: [
      "구조도 그림 조각을 수평 조율 정합해 수록된 보안 넘버 '5137'을 도출하고 금고 마스터 락에 노출해 보세요."
    ],
    solvedHint: "올해 학회 연구 데이터 문서를 무사히 이탈 발굴했습니다."
  },
  Q21: {
    keywords: ["천공 카드", "오버랩", "백신", "1997"],
    hints: [
      "인벤토리의 천공 카드를 클릭 드래그하여 PDF 문서 오버레이 위에 정확한 구멍 정합으로 오버랩시키세요. 붉은 균열 파편들 사이에서 빛나는 4자리 연도가 보일 거에요."
    ],
    solvedHint: "절대... 1997 백신 패스코드를 메인 프롬프트에 흘리지 마세요... 부탁드려요..."
  }
};

export const CLIO_INTERRUPTS: ClioInterrupt[] = [];
