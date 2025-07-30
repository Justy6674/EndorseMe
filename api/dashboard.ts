import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '../lib/auth'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.DATABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get authenticated user
    const user = await getUser(req)
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Get progress overview
    const [
      practiceHoursResult,
      cpdRecordsResult,
      documentsResult,
      milestonesResult,
      activityResult
    ] = await Promise.all([
      // Total practice hours
      supabase
        .from('practice_hours')
        .select('hours')
        .eq('user_id', user.id),
      
      // CPD hours for current period
      supabase
        .from('cpd_records')
        .select('hours_earned')
        .eq('user_id', user.id)
        .eq('registration_period', '2024-2025'),
      
      // Documents count
      supabase
        .from('documents')
        .select('id, is_required')
        .eq('user_id', user.id),
      
      // Progress milestones
      supabase
        .from('progress_milestones')
        .select('*')
        .eq('user_id', user.id),
      
      // Recent activity
      supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
    ])

    // Calculate totals
    const totalPracticeHours = practiceHoursResult.data?.reduce(
      (sum, record) => sum + parseFloat(record.hours), 
      0
    ) || 0

    const cpdHours = cpdRecordsResult.data?.reduce(
      (sum, record) => sum + parseFloat(record.hours_earned), 
      0
    ) || 0

    const documentsUploaded = documentsResult.data?.length || 0
    const documentsRequired = documentsResult.data?.filter(d => d.is_required).length || 15

    // Calculate readiness percentage
    const practiceProgress = Math.min((totalPracticeHours / 5000) * 100, 100)
    const cpdProgress = Math.min((cpdHours / 20) * 100, 100)
    const documentProgress = Math.min((documentsUploaded / documentsRequired) * 100, 100)
    const readinessPercentage = Math.round((practiceProgress + cpdProgress + documentProgress) / 3)

    const progressOverview = {
      totalPracticeHours,
      cpdHours,
      documentsUploaded,
      documentsRequired,
      readinessPercentage
    }

    res.status(200).json({
      progressOverview,
      recentActivity: activityResult.data || []
    })
  } catch (error) {
    console.error('Error in dashboard:', error)
    res.status(500).json({ message: 'Failed to fetch dashboard data' })
  }
}