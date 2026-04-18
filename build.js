/**
 * build.js (In-Place Injection Version)
 * Vercel이 dist 폴더를 무시하는(Root 배포) 설정을 강제하고 있을 가능성에 대비하여,
 * 루트 폴더에 있는 모든 HTML 원본 파일에 직접 환경변수를 주입합니다.
 */

const fs = require('fs');
const path = require('path');

console.log('--- 🛡️  Vercel 빌드 보조 스크립트 (직접 원본 주입 방식) ---');

// 1. 환경변수 준비
const envData = {
    SUPABASE_URL_MAIN: process.env.SUPABASE_URL_MAIN,
    SUPABASE_KEY_MAIN: process.env.SUPABASE_KEY_MAIN,
    SUPABASE_URL_GAME: process.env.SUPABASE_URL_GAME,
    SUPABASE_KEY_GAME: process.env.SUPABASE_KEY_GAME,
};

console.log('[1] 환경변수 상태 점검:');
Object.entries(envData).forEach(([key, value]) => {
    if (!value) console.warn(`  ⚠️  ${key}: 누락됨 (Vercel 대시보드 설정 필요!)`);
    else console.log(`  ✅ ${key}: 감지됨 (${value.substring(0, 8)}...)`);
});

// 2. HTML 파일 탐색 및 IN-PLACE 주입
function injectEnvInPlace(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // 시스템 폴더 및 의미없는 폴더는 무시
            if (!['node_modules', '.git', 'dist', '.gemini'].includes(file)) {
                injectEnvInPlace(fullPath);
            }
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // 중복 주입 방지
            if (content.includes('id="env-injection"')) {
                console.log(`  ⏩ 이미 주입됨 (건너뜀): ${file}`);
                return;
            }

            const scriptTag = `
<script id="env-injection">
  window._ENV_ = ${JSON.stringify(envData)};
  window._ENV_LOADED_AT = "${new Date().toLocaleString()}";
  console.log('🚀 [Critical] 환경변수 원본 주입 완료');
</script>
`;
            
            if (content.includes('<head>')) {
                content = content.replace('<head>', '<head>\n' + scriptTag);
            } else if (content.includes('<html>')) {
                content = content.replace('<html>', '<html>\n' + scriptTag);
            } else {
                content = scriptTag + content;
            }
            
            fs.writeFileSync(fullPath, content);
            console.log(`  💉 원본 주입 완료: ${path.relative(__dirname, fullPath)}`);
        }
    });
}

console.log('[2] 파일 원본 내 환경변수 주입 시작...');
try {
    injectEnvInPlace(__dirname);
    console.log('\n🎉 조치 완료! 이제 Vercel 패스 설정과 무관하게 환경변수가 주입됩니다.');
} catch (err) {
    console.error('  ❌ 주입 실패:', err);
    process.exit(1);
}

console.log('--- 🛡️  빌드 보조 스크립트 종료 ---');
