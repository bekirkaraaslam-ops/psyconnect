import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface Cutoff {
  min: number
  max: number
  label: string
  color: string
}

interface ScoringRules {
  total_fn: 'sum' | 'rosenberg'
  positive_items?: number[]
  negative_items?: number[]
  cutoffs: Cutoff[]
}

function calcScore(answers: number[], rules: ScoringRules): number {
  if (rules.total_fn === 'rosenberg') {
    const maxVal = 3
    return answers.reduce((sum, val, idx) => {
      const isPositive = (rules.positive_items ?? []).includes(idx)
      return sum + (isPositive ? maxVal - val : val)
    }, 0)
  }
  return answers.reduce((sum, v) => sum + v, 0)
}

function getInterpretation(score: number, cutoffs: Cutoff[]): { label: string; color: string } {
  for (const c of cutoffs) {
    if (score >= c.min && score <= c.max) return { label: c.label, color: c.color }
  }
  return { label: '', color: '#64748b' }
}

export async function POST(req: NextRequest) {
  const { token, answers } = await req.json()

  if (!token || !Array.isArray(answers)) {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }

  const supabase = getSupabase()

  const { data: response } = await supabase
    .from('scale_responses')
    .select('id, expires_at, filled_at, scale_id')
    .eq('token', token)
    .maybeSingle()

  if (!response) return NextResponse.json({ error: 'Geçersiz link.' }, { status: 404 })
  if (new Date(response.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Bu linkin süresi dolmuş.' }, { status: 410 })
  }
  if (response.filled_at) {
    return NextResponse.json({ error: 'Bu form zaten doldurulmuş.' }, { status: 409 })
  }

  const { data: scale } = await supabase
    .from('scales')
    .select('scoring_rules')
    .eq('id', response.scale_id)
    .single()

  if (!scale) return NextResponse.json({ error: 'Ölçek bulunamadı.' }, { status: 404 })

  const rules: ScoringRules = scale.scoring_rules
  const totalScore = calcScore(answers, rules)
  const { label, color } = getInterpretation(totalScore, rules.cutoffs)

  const { error } = await supabase
    .from('scale_responses')
    .update({
      answers,
      total_score: totalScore,
      interpretation: label,
      interpretation_color: color,
      filled_at: new Date().toISOString(),
    })
    .eq('id', response.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
