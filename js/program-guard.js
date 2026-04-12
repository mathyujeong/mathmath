/**
 * Program Guard - Real-time activation checker
 * Protects student pages from being accessed if disabled by the teacher.
 */

const GUARD_CONFIG = {
    supabaseUrl: 'https://ivpxdmmsdulidcjrkcjh.supabase.co',
    supabaseKey: 'sb_publishable_AIrRcoIfhXmB5OgKY2FZFg_AQ9WuZGC'
};

async function initProgramGuard() {
    // 1. Identify current program (Automatically from filename)
    // Example: /programs/math_dice.html -> math_dice
    const path = window.location.pathname;
    const fileName = path.split('/').pop();
    const programId = fileName.replace('.html', '');

    if (!programId || programId === 'index') return;

    // 2. Initialize Supabase
    if (!window.supabase) {
        console.error('Supabase SDK not found. Please include it in the HTML.');
        return;
    }
    const sb = window.supabase.createClient(GUARD_CONFIG.supabaseUrl, GUARD_CONFIG.supabaseKey);

    // 3. Check status immediately
    const { data, error } = await sb
        .from('program_config')
        .select('is_active')
        .eq('id', programId)
        .single();

    if (error) {
        console.warn('Status check failed, defaulting to active:', error);
        return;
    }

    if (data && data.is_active === false) {
        showLockOverlay();
    }

    // 4. Listen for real-time changes
    sb.channel('public:program_config')
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'program_config', 
            filter: `id=eq.${programId}` 
        }, (payload) => {
            if (payload.new.is_active === false) {
                showLockOverlay();
            } else {
                removeLockOverlay();
            }
        })
        .subscribe();
}

function showLockOverlay() {
    if (document.getElementById('program-lock-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'program-lock-overlay';
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(253, 251, 247, 0.98);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        z-index: 99999; backdrop-filter: blur(8px);
        font-family: 'Noto Sans KR', sans-serif; text-align: center; padding: 20px;
    `;

    overlay.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 30px; border: 2px solid #ffdfba; box-shadow: 0 10px 30px rgba(0,0,0,0.05); max-width: 400px; width: 100%;">
            <div style="font-size: 60px; margin-bottom: 20px;">🔒</div>
            <h2 style="font-family: 'Black Han Sans', sans-serif; font-size: 32px; color: #374151; margin-bottom: 10px;">지금은 탐험할 수 없어요!</h2>
            <p style="color: #6b7280; margin-bottom: 30px; line-height: 1.6;">선생님이 프로그램을 열어주실 때까지<br>잠시만 기다려주세요! 🌱</p>
            <button onclick="location.href='../index.html'" style="
                background: #ffd6e0; color: #c026d3; border: none; padding: 12px 30px;
                border-radius: 15px; font-weight: bold; font-size: 18px; cursor: pointer;
                box-shadow: 0 4px 0 #fbcfe8; transition: all 0.2s;
            " onmousedown="this.style.transform='translateY(2px)'; this.style.boxShadow='0 2px 0 #fbcfe8'"
               onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 0 #fbcfe8'">
                연구실 홈으로 돌아가기
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
}

function removeLockOverlay() {
    const overlay = document.getElementById('program-lock-overlay');
    if (overlay) overlay.remove();
}

// Global initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProgramGuard);
} else {
    initProgramGuard();
}
