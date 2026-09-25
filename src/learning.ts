export type LearningKind = 'grammar' | 'vocabulary' | 'review'

export type LearningRecord = {
  id: string
  kind: LearningKind
  score: number
  total: number
  createdAt: number
  topicName?: string
}

export type LearningError = {
  id: string
  kind: LearningKind
  prompt: string
  solution: string
  context: string
  hint?: string
  createdAt: number
}

export function createLearningRecord(kind: LearningKind, score: number, total: number): LearningRecord {
  return { id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, kind, score, total, createdAt: Date.now() }
}

export function createLearningError(kind: LearningKind, prompt: string, solution: string, context: string): LearningError {
  return { id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, kind, prompt, solution, context, createdAt: Date.now() }
}