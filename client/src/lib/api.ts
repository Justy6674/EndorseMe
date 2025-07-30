import { supabase } from './supabase'

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:3000'

interface RequestOptions extends RequestInit {
  token?: string
}

class ApiClient {
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  private async request<T>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<T> {
    const token = options.token || await this.getAuthToken()
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    const response = await fetch(`${API_BASE}/api${endpoint}`, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  // Auth endpoints
  async getUser() {
    return this.request<any>('/auth/user')
  }

  // Dashboard
  async getDashboard() {
    return this.request<any>('/dashboard')
  }

  // Practice Hours
  async getPracticeHours() {
    return this.request<any>('/practice-hours')
  }

  async createPracticeHours(data: any) {
    return this.request<any>('/practice-hours', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePracticeHours(id: string, data: any) {
    return this.request<any>(`/practice-hours/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deletePracticeHours(id: string) {
    return this.request<void>(`/practice-hours/${id}`, {
      method: 'DELETE',
    })
  }

  // CPD Records
  async getCpdRecords() {
    return this.request<any>('/cpd')
  }

  async createCpdRecord(data: any) {
    return this.request<any>('/cpd', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCpdRecord(id: string, data: any) {
    return this.request<any>(`/cpd/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCpdRecord(id: string) {
    return this.request<void>(`/cpd/${id}`, {
      method: 'DELETE',
    })
  }

  // Documents
  async getDocuments() {
    return this.request<any>('/documents')
  }

  async uploadDocument(data: any) {
    return this.request<any>('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateDocument(id: string, data: any) {
    return this.request<any>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteDocument(id: string) {
    return this.request<void>(`/documents/${id}`, {
      method: 'DELETE',
    })
  }

  // Progress
  async getProgress() {
    return this.request<any>('/progress')
  }

  // Competencies
  async getCompetencies() {
    return this.request<any>('/competencies')
  }

  async createCompetency(data: any) {
    return this.request<any>('/competencies', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiClient()