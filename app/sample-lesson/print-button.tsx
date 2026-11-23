'use client'

export default function PrintButton() {
  return <button type="button" onClick={() => window.print()} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Print the worksheet</button>
}
