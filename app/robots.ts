import { MetadataRoute } from 'next'

const BASE_URL = 'https://waypointeducation.world'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/onboarding',
        '/journal',
        '/portfolio',
        '/practice',
        '/worksheets',
        '/community',
        '/little-readers',
        '/la-report',
        '/api/',
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
