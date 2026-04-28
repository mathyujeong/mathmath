-- ============================================================
-- 🔧 Supabase MAIN 프로젝트에 실행할 SQL
-- Supabase Dashboard → SQL Editor → New query → 아래 전체 복사 붙여넣기 후 Run
-- ============================================================

-- ============================================================
-- 1. RPC 함수: delete_ranking_record
--    admin.html에서 랭킹 삭제 시 사용
--    비밀번호 검증 후 지정 테이블의 레코드를 삭제
-- ============================================================
CREATE OR REPLACE FUNCTION delete_ranking_record(
  p_table TEXT,
  p_id BIGINT,
  p_secret TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  allowed_tables TEXT[] := ARRAY[
    'zombie_escape_rank',
    'primenumber',
    'omok_rank',
    'algebra_tiles_rank',
    'algebra_balance_rank'
  ];
  delete_password TEXT := '0000';  -- ⚠️ 원래 GAME DB에서 사용하던 비밀번호로 변경하세요!
BEGIN
  -- 테이블 이름 검증 (SQL Injection 방지)
  IF NOT (p_table = ANY(allowed_tables)) THEN
    RAISE EXCEPTION '허용되지 않은 테이블: %', p_table;
  END IF;

  -- 비밀번호 검증
  IF p_secret != delete_password THEN
    RAISE EXCEPTION '비밀번호가 일치하지 않습니다.'
      USING HINT = '관리자에게 문의하세요.';
  END IF;

  -- 동적 SQL로 삭제 실행
  EXECUTE format('DELETE FROM %I WHERE id = $1', p_table)
  USING p_id;

  RETURN 'OK';
END;
$$;

-- ============================================================
-- 2. RLS (Row Level Security) 정책
--    각 테이블에 대해:
--    - 누구나 조회(SELECT) 가능 (랭킹 보기)
--    - 누구나 삽입(INSERT) 가능 (점수 저장)
--    - 누구나 수정(UPDATE) 가능 (점수 갱신 - algebra 계열에서 사용)
--    - 삭제는 RPC 함수로만 처리 (SECURITY DEFINER)
-- ============================================================

-- ■ zombie_escape_rank
ALTER TABLE zombie_escape_rank ENABLE ROW LEVEL SECURITY;

CREATE POLICY "zombie_escape_rank_select" ON zombie_escape_rank
  FOR SELECT USING (true);

CREATE POLICY "zombie_escape_rank_insert" ON zombie_escape_rank
  FOR INSERT WITH CHECK (true);

-- ■ primenumber
ALTER TABLE primenumber ENABLE ROW LEVEL SECURITY;

CREATE POLICY "primenumber_select" ON primenumber
  FOR SELECT USING (true);

CREATE POLICY "primenumber_insert" ON primenumber
  FOR INSERT WITH CHECK (true);

-- ■ omok_rank
ALTER TABLE omok_rank ENABLE ROW LEVEL SECURITY;

CREATE POLICY "omok_rank_select" ON omok_rank
  FOR SELECT USING (true);

CREATE POLICY "omok_rank_insert" ON omok_rank
  FOR INSERT WITH CHECK (true);

-- ■ algebra_tiles_rank
ALTER TABLE algebra_tiles_rank ENABLE ROW LEVEL SECURITY;

CREATE POLICY "algebra_tiles_rank_select" ON algebra_tiles_rank
  FOR SELECT USING (true);

CREATE POLICY "algebra_tiles_rank_insert" ON algebra_tiles_rank
  FOR INSERT WITH CHECK (true);

CREATE POLICY "algebra_tiles_rank_update" ON algebra_tiles_rank
  FOR UPDATE USING (true) WITH CHECK (true);

-- ■ algebra_balance_rank
ALTER TABLE algebra_balance_rank ENABLE ROW LEVEL SECURITY;

CREATE POLICY "algebra_balance_rank_select" ON algebra_balance_rank
  FOR SELECT USING (true);

CREATE POLICY "algebra_balance_rank_insert" ON algebra_balance_rank
  FOR INSERT WITH CHECK (true);

CREATE POLICY "algebra_balance_rank_update" ON algebra_balance_rank
  FOR UPDATE USING (true) WITH CHECK (true);
