import * as React from 'react'

export function ReportEmail({ title, summary }: { title: string; summary: string }){
  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', padding: 20 }}>
      <h1 style={{ margin: 0 }}>{title}</h1>
      <p>{summary}</p>
      <p style={{ color: '#555' }}>— Fynix</p>
    </div>
  )
}
