'use client'

import { useEffect, useState } from 'react'
import { curriculumBand } from '../../lib/curriculum'
import styles from './sheet.module.css'

type Field = { outline: string; x: number; y: number; answer: 1 | 2 | 3 | 4 | 5 }

const boat: Field[] = [
  { outline: 'M145 76 L145 237 L36 237 Z', x: 111, y: 202, answer: 1 },
  { outline: 'M155 78 L272 237 L155 237 Z', x: 187, y: 203, answer: 2 },
  { outline: 'M31 252 H278 L249 289 H55 Z', x: 151, y: 272, answer: 3 },
  { outline: 'M55 289 H249 L228 313 H72 Z', x: 151, y: 301, answer: 4 },
  { outline: 'M31 342 Q52 326 73 342 T115 342 T157 342 T199 342 T241 342 T283 342 V374 H31 Z', x: 155, y: 357, answer: 5 },
  { outline: 'M276 72 A23 23 0 1 1 230 72 A23 23 0 1 1 276 72 Z', x: 253, y: 72, answer: 2 },
]

const market: Field[] = [
  { outline: 'M58 108 H108 L100 159 H36 Z', x: 75, y: 138, answer: 1 },
  { outline: 'M108 108 H152 V159 H100 Z', x: 127, y: 138, answer: 2 },
  { outline: 'M152 108 H196 L204 159 H152 Z', x: 177, y: 138, answer: 1 },
  { outline: 'M196 108 H246 L268 159 H204 Z', x: 230, y: 138, answer: 2 },
  { outline: 'M38 254 H266 V274 H38 Z', x: 152, y: 264, answer: 3 },
  { outline: 'M54 274 H250 V350 H54 Z', x: 152, y: 314, answer: 4 },
  { outline: 'M98 230 A18 18 0 1 1 62 230 A18 18 0 1 1 98 230 Z', x: 80, y: 230, answer: 5 },
  { outline: 'M158 230 A18 18 0 1 1 122 230 A18 18 0 1 1 158 230 Z', x: 140, y: 230, answer: 2 },
  { outline: 'M218 230 A18 18 0 1 1 182 230 A18 18 0 1 1 218 230 Z', x: 200, y: 230, answer: 1 },
]

const colours = ['Red', 'Yellow', 'Brown', 'Green', 'Blue']
const expressions = {
  1: ['4 − 3', '7 − 6'],
  2: ['1 + 1', '6 − 4'],
  3: ['1 + 2', '8 − 5'],
  4: ['2 + 2', '9 − 5'],
  5: ['3 + 2', '10 − 5'],
}

const equations = {
  1: ['4x−3=1', 'x/2+3=3.5', '2(x+2)=6', '5−2x=3'],
  2: ['3x−7=−1', '2(x+3)=10', 'x/4+2=2.5', '5x−4=6'],
  3: ['2x−7=−1', 'x/2+2=3.5', '3(x−1)=6', '8−2x=2'],
  4: ['3x−5=7', 'x/4−2=−1', '2(x−3)=2', '11−2x=3'],
  5: ['3x−8=7', 'x/2+1=3.5', '4(x−1)=16', '13−2x=3'],
}

const mosaic: Field[] = Array.from({ length: 12 }, (_, index) => {
  const x = 24 + (index % 3) * 88
  const y = 42 + Math.floor(index / 3) * 84
  const first = [1, 3, 5, 2, 4] as const
  const second = [4, 2, 1, 5, 3] as const
  return [
    { outline: `M${x} ${y}h88v84Z`, x: x + 59, y: y + 25, answer: first[index % 5] },
    { outline: `M${x} ${y}l88 84h-88Z`, x: x + 29, y: y + 57, answer: second[index % 5] },
  ]
}).flat()

type Mode = 'numbers' | 'sums' | 'algebra'
type Motif = 'boat' | 'market' | 'mosaic'
const pictures = { boat: { title: 'Sailing boat', fields: boat }, market: { title: 'Market stall', fields: market }, mosaic: { title: 'Geometric mosaic', fields: mosaic } }

export default function ColourByNumberPage() {
  const [motif, setMotif] = useState<Motif>('boat')
  const [mode, setMode] = useState<Mode>('numbers')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    let band = ''
    try {
      const age = JSON.parse(localStorage.getItem('activeChild') ?? 'null')?.age_group
      if (typeof age === 'string') band = curriculumBand(age)
    } catch { /* The level can also be chosen manually. */ }

    const requestedMode = params.get('mode')
    const requestedMotif = params.get('motif')
    const level = requestedMode === 'algebra' || requestedMode === 'numbers' || requestedMode === 'sums'
      ? requestedMode : band === '13+' ? 'algebra' : band === '7-9' || band === '10-12' ? 'sums' : 'numbers'
    setMode(level)
    setMotif(requestedMotif === 'boat' || requestedMotif === 'market' || requestedMotif === 'mosaic'
      ? requestedMotif : level === 'algebra' ? 'mosaic' : level === 'sums' ? 'market' : 'boat')
  }, [])

  const { title, fields } = pictures[motif]
  const used = [0, 0, 0, 0, 0, 0]

  return (
    <main className={styles.page}>
      <div className={styles.controls}>
        <a href="/worksheets">← Back to worksheets</a>
        <label>Picture
          <select value={motif} onChange={event => setMotif(event.target.value as Motif)}>
            <option value="boat">Sailing boat</option>
            <option value="market">Market stall</option>
            <option value="mosaic">Geometric mosaic</option>
          </select>
        </label>
        <label>Difficulty
          <select value={mode} onChange={event => setMode(event.target.value as Mode)}>
            <option value="numbers">Numbers 1–5</option>
            <option value="sums">Addition and subtraction</option>
            <option value="algebra">Algebra · 13+</option>
          </select>
        </label>
        <button type="button" onClick={() => window.print()}>Print or save PDF</button>
      </div>
      <article className={styles.sheet}>
        <header>
          <h1>Colour by number</h1>
          <p>{title}</p>
        </header>
        <p>{mode === 'numbers'
          ? 'Match each number to its colour in the key. Colour the matching spaces.'
          : mode === 'algebra' ? 'Solve each equation for x. Use the value of x to find the colour in the key.'
          : 'Work out each sum. Find the answer in the key and colour the space.'}</p>
        <ol className={styles.key} aria-label="Colour key">
          {colours.map((colour, index) => <li key={colour}><strong>{index + 1}</strong> {colour}</li>)}
        </ol>
        <svg className={styles.drawing} viewBox="15 38 282 348" role="img" aria-label={`${title} colouring picture`}>
          {motif === 'market' && <path d="M48 159 H62 V254 H48 Z M242 159 H256 V254 H242 Z" fill="none" stroke="black" strokeWidth="1.8" />}
          {fields.map(field => {
            const index = used[field.answer]++
            const label = mode === 'algebra' ? equations[field.answer][index % 4] : mode === 'sums' ? expressions[field.answer][index % 2] : field.answer
            return (
            <g key={field.outline}>
              <path d={field.outline} fill="white" stroke="black" strokeWidth="1.8" strokeLinejoin="round" />
                <text x={field.x} y={field.y} dominantBaseline="central" textAnchor="middle" fontSize={mode === 'numbers' ? 13 : mode === 'algebra' ? 6.3 : 8}>
                  {label}
                </text>
            </g>
            )
          })}
        </svg>
      </article>
    </main>
  )
}
