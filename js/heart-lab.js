/**
 * 유정쌤의 실험실 - 하트 수식 실험실 엔진 (Heart Lab Engine)
 * 데스모스 API 키 없이도 작동하는 커스텀 그래핑 엔진입니다.
 */

class HeartLab {
    constructor() {
        this.canvas = document.getElementById('heart-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.sizeInput = document.getElementById('heart-size');
        this.speedInput = document.getElementById('beat-speed');
        
        this.width = 0;
        this.height = 0;
        this.scale = 15; // 1단위당 픽셀 수
        
        this.drawProgress = 0; // 0에서 1까지 하트가 그려지는 정도
        this.isDrawing = true;
        this.tick = 0;
        
        this.init();
    }

    init() {
        // 반응형 리사이즈 대응
        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.animate();
        
        // 아이들이 수식을 클릭하면 초기화되는 효과
        document.querySelector('.formula-box')?.addEventListener('click', () => {
            this.drawProgress = 0;
            this.isDrawing = true;
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
        
        // 데스모스 느낌의 스케일 조정 (화면 크기에 비례)
        this.scale = Math.min(this.width, this.height) / 50;
    }

    drawGrid() {
        const ctx = this.ctx;
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        // 1. 보조 그리드 (연한 회색)
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

        // 2. 메인 축 (X, Y축)
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Y축
        ctx.moveTo(centerX, 0); ctx.lineTo(centerX, this.height);
        // X축
        ctx.moveTo(0, centerY); ctx.lineTo(this.width, centerY);
        ctx.stroke();

        // 3. 눈금 표현 (선택 사항)
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('0', centerX - 10, centerY + 15);
    }

    /**
     * 하트 매개변수 방정식
     * x = 16 * sin^3(t)
     * y = 13 * cos(t) - 5 * cos(2t) - 2 * cos(3t) - cos(4t)
     */
    getHeartCoordinates(t, k) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
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
        const beatSpeed = parseFloat(this.speedInput?.value || 2.5);

        this.tick += 0.01 * beatSpeed;

        let k = baseSize;
        
        if (this.isDrawing) {
            this.drawProgress += 0.012;
            if (this.drawProgress >= 1) {
                this.drawProgress = 1;
                this.isDrawing = false;
                document.querySelector('.status-badge').innerText = 'Animation: Beating';
            }
        } else {
            // 심장 박동 효과 (Double-beat pattern)
            const beat = Math.pow(Math.sin(this.tick), 10) * 0.12 + Math.pow(Math.sin(this.tick - 0.4), 10) * 0.06;
            k *= (1 + beat);
        }

        // 하트 그리기 시작
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#f472b6';
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // 네온 효과 (글로우)
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = 'rgba(244, 114, 182, 0.6)';

        const step = 0.02;
        const maxT = Math.PI * 2 * this.drawProgress;

        for (let t = 0; t <= maxT; t += step) {
            const coords = this.getHeartCoordinates(t, k);
            const drawX = centerX + coords.x * this.scale;
            const drawY = centerY + coords.y * this.scale;

            if (t === 0) this.ctx.moveTo(drawX, drawY);
            else this.ctx.lineTo(drawX, drawY);
        }

        // 다 그려졌을 때 곡선 닫기
        if (this.drawProgress >= 1) {
            const coords = this.getHeartCoordinates(0, k);
            this.ctx.lineTo(centerX + coords.x * this.scale, centerY + coords.y * this.scale);
        }

        this.ctx.stroke();
        
        // 초기화 (그리드에 그림자가 생기지 않도록)
        this.ctx.shadowBlur = 0;

        requestAnimationFrame(() => this.animate());
    }
}

// 스크립트 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    new HeartLab();
});
