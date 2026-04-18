/**
 * build.js (Head Injection Version)
 * 모든 HTML 파일의 <head> 태그 직후에 환경변수를 주입하여 
 * 다른 스크립트가 실행되기 전에 변수를 미리 준비함.
 */

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');

console.log('--- 🛡️  Vercel 빌드 보조 스크립트 (헤드 주입 방식) ---');

// 1. 환경변수 준비
const envData = {
    SUPABASE_URL_MAIN: process.env.SUPABASE_URL_MAIN,
    SUPABASE_KEY_MAIN: process.env.SUPABASE_KEY_MAIN,
    SUPABASE_URL_GAME: process.env.SUPABASE_URL_GAME,
    SUPABASE_KEY_GAME: process.env.SUPABASE_KEY_GAME,
};

// 2. dist 폴더 초기화
if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
}
fs.mkdirSync(distPath);

// 3. 파일 복사
console.log('[1] 파일 복사 중...');
function safeCopyRecursive(src, dest) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(child => {
            if (['node_modules', '.git', 'dist', '.gemini', 'build.js', 'package-lock.json'].includes(child)) return;
            safeCopyRecursive(path.join(src, child), path.join(dest, child));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}
safeCopyRecursive(__dirname, distPath);

// 4. HTML 파일의 <head>에 환경변수 주입 (가장 먼저 실행되도록!)
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
  console.log('🚀 [Critical] 환경변수 헤드 주입 완료');
</script>
`;
            // <head> 태그 바로 다음에 삽입하여 모든 스크립트보다 먼저 실행되게 함
            if (content.includes('<head>')) {
                content = content.replace('<head>', '<head>' + scriptTag);
            } else if (content.includes('<html>')) {
                content = content.replace('<html>', '<html>' + scriptTag);
            } else {
                content = scriptTag + content;
            }
            
            fs.writeFileSync(fullPath, content);
            console.log(`  💉 헤드 주입 완료: ${path.relative(distPath, fullPath)}`);
        }
    });
}

console.log('[2] HTML 헤드 내 환경변수 주입 시작...');
injectEnvToHtml(distPath);

console.log('\n🎉 모든 작업이 완료되었습니다. 이제 변수가 먼저 도착해 기다리고 있을 겁니다!');
console.log('--- 🛡️  빌드 보조 스크립트 종료 ---');
