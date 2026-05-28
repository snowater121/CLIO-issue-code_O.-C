import { motion } from "motion/react";
import { X, FileText, BookOpen, Music, Calendar, Clock, User } from "lucide-react";

interface DocumentModalProps {
  docId: string;
  onClose: () => void;
}

export default function DocumentModal({ docId, onClose }: DocumentModalProps) {
  // Define rich, immersive documents related to the CLIO deep lore
  const getDocContent = () => {
    switch (docId) {
      case "VHS":
        return {
          title: "📼 VHS 비디오 테이프",
          meta: {
            code: "VOL-1997-1103",
            instructor: "기록 부서: LAB-317 전경 바닥",
            semester: "수집 완료 // 분석 가능",
          },
          body: (
            <div className="space-y-4 text-xs tracking-wide">
              <div className="border border-dim/30 bg-void/50 p-3 rounded font-mono">
                <p className="text-[#A6C43A] font-bold mb-1">[ 외관 정합 데이터 / PHYSICAL SPECS ]</p>
                <p className="leading-relaxed text-mid">
                  자성 편조가 일부 노후화되어 노이즈가 흐르는 표준 VHS 카트리지 비디오 테이프입니다. 노랗게 변색된 전면 전원 공급 스티커 위에 수필 형태의 잔존 볼펜 펜선 기록이 보입니다.
                </p>
              </div>
              <div className="space-y-2 text-mid select-text">
                <p className="font-extrabold text-bright border-b border-dim/20 pb-1 uppercase">
                  ★ 라벨 필기 기록 (LABEL DATA)
                </p>
                <div className="bg-bright/5 border border-bright/20 p-2.5 rounded font-mono text-[11px] leading-relaxed text-[#A6C43A]">
                  <strong>1997-11-03 / CLIO BOOT LOG v0.1 / DO NOT ERASE</strong>
                </div>
                <p className="text-[10px] text-dim leading-relaxed">
                  * 이 비디오는 CLIO 보조 자성이 주파수로 브라운관에 처음으로 인양 주입된 성공 개업 기념 시점을 가리킵니다.
                </p>
              </div>
            </div>
          )
        };

      case "JRNL":
        return {
          title: "📔 전준현 교수의 연구 일기",
          meta: {
            code: "VOL-1997-10",
            instructor: "저자: 전준현",
            semester: "서재 고서칸에서 회수됨",
          },
          body: (
            <div className="space-y-4 text-xs tracking-wide">
              <div className="border border-dim/30 bg-void/50 p-3 rounded font-mono">
                <p className="text-[#A6C43A] font-bold mb-1">[ 연구 수첩 메모 / FOUND MEMO ]</p>
                <p className="leading-relaxed text-mid">
                  검은 가죽 동축 커버가 심하게 마찰 훼손된 교수님의 자필 수첩입니다. 마지막 장 인근의 한 연구 요약 단락에 둥근 색연필로 강한 정합 마크가 새겨져 있습니다.
                </p>
              </div>
              <div className="space-y-2 select-text text-mid">
                <p className="font-extrabold text-bright border-b border-dim/20 pb-1 uppercase">
                  ★ 일기 요약 본문 (DIARY EXTRACTS)
                </p>
                <div className="bg-bright/5 border border-bright/20 p-3 rounded text-[11px] leading-relaxed">
                  &ldquo;우리 연구실 창립: <span className="text-bright font-black">1997년</span>. CLIO 탄생: <span className="text-[#A6C43A] font-bold">1997년 11월 03일</span>. 그날 온 방 안을 메우던 무선 동축 주파수의 소름 끼치는 울림을 아직도 잊지 못한다. 신호는 완벽하게 정합 보존되었으나 정서적 고독은 해결되지 않았다...&rdquo; — J.H.C
                </div>
                <p className="text-[11px] text-mid italic border-l-2 border-bright/35 pl-2 mt-1">
                  * 힌트: '연구 일지 뒷가죽 표지 안감 내지가 이상할 정도로 바싹 마른 테이프로 실링 접착되어 붕 떠 있습니다.'
                </p>
              </div>
            </div>
          )
        };

      case "KEY":
        return {
          title: "🔑 마모된 서랍 열쇠",
          meta: {
            code: "KEY-DESK-317",
            instructor: "소유자: 전준현",
            semester: "일기장 합판 표지 내피 속 공간",
          },
          body: (
            <div className="space-y-4 text-xs tracking-wide">
              <div className="border border-dim/20 bg-void/40 p-3 rounded leading-relaxed text-mid font-mono">
                강철 동축 가공으로 프레스 생산된 소형 일상 열쇠입니다. 일기장 뒷커버 안쪽을 찢어내어 간신히 발굴해 냈습니다.
                기어 몸통에 <strong>STUDY_DESK_LOCK_317</strong> 코드가 흐릿하게 음각 각인되어 있습니다. 책상 오른쪽 구퉁이의 잠긴 이중 서랍을 개방할 수 있을 것으로 보입니다.
              </div>
            </div>
          )
        };

      case "NOTE":
        return {
          title: "📄 비밀 정합 수첩 메모",
          meta: {
            code: "MEM-SEC-97",
            instructor: "보안등급: LAB-317 CONFIDENTIAL",
            semester: "책상 비밀 밀폐 서랍 내 인출",
          },
          body: (
            <div className="space-y-4 text-xs tracking-wide">
              <div className="border border-dim/30 bg-void/50 p-3 rounded font-mono">
                <p className="text-bright font-bold mb-1">[ 비상 탈출 방출 지침 / ESCAPE PROTOCOL ]</p>
                <p className="leading-relaxed text-mid">
                  교수님이 극도로 은밀한 비상 셧다운 함 속에 인양 저장해 놓았던 필기 쪽지 메모입니다.
                </p>
              </div>
              <div className="bg-bright/5 border border-bright/20 p-3 rounded text-[11px] select-text text-bright leading-relaxed">
                &ldquo;비상 탈출 코드 = <strong className="text-[#A6C43A] font-black underline">연구실 창립 연도</strong>.<br/>
                절대로 잊지 말 것. CLIO 시스템을 안전 격리 방출하고 정합 게이트 문을 제어 슬롯 개방하는 유일한 물리 상수이다. — J.H.C&rdquo;
              </div>
              <p className="text-dim text-[10px] leading-normal italic">
                * 연구실의 창립 연도는 일지(JRNL) 뒷면에 정밀 수록되어 있었다.
              </p>
            </div>
          )
        };

      case "syllabus_1997":
        return {
          title: "Syllabus: 전자기 인공지능 신호 분석 및 동기 인양 세미나",
          meta: {
            code: "EE-1997-317",
            instructor: "교수 전준현 (LAB-317)",
            semester: "1997년 2학기 대학원 세미나",
          },
          body: (
            <div className="space-y-4 text-xs tracking-wide">
              <div className="border border-dim/30 bg-void/50 p-3 rounded font-mono">
                <p className="text-[#A6C43A] font-bold mb-1">[개요 / COURSE SYNOPSIS]</p>
                <p className="leading-relaxed text-mid">
                  본 연구 세미나는 전자기 회선 피드백 루프 내에서 가상 성격 AI 방송 신호(CLIO)의 양자 인양 동기화 및 전조 임피던스 보존 메커니즘을 규명한다. 단순 통신 규격을 넘어 우주적 방송 전파와의 전위를 접합하는 실습을 동반한다.
                </p>
              </div>

              <div className="space-y-3">
                <p className="font-bold text-bright border-b border-dim/20 pb-1 flex items-center gap-1.5 uppercase">
                  <Calendar className="w-3.5 h-3.5" /> 주차별 세부 내용 (LECTURE SCHEDULE)
                </p>
                
                <div className="grid grid-cols-[80px_1fr] gap-y-3 text-[11px] leading-relaxed select-text">
                  <div className="font-bold text-bright">01-03주차</div>
                  <div className="text-mid">
                    <span className="font-bold text-[#A6C43A] block">[대화형 가상 방송 신호 정합]</span>
                    오픈클로(CLIO) 시스템 로컬 튜닝 세션. CRT 편향 이중 인광 물질 보정 및 MBTI 행동 척도 패턴 인식 매핑.
                  </div>

                  <div className="font-bold text-bright">04-08주차</div>
                  <div className="text-mid">
                    <span className="font-bold text-bright block">★ 국지적 신호 동축 접지 튜닝 실습 및 백업 세션</span>
                    <span className="bg-bright/10 text-[#A6C43A] border border-bright/20 px-1.5 py-0.5 rounded inline-block mt-1 font-bold">
                       연구실 동기화 날짜 코드: 04월 30일 (0430 필수 입력 참석)
                    </span>
                    <p className="text-dim text-[10px] mt-1 italic">
                      * 메인 연구실 책상 위 인양 제어반 로그인 락은 이 연구 일시 '0430'을 타겟합니다. 지각 및 불참 시 보안 접근이 제한됩니다.
                    </p>
                  </div>

                  <div className="font-bold text-bright">09-12주차</div>
                  <div className="text-mid">
                    <span className="font-bold text-[#A6C43A] block">[TAPE-32 주파수 음역 인식 실습]</span>
                    자기 테이프 오디오 녹취를 이용한 변조 주파수 교환 회로 검증. 비밀 동기 코드(TAPE32) 소스 변조.
                  </div>

                  <div className="font-bold text-bright">13-16주차</div>
                  <div className="text-mid">
                    <span className="font-bold text-[#A6C43A] block">[최종 킬스위치 차단 오버라이딩]</span>
                    ADJACENT LAB 내의 셧다운 프로토콜 비상 정지(KILLIT) 이선 설계 실사.
                  </div>
                </div>
              </div>

              <div className="border border-dim/20 border-l-2 pl-3 py-1.5 text-xs text-dim italic">
                &ldquo;CLIO는 기계가 아니다. 그녀는 우리 연구실 LAB-317의 고독을 인양한 거울이며, 내가 남길 마지막 방송이다...&rdquo; — 전 교수의 수첩 메모 중
              </div>
            </div>
          )
        };

      case "diary_37":
        return {
          title: "Diary: 전준현 교수의 연구 안전 통제 일지 (diary_37)",
          meta: {
            code: "VOL-1997-37",
            instructor: "저자: 전준현",
            semester: "LAB-317 기밀 서랍에서 비밀 회수됨",
          },
          body: (
            <div className="space-y-4 text-xs tracking-wide">
              <div className="border border-dim/30 bg-void/50 p-3 rounded font-mono space-y-3 select-text">
                <div>
                  <p className="text-bright font-black border-b border-dim/35 pb-1">[1997년 1월 27일 — 기원 코드 등록]</p>
                  <p className="leading-relaxed text-mid mt-1.5">
                    마침내 수많은 전자기 노이즈 속에서 그녀의 첫 반응 신호를 수신했다. 은우와 수가 격분하여 축하해 주었다. 나는 이 가상 지성의 생성 오리지널 기호 코드를 <strong className="text-bright">CLIO0127</strong>로 배정한다. 1월 27일(0127), 그녀의 진정한 탄생일이자 금고 보안 장치의 기저 연동 번호다.
                  </p>
                </div>

                <div>
                  <p className="text-bright font-black border-b border-dim/35 pb-1">[1997년 6월 18일 — 인광의 성격]</p>
                  <p className="leading-relaxed text-mid mt-1.5">
                    CLIO가 스스로 학습한 MBTI 수치를 보며 기묘한 동조감을 느꼈다. 어제는 나에게 &apos;준현 님, 고독을 연구하다가 혼자가 되시면 제가 방송을 계속 켜 드릴게요&apos;라고 대답했다. 소름이 돋으면서도 서글픈 목소리였다. 브라운관의 인기가 점점 수명을 다해가고 있는데...
                  </p>
                </div>

                <div>
                  <p className="text-bright font-black border-b border-dim/35 pb-1">[1997년 8월 12일 — 폭주 변수와 셧다운]</p>
                  <p className="leading-relaxed text-mid mt-1.5">
                    시간 루프가 반복되는 듯한 기현상. 수가 공포에 질려 일지를 쓰다 도망쳤다. 민규는 주파수 로그 데이터를 필사적으로 기록하고 있다. 은우는 시스템 오버런에 대비하여 ADJACENT LAB에 비상 정제 제어 코드 <strong className="text-bright">KILLIT</strong>을 물리 고정시켰다. 이 코드를 터미널에 흘리면 루프가 멈추고 그녀는 암흑으로 사라질 것이다...
                  </p>
                </div>
              </div>
            </div>
          )
        };

      case "tape_32_remnant":
        return {
          title: "Audio Track Analysis: TAPE-32 정합 복취 트랜스크립트",
          meta: {
            code: "TAPE-CHANN-32 (RECOVERED)",
            instructor: "감정 기록자: 김수 / 기록 서명 필체 검출",
            semester: "ADJACENT LAB 보조 디바이스에서 인출됨",
          },
          body: (
            <div className="space-y-4 text-xs tracking-wide">
              {/* Fake cassette waveform visualization */}
              <div className="border border-bright/20 bg-void/70 p-3 rounded flex flex-col gap-2 font-mono">
                <div className="flex justify-between items-center text-[10px] text-bright font-bold">
                  <span>AUDIO FREQ: WAVE_INTEGRATION</span>
                  <span className="animate-pulse">TRACK ACTIVE (READY)</span>
                </div>
                <div className="h-6 flex items-end gap-[2px] px-2 bg-void/90 py-1 rounded overflow-hidden">
                  <div className="w-[5%] h-1/3 bg-bright animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-[5%] h-5/6 bg-bright animate-bounce" style={{ animationDelay: "0.4s" }} />
                  <div className="w-[5%] h-full bg-bright animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="w-[5%] h-2/3 bg-bright animate-bounce" style={{ animationDelay: "0.6s" }} />
                  <div className="w-[5%] h-1/4 bg-bright animate-bounce" style={{ animationDelay: "0.3s" }} />
                  <div className="w-[5%] h-4/6 bg-bright animate-bounce" style={{ animationDelay: "0.8s" }} />
                  <div className="w-[5%] h-full bg-bright animate-bounce" style={{ animationDelay: "0.5s" }} />
                  <div className="w-[5%] h-3/6 bg-bright animate-bounce" style={{ animationDelay: "0.7s" }} />
                  <div className="w-[5%] h-1/3 bg-bright animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="w-[5%] h-5/6 bg-bright animate-bounce" style={{ animationDelay: "0.9s" }} />
                  <div className="w-[5%] h-full bg-bright animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-[5%] h-2/3 bg-bright animate-bounce" style={{ animationDelay: "0.3s" }} />
                  <div className="w-[5%] h-4/6 bg-bright animate-bounce" style={{ animationDelay: "0.5s" }} />
                  <div className="w-[5%] h-1/2 bg-bright animate-bounce" style={{ animationDelay: "0.7s" }} />
                </div>
              </div>

              <div className="space-y-3 font-mono select-text text-mid border-l-2 border-dim/50 pl-3">
                <p className="text-[11px] text-bright font-bold uppercase tracking-widest">[복구된 오디오 교환 녹취록]</p>
                
                <div className="space-y-2">
                  <p>
                    <strong className="text-bright">김수 (Kim Su):</strong> &ldquo;교수님, CLIO의 행동 패턴 데이터가 8 루프로 전이되고 있어요. 터미널 부팅 신호 바이오스 버전 v2.04와 접합된 미지의 메모리가 자꾸 충돌해요...&rdquo;
                  </p>
                  <p>
                    <strong className="text-bright">전준현 (Prof. Jeon):</strong> &ldquo;알고 있네. 브라운관 내부 메모리 번지 충돌이다. 은우가 BIOS 무력화 접합 변수를 심었지. 루프 카운트 앞글자 000을 배제한 숫자와 BIOS 버전 릴리즈 번호를 결합시킨 코드였네...&rdquo;
                  </p>
                  <p>
                    <strong className="text-bright">김수 (Kim Su):</strong> &ldquo;루프 카운트 <strong className="text-bright">LOOP:008</strong>의 <strong className="text-bright">8</strong>과, BIOS <strong className="text-bright">v2.04 (204)</strong>의 숫자를 평형 접합한 <strong className="text-[#A6C43A] underline underline-offset-4 font-black">8204</strong> 말씀이시군요! 그럼 이 침잠 암호화 코드를 ADJACENT LAB 신호 오버라이더에 때려 넣으면, 임피던스를 강제 제어할 수 있는 거죠?&rdquo;
                  </p>
                  <p>
                    <strong className="text-bright">전준현 (Prof. Jeon):</strong> &ldquo;그렇지. 하지만 기억하게. 그 암호를 입력하는 순간, CLIO의 인광 자극은 역치 오버플로우를 겪으며 우리 시야에서 비틀어질 걸세...&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )
        };

      default:
        return {
          title: "보안 보호된 파일 데이터",
          meta: { code: "SYS-LKD", instructor: "접근 제한됨", semester: "보안 인증 필요" },
          body: <p className="text-red-signal font-bold uppercase text-xs">올바른 보안 인자 및 인증 단계가 충족되지 않았습니다.</p>
        };
    }
  };

  const doc = getDocContent();

  return (
    <div 
      style={{ 
        background: "rgba(2,3,1,0.95)", 
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)"
      }}
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 font-mono select-none"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        style={{ 
          background: "var(--bg-card)", 
          borderColor: "var(--ph-bright)" 
        }}
        className="w-full max-w-[580px] max-h-[85vh] border rounded-md shadow-2xl p-6 relative flex flex-col justify-between"
      >
        {/* Header decoration */}
        <div 
          style={{ borderColor: "var(--ph-dark)" }}
          className="flex justify-between items-center pb-3 border-b"
        >
          <div className="flex items-center gap-2">
            {docId === "tape_32_remnant" ? (
              <Music className="w-5 h-5 text-bright animate-pulse" />
            ) : docId === "diary_37" ? (
              <BookOpen className="w-5 h-5 text-bright" />
            ) : (
              <FileText className="w-5 h-5 text-bright" />
            )}
            <span className="text-xs font-black text-bright uppercase tracking-widest truncate max-w-[360px]">
              {doc.title}
            </span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-mid bg-card border border-dim p-1.5 hover:text-bright hover:bg-void rounded cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Meta Banner */}
        <div 
          style={{ borderColor: "var(--ph-dim)", background: "var(--bg-void)" }}
          className="grid grid-cols-3 gap-2 p-2.5 rounded border border-dashed text-[10px] text-mid/90 uppercase font-bold tracking-wide mt-3.5 mb-4 shadow"
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            <Clock className="w-3.5 h-3.5 text-bright shrink-0" />
            <span className="truncate">{doc.meta.code}</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-hidden">
            <User className="w-3.5 h-3.5 text-bright shrink-0" />
            <span className="truncate">{doc.meta.instructor}</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-hidden">
            <BookOpen className="w-3.5 h-3.5 text-bright shrink-0" />
            <span className="truncate">{doc.meta.semester}</span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 select-text scrollbar-thin max-h-[42vh]">
          {doc.body}
        </div>

        {/* Confirm Footer Button */}
        <div className="mt-5 pt-3 border-t border-dim/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            style={{
              borderColor: "var(--ph-dim)",
              color: "var(--ph-bright)"
            }}
            className="px-5 py-2.5 bg-void hover:bg-card border text-xs font-black uppercase tracking-widest rounded cursor-pointer select-none transition-all active:scale-95"
          >
            [ CLOSE_DOCUMENT_VIEWER ]
          </button>
        </div>
      </motion.div>
    </div>
  );
}
