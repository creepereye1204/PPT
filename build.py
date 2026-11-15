"""
슬라이드 생성기 — 내용은 이 파일의 데이터만 고치면 됩니다.
    python3 build.py   →  index.html 재생성
"""
import html
from pathlib import Path

ROOT = Path(__file__).parent
esc = lambda s: html.escape(s, quote=False)

AGENDA = [
    ('01', '프롬프트 엔지니어링', '모델에게 무엇을, 어떻게 요청할까'),
    ('02', '컨텍스트 엔지니어링', '모델이 보는 정보를 설계하기'),
    ('03', '하네스 엔지니어링', '도구·실행 환경으로 모델을 감싸기'),
    ('04', '루프 엔지니어링', '관찰 → 행동 → 검증을 반복하는 에이전트'),
    ('05', '그래프 엔지니어링', '여러 단계·에이전트를 워크플로로 연결'),
]
BONUS = [
    ('06', 'gstack', 'Garry Tan의 역할 기반 스킬'),
    ('07', 'pstack', 'Lauren Tan의 에이전트 워크플로'),
]

TOPICS = [
    # ------------------------------------------------------------------ 01
    dict(no='01', bg='flow', title='프롬프트 엔지니어링', tag='모델에게 무엇을, 어떻게 요청할까',
         history=[
             '<b>GPT-3 (2020)</b> — 몇 개의 예시만 보여줘도 새 작업을 수행하는 few-shot 학습 발견',
             '모델 가중치를 바꾸지 않고 <b>입력 텍스트만으로</b> 동작을 제어할 수 있게 됨',
             '<b>Chain-of-Thought (2022)</b> — 추론 과정을 쓰게 하면 수학·논리 문제 정확도가 크게 상승',
             '<b>ChatGPT (2022.11)</b> 이후 누구나 쓰는 기술로 대중화 — “프롬프트 엔지니어” 직군 등장',
         ],
         concepts=[
             ('Zero-shot', '예시 없이 지시만으로 수행 — 가장 단순한 출발점'),
             ('Few-shot', '입력→출력 예시 몇 개로 원하는 패턴·형식을 전달'),
             ('Chain-of-Thought', '답하기 전에 추론 과정을 쓰게 해 복잡한 문제 정확도 향상'),
             ('역할 부여', '전문가 페르소나로 어휘·관점·깊이를 고정'),
             ('구조화 출력', 'JSON·XML 태그로 형식을 강제해 코드에서 바로 파싱'),
             ('Self-Consistency', '여러 번 샘플링한 답 중 다수결로 선택 (2022)'),
         ],
         diagram='prompt', diagram_title='프롬프트가 답이 되기까지',
         diagram_caption='각 블록은 독립적으로 고칠 수 있다 — 프롬프트도 “조립”하는 것',
         ex_title='역할 + 지시 + 예시 + 출력 형식', lang='shell',
         code='''# 역할
당신은 쇼핑몰 고객 리뷰 분석가입니다.
# 지시
리뷰의 감정을 positive / negative / neutral 로 분류하세요.
# 예시 (few-shot)
리뷰: "배송이 빨라서 좋았어요" → positive
리뷰: "포장이 다 찢어져서 왔네요" → negative
# 출력 형식
리뷰: "{review}"
{"label": "...", "reason": "한 문장"}''',
         caption='역할·지시·예시·형식을 분리하면 결과가 안정적이고 수정하기 쉬워진다',
         pros=['비용이 거의 없고 즉시 실험 가능', '파인튜닝·학습 데이터 불필요', '개발자가 아니어도 활용 가능', '빠른 프로토타이핑에 최적'],
         cons=['문구 하나에 결과가 흔들림 (취약성)', '모델·버전이 바뀌면 다시 튜닝 필요', '모델이 모르는 최신·사내 지식은 못 넣음', '결과를 체계적으로 평가하기 어려움'],
         do=['“3문장 이내”처럼 측정 가능하게 지시', '지시·입력·예시를 태그로 명확히 구분', '좋은 예시와 나쁜 예시를 함께 제시', '프롬프트도 버전 관리 + 평가셋으로 테스트'],
         dont=['“절대·반드시” 남발 (과잉 반응 유발)', '한 프롬프트에 작업 여러 개 몰아넣기', '모델이 모르는 사실을 묻고 그대로 믿기', '한두 번 결과만 보고 “좋아졌다” 판단'],
         ),
    # ------------------------------------------------------------------ 02
    dict(no='02', bg='waves', title='컨텍스트 엔지니어링', tag='모델이 보는 정보를 설계하기',
         history=[
             'LLM 앱이 <b>RAG·메모리·도구 결과·대화 기록</b>을 함께 다루게 됨',
             '“어떻게 묻느냐”보다 <b>“무엇을 보여주느냐”</b>가 성능을 좌우',
             '컨텍스트 창은 커졌지만 길수록 <b>중간 정보를 놓치는</b> 문제 (Lost in the Middle, 2023)',
             '<b>2025년 중반</b> 토비 뤼트케(Shopify), 안드레이 카파시 등이 용어를 확산',
         ],
         concepts=[
             ('RAG', '질문과 관련된 문서를 검색해 컨텍스트에 주입'),
             ('메모리', '대화를 넘어 사용자·프로젝트 정보를 저장하고 회상'),
             ('압축 (Compaction)', '길어진 대화를 요약해 컨텍스트 창을 확보'),
             ('Just-in-time 로딩', '미리 다 넣지 않고 필요할 때 에이전트가 직접 조회'),
             ('도구 결과 관리', '거대한 출력은 잘라내거나 파일로 빼고 참조만 전달'),
             ('서브에이전트 격리', '탐색은 별도 컨텍스트에서, 요약된 결과만 반환'),
         ],
         diagram='context', diagram_title='컨텍스트 창은 한정된 예산이다',
         diagram_caption='넣을수록 좋은 게 아니라, “최소한의 고신호 토큰”을 고르는 문제',
         ex_title='매 요청마다 컨텍스트를 조립하기', lang='python',
         code='''def build_context(query, user):
    docs    = retriever.search(query, k=5)      # RAG: 관련 문서
    memory  = memory_store.recall(user.id)      # 장기 기억
    history = chat_log.last(user.id, n=10)      # 최근 대화

    if count_tokens(history) > 8_000:           # 너무 길면 압축
        history = [summarize(history)]

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": f"사용자 정보: {memory}"},
        {"role": "system", "content": format_docs(docs)},
        *history,
        {"role": "user", "content": query},
    ]''',
         caption='프롬프트는 한 줄, 컨텍스트는 시스템 — 무엇을 넣고 무엇을 뺄지가 핵심',
         pros=['최신·사내 지식을 모델에 주입', '근거 문서 제공으로 환각 감소', '사용자별 메모리로 개인화', '모델을 바꿔도 파이프라인 재사용'],
         cons=['검색 품질이 나쁘면 결과도 나쁨', '토큰 비용·응답 지연 증가', '정보가 많을수록 주의가 분산됨', '조립 파이프라인이 복잡해짐'],
         do=['중요한 지시는 앞이나 끝에 배치', '문서에 출처를 붙여 인용 가능하게', '오래된 기록은 요약해서 유지', 'CLAUDE.md 같은 프로젝트 메모 파일 활용'],
         dont=['“혹시 몰라서” 전부 넣기', '검색 품질 평가 없이 운영', '서로 충돌하는 지시를 방치', '도구 출력 수천 줄을 그대로 주입'],
         ),
    # ------------------------------------------------------------------ 03
    dict(no='03', bg='grid', title='하네스 엔지니어링', tag='도구·실행 환경으로 모델을 감싸기',
         history=[
             '<b>Function Calling (2023)</b> 이후 모델이 직접 도구를 호출하기 시작',
             '<b>MCP (2024.11)</b> — 도구·데이터 연결을 위한 표준 프로토콜 등장',
             'Claude Code·Codex CLI 같은 <b>코딩 에이전트</b>가 파일 수정·테스트 실행까지 수행',
             '같은 모델이라도 <b>감싸는 환경(하네스)</b>에 따라 결과가 크게 달라짐 → 에이전트 = 모델 + 하네스',
         ],
         concepts=[
             ('도구 (Tools)', '모델이 호출하는 함수 — 이름·설명·스키마가 곧 모델의 UI'),
             ('MCP', '외부 도구·데이터를 연결하는 표준 프로토콜'),
             ('권한 (Permissions)', '허용 / 거부 / 확인 규칙으로 행동 범위를 제한'),
             ('샌드박스', '파일시스템·네트워크를 격리해 사고 반경을 제한'),
             ('훅 (Hooks)', '도구 실행 전후 자동 스크립트 — 린트·테스트·차단'),
             ('스킬 (Skills)', '필요할 때만 불러오는 절차·지식 묶음 (SKILL.md)'),
         ],
         diagram='harness', diagram_title='모든 행동은 게이트를 지난다',
         diagram_caption='“하지 마”라고 부탁하지 말고, 하네스가 막게 한다',
         ex_title='Claude Code 하네스 설정 (.claude/settings.json)', lang='json',
         code='''{
  "permissions": {
    "allow": ["Read", "Edit", "Bash(npm test:*)"],
    "deny":  ["Read(./.env)", "Bash(rm -rf:*)"]
  },
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{ "type": "command", "command": "npm run lint -- --fix" }]
    }]
  }
}''',
         caption='무엇을 허용/금지할지 + 행동 후 자동으로 무엇을 실행할지 = 하네스 설계',
         pros=['실제 행동 가능 (파일·터미널·브라우저)', '권한·샌드박스로 안전하게 통제', '도구·스킬 추가로 능력 확장', '모델을 바꿔도 하네스는 재사용'],
         cons=['설계·유지보수 비용이 큼', '도구가 많으면 잘못 고르기 쉬움', '프롬프트 인젝션·과도한 권한 위험', '하네스마다 동작이 달라 디버깅 어려움'],
         do=['도구 설명은 신입에게 설명하듯 명확히', '도구는 적게, 기능이 겹치지 않게', '위험한 작업엔 사람 확인 단계', '린트·테스트 같은 검증은 훅으로 강제'],
         dont=['프롬프트로 “rm 하지 마” 부탁하기', '비밀키를 에이전트가 읽을 수 있는 곳에', '웹·문서 내용을 지시처럼 신뢰', '도구 결과를 원문 그대로 전부 반환'],
         ),
    # ------------------------------------------------------------------ 04
    dict(no='04', bg='orbit', title='루프 엔지니어링', tag='관찰 → 행동 → 검증을 반복하는 에이전트',
         history=[
             '<b>ReAct (2022)</b> — 추론(Reason)과 행동(Act)을 번갈아 반복하는 패턴',
             '<b>AutoGPT (2023)</b> 열풍 → 무한 루프·비용 폭주 문제가 드러남',
             '<b>Ralph 루프 (2025)</b> — 같은 프롬프트를 계속 다시 실행하는 단순 루프가 의외로 강력',
             '핵심은 루프 자체보다 <b>종료 조건 · 검증기 · 예산</b> 설계',
         ],
         concepts=[
             ('ReAct', '생각 → 행동 → 관찰을 번갈아 반복하는 기본 패턴'),
             ('검증기 (Verifier)', '테스트·타입체크·린터 등 객관적인 통과 기준'),
             ('예산 (Budget)', '최대 스텝·토큰·시간·비용의 상한'),
             ('자기 반성 (Reflexion)', '실패 원인을 글로 남기고 다음 시도에 반영 (2023)'),
             ('상태 저장', '진행 상황을 파일(TODO·노트)로 남겨 언제든 재시작'),
             ('에스컬레이션', '막히거나 위험할 때 사람에게 넘기는 지점'),
         ],
         diagram='loop', diagram_title='검증을 통과할 때까지 돈다',
         diagram_caption='“언제 멈출지”를 모델이 아니라 검증기와 예산이 정한다',
         ex_title='예산 + 검증기가 있는 에이전트 루프', lang='python',
         code='''MAX_STEPS = 20

for step in range(MAX_STEPS):              # 1. 예산 (종료 조건)
    action = llm.decide(goal, history)     # 2. 다음 행동 결정
    result = tools.run(action)             # 3. 행동 실행
    history.append((action, result))       # 4. 관찰 기록

    if verifier.passed(result):            # 5. 검증 통과 → 종료
        break
else:
    escalate_to_human(history)             # 예산 초과 → 사람에게''',
         caption='Python의 for-else: break 없이 끝나면(= 예산 소진) else가 실행된다',
         pros=['한 번에 못 푸는 긴 작업 해결', '테스트·린터 피드백으로 스스로 수정', '사람 개입 없이 자율 실행', '구조가 단순해 구현이 쉬움'],
         cons=['비용·시간이 폭주할 수 있음', '같은 실수를 반복하며 갇힘', '“완료”를 판단하는 기준 설계가 어려움', '작은 오류가 단계마다 누적'],
         do=['시작 전에 “완료”를 테스트로 정의', '매 반복의 진행 상황을 파일에 기록', '같은 오류 N회 반복 시 전략 변경', '스텝·비용 상한을 반드시 설정'],
         dont=['모델이 “다 했어요” 하면 완료 처리', '종료 조건 없는 무한 루프', '실패 로그를 버리고 다시 시작', '한 루프에 여러 목표 섞기'],
         ),
    # ------------------------------------------------------------------ 05
    dict(no='05', bg='neural', title='그래프 엔지니어링', tag='여러 단계·에이전트를 워크플로로 연결',
         history=[
             '하나의 루프로는 <b>조사 → 작성 → 검토</b> 같은 복잡한 업무를 안정적으로 처리하기 어려움',
             '작업을 <b>노드(LLM·도구·에이전트)</b>와 <b>엣지(조건 분기)</b>로 쪼갠 그래프로 설계',
             '<b>LangGraph (2024)</b>, CrewAI·AutoGen 등 멀티에이전트 프레임워크 등장',
             'Anthropic <b>“Building effective agents” (2024.12)</b> — 워크플로 패턴을 체계적으로 정리',
         ],
         concepts=[
             ('프롬프트 체이닝', '단계를 순서대로 실행, 사이사이에 검사 게이트'),
             ('라우팅', '입력을 분류해 전문화된 경로로 분기'),
             ('병렬화', '독립 작업을 동시에 실행하거나 여러 번 투표'),
             ('오케스트레이터-워커', '중앙 LLM이 작업을 쪼개 워커에게 위임'),
             ('평가자-최적화', '생성 ↔ 평가를 반복하며 결과를 개선'),
             ('체크포인트 · HITL', '상태를 저장하고 사람 승인 노드를 삽입'),
         ],
         diagram='graph', diagram_title='조건 분기가 있는 워크플로',
         diagram_caption='루프는 그래프의 한 노드가 되고, 그래프는 루프들의 지도가 된다',
         ex_title='LangGraph로 조사 → 작성 → 검토 그래프', lang='python',
         code='''from langgraph.graph import StateGraph, END

g = StateGraph(State)
g.add_node("research", research_agent)
g.add_node("write",    writer_agent)
g.add_node("review",   reviewer_agent)

g.set_entry_point("research")
g.add_edge("research", "write")
g.add_edge("write", "review")
g.add_conditional_edges(                      # 검토 결과에 따라 분기
    "review", lambda s: "write" if s["needs_fix"] else END)

app = g.compile()''',
         caption='앞 슬라이드의 애니메이션이 정확히 이 코드의 실행 흐름',
         pros=['단계별로 관찰·디버깅 가능', '독립된 단계는 병렬 실행', '노드마다 다른 모델·프롬프트 최적화', '체크포인트·재시도·사람 승인 삽입'],
         cons=['설계가 복잡해지고 과설계 위험', '노드 사이에서 정보가 손실됨', '정해진 경로 밖의 상황에 약함', '특정 프레임워크에 종속'],
         do=['가장 단순한 구조로 시작해 필요할 때 추가', '노드 간 State 스키마를 명확히', '노드별로 따로 로깅·평가', '위험 지점에 사람 승인 노드'],
         dont=['루프 하나면 될 일에 멀티에이전트', '노드끼리 긴 자연어로만 주고받기', '프레임워크 뒤에 프롬프트 숨기기', '최종 결과만 보고 디버깅'],
         ),
    # ------------------------------------------------------------------ 06
    dict(no='06', bg='matrix', title='gstack', tag='Garry Tan의 역할 기반 스킬 스택', bonus=True,
         history=[
             'Y Combinator CEO <b>Garry Tan</b>이 공개한 코딩 에이전트용 스킬 모음 (MIT, 오픈소스)',
             '범용 어시스턴트 하나 대신 <b>“가상 엔지니어링 팀”</b> — 제품·디자인·엔지니어링·QA·보안·릴리스',
             '<b>Think → Plan → Build → Review → Test → Ship → Reflect</b> 스프린트 흐름',
             '목표: CI를 통과하는 버그까지 잡고, AI가 쓴 변경을 <b>리뷰 가능하게</b>',
         ],
         concepts=[
             ('/office-hours', '아이디어를 재정의하고 다른 스킬이 읽을 설계 문서 작성'),
             ('/plan-ceo-review', '제품 관점 — 범위가 맞나? 더 나은 버전은?'),
             ('/plan-eng-review', '아키텍처·데이터 흐름·엣지 케이스·테스트 확정'),
             ('/review', '프로덕션 버그를 찾고 명백한 것은 자동 수정'),
             ('/qa', '실제 브라우저·API로 동작을 테스트하고 버그 수정'),
             ('/careful · /guard', '파괴적 명령 경고, 편집 범위 제한 등 안전장치'),
         ],
         diagram='gstack', diagram_title='한 명의 AI, 일곱 개의 역할',
         diagram_caption='각 단계가 이전 단계의 산출물(설계 문서·리뷰 결과)을 읽고 이어받는다',
         ex_title='설치 & 기능 하나를 만드는 흐름', lang='shell',
         code='''# 설치 (Claude Code)
git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup

/office-hours       # 아이디어를 재정의하고 설계 문서 작성
/plan-ceo-review    # 제품 관점: 범위가 맞나? 더 나은 버전은?
/plan-eng-review    # 설계 관점: 아키텍처·데이터 흐름·엣지 케이스
   ... 구현 ...
/review             # 프로덕션 버그 탐지 + 명백한 건 자동 수정
/qa                 # 실제 브라우저로 동작 테스트 후 버그 수정
/ship               # main 동기화 → 테스트 → PR 생성
/retro              # 주간 회고''',
         caption='한 명의 AI를 CEO·엔지니어·QA·릴리스 매니저로 번갈아 쓰는 방식',
         pros=['역할별 관점으로 다각도 검토', '개발 전 과정을 슬래시 커맨드로 표준화', '브라우저 QA 내장 (/browse, /qa)', '안전장치 (/careful, /freeze, /guard)'],
         cons=['작성자 취향이 강해 팀 방식과 충돌 가능', '커맨드가 50개 이상 — 학습 곡선', '리뷰 단계가 많아 토큰·시간 비용 증가', '업데이트가 잦아 구성이 자주 바뀜'],
         do=['/plan-eng-review · /review · /ship부터 시작', '팀 모드로 설정을 리포에 공유', '큰 기능에만 전체 스프린트 적용', '설계 문서를 리포에 남겨 재사용'],
         dont=['오타 수정에 전체 스프린트', '리뷰 결과를 읽지 않고 /ship', '50개 커맨드를 한 번에 외우기', '안전장치 없이 운영 환경 작업'],
         ),
    # ------------------------------------------------------------------ 07
    dict(no='07', bg='warp', title='pstack', tag='Lauren Tan의 에이전트 워크플로', bonus=True,
         history=[
             '에이전트가 <b>사람이 검증할 수 있는 속도보다 빠르게</b> 코드를 생성 → “이게 정말 동작하나?”',
             '<b>Lauren Tan (Poteto)</b>이 시니어 엔지니어의 습관을 에이전트가 반복할 수 있는 워크플로로 패키징',
             '핵심 원칙은 <b>검증(verification)</b> — 이해 → 설계 → 검증 → 정리',
             'Cursor 플러그인으로 시작 (MIT) · Claude Code·Codex용 <b>커뮤니티 포트</b> 존재',
         ],
         concepts=[
             ('/poteto-mode', '진입점 — 작업에 맞는 플레이북과 스킬을 자동 선택'),
             ('/how · /why', '런타임 동작 원리와 코드의 역사적 이유를 파악'),
             ('/architect', '구현 전에 타입과 인터페이스부터 설계'),
             ('/tdd', '실패하는 테스트를 먼저 작성하고 통과시키기'),
             ('/interrogate', '여러 모델이 diff를 공격적으로 교차 검증'),
             ('/arena · /swarm', '경쟁 시도 중 최선 선택 · 작업을 여러 에이전트로 분할'),
         ],
         diagram='pstack', diagram_title='신뢰도를 쌓아 올리는 4단계',
         diagram_caption='코드를 “빨리” 만드는 게 아니라 “믿을 수 있게” 만드는 데 비용을 쓴다',
         ex_title='설치 & 프로덕션 버그를 고치는 흐름', lang='shell',
         code='''# 설치 (Cursor)
/add-plugin pstack
/setup-pstack    # 모델 라우팅 설정

# 작업에 맞는 플레이북·스킬 자동 선택
/poteto-mode 결제 실패 버그 고쳐줘

/how            # 런타임에서 실제로 어떻게 동작하는지
/why            # 코드가 왜 이렇게 됐는지 (히스토리)
/tdd            # 실패하는 테스트부터 작성
/interrogate    # 여러 모델이 diff를 공격적으로 검증
/unslop         # PR 설명의 AI 말투 정리''',
         caption='작은 작업엔 과하고, 핵심 기능·대규모 리팩터·프로덕션 버그에 쓰는 도구',
         pros=['검증 중심이라 결과를 신뢰하기 쉬움', '여러 모델이 diff 교차 검증', '작업에 맞는 흐름 자동 선택', '낯선 코드베이스 빠르게 파악'],
         cons=['추론 비용·시간이 큼 (약 2배)', '작은 UI 수정 등에는 과함', 'Claude Code 등은 비공식 포트', '모델이 발전하면 불필요해질 수도'],
         do=['핵심 기능·리팩터·프로덕션 버그에 사용', '프로젝트 전용 검증 스킬 만들기', '리포만 읽고 습관만 가져와도 OK', '시작 전 비용 예산 확인'],
         dont=['작은 UI 수정에 풀 스택 적용', '“월 2,000 PR” 같은 수치를 그대로 기대', '비공식 포트를 공식으로 착각', '검증에서 나온 경고 무시'],
         ),
]


