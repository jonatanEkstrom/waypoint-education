'use client'

import { useState } from 'react'
import type { LessonQuickCheck } from '../lib/lesson-quick-check'

export default function QuickCheck({ check }: { check: LessonQuickCheck }) {
  const [choice, setChoice] = useState<string | null>(null)
  const correct = choice === check.answer

  return (
    <fieldset style={{ background: '#FAF7F2', border: '1px solid #DDD0F0', borderRadius: 14, margin: '0 0 16px', padding: 16, minWidth: 0 }}>
      <legend style={{ color: '#332746', fontWeight: 700, padding: '0 6px' }}>Quick check</legend>
      <details style={{ margin: '0 0 12px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Read this aloud to your child</summary>
        <p style={{ margin: '6px 0 0' }}>{check.adultCue}</p>
      </details>
      <p style={{ margin: '0 0 10px' }}>Which word did you hear?</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {check.options.map(word => (
          <button type="button" key={word} aria-pressed={choice === word} disabled={correct}
            onClick={() => setChoice(word)}
            style={{
              minHeight: 44, minWidth: 72, padding: '6px 16px', borderRadius: 10, fontSize: 19,
              border: `2px solid ${choice === word ? '#654c91' : '#DDD0F0'}`,
              background: choice === word ? '#F0EBF9' : 'white', color: '#332746',
            }}>
            {word}
          </button>
        ))}
      </div>
      <p role="status" style={{ margin: choice ? '12px 0 0' : 0, color: '#332746' }}>
        {correct ? check.success : choice ? `Try again. ${check.hint}` : ''}
      </p>
    </fieldset>
  )
}
