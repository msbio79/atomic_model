const elementsBase = [
    { z: 0, symbol: '?', name: '미지 원소', mass: 0 },
    { z: 1, symbol: 'H', name: '수소', mass: 1 },
    { z: 2, symbol: 'He', name: '헬륨', mass: 4 },
    { z: 3, symbol: 'Li', name: '리튬', mass: 7 },
    { z: 4, symbol: 'Be', name: '베릴륨', mass: 9 },
    { z: 5, symbol: 'B', name: '붕소', mass: 11 },
    { z: 6, symbol: 'C', name: '탄소', mass: 12 },
    { z: 7, symbol: 'N', name: '질소', mass: 14 },
    { z: 8, symbol: 'O', name: '산소', mass: 16 },
    { z: 9, symbol: 'F', name: '플루오린', mass: 19 },
    { z: 10, symbol: 'Ne', name: '네온', mass: 20 },
    { z: 11, symbol: 'Na', name: '나트륨', mass: 23 },
    { z: 12, symbol: 'Mg', name: '마그네슘', mass: 24 },
    { z: 13, symbol: 'Al', name: '알루미늄', mass: 27 },
    { z: 14, symbol: 'Si', name: '규소', mass: 28 },
    { z: 15, symbol: 'P', name: '인', mass: 31 },
    { z: 16, symbol: 'S', name: '황', mass: 32 },
    { z: 17, symbol: 'Cl', name: '염소', mass: 35 },
    { z: 18, symbol: 'Ar', name: '아르곤', mass: 40 },
    { z: 19, symbol: 'K', name: '칼륨', mass: 39 },
    { z: 20, symbol: 'Ca', name: '칼슘', mass: 40 }
];

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

function init() {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    setupControls();
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
    const maxNucleusR = (currentZ > 0 && currentN > 0) ? 44 : (hasNucleus ? 20 : 10);
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
    document.getElementById('elName').textContent = elData.name;
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

// 입점 생성 로직 단순화 (개별 렌더링에서 수치 표시형태로 변경)
function generateNucleus() {
    nucleusParticles = [];
}

function getShellsDistribution(eCount) {
    let shells = [0, 0, 0, 0, 0, 0, 0];
    let e = eCount;
    let fill = Math.min(e, 2); shells[0] += fill; e -= fill; if (e <= 0) return shells;
    fill = Math.min(e, 8); shells[1] += fill; e -= fill; if (e <= 0) return shells;
    fill = Math.min(e, 8); shells[2] += fill; e -= fill; if (e <= 0) return shells;
    fill = Math.min(e, 2); shells[3] += fill; e -= fill; if (e <= 0) return shells;
    fill = Math.min(e, 10); shells[2] += fill; e -= fill; if (e <= 0) return shells;
    fill = Math.min(e, 6); shells[3] += fill; e -= fill; if (e <= 0) return shells;
    shells[3] += e; 
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
    const maxNucleusR = (currentZ > 0 && currentN > 0) ? 44 : (hasNucleus ? 20 : 10);
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
            
            // 껍질 오른쪽에 전자 개수만 크게 표시
            ctx.fillStyle = isLightMode ? '#334155' : 'rgba(251, 251, 253, 0.9)';
            ctx.font = '700 24px Pretendard, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            // 텍스트 강조 그림자 효과
            ctx.shadowBlur = isLightMode ? 0 : 6;
            ctx.shadowColor = isLightMode ? 'transparent' : 'rgba(11, 15, 25, 0.8)';
            ctx.fillText(`${electronCount}`, radius + 10, 0);
            ctx.shadowBlur = 0; // 그림자 초기화
            
            // 전자 그리기
            for (let i = 0; i < electronCount; i++) {
                const speed = 0.001 * (1.5 / (s + 1));
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
    
    // 원자핵(양성자, 중성자) 단일 원 및 숫자 표시
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
    
    ctx.restore();
    
    if (isAnimating) time += 16;
    requestAnimationFrame(render);
}

document.addEventListener('DOMContentLoaded', init);
