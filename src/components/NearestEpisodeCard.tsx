'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import type { NearestEpisode, FetchError } from '@/types/api'
import Spinner from '@/components/ui/Spinner'

const fetcher = async (url: string): Promise<NearestEpisode> => {
  const res = await fetch(url)

  if (!res.ok) {
    const error = new Error(
      'An error occurred while fetching the data.'
    ) as FetchError
    error.status = res.status
    error.info = await res.json().catch(() => ({}))
    throw error
  }

  return res.json()
}

export default function NearestEpisodeCard() {
  const { data, error, isLoading, mutate } = useSWR<NearestEpisode, FetchError>(
    '/api/nearest-episode',
    fetcher,
    {
      revalidateOnFocus: false,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  )

  const [formattedTime, setFormattedTime] = useState<string>('')
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    if (data?.startTime) {
      const date = new Date(data.startTime)
      const formatted = new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date)
      setFormattedTime(formatted)
    }
  }, [data?.startTime])

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await mutate()
    } catch {
    } finally {
      setIsRetrying(false)
    }
  }

  if (error) {
    if (error.status === 404) {
      return (
        <article className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center mb-2">
            <svg
              className="w-5 h-5 text-yellow-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-yellow-800 font-semibold">No Episode Found</h3>
          </div>
          <p className="text-yellow-600 text-sm">
            No upcoming episodes available at the moment.
          </p>
        </article>
      )
    }

    return (
      <article className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
        <div className="flex items-center mb-2">
          <svg
            className="w-5 h-5 text-red-600 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="text-red-800 font-semibold">Error Loading Episode</h3>
        </div>
        <p className="text-red-600 text-sm mb-4">
          {error.status === 500
            ? 'Server error occurred. Please try again later.'
            : 'Failed to load episode information. Please check your connection.'}
        </p>
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRetrying ? (
            <>
              <Spinner size="sm" className="mr-2 text-red-600" />
              Retrying...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </>
          )}
        </button>
      </article>
    )
  }

  if (isLoading) {
    return (
      <article className="bg-white border border-gray-200 rounded-lg p-6 max-w-md shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Spinner size="lg" className="text-blue-600 mr-3" />
          <span className="text-gray-600 font-medium">
            Loading episode information...
          </span>
        </div>
      </article>
    )
  }

  if (!data) {
    return (
      <article className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
        <div className="flex items-center mb-2">
          <svg
            className="w-5 h-5 text-yellow-600 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="text-yellow-800 font-semibold">No Episode Found</h3>
        </div>
        <p className="text-yellow-600 text-sm">
          No upcoming episodes available at the moment.
        </p>
      </article>
    )
  }

  return (
    <article className="bg-white border border-gray-200 rounded-lg p-6 max-w-md shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{data.title}</h3>

      <time
        className="block text-sm font-medium text-blue-600 mb-3"
        dateTime={data.startTime}
        title={data.startTime}
      >
        {formattedTime}
      </time>

      {data.description && (
        <div
          className="text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-a:text-blue-600 prose-a:underline prose-strong:font-semibold prose-em:italic"
          dangerouslySetInnerHTML={{ __html: data.description }}
        />
      )}
    </article>
  )
}
