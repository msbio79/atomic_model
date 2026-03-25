const elementsData = [
    ["?", "미지 원소", 0],
    ["H", "수소", 1], ["He", "헬륨", 4],
    ["Li", "리튬", 7], ["Be", "베릴륨", 9], ["B", "붕소", 11], ["C", "탄소", 12], ["N", "질소", 14], ["O", "산소", 16], ["F", "플루오린", 19], ["Ne", "네온", 20],
    ["Na", "나트륨", 23], ["Mg", "마그네슘", 24], ["Al", "알루미늄", 27], ["Si", "규소", 28], ["P", "인", 31], ["S", "황", 32], ["Cl", "염소", 35], ["Ar", "아르곤", 40],
    ["K", "칼륨", 39], ["Ca", "칼슘", 40], ["Sc", "스칸듐", 45], ["Ti", "타이타늄", 48], ["V", "바나듐", 51], ["Cr", "크로뮴", 52], ["Mn", "망가니즈", 55], ["Fe", "철", 56], ["Co", "코발트", 59], ["Ni", "니켈", 59], ["Cu", "구리", 64], ["Zn", "아연", 65],
    ["Ga", "갈륨", 70], ["Ge", "저마늄", 73], ["As", "비소", 75], ["Se", "셀레늄", 79], ["Br", "브로민", 80], ["Kr", "크립톤", 84],
    ["Rb", "루비듐", 85], ["Sr", "스트론튬", 88], ["Y", "이트륨", 89], ["Zr", "지르코늄", 91], ["Nb", "나이오븀", 93], ["Mo", "몰리브데넘", 96], ["Tc", "테크네튬", 98], ["Ru", "루테늄", 101], ["Rh", "로듐", 103], ["Pd", "팔라듐", 106], ["Ag", "은", 108], ["Cd", "카드뮴", 112],
    ["In", "인듐", 115], ["Sn", "주석", 119], ["Sb", "안티모니", 122], ["Te", "텔루륨", 128], ["I", "아이오딘", 127], ["Xe", "제논", 131],
    ["Cs", "세슘", 133], ["Ba", "바륨", 137], ["La", "란타넘", 139], ["Ce", "세륨", 140], ["Pr", "프라세오디뮴", 141], ["Nd", "네오디뮴", 144], ["Pm", "프로메튬", 145], ["Sm", "사마륨", 150], ["Eu", "유로퓸", 152], ["Gd", "가돌리늄", 157], ["Tb", "터븀", 159], ["Dy", "디스프로슘", 162], ["Ho", "홀뮴", 165], ["Er", "어븀", 167], ["Tm", "툴륨", 169], ["Yb", "이터븀", 173], ["Lu", "루테튬", 175],
    ["Hf", "하프늄", 178], ["Ta", "탄탈럼", 181], ["W", "텅스텐", 184], ["Re", "레늄", 186], ["Os", "오스뮴", 190], ["Ir", "이리듐", 192], ["Pt", "백금", 195], ["Au", "금", 197], ["Hg", "수은", 201],
    ["Tl", "탈륨", 204], ["Pb", "납", 207], ["Bi", "비스무트", 209], ["Po", "폴로늄", 209], ["At", "아스타틴", 210], ["Rn", "라돈", 222],
    ["Fr", "프랑슘", 223], ["Ra", "라듐", 226], ["Ac", "악티늄", 227], ["Th", "토륨", 232], ["Pa", "프로탁티늄", 231], ["U", "우라늄", 238], ["Np", "넵투늄", 237], ["Pu", "플루토늄", 244], ["Am", "아메리슘", 243], ["Cm", "퀴륨", 247], ["Bk", "버클륨", 247], ["Cf", "캘리포늄", 251], ["Es", "아인슈타이늄", 252], ["Fm", "페르뮴", 257], ["Md", "멘델레븀", 258], ["No", "노벨륨", 259], ["Lr", "로렌슘", 262],
    ["Rf", "러더포듐", 267], ["Db", "더브늄", 268], ["Sg", "시보귬", 269], ["Bh", "보륨", 270], ["Hs", "하슘", 269], ["Mt", "마이트너륨", 278], ["Ds", "다름슈타튬", 281], ["Rg", "뢴트게늄", 282], ["Cn", "코페르니슘", 285],
    ["Nh", "니호늄", 286], ["Fl", "플레로븀", 289], ["Mc", "모스코븀", 290], ["Lv", "리버모륨", 293], ["Ts", "테네신", 294], ["Og", "오가네손", 294]
];

