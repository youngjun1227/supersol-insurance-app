/* 문구 컴플라이언스 — 금칙어·단정형 청구 표현·실명/실번호 (#108).

   CI 에만 있던 grep 스윕을 스크립트로 뺐다. 이유는 하나 —
   **public 저장소의 실명 유출은 push 후에 잡으면 이미 늦다.** CI 가 빨간불이어도
   커밋은 GitHub 에 올라간 뒤다. 같은 코드를 pre-commit 이 먼저 돌린다.

     node scripts/check-copy.mjs            전체 검사 (CI)
     node scripts/check-copy.mjs a.ts b.md  주어진 파일만 (pre-commit)
*/

import { readFileSync, statSync, readdirSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')

/** 검사 대상 — 코드와 문서. 문구 규칙은 UI·문서 양쪽에 걸린다 */
const CODE_EXT = new Set(['.ts', '.tsx', '.css', '.html'])
const DOC_EXT = new Set(['.md'])

/* 금칙어 — CLAUDE.md 문구 규칙 + 변경로그 §3.
   "청구할 수 있어요"는 단정 표현이라 금지 ("가능할 수 있어요"만 허용) */
const FORBIDDEN_TERMS = [
  '개선안', '솔루션', '노출 증대', '가입 전환', '청구할 수 있어요', 'SOL:VE',
]

/* public 저장소 — 팀원 실명 금지, GitHub 계정명만 쓴다.
   docs 까지 보는 이유: 디자인 레포에서 동기화된 문서에 실명이 섞여 들어온 적이 있다 */
const REAL_NAMES = ['영준', '종광', '찬영']

/** 목데이터 규칙 — 김신한 / 010-0000-0000 만 허용 */
const PHONE = /010-\d{4}-\d{4}/

const SCAN_DIRS = ['src', 'docs']
const SCAN_FILES = ['index.html', 'CLAUDE.md', 'README.md', 'CONTRIBUTING.md']

function walk(dir, out = []) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === 'figma-ref') continue
      walk(full, out)
    } else if (CODE_EXT.has(extname(e.name)) || DOC_EXT.has(extname(e.name))) {
      out.push(full)
    }
  }
  return out
}

function targets() {
  const args = process.argv.slice(2)
  if (args.length > 0) {
    return args
      .map((a) => resolve(ROOT, a))
      .filter((p) => {
        const ext = extname(p)
        if (!CODE_EXT.has(ext) && !DOC_EXT.has(ext)) return false
        try {
          return statSync(p).isFile()
        } catch {
          return false
        }
      })
  }
  const files = []
  for (const d of SCAN_DIRS) walk(resolve(ROOT, d), files)
  for (const f of SCAN_FILES) {
    const p = resolve(ROOT, f)
    try {
      if (statSync(p).isFile()) files.push(p)
    } catch { /* 없으면 넘어간다 */ }
  }
  return files
}

/** 주석 줄인지 — 경고 주석이 스스로 걸리지 않게 (CI grep 과 같은 기준) */
const isComment = (line) => /^\s*(\/\/|\/\*|\*)/.test(line)

const problems = []

for (const file of targets()) {
  let src
  try {
    src = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  const rel = relative(ROOT, file)
  const isDoc = DOC_EXT.has(extname(file))

  src.split('\n').forEach((line, i) => {
    const at = `${rel}:${i + 1}`

    // 금칙어는 코드에서만 본다 (문서에는 "금지" 규칙 자체를 적어야 한다)
    if (!isDoc && !isComment(line)) {
      for (const term of FORBIDDEN_TERMS) {
        if (line.includes(term)) problems.push(`${at}  금지 문구 "${term}"`)
      }
    }

    // 실전화번호 — 목데이터 가명만 허용
    const phone = line.match(PHONE)
    if (phone && !line.includes('010-0000-0000')) {
      problems.push(`${at}  실전화번호 패턴 ${phone[0]} — 010-0000-0000 만 씁니다`)
    }

    // 실명 — 코드·문서 모두 금지 (public 저장소)
    for (const name of REAL_NAMES) {
      if (line.includes(name)) {
        problems.push(`${at}  실명 "${name}" — GitHub 계정명을 쓰세요 (public 저장소)`)
      }
    }
  })
}

if (problems.length > 0) {
  console.error(`\n❌ 문구 규칙 위반 ${problems.length}건:\n`)
  for (const p of problems) console.error(`  ${p}`)
  console.error('\n규칙은 CLAUDE.md "문구 규칙" 절에 있습니다.')
  process.exit(1)
}

console.log(`✓ 문구 규칙 통과 (${targets().length}개 파일)`)
