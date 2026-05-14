import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Baileys native modüllerini server-only olarak işaretle
  serverExternalPackages: ['@whiskeysockets/baileys', '@hapi/boom'],

  // Build sırasında Supabase env değişkenleri yoksa hata verme
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
