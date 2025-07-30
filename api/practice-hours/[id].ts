import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '../../lib/auth'
import { z } from 'zod'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.DATABASE_SERVICE_ROLE_KEY!
)

const updatePracticeHoursSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  hours: z.number().positive().optional(),
  workplace: z.string().min(1).optional(),
  department: z.string().optional(),
  position: z.string().min(1).optional(),
  supervisor_name: z.string().min(1).optional(),
  supervisor_email: z.string().email().optional(),
  supervisor_phone: z.string().optional(),
  description: z.string().optional(),
  is_advanced_practice: z.boolean().optional()
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Get authenticated user
    const user = await getUser(req)
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { id } = req.query
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid practice hours ID' })
    }

    // Check if record exists and belongs to user
    const { data: existing, error: checkError } = await supabase
      .from('practice_hours')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existing) {
      return res.status(404).json({ message: 'Practice hours record not found' })
    }

    switch (req.method) {
      case 'PUT': {
        // Validate request body
        const validation = updatePracticeHoursSchema.safeParse(req.body)
        if (!validation.success) {
          return res.status(400).json({ 
            message: 'Invalid data', 
            errors: validation.error.errors 
          })
        }

        // Update practice hours record
        const { data, error } = await supabase
          .from('practice_hours')
          .update({
            ...validation.data,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) {
          return res.status(500).json({ message: 'Failed to update practice hours' })
        }

        // Log activity
        await supabase.from('activity_log').insert({
          user_id: user.id,
          action: 'update',
          entity_type: 'practice_hours',
          entity_id: id,
          description: 'Updated practice hours record',
          created_at: new Date().toISOString()
        })

        return res.status(200).json(data)
      }

      case 'DELETE': {
        // Delete practice hours record
        const { error } = await supabase
          .from('practice_hours')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) {
          return res.status(500).json({ message: 'Failed to delete practice hours' })
        }

        // Log activity
        await supabase.from('activity_log').insert({
          user_id: user.id,
          action: 'delete',
          entity_type: 'practice_hours',
          entity_id: id,
          description: 'Deleted practice hours record',
          created_at: new Date().toISOString()
        })

        return res.status(204).end()
      }

      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error in practice-hours/[id]:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}