def ul(items, cls='bullets small', frag=False):
    fc = ' class="fragment"' if frag else ''
    body = '\n'.join(f'            <li{fc}>{x}</li>' for x in items)
    return f'<ul class="{cls}">\n{body}\n          </ul>'


def topic_slides(t):
    part = 'Bonus' if t.get('bonus') else 'Part'
    no, bg, title = t['no'], t['bg'], t['title']
    lang = f' data-lang="{t["lang"]}"' if t.get('lang') else ''
    concepts = '\n'.join(
        f'''        <div class="concept"><h4>{esc(n)}</h4><p>{esc(d)}</p></div>''' for n, d in t['concepts'])
    return f'''
    <!-- ===================== {no}. {title} ===================== -->
    <section class="slide" data-bg="{bg}">
      <span class="watermark">{no}</span>
      <p class="eyebrow">{part} {no} · 등장 배경</p>
      <h2>{title}</h2>
      <p class="tagline">{t["tag"]}</p>
      {ul(t["history"], "bullets mid", True)}
    </section>

    <section class="slide" data-bg="{bg}">
      <p class="eyebrow">{part} {no} · 핵심 개념</p>
      <h2>{title}의 도구 상자</h2>
      <div class="concepts">
{concepts}
      </div>
    </section>

    <section class="slide dense" data-bg="{bg}">
      <p class="eyebrow">{part} {no} · 동작 원리</p>
      <h2>{t["diagram_title"]}</h2>
      <div class="diagram" data-diagram="{t["diagram"]}"></div>
      <p class="code-caption">{t["diagram_caption"]}</p>
    </section>

    <section class="slide" data-bg="{bg}">
      <p class="eyebrow">{part} {no} · 예시</p>
      <h2>{t["ex_title"]}</h2>
      <pre class="code small"{lang}><code>{esc(t["code"])}</code></pre>
      <p class="code-caption">{t["caption"]}</p>
    </section>

    <section class="slide" data-bg="{bg}">
      <p class="eyebrow">{part} {no} · 장단점</p>
      <h2>{title}</h2>
      <div class="two-col">
        <div class="card pro">
          <h3>장점</h3>
          {ul(t["pros"])}
        </div>
        <div class="card con">
          <h3>단점</h3>
          {ul(t["cons"])}
        </div>
      </div>
    </section>

    <section class="slide" data-bg="{bg}">
      <p class="eyebrow">{part} {no} · 실전 팁</p>
      <h2>이렇게 쓰세요</h2>
      <div class="two-col tips">
        <div class="card pro">
          <h3>✓ Do</h3>
          {ul(t["do"], "bullets small check")}
        </div>
        <div class="card con">
          <h3>✗ Don't</h3>
          {ul(t["dont"], "bullets small cross")}
        </div>
      </div>
    </section>
'''


