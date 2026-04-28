/**
 * build.js (Public Directory Version)
 * Vercel의 기본 폴더인 public 폴더를 생성하고 안전하게 코드를 주입하는 버전입니다.
 */

const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'public');

console.log('--- 🛡️ Vercel 빌드 보조 스크립트 (Public 폴더 배포) ---');

// 1. 환경변수 준비
const envData = {
    SUPABASE_URL_MAIN: process.env.SUPABASE_URL_MAIN,
    SUPABASE_KEY_MAIN: process.env.SUPABASE_KEY_MAIN,
};

console.log('[1] 환경변수 점검:');
Object.entries(envData).forEach(([key, value]) => {
    if (!value) console.warn(`  ⚠️ ${key}: 누락됨`);
    else console.log(`  ✅ ${key}: 감지됨`);
});

// 2. public 폴더 초기화
if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir);

// 3. 파일 복사 (안전한 재귀 복사)
console.log('[2] 파일 복사 중 (public 폴더)...');
function safeCopyRecursive(src, dest) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(child => {
            // 시스템 폴더 및 의미없는 파일 무시
            if (['node_modules', '.git', 'public', '.gemini', 'dist', 'build.js', 'package-lock.json'].includes(child)) return;
            safeCopyRecursive(path.join(src, child), path.join(dest, child));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}
safeCopyRecursive(__dirname, outputDir);
console.log('  ✅ 복사 완료.');

// 4. HTML 파일 <head>에 직접 주입
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
  window._ENV_LOADED_AT = "${new Date().toISOString()}";
  console.log('🚀 [Critical] 환경변수 Public 주입 완료');
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
            console.log(`  💉 주입 완료: ${path.relative(outputDir, fullPath)}`);
        }
    });
}

console.log('[3] HTML 파일 환경변수 주입 시작...');
injectEnvToHtml(outputDir);

console.log('\n🎉 모든 빌드 준비가 완료되었습니다. Vercel이 public 폴더를 배포합니다.');
