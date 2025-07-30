import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '../../lib/auth'
import { z } from 'zod'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.DATABASE_SERVICE_ROLE_KEY!
)

const insertPracticeHoursSchema = z.object({
  start_date: z.string(),
  end_date: z.string(),
  hours: z.number().positive(),
  workplace: z.string().min(1),
  department: z.string().optional(),
  position: z.string().min(1),
  supervisor_name: z.string().min(1),
  supervisor_email: z.string().email().optional(),
  supervisor_phone: z.string().optional(),
  description: z.string().optional(),
  is_advanced_practice: z.boolean().default(true)
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
        // Get practice hours for user
        const { data: practiceHours, error } = await supabase
          .from('practice_hours')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false })

        if (error) {
          return res.status(500).json({ message: 'Failed to fetch practice hours' })
        }

        // Calculate total hours
        const totalHours = practiceHours.reduce(
          (sum, record) => sum + parseFloat(record.hours), 
          0
        )

        return res.status(200).json({
          practiceHours,
          totalHours,
          requiredHours: 5000,
          progress: Math.min((totalHours / 5000) * 100, 100)
        })
      }

      case 'POST': {
        // Validate request body
        const validation = insertPracticeHoursSchema.safeParse(req.body)
        if (!validation.success) {
          return res.status(400).json({ 
            message: 'Invalid data', 
            errors: validation.error.errors 
          })
        }

        // Create practice hours record
        const { data, error } = await supabase
          .from('practice_hours')
          .insert({
            ...validation.data,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) {
          return res.status(500).json({ message: 'Failed to create practice hours' })
        }

        // Log activity
        await supabase.from('activity_log').insert({
          user_id: user.id,
          action: 'create',
          entity_type: 'practice_hours',
          entity_id: data.id,
          description: `Added ${validation.data.hours} practice hours`,
          created_at: new Date().toISOString()
        })

        return res.status(201).json(data)
      }

      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error in practice-hours:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}