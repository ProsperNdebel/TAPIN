import { useState, useEffect, useCallback } from 'react'
import { getArticles } from '../services/api'
import { MOCK_ARTICLES } from '../services/mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

/**
 * Hook for fetching and filtering articles.
 * Falls back to mock data when VITE_USE_MOCK is not 'false'.
 */
export function useArticles({ category = '', platform = '', search = '' } = {}) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (USE_MOCK) {
        // Simulate network delay in development
        await new Promise(r => setTimeout(r, 400))
        let data = [...MOCK_ARTICLES]
        if (category && category !== 'All')
          data = data.filter(a => a.category === category)
        if (platform && platform !== 'All')
          data = data.filter(a => a.platform === platform)
        if (search)
          data = data.filter(a =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.excerpt.toLowerCase().includes(search.toLowerCase())
          )
        setArticles(data)
      } else {
        const data = await getArticles({ category, platform, search })
        setArticles(data.items ?? data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [category, platform, search])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  return { articles, loading, error, refetch: fetchArticles }
}