def agenda_li(items):
    return '\n'.join(
        f'        <li><span class="num">{n}</span><span class="title">{t}</span><span class="desc">{d}</span></li>'
        for n, t, d in items)


HEAD = '''<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI 엔지니어링의 진화</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" />
  <link rel="stylesheet" href="css/style.css" />
</head>
<!-- 이 파일은 build.py 가 생성합니다. 내용 수정은 build.py 에서 하고 `python3 build.py` 실행 -->
<body>
  <canvas id="bg"></canvas>
  <div class="vignette"></div>

  <main class="stage" id="stage">
'''

FOOT = '''
  </main>

  <div class="hud">
    <span class="hud-title">AI 강의 · AI 엔지니어링의 진화</span>
    <span class="counter" id="counter"></span>
  </div>
  <div class="progress"><span id="progress"></span></div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="js/backgrounds.js"></script>
  <script src="js/diagrams.js"></script>
  <script src="js/hero3d.js"></script>
  <script src="js/deck.js"></script>
  <script src="js/cursor.js"></script>
</body>
</html>
'''

INTRO = f'''
    <!-- 표지 -->
    <section class="slide center" data-bg="neural">
      <div class="hero3d" data-hero3d></div>
      <p class="eyebrow">AI Lecture · 2026</p>
      <h1>AI 엔지니어링의 <span class="gradient-text">진화</span></h1>
      <p class="lead">프롬프트에서 그래프까지, 그리고 실전 스킬 스택</p>
      <p class="meta">발표자 이름 · 소속 · 2026.11.15</p>
    </section>

    <!-- 목차 -->
    <section class="slide dense" data-bg="aurora">
      <p class="eyebrow">Agenda</p>
      <h2>오늘 다룰 내용</h2>
      <ol class="agenda">
{agenda_li(AGENDA)}
      </ol>
      <p class="agenda-label">Bonus · 실전 스킬 스택</p>
      <ol class="agenda agenda-row">
{agenda_li(BONUS)}
      </ol>
    </section>

    <!-- 진화 타임라인 -->
    <section class="slide dense" data-bg="aurora">
      <p class="eyebrow">Big Picture</p>
      <h2>6년 동안 무엇이 바뀌었나</h2>
      <div class="diagram" data-diagram="evolution"></div>
      <p class="code-caption">질문이 “어떻게 말할까” → “무엇을 보여줄까” → “어떤 환경에서, 어떤 구조로 일하게 할까”로 이동</p>
    </section>
'''

OUTRO = '''
    <!-- 정리 -->
    <section class="slide dense" data-bg="pulse">
      <p class="eyebrow">Summary</p>
      <h2>대체가 아니라, 감싸는 것</h2>
      <div class="diagram" data-diagram="layers"></div>
      <p class="code-caption">gstack · pstack은 이 다섯 층을 실전 워크플로로 묶어 놓은 “스킬 스택”이다</p>
    </section>

    <!-- 마무리 -->
    <section class="slide center" data-bg="pulse">
      <p class="eyebrow">Thank you</p>
      <h1><span class="gradient-text">Q &amp; A</span></h1>
      <p class="lead">질문 환영합니다</p>
      <p class="meta">email@example.com · github.com/username</p>
    </section>
'''

if __name__ == '__main__':
    body = INTRO + ''.join(topic_slides(t) for t in TOPICS) + OUTRO
    (ROOT / 'index.html').write_text(HEAD + body + FOOT, encoding='utf-8')
    print('slides:', body.count('<section'))
