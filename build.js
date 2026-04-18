/**
 * build.js (Deep Debug Version)
 * Vercel 빌드 시 환경변수 상태를 상세히 출력하고 치환 작업을 수행함.
 */

const fs = require('fs');
const path = require('path');

console.log('--- 🛡️  Vercel 빌드 보조 스크립트 (디버그 모드) ---');
console.log('Node.js 버전:', process.version);
console.log('현재 작업 경로:', process.cwd());

// 1. 환경변수 읽기 및 상태 출력
const replacements = {
    '__SUPABASE_URL_MAIN__': process.env.SUPABASE_URL_MAIN,
    '__SUPABASE_KEY_MAIN__': process.env.SUPABASE_KEY_MAIN,
    '__SUPABASE_URL_GAME__': process.env.SUPABASE_URL_GAME,
    '__SUPABASE_KEY_GAME__': process.env.SUPABASE_KEY_GAME,
};

let hasError = false;
console.log('\n[1] 환경변수 점검:');
Object.entries(replacements).forEach(([placeholder, value]) => {
    const keyName = placeholder.replace(/__/g, '');
    if (!value) {
        console.error(`❌ ${keyName}: 설정되지 않았습니다!`);
        hasError = true;
    } else {
        const masked = value.substring(0, 10) + '...' + value.substring(value.length - 5);
        console.log(`✅ ${keyName}: 감지됨 (길이: ${value.length}, 시작: ${value.substring(0, 5)}...)`);
    }
});

if (hasError) {
    console.error('\n⚠️  필수 환경변수가 누락되어 빌드를 중단합니다.');
    console.error('Vercel Settings > Environment Variables에서 4개의 키가 모두 [Production]으로 설정되었는지 확인하세요.');
    process.exit(1);
}

// 2. dist 폴더 생성 및 파일 복사
const distPath = path.join(__dirname, 'dist');
console.log(`\n[2] 빌드 출력 전용 폴더(dist) 생성 중: ${distPath}`);

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
console.log('✅ 파일 복사 완료');

// 3. 모든 HTML, JS 파일을 대상으로 치환 (정규표현식 사용)
function processDirectory(directory) {
    const items = fs.readdirSync(directory);
    items.forEach(item => {
        const fullPath = path.join(directory, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            processDirectory(fullPath);
        } else if (item.endsWith('.html') || item.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let fileChanged = false;

            Object.entries(replacements).forEach(([placeholder, value]) => {
                // 더 강력한 정규표현식 사용 (g: 전역 치환)
                const regex = new RegExp(placeholder, 'g');
                if (regex.test(content)) {
                    content = content.replace(regex, value);
                    fileChanged = true;
                    console.log(`   └─ 치환: ${item} (${placeholder} -> 적용됨)`);
                }
            });

            if (fileChanged) {
                fs.writeFileSync(fullPath, content);
            }
        }
    });
}

console.log('\n[3] 이름표(Placeholder) 치환 작업 시작:');
processDirectory(distPath);

console.log('\n🎉 빌드 시스템이 모든 작업을 성공적으로 마쳤습니다!');
console.log('Vercel이 이제 dist 폴더의 내용물을 배포합니다.');
console.log('--- 🛡️  빌드 보조 스크립트 종료 ---');
