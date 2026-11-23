'use client'

import { useEffect, useState } from 'react'
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

export default function ColourByNumberPage() {
  const [motif, setMotif] = useState<'boat' | 'market'>('boat')
  const [mode, setMode] = useState<'numbers' | 'sums'>('numbers')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('mode') === 'sums') setMode('sums')
    if (params.get('motif') === 'market') setMotif('market')
  }, [])

  const fields = motif === 'boat' ? boat : market

  return (
    <main className={styles.page}>
      <div className={styles.controls}>
        <a href="/worksheets">← Back to worksheets</a>
        <label>Picture
          <select value={motif} onChange={event => setMotif(event.target.value === 'market' ? 'market' : 'boat')}>
            <option value="boat">Sailing boat</option>
            <option value="market">Market stall</option>
          </select>
        </label>
        <label>Difficulty
          <select value={mode} onChange={event => setMode(event.target.value === 'sums' ? 'sums' : 'numbers')}>
            <option value="numbers">Numbers 1–5</option>
            <option value="sums">Addition and subtraction</option>
          </select>
        </label>
        <button type="button" onClick={() => window.print()}>Print or save PDF</button>
      </div>
      <article className={styles.sheet}>
        <header>
          <h1>Colour by number</h1>
          <p>{motif === 'boat' ? 'Sailing boat' : 'Market stall'}</p>
        </header>
        <p>{mode === 'numbers'
          ? 'Match each number to its colour in the key. Colour the matching spaces.'
          : 'Work out each sum. Find the answer in the key and colour the space.'}</p>
        <ol className={styles.key} aria-label="Colour key">
          {colours.map((colour, index) => <li key={colour}><strong>{index + 1}</strong> {colour}</li>)}
        </ol>
        <svg className={styles.drawing} viewBox="15 38 282 348" role="img" aria-label={motif === 'boat' ? 'Sailing boat colouring picture' : 'Market stall colouring picture'}>
          {motif === 'market' && <path d="M48 159 H62 V254 H48 Z M242 159 H256 V254 H242 Z" fill="none" stroke="black" strokeWidth="1.8" />}
          {fields.map((field, index) => (
            <g key={field.outline}>
              <path d={field.outline} fill="white" stroke="black" strokeWidth="1.8" strokeLinejoin="round" />
                <text x={field.x} y={field.y} dominantBaseline="central" textAnchor="middle" fontSize={mode === 'sums' ? 8 : 13}>
                  {mode === 'numbers' ? field.answer : expressions[field.answer][index % 2]}
                </text>
            </g>
          ))}
        </svg>
      </article>
    </main>
  )
}
