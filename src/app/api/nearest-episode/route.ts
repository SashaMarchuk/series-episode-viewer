import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Zod schema for output validation - handle nullable description
const NearestEpisodeSchema = z.object({
  episodeId: z.string(),
  title: z.string(),
  startTime: z.string(),
  description: z.string().nullable(),
})

export type NearestEpisode = z.infer<typeof NearestEpisodeSchema>

export async function GET() {
  try {
    const series = await prisma.series.findFirst({
      orderBy: { created_at: 'desc' },
      where: {
        Salon: {
          some: {
            type: 'SERIES_EPISODE',
          },
        },
      },
      include: {
        Salon: {
          where: {
            type: 'SERIES_EPISODE',
          },
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    })

    if (!series || series.Salon.length === 0) {
      return NextResponse.json(
        { error: 'No series with episodes found' },
        { status: 404 }
      )
    }

    const now = new Date()
    const nearestSalon = series.Salon.reduce((nearest, current) => {
      const currentTimeDiff = Math.abs(
        current.startTime.getTime() - now.getTime()
      )
      const nearestTimeDiff = Math.abs(
        nearest.startTime.getTime() - now.getTime()
      )

      return currentTimeDiff < nearestTimeDiff ? current : nearest
    })

    const response: NearestEpisode = {
      episodeId: nearestSalon.id,
      title: nearestSalon.title,
      startTime: nearestSalon.startTime.toISOString(),
      description: nearestSalon.description || null,
    }

    const validatedResponse = NearestEpisodeSchema.parse(response)

    return NextResponse.json(validatedResponse)
  } catch (error) {
    console.error('Error fetching nearest episode:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
