// DocGP Logic & Decision Tree Algorithm

// 1. Data Store: Rule-Based Questions & Recommendations
const SYMPTOM_DATA = {
    head: {
        title: "머리 / 얼굴 관련 증상",
        sub: "가장 가깝다고 느끼시는 주요 통증/증상을 선택해 주세요.",
        options: [
            { text: "욱씬거리거나 깨질 듯한 두통 (어지럼증/메스꺼움 동반)", dept: "신경과", reason: "편두통, 뇌혈관 질환 또는 신경계 이상 가능성이 높아 신경과 진료가 1차적으로 필요합니다.", urgent: false },
            { text: "얼굴 특정 부위, 눈, 코, 귀 부근 찌릿한 통증", dept: "이비인후과", reason: "부비동염(축농증), 중이염 또는 삼차신경통 의심 증상입니다.", urgent: false },
            { text: "갑작스러운 언어장애, 한쪽 안면 마비, 극심한 폭발적 두통", dept: "응급의학과 / 3차상급병원", reason: "뇌졸중 등 뇌혈관 응급 질환 신호일 수 있으므로 즉시 응급실(119) 방문을 권장합니다.", urgent: true },
            { text: "턱 관절 통증 또는 치아/잇몸 통증", dept: "치과", reason: "턱관절 장애 또는 구강 질환 가능성이 높습니다.", urgent: false }
        ]
    },
    chest: {
        title: "목 / 흉부 / 등 관련 증상",
        sub: "가슴이나 목, 등 부위의 세부 통증 양상을 선택하세요.",
        options: [
            { text: "가슴이 답답하고 짓누르는 듯한 통증 (어깨/턱으로 뻐근함 전이)", dept: "순환기내과", reason: "협심증, 심근경색 등 심장 질환 가능성이 있으므로 신속한 심혈관 내과 진료가 필요합니다.", urgent: true },
            { text: "기침, 가래, 호흡 곤란 또는 발열 동반", dept: "호흡기내과", reason: "기관지염, 림프절염 또는 폐렴 가능성이 의심되어 호흡기내과 방문을 권장합니다.", urgent: false },
            { text: "목이나 등 뼈 마디가 뻐근하고 움직일 때 통증 증대", dept: "정형외과", reason: "목 디스크(경추 추간판 탈출증) 또는 근육 염좌 가능성이 높습니다.", urgent: false },
            { text: "식사 후 명치 뻐근함, 쥐어짜는 듯한 통증, 신물 올라옴", dept: "소화기내과", reason: "역류성 식도염 또는 위경련 가능성이 높습니다.", urgent: false }
        ]
    },
    abdomen: {
        title: "복부 / 허리 관련 증상",
        sub: "배나 허리 부위의 통증 양상을 선택해 주세요.",
        options: [
            { text: "허리를 숙이거나 틀 때 찌릿함, 엉덩이/다리 저림", dept: "정형외과 / 통증의학과", reason: "요추 디스크(허리 디스크) 또는 신경 압박 가능성이 높아 1차 정형외과/통증의학과 진료를 추천합니다.", urgent: false },
            { text: "오른쪽 아랫배 콕콕 찌르는 찌릿한 통증 및 누를 때 통증", dept: "외과 / 소화기내과", reason: "급성 충수염(맹장염) 의심 증상으로 신속한 외과 1차 진찰이 필요합니다.", urgent: true },
            { text: "배 전체 복통, 설사, 콕콕 쑤심, 복부 팽만감", dept: "내과 (소화기내과)", reason: "급성 위장염, 장염 또는 과민성 대장 증후군 의심 증상입니다.", urgent: false },
            { text: "옆구리 쥐어짜는 통증 및 혈뇨/배뇨통", dept: "비뇨의학과", reason: "요로결석 또는 방광염/신우신염 가능성이 의심됩니다.", urgent: false }
        ]
    },
    limbs: {
        title: "팔 / 다리 / 관절 관련 증상",
        sub: "관절이나 관절 부위 붓기/통증을 선택해 주세요.",
        options: [
            { text: "관절(무릎, 손목, 발목)이 붓고 열감 동반, 걸을 때 통증", dept: "정형외과 / 류마티스내과", reason: "관절염, 연골 손상 또는 류마티스 질환 가능성이 커 1차 정형외과 진료가 적합합니다.", urgent: false },
            { text: "운동/넘어진 후 특정 부위 극심한 통증 및 변형/붓기", dept: "정형외과", reason: "골절, 인대 파열, 골막 손상 가능성이 커 즉각적인 엑스레이 검사가 필요합니다.", urgent: true },
            { text: "다리가 붓고 찌릿찌릿 저림, 밤에 쥐가 자주 남", dept: "흉부외과 / 신경과", reason: "하지정맥류 또는 하공신경통/혈관 순환 장애 의심 증상입니다.", urgent: false }
        ]
    },
    skin: {
        title: "피부 / 전신 / 기타 관련 증상",
        sub: "전신 전반 또는 피부 이상 증상을 선택해 주세요.",
        options: [
            { text: "피부 발진, 두드러기, 가려움증, 띠 모양 수포", dept: "피부과", reason: "접촉성 피부염, 알레르기 또는 대상포진 가능성이 높아 피부과 진료를 추천합니다.", urgent: false },
            { text: "몸살 기운, 38도 이상 전신 발열, 근육통", dept: "내과", reason: "독감(인플루엔자), 감기 또는 바이러스성 감염 증상으로 일반 내과 1차 진료가 필요합니다.", urgent: false },
            { text: "갑작스러운 체중 변화, 만성 피로, 붓기", dept: "내과 (내분비내과)", reason: "갑상선 기능 이상 또는 대사 질환 관련 수치 확인이 필요합니다.", urgent: false }
        ]
    }
};