const elementsBase = elementsData.map((el, i) => ({
    z: i, symbol: el[0], name: el[1], mass: el[2]
}));

let currentZ = 1;
let currentN = 0;
let currentE = 1;
let zoom = 3.0;

const canvas = document.getElementById('atomCanvas');
const ctx = canvas.getContext('2d');
let width, height;

const NUCLEUS_RADIUS_BASE = 15;
const SHELL_SPACING = 55;
let time = 0;
let isAnimating = true;
let isLightMode = false;
let nucleusParticles = [];
let drawNucleusAsParticles = false;
let currentNucleusRadius = 20;
let drawShellSymbol = false;

function init() {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    setupControls();
    setupElementSelect();
    setupPeriodicTable();
    updateDerivedStats();
    requestAnimationFrame(render);
}

function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth * window.devicePixelRatio;
    canvas.height = container.clientHeight * window.devicePixelRatio;
    width = canvas.width;
    height = canvas.height;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    width /= window.devicePixelRatio;
    height /= window.devicePixelRatio;
}

// 원소 드롭다운 메뉴 초기화
function setupElementSelect() {
    const select = document.getElementById('elSelect');
    if (!select) return;
    select.innerHTML = '';
    for (let i = 1; i < elementsBase.length; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `${i}. ${elementsBase[i].symbol} (${elementsBase[i].name})`;
        select.appendChild(opt);
    }
    select.addEventListener('change', (e) => {
        setElement(parseInt(e.target.value));
    });
}

// 고등학교 과정 단주기율표 (8족 체계) 매핑
function getGridPosAdjusted(z) {
    if (z === 1) return { r: 1, c: 1 };
    if (z === 2) return { r: 1, c: 8 };
    if (z >= 3 && z <= 10) return { r: 2, c: z - 2 }; // Li(1)~Ne(8)
    if (z >= 11 && z <= 18) return { r: 3, c: z - 10 }; // Na(1)~Ar(8)
    if (z >= 19 && z <= 20) return { r: 4, c: z - 18 }; // K(1), Ca(2)
    return { r: 5, c: 1 };
}

function setupPeriodicTable() {
    const grid = document.getElementById('periodicTable');
    grid.innerHTML = '';
    for (let i = 1; i <= 20; i++) {
        const el = elementsBase[i];
        const btn = document.createElement('button');
        btn.className = 'element-btn';
        btn.textContent = el.symbol;
        
        const pos = getGridPosAdjusted(i);
        btn.style.gridColumn = pos.c;
        btn.style.gridRow = pos.r;
        
        btn.addEventListener('click', () => setElement(i));
        grid.appendChild(btn);
    }
}

