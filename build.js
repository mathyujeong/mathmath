/**
 * build.js (Ultra Stable Version)
 * Vercel 빌드 시 js/env.js 파일을 생성하고 모든 파일을 dist 폴더로 안전하게 복사함.
 */

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');

console.log('--- 🛡️  Vercel 빌드 보조 스크립트 (진단 및 복사 강화) ---');

// 1. 환경변수 읽기
const envData = {
    SUPABASE_URL_MAIN: process.env.SUPABASE_URL_MAIN,
    SUPABASE_KEY_MAIN: process.env.SUPABASE_KEY_MAIN,
    SUPABASE_URL_GAME: process.env.SUPABASE_URL_GAME,
    SUPABASE_KEY_GAME: process.env.SUPABASE_KEY_GAME,
};

// 로그 출력 (진단용)
console.log('[1] 환경변수 상태 점검:');
Object.entries(envData).forEach(([key, value]) => {
    if (!value) {
        console.warn(`  ⚠️  ${key}: 누락됨 (Vercel 설정 확인 필요)`);
    } else {
        console.log(`  ✅ ${key}: 감지됨 (${value.substring(0, 8)}...)`);
    }
});

// 2. dist 폴더 초기화
if (fs.existsSync(distPath)) {
    console.log('[2] 기존 dist 폴더 제거 중...');
    fs.rmSync(distPath, { recursive: true, force: true });
}
fs.mkdirSync(distPath);

// 3. 파일 복사 (fs.cpSync - Node 16.7+ 표준 라이브러리)
console.log('[3] 파일 복사 중 (dist 디렉토리 구축)...');
try {
    // fs.cpSync는 하위 폴더까지 통째로 복사하는 가장 확실한 방법입니다.
    fs.cpSync(__dirname, distPath, {
        recursive: true,
        filter: (src) => {
            const basename = path.basename(src);
            // 제외할 목록
            return !['node_modules', '.git', 'dist', '.gemini', 'build.js', 'package-lock.json'].includes(basename);
        }
    });
    console.log('  ✅ 복사 완료.');
} catch (err) {
    console.error('  ❌ 복사 실패:', err);
    process.exit(1);
}

// 4. js/env.js 파일 생성 (항상 생성됨)
const jsDir = path.join(distPath, 'js');
if (!fs.existsSync(jsDir)) fs.mkdirSync(jsDir, { recursive: true });

const envJsContent = `// 자동으로 생성된 환경변수 설정 파일
window._ENV_ = ${JSON.stringify(envData, null, 2)};
window._ENV_LOADED_AT = "${new Date().toLocaleString()}";
console.log('🚀 [env.js] 환경변수 로딩 시스템 가동');
`;

fs.writeFileSync(path.join(jsDir, 'env.js'), envJsContent);
console.log('[4] js/env.js 파일 생성 완료.');

console.log('\n🎉 모든 빌드 보조 작업을 성공적으로 마쳤습니다!');
console.log('--- 🛡️  빌드 보조 스크립트 종료 ---');
