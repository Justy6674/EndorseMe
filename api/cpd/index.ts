import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '../../lib/auth'
import { z } from 'zod'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.DATABASE_SERVICE_ROLE_KEY!
)

const insertCpdRecordSchema = z.object({
  title: z.string().min(1),
  provider: z.string().optional(),
  category: z.enum(['mandatory', 'continuing_competence', 'education', 'other']),
  activity_type: z.enum(['course', 'conference', 'workshop', 'webinar', 'reading', 'research', 'other']),
  hours_earned: z.number().positive(),
  completion_date: z.string(),
  expiry_date: z.string().optional(),
  description: z.string().optional(),
  learning_outcomes: z.string().optional(),
  reflection: z.string().optional(),
  certificate_url: z.string().optional(),
  evidence_url: z.string().optional(),
  registration_period: z.string()
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
        // Get CPD records for user
        const { data: cpdRecords, error } = await supabase
          .from('cpd_records')
          .select('*')
          .eq('user_id', user.id)
          .order('completion_date', { ascending: false })

        if (error) {
          return res.status(500).json({ message: 'Failed to fetch CPD records' })
        }

        // Calculate current period hours
        const currentPeriodHours = cpdRecords
          .filter(record => record.registration_period === '2024-2025')
          .reduce((sum, record) => sum + parseFloat(record.hours_earned), 0)

        return res.status(200).json({
          cpdRecords,
          currentPeriodHours,
          requiredHours: 20,
          progress: Math.min((currentPeriodHours / 20) * 100, 100)
        })
      }

      case 'POST': {
        // Validate request body
        const validation = insertCpdRecordSchema.safeParse(req.body)
        if (!validation.success) {
          return res.status(400).json({ 
            message: 'Invalid data', 
            errors: validation.error.errors 
          })
        }

        // Create CPD record
        const { data, error } = await supabase
          .from('cpd_records')
          .insert({
            ...validation.data,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) {
          return res.status(500).json({ message: 'Failed to create CPD record' })
        }

        // Log activity
        await supabase.from('activity_log').insert({
          user_id: user.id,
          action: 'create',
          entity_type: 'cpd_record',
          entity_id: data.id,
          description: `Added CPD: ${validation.data.title} (${validation.data.hours_earned} hours)`,
          created_at: new Date().toISOString()
        })

        return res.status(201).json(data)
      }

      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error in cpd:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}