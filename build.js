/**
 * build.js (Generation Version)
 * Vercel 빌드 시 js/env.js 파일을 생성하여 환경변수를 주입함.
 */

const fs = require('fs');
const path = require('path');

console.log('--- 🛡️  Vercel 빌드 보조 스크립트 (파일 생성 방식) ---');

// 1. 환경변수 읽기
const envData = {
    SUPABASE_URL_MAIN: process.env.SUPABASE_URL_MAIN,
    SUPABASE_KEY_MAIN: process.env.SUPABASE_KEY_MAIN,
    SUPABASE_URL_GAME: process.env.SUPABASE_URL_GAME,
    SUPABASE_KEY_GAME: process.env.SUPABASE_KEY_GAME,
};

// 필수 환경변수 체크
let hasError = false;
Object.entries(envData).forEach(([key, value]) => {
    if (!value) {
        console.error(`❌ 환경변수 누락: ${key}`);
        hasError = true;
    } else {
        console.log(`✅ ${key}: 감지됨 (길이: ${value.length})`);
    }
});

if (hasError) {
    console.error('\n⚠️  필수 환경변수가 누락되어 빌드를 중단합니다.');
    process.exit(1);
}

// 2. dist 폴더 초기화 및 모든 파일 복사
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
}
fs.mkdirSync(distPath);

function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(child => {
            if (['node_modules', '.git', 'dist'].includes(child)) return;
            copyRecursive(path.join(src, child), path.join(dest, child));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

copyRecursive(__dirname, distPath);
console.log('✅ 모든 파일을 dist 폴더로 복사 완료.');

// 3. js/env.js 파일 생성 (핵심!)
const jsDir = path.join(distPath, 'js');
if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir, { recursive: true });
}

const envJsContent = `// 자동으로 생성된 환경변수 설정 파일
window._ENV_ = ${JSON.stringify(envData, null, 2)};
console.log('🚀 환경변수 로드 완료');
`;

fs.writeFileSync(path.join(jsDir, 'env.js'), envJsContent);
console.log('✅ js/env.js 파일 생성 완료.');

console.log('\n🎉 빌드 시스템이 모든 작업을 성공적으로 마쳤습니다!');
console.log('--- 🛡️  빌드 보조 스크립트 종료 ---');
