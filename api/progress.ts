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

    // Get progress milestones
    const { data: milestones, error: milestonesError } = await supabase
      .from('progress_milestones')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (milestonesError) {
      return res.status(500).json({ message: 'Failed to fetch milestones' })
    }

    // Get progress overview (same as dashboard)
    const [
      practiceHoursResult,
      cpdRecordsResult,
      documentsResult
    ] = await Promise.all([
      supabase
        .from('practice_hours')
        .select('hours')
        .eq('user_id', user.id),
      
      supabase
        .from('cpd_records')
        .select('hours_earned')
        .eq('user_id', user.id)
        .eq('registration_period', '2024-2025'),
      
      supabase
        .from('documents')
        .select('id, is_required')
        .eq('user_id', user.id)
    ])

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

    const practiceProgress = Math.min((totalPracticeHours / 5000) * 100, 100)
    const cpdProgress = Math.min((cpdHours / 20) * 100, 100)
    const documentProgress = Math.min((documentsUploaded / documentsRequired) * 100, 100)
    const readinessPercentage = Math.round((practiceProgress + cpdProgress + documentProgress) / 3)

    const overview = {
      totalPracticeHours,
      cpdHours,
      documentsUploaded,
      documentsRequired,
      readinessPercentage,
      practiceProgress,
      cpdProgress,
      documentProgress
    }

    // Create or update default milestones if they don't exist
    const defaultMilestones = [
      { milestone_type: 'registration_current', status: 'completed' },
      { milestone_type: 'masters_enrolled', status: 'not_started' },
      { milestone_type: 'masters_completed', status: 'not_started' },
      { milestone_type: 'practice_hours_started', status: totalPracticeHours > 0 ? 'completed' : 'not_started' },
      { milestone_type: 'practice_hours_50_percent', status: totalPracticeHours >= 2500 ? 'completed' : totalPracticeHours > 0 ? 'in_progress' : 'not_started' },
      { milestone_type: 'practice_hours_completed', status: totalPracticeHours >= 5000 ? 'completed' : totalPracticeHours >= 2500 ? 'in_progress' : 'not_started' },
      { milestone_type: 'cpd_requirements_met', status: cpdHours >= 20 ? 'completed' : cpdHours > 0 ? 'in_progress' : 'not_started' },
      { milestone_type: 'documents_uploaded', status: documentsUploaded >= documentsRequired ? 'completed' : documentsUploaded > 0 ? 'in_progress' : 'not_started' },
      { milestone_type: 'portfolio_completed', status: 'not_started' },
      { milestone_type: 'supervisor_verification', status: 'not_started' },
      { milestone_type: 'ready_for_submission', status: readinessPercentage >= 100 ? 'completed' : readinessPercentage >= 80 ? 'in_progress' : 'not_started' },
      { milestone_type: 'application_submitted', status: 'not_started' },
      { milestone_type: 'endorsement_received', status: 'not_started' }
    ]

    // Merge with existing milestones
    const mergedMilestones = defaultMilestones.map(defaultMilestone => {
      const existing = milestones?.find(m => m.milestone_type === defaultMilestone.milestone_type)
      return existing || { ...defaultMilestone, user_id: user.id }
    })

    res.status(200).json({
      milestones: mergedMilestones,
      overview
    })
  } catch (error) {
    console.error('Error in progress:', error)
    res.status(500).json({ message: 'Failed to fetch progress' })
  }
}