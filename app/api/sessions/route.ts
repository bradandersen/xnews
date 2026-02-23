import { NextResponse } from 'next/server'
import { listSessions } from '@/lib/storage'

export async function GET() {
  const sessions = listSessions()
  return NextResponse.json(sessions)
}