function updateActivePeriodicTable() {
    const buttons = document.querySelectorAll('.element-btn');
    buttons.forEach((btn, idx) => {
        if (idx + 1 === currentZ) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function setElement(z) {
    currentZ = z;
    currentE = z; 
    currentN = elementsBase[z].mass - z;
    zoom = 3.0;
    updateZoomText();
    updateDerivedStats();
}

function setupControls() {
    document.getElementById('addProton').onclick = () => { currentZ++; updateDerivedStats(); };
    document.getElementById('subProton').onclick = () => { if (currentZ > 0) currentZ--; updateDerivedStats(); };
    
    document.getElementById('addNeutron').onclick = () => { currentN++; updateDerivedStats(); };
    document.getElementById('subNeutron').onclick = () => { if (currentN > 0) currentN--; updateDerivedStats(); };
    
    document.getElementById('addElectron').onclick = () => { currentE++; updateDerivedStats(); };
    document.getElementById('subElectron').onclick = () => { if (currentE > 0) currentE--; updateDerivedStats(); };
    
    document.getElementById('btnZoomIn').onclick = () => { zoom = Math.min(zoom + 0.2, 5.0); updateZoomText(); };
    document.getElementById('btnZoomOut').onclick = () => { zoom = Math.max(zoom - 0.2, 0.4); updateZoomText(); };
    
    document.getElementById('btnToggleAnim').onclick = () => {
        isAnimating = !isAnimating;
        document.getElementById('iconPause').style.display = isAnimating ? 'block' : 'none';
        document.getElementById('iconPlay').style.display = isAnimating ? 'none' : 'block';
    };

    const themeToggleBtn = document.getElementById('btnThemeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.onclick = () => {
            isLightMode = !isLightMode;
            document.body.classList.toggle('light-theme', isLightMode);
            document.getElementById('iconMoon').style.display = isLightMode ? 'none' : 'block';
            document.getElementById('iconSun').style.display = isLightMode ? 'block' : 'none';
            document.getElementById('themeText').textContent = isLightMode ? '다크모드' : '라이트모드';
            
            const divi = document.getElementById('zoomDivider');
            if (divi) divi.style.background = isLightMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)';
        };
    }

    const viewToggleBtn = document.getElementById('btnNucleusView');
    if (viewToggleBtn) {
        viewToggleBtn.onclick = () => {
            drawNucleusAsParticles = !drawNucleusAsParticles;
            viewToggleBtn.textContent = drawNucleusAsParticles ? '핵: 숫자로' : '핵: 입자로';
            autoFitZoom();
        };
    }

    const shellLabelBtn = document.getElementById('btnShellLabel');
    if (shellLabelBtn) {
        shellLabelBtn.onclick = () => {
            drawShellSymbol = !drawShellSymbol;
            shellLabelBtn.textContent = drawShellSymbol ? '껍질: 숫자로' : '껍질: 기호로';
        };
    }

    // 마우스 휠 줌 기능
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.2 : 0.2;
        zoom = Math.min(Math.max(zoom + delta, 0.4), 5.0);
        updateZoomText();
    }, { passive: false });
}

function updateZoomText() {
    document.getElementById('zoomLevel').textContent = `${Math.round(zoom * 100)}%`;
}

function autoFitZoom() {
    if (!width || !height) return;
    
    const shells = getShellsDistribution(currentE);
    let activeShellCount = 0;
    for (let s = 0; s < 7; s++) {
        if (shells[s] > 0 || (s === 0 && currentZ > 0)) activeShellCount = s + 1;
    }
    
    const hasNucleus = currentZ > 0 || currentN > 0;
    let maxNucleusR = 0;
    if (drawNucleusAsParticles) {
        maxNucleusR = hasNucleus ? currentNucleusRadius : 10;
    } else {
        maxNucleusR = (currentZ > 0 && currentN > 0) ? 44 : (hasNucleus ? 20 : 10);
    }
    const baseRadius = hasNucleus ? Math.max(50, maxNucleusR + 18) : 30;
    
    const maxR = activeShellCount > 0 ? baseRadius + (activeShellCount - 1) * SHELL_SPACING : baseRadius;
    const requiredRadius = maxR + 50; 
    
    const minCanvasDim = Math.min(width, height);
    const fitZoom = (minCanvasDim / 2) / requiredRadius;
    
    zoom = Math.min(3.0, fitZoom); // 기본 최대 확대 한계 3.0
    zoom = Math.max(0.4, zoom);
    
    updateZoomText();
}

function updateDerivedStats() {
    generateNucleus();
    updateUI();
    autoFitZoom();
}

function updateUI() {
    const elData = elementsBase[currentZ] || { symbol: '?', name: '미지 원소' };
    
    document.getElementById('elSymbol').textContent = elData.symbol;
    
    const select = document.getElementById('elSelect');
    if (select) {
        if (currentZ >= 1 && currentZ < elementsBase.length) {
            select.value = currentZ;
        } else {
            select.value = "";
        }
    }
    
    document.getElementById('statZ').textContent = currentZ;
    document.getElementById('statA').textContent = currentZ + currentN;
    
    const charge = currentZ - currentE;
    let chargeStr = "0";
    const ionStateBadge = document.getElementById('ionState');
    ionStateBadge.className = 'ion-badge';

    if (charge > 0) {
        chargeStr = `+${charge}`;
        ionStateBadge.textContent = '양이온';
        ionStateBadge.classList.add('cation');
    } else if (charge < 0) {
        chargeStr = `${charge}`;
        ionStateBadge.textContent = '음이온';
        ionStateBadge.classList.add('anion');
    } else {
        ionStateBadge.textContent = '중성 원자';
    }
    
    document.getElementById('statCharge').textContent = chargeStr;
    document.getElementById('countProton').textContent = currentZ;
    document.getElementById('countNeutron').textContent = currentN;
    document.getElementById('countElectron').textContent = currentE;
    updateActivePeriodicTable();
}

