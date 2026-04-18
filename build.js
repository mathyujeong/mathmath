/**
 * build.js
 * Vercel 빌드 시 모든 파일을 dist 폴더로 복사하고, 환경변수를 삽입함.
 */

const fs = require('fs');
const path = require('path');

// 1. 환경변수 읽기
const replacements = {
    '__SUPABASE_URL_MAIN__': process.env.SUPABASE_URL_MAIN,
    '__SUPABASE_KEY_MAIN__': process.env.SUPABASE_KEY_MAIN,
    '__SUPABASE_URL_GAME__': process.env.SUPABASE_URL_GAME,
    '__SUPABASE_KEY_GAME__': process.env.SUPABASE_KEY_GAME,
};

// 필수 환경변수 체크
let hasError = false;
Object.entries(replacements).forEach(([placeholder, value]) => {
    if (!value) {
        console.error(`❌ 환경변수 누락: ${placeholder.replace(/__/g, '')}`);
        hasError = true;
    }
});

if (hasError) {
    console.error('⚠️  모든 환경변수(MAIN 2개, GAME 2개)를 Vercel에 등록해야 합니다.');
    process.exit(1);
}

// 2. dist 폴더 초기화
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
}
fs.mkdirSync(distPath);

// 3. 재귀적으로 파일 복사하는 함수
function copyRecursive(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(childItemName => {
            if (childItemName === 'node_modules' || childItemName === '.git' || childItemName === 'dist') return;
            copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

console.log('📦 파일을 dist 폴더로 복사 중...');
copyRecursive(__dirname, distPath);

// 4. 치환 대상 파일 목록 (dist 폴더 기준)
const targetFiles = [
    'index.html',
    'admin.html',
    'js/program-guard.js',
    'programs/math_dice.html',
    'programs/game.html',
    'programs/zombie_escape.html',
];

console.log('🔧 환경변수 치환 작업 시작...');
targetFiles.forEach(relPath => {
    const fullPath = path.join(distPath, relPath);
    if (!fs.existsSync(fullPath)) {
        console.warn(`⚠️  파일을 찾을 수 없음: ${relPath}`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;

    Object.entries(replacements).forEach(([placeholder, value]) => {
        if (content.includes(placeholder)) {
            content = content.split(placeholder).join(value);
            changed = true;
        }
    });

    if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`✅ 치환 완료: ${relPath}`);
    }
});

console.log('\n🎉 모든 작업이 완료되었습니다! dist 폴더가 배포 준비되었습니다.');