// 2. Jeonju Hospital Database (Local Hospital Network)
const JEONJU_HOSPITALS = {
    "정형외과": [
        { name: "전주 한국병원 (2차 거점)", dist: "전주시 덕진구 • 1.2km", hours: "오늘 08:30 ~ 17:30 진료", desc: "관절·척추 특화 센터, X-ray/MRI 즉시 촬영 가능" },
        { name: "전주 굿모닝 정형외과의원", dist: "전주시 완산구 효자동 • 0.8km", hours: "오늘 09:00 ~ 19:00 (야간진료)", desc: "도수치료 및 1차 관절 염좌 신속 진료" },
        { name: "전북대학교병원 (3차 상급)", dist: "전주시 덕진구 건지로 • 3.5km", hours: "24시간 응급센터 운영", desc: "중증/복합 응급 질환 3차 의뢰 센터" }
    ],
    "내과": [
        { name: "전주 예수병원 (2차 거점)", dist: "전주시 완산구 서원로 • 1.8km", hours: "오늘 08:30 ~ 17:30 진료", desc: "소화기/호흡기 내과 전문의 8인 상주" },
        { name: "전주 속편한내과의원", dist: "전주시 완산구 신시가지 • 0.5km", hours: "오늘 08:30 ~ 18:30 진료", desc: "5대 암 검진 및 위/대장 내시경 전문" },
        { name: "전주병원", dist: "전주시 완산구 바우배기5길 • 2.1km", hours: "오늘 08:30 ~ 18:00 진료", desc: "지역 응급의료기관 지정 2차 병원" }
    ],
    "신경과": [
        { name: "전주 브레인 신경과의원", dist: "전주시 덕진구 송천동 • 1.5km", hours: "오늘 09:00 ~ 18:00 진료", desc: "만성 두통, 어지럼증 검사 특화 1차 의원" },
        { name: "전북대학교병원 신경과", dist: "전주시 덕진구 • 3.5km", hours: "진료예약 및 24시간 뇌졸중 응급센터", desc: "뇌혈관 중증 응급 센터" }
    ],
    "이비인후과": [
        { name: "전주 연세이비인후과의원", dist: "전주시 완산구 효자동 • 0.4km", hours: "오늘 09:00 ~ 18:30 진료", desc: "부비동염, 중이염, 어지럼증 1차 퀵 검사" }
    ],
    "피부과": [
        { name: "전주 오라클피부과의원", dist: "전주시 완산구 신시가지 • 0.6km", hours: "오늘 10:00 ~ 20:00 (야간진료)", desc: "대상포진 및 급성 피부염 1차 치료" }
    ],
    "default": [
        { name: "전주 예수병원", dist: "전주시 완산구 서원로 • 1.8km", hours: "08:30 ~ 17:30", desc: "전북 지역 대표 종합병원" },
        { name: "전북대학교병원", dist: "전주시 덕진구 건지로 • 3.5km", hours: "24시간 응급센터", desc: "전라북도 거점 상급종합병원" }
    ]
};

// State Variables
let currentPart = null;
let selectedOption = null;

