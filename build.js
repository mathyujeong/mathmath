/**
 * build.js
 * Vercel 빌드 시 환경변수를 HTML/JS 파일에 자동으로 삽입하는 스크립트
 */

const fs = require('fs');

// 환경변수에서 값 읽기
const replacements = {
  '__SUPABASE_URL_MAIN__': process.env.SUPABASE_URL_MAIN,
  '__SUPABASE_KEY_MAIN__': process.env.SUPABASE_KEY_MAIN,
  '__SUPABASE_URL_GAME__': process.env.SUPABASE_URL_GAME,
  '__SUPABASE_KEY_GAME__': process.env.SUPABASE_KEY_GAME,
};

// 수정할 파일 목록
const files = [
  'index.html',
  'admin.html',
  'js/program-guard.js',
  'programs/math_dice.html',
  'programs/game.html',
  'programs/zombie_escape.html',
];

let hasError = false;

// 누락된 환경변수 체크
Object.entries(replacements).forEach(([placeholder, value]) => {
  if (!value) {
    console.error(`❌ 환경변수 누락: ${placeholder.replace(/__/g, '')} 가 설정되지 않았습니다.`);
    hasError = true;
  }
});

if (hasError) {
  console.error('\n⚠️  Vercel 환경변수를 확인해주세요. 가이드: vercel_env_setup_guide.md');
  process.exit(1);
}

// 각 파일의 placeholder를 실제 값으로 교체
files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.warn(`⚠️  파일 없음, 건너뜀: ${file}`);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  Object.entries(replacements).forEach(([placeholder, value]) => {
    if (content.includes(placeholder)) {
      content = content.split(placeholder).join(value);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`✅ 완료: ${file}`);
  } else {
    console.log(`⏭️  변경 없음: ${file}`);
  }
});

console.log('\n🎉 빌드 완료! 환경변수가 모두 적용되었습니다.');
