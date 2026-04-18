/**
 * build.js (Final Injection Version)
 * 모든 HTML 파일의 </body> 태그 직전에 환경변수를 직접 삽입하여 로드 오류를 원천 차단함.
 */

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');

console.log('--- 🛡️  Vercel 빌드 보조 스크립트 (직접 주입 방식) ---');

// 1. 환경변수 준비
const envData = {
    SUPABASE_URL_MAIN: process.env.SUPABASE_URL_MAIN,
    SUPABASE_KEY_MAIN: process.env.SUPABASE_KEY_MAIN,
    SUPABASE_URL_GAME: process.env.SUPABASE_URL_GAME,
    SUPABASE_KEY_GAME: process.env.SUPABASE_KEY_GAME,
};

// 로그 출력
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

// 3. 파일 복사
console.log('[2] 파일 복사 중...');
fs.cpSync(__dirname, distPath, {
    recursive: true,
    filter: (src) => {
        const basename = path.basename(src);
        return !['node_modules', '.git', 'dist', '.gemini', 'build.js', 'package-lock.json'].includes(basename);
    }
});

// 4. HTML 파일에 환경변수 직접 주입 (핵심!)
function injectEnvToHtml(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            injectEnvToHtml(fullPath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // window._ENV_ 를 정의하는 스크립트 생성
            const scriptTag = `
<script id="env-injection">
  window._ENV_ = ${JSON.stringify(envData)};
  window._ENV_INJECTED = true;
  console.log('🚀 [Build-Time] 환경변수가 HTML에 직접 주입되었습니다.');
</script>
`;
            
            // </body> 태그 직전에 삽입 (없으면 맨 뒤에 삽입)
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

console.log('\n🎉 모든 작업이 완료되었습니다. 이제 파일을 못 찾을 일은 없습니다!');
console.log('--- 🛡️  빌드 보조 스크립트 종료 ---');
