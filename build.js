/**
 * build.js (Self-Reference Protected Version)
 * Vercel 빌드 시 발생한 ERR_FS_CP_EINVAL 오류를 해결한 버전입니다.
 */

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');

console.log('--- 🛡️  Vercel 빌드 보조 스크립트 (무한 루프 방지 버전) ---');

// 1. 환경변수 읽기
const envData = {
    SUPABASE_URL_MAIN: process.env.SUPABASE_URL_MAIN,
    SUPABASE_KEY_MAIN: process.env.SUPABASE_KEY_MAIN,
    SUPABASE_URL_GAME: process.env.SUPABASE_URL_GAME,
    SUPABASE_KEY_GAME: process.env.SUPABASE_KEY_GAME,
};

console.log('[1] 환경변수 상태 점검:');
Object.entries(envData).forEach(([key, value]) => {
    if (!value) console.warn(`  ⚠️  ${key}: 누락됨`);
    else console.log(`  ✅ ${key}: 감지됨 (${value.substring(0, 8)}...)`);
});

// 2. dist 폴더 초기화
if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
}
fs.mkdirSync(distPath);

// 3. 파일 복사 (수동 재귀 방식 - ERR_FS_CP_EINVAL 방지)
console.log('[2] 파일 복사 중 (안전 모드)...');
function safeCopyRecursive(src, dest) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(child => {
            // 핵심: 'dist' 폴더를 비롯한 시스템 폴더는 절대 복사하지 않음
            if (['node_modules', '.git', 'dist', '.gemini', 'build.js', 'package-lock.json'].includes(child)) return;
            safeCopyRecursive(path.join(src, child), path.join(dest, child));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

try {
    safeCopyRecursive(__dirname, distPath);
    console.log('  ✅ 복사 완료.');
} catch (err) {
    console.error('  ❌ 복사 실패:', err);
    process.exit(1);
}

// 4. HTML 파일에 환경변수 직접 주입
function injectEnvToHtml(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            injectEnvToHtml(fullPath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const scriptTag = `
<script id="env-injection">
  window._ENV_ = ${JSON.stringify(envData)};
  window._ENV_INJECTED = true;
  console.log('🚀 [Build-Time] 환경변수 주입 완료');
</script>
`;
            if (content.includes('</body>')) {
                content = content.replace('</body>', scriptTag + '</body>');
            } else {
                content += scriptTag;
            }
            fs.writeFileSync(fullPath, content);
            console.log(`  💉 주입 완료: ${path.relative(distPath, fullPath)}`);
        }
    });
}

console.log('[3] HTML 파일 내 환경변수 주입 시작...');
injectEnvToHtml(distPath);

console.log('\n🎉 빌드 보조 작업이 무사히 완료되었습니다!');
console.log('--- 🛡️  빌드 보조 스크립트 종료 ---');
