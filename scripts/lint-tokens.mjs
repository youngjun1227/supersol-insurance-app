#!/usr/bin/env node
/* 토큰 lint — 스펙 §8 "금지 목록"을 기계로 강제한다.
   사람 규칙은 새지만 스크립트는 안 샌다. 3명이 각자 짜도 이탈은 커밋이 막힌다.

   검사:
     1) 토큰 밖 hex 색  (tokens.css 제외)
     2) font-size 직접 지정 (var(--fs-*) 아닌 것)
     3) border-radius 직접 지정 (var(--r-*) 아닌 것)
     4) 금지된 라이프 계열 색
     5) 100vh (스펙 §0 — 100dvh 써야 함)

   사용: node scripts/lint-tokens.mjs [파일...]   (없으면 src 전체)
*/
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname, sep } from 'node:path'

const TOKENS_FILE = 'src/styles/tokens.css'

/* 윈도우는 경로 구분자가 역슬래시라 walk() 결과가 'src\\styles\\tokens.css' 가 된다.
   슬래시로 적힌 상수와 문자열 비교가 어긋나 tokens.css 제외 규칙이 통째로 무효였다
   (윈도우에서만 자기 자신을 23건 위반으로 잡음). 비교 전에 항상 정규화한다.
   git 이 넘겨주는 경로(pre-commit)와 CI(ubuntu)는 슬래시라 드러나지 않았다. */
const norm = (p) => p.split(sep).join('/')
// 스펙 §8 — 라이프 계열 색 금지
const FORBIDDEN_HEX = ['265BF0', '3668F6', '111726', '495365']

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (['.css', '.tsx', '.ts'].includes(extname(p))) out.push(p)
  }
  return out
}

const args = process.argv.slice(2)
const files = (args.length ? args : walk('src')).filter(
  (f) => norm(f).startsWith('src/') && ['.css', '.tsx', '.ts'].includes(extname(f)),
)

const problems = []

for (const file of files) {
  let src
  try {
    src = readFileSync(file, 'utf8')
  } catch {
    continue // 삭제된 파일
  }
  const lines = src.split('\n')

  lines.forEach((line, i) => {
    const n = i + 1
    const at = `${file}:${n}`
    // 주석 줄은 건너뛴다 — 설명에 hex를 적는 건 허용
    const isComment = /^\s*(\/\/|\/\*|\*)/.test(line)

    // 1) 토큰 밖 hex
    if (norm(file) !== TOKENS_FILE && !isComment) {
      const hex = line.match(/#[0-9A-Fa-f]{3,8}\b/g)
      if (hex) {
        problems.push(`${at}  토큰 밖 색 ${hex.join(' ')} — tokens.css 의 var(--…) 를 쓰세요`)
      }
    }

    // 4) 라이프 계열 색 (주석에서도 금지)
    for (const bad of FORBIDDEN_HEX) {
      if (line.toUpperCase().includes(bad)) {
        problems.push(`${at}  라이프 계열 색 #${bad} 은 쓸 수 없습니다 (스펙 §8)`)
      }
    }

    if (extname(file) === '.css') {
      // 2) font-size 직접 지정
      if (/font-size\s*:/.test(line) && !/var\(--fs-/.test(line)) {
        problems.push(`${at}  font-size 직접 지정 — var(--fs-*) 또는 .t-* 클래스를 쓰세요 (§2)`)
      }
      // 3) border-radius 직접 지정
      if (/border-radius\s*:/.test(line) && !/var\(--r-/.test(line) && !/\b0\b/.test(line)) {
        problems.push(`${at}  border-radius 직접 지정 — var(--r-*) 를 쓰세요 (§3 라운드 8개)`)
      }
    }

    // 5) 100vh 금지 (주석의 "100vh 금지" 같은 설명은 제외)
    if (/\b100vh\b/.test(line) && !isComment) {
      problems.push(`${at}  100vh 금지 — 100dvh 를 쓰세요 (§0, iOS 하단 바)`)
    }
  })
}

if (problems.length) {
  console.error('\n❌ 토큰 규칙 위반 ' + problems.length + '건:\n')
  for (const p of problems) console.error('  ' + p)
  console.error(`
토큰 밖 값을 Figma에서 발견했다면:
  → 가장 가까운 토큰으로 스냅해서 구현하고
  → docs/디자인변경로그.md 에 한 줄 보고하세요 (Figma는 팀장이 고칩니다)
`)
  process.exit(1)
}

console.log(`✓ 토큰 규칙 통과 (${files.length}개 파일)`)