// 원자핵 입자 위치 계산
function generateNucleus() {
    nucleusParticles = [];
    const total = currentZ + currentN;
    let particles = [];
    
    let pAdded = 0;
    for (let i = 0; i < total; i++) {
        let expectedP = (currentZ / total) * (i + 1);
        if (pAdded < expectedP) {
            particles.push({type: 'p'});
            pAdded++;
        } else {
            particles.push({type: 'n'});
        }
    }

    const phi = Math.PI * (3 - Math.sqrt(5));
    const particleRadius = 6.5; 
    let maxR = 0;

    particles.forEach((p, i) => {
        let r = Math.sqrt(i) * particleRadius * 0.9; // 1.5에서 0.9로 줄여 입자들이 겹치도록 설정
        let theta = i * phi;
        p.x = Math.cos(theta) * r;
        p.y = Math.sin(theta) * r;
        p.r = r; // 정렬을 위해 중심からの 거리 저장
        nucleusParticles.push(p);
        if (r + particleRadius > maxR) maxR = r + particleRadius;
    });

    // 중심으로부터 먼 입자(바깥)를 먼저 그리고, 가까운 입자(안쪽)를 나중에 그리도록 정렬 (입체감/겹침 자연스럽게)
    nucleusParticles.sort((a, b) => b.r - a.r);

    currentNucleusRadius = particles.length > 0 ? maxR : 10;
}

function getShellsDistribution(eCount) {
    let shells = [0, 0, 0, 0, 0, 0, 0];
    let e = eCount;

    // 실제 원자 오비탈의 에너지 준위 채움 순서 (Aufbau principle)
    // [껍질 인덱스(0부터 시작), 해당 오비탈 수용 가능 전자 수]
    const order = [
        [0, 2],         // 1s
        [1, 2], [1, 6], // 2s, 2p
        [2, 2], [2, 6], // 3s, 3p
        [3, 2],         // 4s
        [2, 10],        // 3d
        [3, 6],         // 4p
        [4, 2],         // 5s
        [3, 10],        // 4d
        [4, 6],         // 5p
        [5, 2],         // 6s
        [3, 14],        // 4f
        [4, 10],        // 5d
        [5, 6],         // 6p
        [6, 2],         // 7s
        [4, 14],        // 5f
        [5, 10],        // 6d
        [6, 6]          // 7p
    ];

    for (let i = 0; i < order.length; i++) {
        const shellIndex = order[i][0];
        const capacity = order[i][1];
        const fill = Math.min(e, capacity);
        shells[shellIndex] += fill;
        e -= fill;
        if (e <= 0) break;
    }

    // 전자가 극도로 많아 남는다면 마지막 껍질에 추가
    if (e > 0) {
        shells[6] += e;
    }
    
    return shells;
}

