import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/landing', '/sample-lesson', '/privacy', '/terms'].map(path => ({
    url: `https://www.waypointeducation.world${path}`,
  }))
}