// DOM Elements
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const step3 = document.getElementById('step-3');
const resultSection = document.getElementById('result-section');

const symptomOptionsContainer = document.getElementById('symptom-options-container');
const qTitle = document.getElementById('q-title');
const qSub = document.getElementById('q-sub');

// Step 1: Click Body Part
document.querySelectorAll('.body-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentPart = btn.dataset.part;
        loadStep2(currentPart);
    });
});

function loadStep2(partKey) {
    const data = SYMPTOM_DATA[partKey];
    if (!data) return;

    qTitle.textContent = data.title;
    qSub.textContent = data.sub;
    symptomOptionsContainer.innerHTML = '';

    data.options.forEach((opt, idx) => {
        const optBtn = document.createElement('button');
        optBtn.className = 'opt-btn';
        optBtn.innerHTML = `
            <span>${opt.text}</span>
            <span style="color: var(--primary-glow); font-size: 1.1rem;">➔</span>
        `;
        optBtn.addEventListener('click', () => {
            selectedOption = opt;
            goToStep3();
        });
        symptomOptionsContainer.appendChild(optBtn);
    });

    switchStep(step1, step2);
}

function goToStep3() {
    switchStep(step2, step3);
}

// Step 3 Back / Navigation
document.getElementById('back-to-step-1').addEventListener('click', () => switchStep(step2, step1));
document.getElementById('back-to-step-2').addEventListener('click', () => switchStep(step3, step2));

// Step 3 Chips Select
document.querySelectorAll('.chip-group:not(.multi) .chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
        const parent = e.target.closest('.chip-group');
        parent.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
    });
});

document.querySelectorAll('.chip-group.multi .chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
        if (e.target.dataset.val === 'none') {
            e.target.closest('.chip-group').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
        } else {
            const noneChip = e.target.closest('.chip-group').querySelector('[data-val="none"]');
            if (noneChip) noneChip.classList.remove('active');
            e.target.classList.toggle('active');
        }
    });
});

// Final Result Generation
document.getElementById('get-result-btn').addEventListener('click', () => {
    if (!selectedOption) return;

    // Set Result Fields
    document.getElementById('dept-name').textContent = selectedOption.dept;
    document.getElementById('dept-reason').textContent = selectedOption.reason;

    if (selectedOption.urgent) {
        document.getElementById('dept-type-tag').textContent = '⚠️ 신속 진료 필요 (응급/상급병원 고려)';
        document.getElementById('dept-type-tag').style.background = 'rgba(239, 68, 68, 0.2)';
        document.getElementById('dept-type-tag').style.color = '#FCA5A5';
    } else {
        document.getElementById('dept-type-tag').textContent = '1차 의원 및 2차 병원 권장 (경증)';
        document.getElementById('dept-type-tag').style.background = 'rgba(255, 255, 255, 0.1)';
        document.getElementById('dept-type-tag').style.color = '#E2E8F0';
    }

    // Load Local Hospital List
    const hospListContainer = document.getElementById('hospital-list');
    hospListContainer.innerHTML = '';

    const deptKey = selectedOption.dept.split(' ')[0]; // e.g. "정형외과"
    const hospitals = JEONJU_HOSPITALS[deptKey] || JEONJU_HOSPITALS['default'];

    hospitals.forEach(h => {
        const item = document.createElement('div');
        item.className = 'hosp-item';
        item.innerHTML = `
            <div class="hosp-name-row">
                <span class="hosp-name">${h.name}</span>
                <span class="hosp-dist">${h.dist}</span>
            </div>
            <span class="hosp-detail">⏰ ${h.hours}</span>
            <span class="hosp-detail">💡 ${h.desc}</span>
        `;
        hospListContainer.appendChild(item);
    });

    switchStep(step3, resultSection);
});

// Restart
document.getElementById('restart-btn').addEventListener('click', () => {
    currentPart = null;
    selectedOption = null;
    switchStep(resultSection, step1);
});

// Utility: Switch Step Animation
function switchStep(from, to) {
    from.classList.remove('active');
    to.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// -------------------------------------------------------------
// Upstage Solar AI Interactive Modal Chat Logic
// -------------------------------------------------------------
const aiModal = document.getElementById('ai-modal');
const openAiModalBtn = document.getElementById('open-ai-modal');
const closeAiModalBtn = document.getElementById('close-ai-modal');
const sendChatBtn = document.getElementById('send-chat-btn');
const chatInput = document.getElementById('chat-input');
const chatBox = document.getElementById('chat-box');
const upstageKeyInput = document.getElementById('upstage-key-input');

openAiModalBtn.addEventListener('click', () => aiModal.classList.add('active'));
closeAiModalBtn.addEventListener('click', () => aiModal.classList.remove('active'));

sendChatBtn.addEventListener('click', handleChatSubmit);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChatSubmit();
});