function render() {
    ctx.clearRect(0, 0, width, height);
    
    const cx = width / 2;
    const cy = height / 2;
    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(zoom, zoom);
    
    const shells = getShellsDistribution(currentE);
    const hasNucleus = currentZ > 0 || currentN > 0;
    let maxNucleusR = 0;
    if (drawNucleusAsParticles) {
        maxNucleusR = hasNucleus ? currentNucleusRadius : 10;
    } else {
        maxNucleusR = (currentZ > 0 && currentN > 0) ? 44 : (hasNucleus ? 20 : 10);
    }
    const baseRadius = hasNucleus ? Math.max(50, maxNucleusR + 18) : 30;
    
    // 전자 껍질(궤도) 그리기
    ctx.lineWidth = 1;
    ctx.strokeStyle = isLightMode ? 'rgba(2, 132, 199, 0.25)' : 'rgba(56, 189, 248, 0.2)';
    
    for (let s = 0; s < 7; s++) {
        if (shells[s] > 0 || (s === 0 && currentZ > 0)) { // 전자가 없어도 1번째 껍질은 기본으로 보이기 
            const radius = baseRadius + (s * SHELL_SPACING);
            
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            const electronCount = shells[s];
            
            // 껍질 오른쪽에 전자 개수 또는 껍질 기호 표시
            ctx.fillStyle = isLightMode ? '#334155' : 'rgba(251, 251, 253, 0.9)';
            ctx.font = '700 24px Pretendard, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            // 텍스트 강조 그림자 효과
            ctx.shadowBlur = isLightMode ? 0 : 6;
            ctx.shadowColor = isLightMode ? 'transparent' : 'rgba(11, 15, 25, 0.8)';
            const symbols = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
            ctx.fillText(drawShellSymbol ? symbols[s] : `${electronCount}`, radius + 10, 0);
            ctx.shadowBlur = 0; // 그림자 초기화
            
            // 전자 그리기
            for (let i = 0; i < electronCount; i++) {
                const speed = 0.00025 * (1.5 / (s + 1)); // 0.0005에서 0.00025로 속도 추가 50% 절감
                const startAngle = (Math.PI * 2 / electronCount) * i;
                const angle = startAngle + time * speed;
                
                const ex = Math.cos(angle) * radius;
                const ey = Math.sin(angle) * radius;
                
                ctx.beginPath();
                ctx.arc(ex, ey, 7, 0, Math.PI * 2);
                ctx.fillStyle = isLightMode ? '#0284c7' : '#38bdf8';
                ctx.shadowBlur = isLightMode ? 0 : 15;
                ctx.shadowColor = isLightMode ? 'transparent' : '#38bdf8';
                ctx.fill();
                ctx.shadowBlur = 0; // 초기화
            }
        }
    }
    
    // 원자핵 후광(Glow) 효과
    if (hasNucleus) {
        ctx.beginPath();
        const gradR = maxNucleusR + 10;
        ctx.arc(0, 0, gradR, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(0,0,0, 0,0,gradR);
        if (isLightMode) {
             grad.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
             grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
             grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
             grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }
        ctx.fillStyle = grad;
        ctx.fill();
    }
    
    // 원자핵(양성자, 중성자) 그리기
    if (drawNucleusAsParticles) {
        nucleusParticles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6.5, 0, Math.PI * 2);

            if (p.type === 'p') {
                ctx.fillStyle = isLightMode ? '#e11d48' : '#f87171';
                ctx.shadowBlur = isLightMode ? 0 : 5;
                ctx.shadowColor = isLightMode ? 'transparent' : 'rgba(248, 113, 113, 0.4)';
            } else {
                ctx.fillStyle = isLightMode ? '#64748b' : '#9ca3af';
                ctx.shadowBlur = isLightMode ? 0 : 5;
                ctx.shadowColor = isLightMode ? 'transparent' : 'rgba(156, 163, 175, 0.4)';
            }
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Highlight for 3D sphere look
            ctx.beginPath();
            ctx.arc(p.x - 2, p.y - 2, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
        });
    } else {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '800 13px Pretendard, sans-serif';

        const drawParticle = (type, count, px, py) => {
            ctx.beginPath();
            ctx.arc(px, py, 20, 0, Math.PI * 2);

            if (type === 'p') {
                ctx.fillStyle = isLightMode ? '#e11d48' : '#f87171';
                ctx.shadowBlur = isLightMode ? 0 : 8;
                ctx.shadowColor = isLightMode ? 'transparent' : 'rgba(248, 113, 113, 0.6)';
            } else {
                ctx.fillStyle = isLightMode ? '#64748b' : '#9ca3af';
                ctx.shadowBlur = isLightMode ? 0 : 8;
                ctx.shadowColor = isLightMode ? 'transparent' : 'rgba(156, 163, 175, 0.6)';
            }
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#ffffff';
            ctx.fillText(type === 'p' ? `p⁺ ${count}` : `n⁰ ${count}`, px, py);
        };

        if (currentZ > 0 && currentN > 0) {
            drawParticle('p', currentZ, -22, 0);
            drawParticle('n', currentN, 22, 0);
        } else if (currentZ > 0) {
            drawParticle('p', currentZ, 0, 0);
        } else if (currentN > 0) {
            drawParticle('n', currentN, 0, 0);
        }
    }
    
    ctx.restore();
    
    if (isAnimating) time += 16;
    requestAnimationFrame(render);
}

document.addEventListener('DOMContentLoaded', init);
