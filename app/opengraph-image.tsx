import { ImageResponse } from 'next/og'

export const alt = 'Waypoint Education — Less planning. More learning together.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', background: '#f5f0fc', color: '#302346', padding: 80 }}>
      <div style={{ fontSize: 40, color: '#584473', marginBottom: 32 }}>WAYPOINT EDUCATION</div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 78, fontWeight: 700, lineHeight: 1.12 }}><span>Less planning.</span><span>More learning together.</span></div>
      <div style={{ fontSize: 32, marginTop: 40 }}>Hands-on homeschool lessons for travelling families</div>
    </div>,
    size,
  )
}
