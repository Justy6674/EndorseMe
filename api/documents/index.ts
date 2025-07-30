import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '../../lib/auth'
import { z } from 'zod'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.DATABASE_SERVICE_ROLE_KEY!
)

const insertDocumentSchema = z.object({
  category: z.enum([
    'academic_transcripts',
    'certificates',
    'cv_resume',
    'statement_of_service',
    'cpd_evidence',
    'supervisor_references',
    'identity_documents',
    'criminal_history_check',
    'english_proficiency',
    'portfolio_evidence',
    'other'
  ]),
  file_name: z.string().min(1),
  original_file_name: z.string().min(1),
  file_size: z.number().positive(),
  mime_type: z.string().min(1),
  file_url: z.string().url(),
  description: z.string().optional(),
  is_required: z.boolean().default(false),
  expiry_date: z.string().optional()
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
        // Get documents for user
        const { data: documents, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          return res.status(500).json({ message: 'Failed to fetch documents' })
        }

        // Group documents by category
        const documentsByCategory = documents.reduce((acc, doc) => {
          if (!acc[doc.category]) {
            acc[doc.category] = []
          }
          acc[doc.category].push(doc)
          return acc
        }, {} as Record<string, typeof documents>)

        return res.status(200).json({
          documents,
          documentsByCategory,
          totalDocuments: documents.length,
          requiredDocuments: 15
        })
      }

      case 'POST': {
        // Validate request body
        const validation = insertDocumentSchema.safeParse(req.body)
        if (!validation.success) {
          return res.status(400).json({ 
            message: 'Invalid data', 
            errors: validation.error.errors 
          })
        }

        // Create document record
        const { data, error } = await supabase
          .from('documents')
          .insert({
            ...validation.data,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) {
          return res.status(500).json({ message: 'Failed to create document' })
        }

        // Log activity
        await supabase.from('activity_log').insert({
          user_id: user.id,
          action: 'upload',
          entity_type: 'document',
          entity_id: data.id,
          description: `Uploaded ${validation.data.category}: ${validation.data.original_file_name}`,
          created_at: new Date().toISOString()
        })

        return res.status(201).json(data)
      }

      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error in documents:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}