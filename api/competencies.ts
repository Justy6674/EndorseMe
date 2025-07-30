import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '../lib/auth'
import { z } from 'zod'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.DATABASE_SERVICE_ROLE_KEY!
)

const insertCompetencySchema = z.object({
  competency_area: z.string().min(1),
  evidence_description: z.string().min(1),
  reflective_statement: z.string().optional(),
  competency_level: z.enum(['developing', 'proficient', 'advanced', 'expert']),
  assessment_date: z.string(),
  assessor_name: z.string().optional(),
  assessor_role: z.string().optional()
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Get authenticated user
    const user = await getUser(req)
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    switch (req.method) {
      case 'GET': {
        // Get competency assessments for user
        const { data: assessments, error } = await supabase
          .from('competency_assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('assessment_date', { ascending: false })

        if (error) {
          return res.status(500).json({ message: 'Failed to fetch competency assessments' })
        }

        return res.status(200).json({
          assessments,
          totalAssessments: assessments.length
        })
      }

      case 'POST': {
        // Validate request body
        const validation = insertCompetencySchema.safeParse(req.body)
        if (!validation.success) {
          return res.status(400).json({ 
            message: 'Invalid data', 
            errors: validation.error.errors 
          })
        }

        // Create competency assessment
        const { data, error } = await supabase
          .from('competency_assessments')
          .insert({
            ...validation.data,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) {
          return res.status(500).json({ message: 'Failed to create competency assessment' })
        }

        // Log activity
        await supabase.from('activity_log').insert({
          user_id: user.id,
          action: 'create',
          entity_type: 'competency_assessment',
          entity_id: data.id,
          description: `Added competency assessment: ${validation.data.competency_area}`,
          created_at: new Date().toISOString()
        })

        return res.status(201).json(data)
      }

      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error in competencies:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}