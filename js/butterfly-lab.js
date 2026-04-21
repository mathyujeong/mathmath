/**
 * 유정쌤의 실험실 - 버터플라이 곡선 실험실 엔진 (Butterfly Lab Engine)
 * 템플 페이(Temple H. Fay, 1989)의 버터플라이 곡선을 캔버스에 구현합니다.
 */

class ButterflyLab {
    constructor() {
        this.canvas = document.getElementById('butterfly-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.sizeInput = document.getElementById('butterfly-size');
        this.speedInput = document.getElementById('butterfly-speed');
        this.statusBadge = document.getElementById('butterfly-status');
        
        this.width = 0;
        this.height = 0;
        this.scale = 40; // 하트보다 수치가 작으므로 스케일을 더 크게 잡음 (기본값)
        
        this.drawProgress = 0; // 0에서 1까지 그려지는 정도
        this.isDrawing = true;
        this.tick = 0;
        
        this.init();
    }

    init() {
        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.animate();
        
        // 수식 클릭 시 재시작 효과
        document.querySelector('#butterfly-lab-container .formula-box')?.addEventListener('click', () => {
            this.drawProgress = 0;
            this.isDrawing = true;
            if (this.statusBadge) this.statusBadge.innerText = 'Drawing...';
        });

        window.addEventListener('tabChanged', (e) => {
            if (e.detail.tabId === 'gallery') {
                setTimeout(() => this.resize(), 100);
            }
        });
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.width = rect.width;
        this.height = rect.height;
        
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        
        // 화면 크기에 맞게 스케일 조정 (곡선 범위가 약 -3 ~ 3 이므로 넉넉하게 조정)
        this.scale = Math.min(this.width, this.height) / 10;
    }

    drawGrid() {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        ctx.beginPath();

        for (let x = centerX % this.scale; x < this.width; x += this.scale) {
            ctx.moveTo(x, 0); ctx.lineTo(x, this.height);
        }
        for (let y = centerY % this.scale; y < this.height; y += this.scale) {
            ctx.moveTo(0, y); ctx.lineTo(this.width, y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, 0); ctx.lineTo(centerX, this.height);
        ctx.moveTo(0, centerY); ctx.lineTo(this.width, centerY);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('0', centerX - 10, centerY + 15);
    }

    /**
     * 버터플라이 곡선 매개변수 방정식
     * r = exp(cos(t)) - 2*cos(4t) + sin^5(t/12)
     * x = sin(t) * r
     * y = -cos(t) * r (캔버스 Y축 반전 보정)
     */
    getButterflyCoordinates(t, k) {
        const r = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) + Math.pow(Math.sin(t / 12), 5);
        const x = Math.sin(t) * r;
        const y = -Math.cos(t) * r; // 캔버스는 아래쪽이 +Y이므로 -를 곱해 수학적 위쪽으로 보정
        return {
            x: x * k,
            y: y * k
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawGrid();

        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const baseSize = parseFloat(this.sizeInput?.value || 1);
        const drawSpeed = parseFloat(this.speedInput?.value || 5);

        this.tick += 0.01;

        if (this.isDrawing) {
            this.drawProgress += 0.001 * drawSpeed;
            if (this.drawProgress >= 1) {
                this.drawProgress = 1;
                this.isDrawing = false;
                if (this.statusBadge) this.statusBadge.innerText = 'Animation: Fluttering';
            }
        }

        // '날갯짓' 효과 (미세한 떨림)
        let flutter = 0;
        if (!this.isDrawing) {
            flutter = Math.sin(this.tick * 3) * 0.02;
        }
        const k = baseSize * (1 + flutter);

        this.ctx.beginPath();
        
        // 나비 색상: 시안 -> 바이올렛 그라데이션
        const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#22d3ee'); // cyan-400
        gradient.addColorStop(1, '#818cf8'); // indigo-400
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 2.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // 네온 글로우 효과
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = 'rgba(34, 211, 238, 0.4)';

        const step = 0.05;
        const maxT = (Math.PI * 12) * this.drawProgress; // 12파이까지 그려야 함

        for (let t = 0; t <= maxT; t += step) {
            const coords = this.getButterflyCoordinates(t, k);
            const drawX = centerX + coords.x * this.scale;
            const drawY = centerY + coords.y * this.scale;

            if (t === 0) this.ctx.moveTo(drawX, drawY);
            else this.ctx.lineTo(drawX, drawY);
        }

        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        requestAnimationFrame(() => this.animate());
    }
}

// 스크립트 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    new ButterflyLab();
});
