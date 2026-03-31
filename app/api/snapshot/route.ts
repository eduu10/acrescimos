import { NextResponse } from 'next/server'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

interface AgentDesk { col: number; row: number }
interface Agent { id: string; name: string; icon: string; status: string; desk: AgentDesk }
interface SquadState {
  squad: string
  status: string
  step: { current: number; total: number; label: string }
  agents: Agent[]
  handoff: unknown
  startedAt: string | null
  updatedAt: string
}
interface SquadInfo {
  code: string
  name: string
  description: string
  icon: string
  agents: string[]
}

function getSquadsDir(): string {
  return path.resolve(process.cwd(), 'squads')
}

async function discoverSquads(squadsDir: string): Promise<SquadInfo[]> {
  let entries
  try {
    entries = await fsp.readdir(squadsDir, { withFileTypes: true })
  } catch {
    return []
  }

  const squads: SquadInfo[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue

    const yamlPath = path.join(squadsDir, entry.name, 'squad.yaml')
    try {
      const raw = await fsp.readFile(yamlPath, 'utf-8')
      // Simple YAML parsing for name/code/description
      const nameMatch = raw.match(/^name:\s*"?(.+?)"?\s*$/m)
      const codeMatch = raw.match(/^code:\s*"?(.+?)"?\s*$/m)
      const descMatch = raw.match(/^description:\s*"?(.+?)"?\s*$/m)

      squads.push({
        code: codeMatch?.[1] || entry.name,
        name: nameMatch?.[1] || entry.name,
        description: descMatch?.[1] || '',
        icon: '📋',
        agents: [],
      })
    } catch {
      squads.push({
        code: entry.name,
        name: entry.name,
        description: '',
        icon: '📋',
        agents: [],
      })
    }
  }

  return squads
}

async function readActiveStates(squadsDir: string): Promise<Record<string, SquadState>> {
  const states: Record<string, SquadState> = {}
  let entries
  try {
    entries = await fsp.readdir(squadsDir, { withFileTypes: true })
  } catch {
    return states
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const statePath = path.join(squadsDir, entry.name, 'state.json')

    try {
      if (!fs.existsSync(statePath)) continue
      const raw = await fsp.readFile(statePath, 'utf-8')
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed.status === 'string' && Array.isArray(parsed.agents)) {
        states[entry.name] = parsed
      }
    } catch {
      // Skip
    }
  }

  return states
}

export async function GET() {
  const squadsDir = getSquadsDir()
  const snapshot = {
    type: 'SNAPSHOT',
    squads: await discoverSquads(squadsDir),
    activeStates: await readActiveStates(squadsDir),
  }

  return NextResponse.json(snapshot, {
    headers: { 'Cache-Control': 'no-cache' },
  })
}