const DEFAULT_UPSTAGE_KEY = "up_2Tym25ZOXlznGcfuApwqoSlBkHdNk";

async function handleChatSubmit() {
    const userText = chatInput.value.trim();
    if (!userText) return;

    appendMessage(userText, 'user');
    chatInput.value = '';

    const loadingMsg = appendMessage('Upstage Solar AI가 전주 지역 의료 데이터를 분석 중입니다...', 'bot');
    const userKey = upstageKeyInput.value.trim() || DEFAULT_UPSTAGE_KEY;

    // 1. 백엔드 프록시 시도 (서버 실행 중일 때만 동작, 1초 타임아웃)
    try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 1000);
        const resp = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userText, apiKey: userKey }),
            signal: ctrl.signal
        });
        clearTimeout(timer);
        if (resp.ok) {
            const data = await resp.json();
            if (data.reply) {
                loadingMsg.remove();
                appendMessage(data.reply, 'bot');
                return;
            }
        }
    } catch (e) {
        // 서버 없음 or 타임아웃 → 직접 호출로 fallback
    }

    // 2. 브라우저에서 Upstage Solar API 직접 호출 (CORS 허용)
    try {
        const response = await fetch('https://api.upstage.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userKey}`
            },
            body: JSON.stringify({
                model: 'solar-pro',
                messages: [
                    {
                        role: 'system',
                        content: '너는 전주시 특화 1차 방문 진료과 추천 AI 가이드 DocGP이다. 환자의 증상을 듣고 친절하게 1차 방문 추천 진료과(정형외과, 내과, 신경과, 이비인후과 등)와 전주 지역 1·2차 대표 병원을 3문장 이내로 명확하게 권장해라. 절대로 단정적인 의학적 진단을 내리지 말고 1차 진료과 안내임을 밝혀라.'
                    },
                    { role: 'user', content: userText }
                ]
            })
        });

        const data = await response.json();
        loadingMsg.remove();

        if (data.choices && data.choices[0]) {
            appendMessage(data.choices[0].message.content, 'bot');
            return;
        } else if (data.error) {
            appendMessage(`⚠️ API 오류: ${data.error.message || JSON.stringify(data.error)}`, 'bot');
            return;
        }
    } catch (err) {
        console.error('Upstage API 직접 호출 실패:', err);
        loadingMsg.remove();
        appendMessage(`⚠️ Upstage AI 연결 실패: ${err.message}. 데모 모드로 답변합니다.`, 'bot');
        runDemoAiReply(userText);
        return;
    }

    // 3. 마지막 fallback
    loadingMsg.remove();
    runDemoAiReply(userText);
}

function runDemoAiReply(text) {
    let reply = "";
    if (text.includes("머리") || text.includes("두통") || text.includes("어지럼")) {
        reply = "입력하신 증상은 지속적인 두통 및 신경계 이상과 관련되어 1차적으로 [신경과] 방문을 추천합니다. 전주 지역에서는 전주 브레인 신경과의원 또는 2차 예수병원 방문이 적합합니다.";
    } else if (text.includes("허리") || text.includes("관절") || text.includes("어깨") || text.includes("다리")) {
        reply = "근골격계 및 척추 신경 압박이 의심되는 증상입니다. 1차 방문 진료과로 [정형외과] 또는 [통증의학과]를 추천해 드리며, 전주 신시가지 및 효자동 부근 1차 정형외과의원 방문을 안내해 드립니다.";
    } else if (text.includes("배") || text.includes("속") || text.includes("소화") || text.includes("위")) {
        reply = "소화기계 통증으로 의심되며 1차 진료과로 [소화기내과] 방문을 권장합니다. 전주 속편한내과 또는 예수병원 내과 센터에서 빠른 기본 진찰이 가능합니다.";
    } else {
        reply = "말씀해주신 증상으로는 1차 [일반내과] 진찰을 통해 기본 상태를 점검하고 필요시 전주 지역 종합병원 타과로 의뢰받으시는 것이 좋습니다.";
    }
    appendMessage(reply, 'bot');
}

function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv;
}
