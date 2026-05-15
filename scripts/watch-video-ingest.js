#!/usr/bin/env node

/**
 * Video Ingest Watcher
 * 
 * Watches /Volumes/ClemVideo/RawFootage for new video files and catalogs them
 * into the Mission Control Supabase database.
 * 
 * Usage: node watch-video-ingest.js [--path /custom/path]
 * 
 * Runs as a background process on the Mac Mini. New files are detected,
 * metadata extracted (duration, resolution), and registered in the videos table.
 * 
 * Requirements: ffprobe (from ffmpeg) for metadata extraction
 */

const fs = require('fs')
const path = require('path')
const { execFile } = require('child_process')
const http = require('https')

// Config
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lmboomcjvrohibzqbmaw.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const WATCH_PATH = process.env.WATCH_PATH || '/Volumes/ClemVideo/RawFootage'
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.mkv', '.avi', '.webm', '.m4v', '.mpg', '.mpeg', '.3gp']
const POLL_INTERVAL_MS = 30000 // 30 seconds

// Track processed files
const processedFiles = new Set()

/**
 * Get video metadata using ffprobe
 */
function getVideoMetadata(filePath) {
  return new Promise((resolve) => {
    execFile('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath
    ], (err, stdout) => {
      if (err) {
        resolve({ duration_seconds: null, resolution: null, file_size: null })
        return
      }
      try {
        const data = JSON.parse(stdout)
        const videoStream = data.streams?.find(s => s.codec_type === 'video')
        const duration = data.format?.duration ? Math.round(parseFloat(data.format.duration)) : null
        const resolution = videoStream ? `${videoStream.width}x${videoStream.height}` : null
        const fileSize = data.format?.size ? parseInt(data.format.size) : null
        resolve({ duration_seconds: duration, resolution, file_size: fileSize })
      } catch {
        resolve({ duration_seconds: null, resolution: null, file_size: null })
      }
    })
  })
}

/**
 * Generate auto-tags based on file path and name
 */
function autoTag(filePath) {
  const tags = []
  const lower = filePath.toLowerCase()
  const fileName = path.basename(filePath, path.extname(filePath)).toLowerCase()
  
  // Location tags
  if (lower.includes('altar')) tags.push('altar')
  if (lower.includes('ceremony')) tags.push('ceremony')
  if (lower.includes('interview')) tags.push('interview')
  if (lower.includes('lecture')) tags.push('lecture')
  if (lower.includes('course')) tags.push('course')
  if (lower.includes('tutorial')) tags.push('tutorial')
  if (lower.includes('b-roll') || lower.includes('broll')) tags.push('b-roll')
  if (lower.includes('behind') || lower.includes('behind_the_scenes') || lower.includes('bts')) tags.push('behind-the-scenes')
  if (lower.includes('podcast')) tags.push('podcast')
  if (lower.includes('live')) tags.push('live')
  if (lower.includes('test') || lower.includes('draft')) tags.push('draft')
  if (lower.includes('final') || lower.includes('export')) tags.push('final')
  if (lower.includes('reel') || lower.includes('short')) tags.push('reel')
  if (lower.includes('tiktok')) tags.push('tiktok')
  if (lower.includes('youtube') || lower.includes('yt')) tags.push('youtube')
  if (lower.includes('instagram') || lower.includes('ig')) tags.push('instagram')
  
  // Date tag from filename patterns
  const dateMatch = fileName.match(/(\d{4})[-_]?(\d{2})[-_]?(\d{2})/)
  if (dateMatch) tags.push(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`)
  
  // Source phone detection
  if (lower.includes('iphone') || lower.includes('img_')) tags.push('iphone')
  if (lower.includes('pixel') || lower.includes('mvimg_')) tags.push('pixel')
  if (lower.includes('screen')) tags.push('screen-recording')
  
  return [...new Set(tags)]
}

/**
 * Catalog a video file in Supabase
 */
async function catalogVideo(filePath) {
  const fileName = path.basename(filePath)
  
  console.log(`[ingest] Processing: ${fileName}`)
  
  // Get metadata
  const meta = await getVideoMetadata(filePath)
  
  // Auto-tag
  const tags = autoTag(filePath)
  
  // Title from filename (clean up)
  const title = fileName
    .replace(/\.[^.]+$/, '') // Remove extension
    .replace(/[-_]/g, ' ')  // Replace dashes/underscores with spaces
    .replace(/\b\w/g, l => l.toUpperCase()) // Title case
    .trim()
  
  const payload = {
    title,
    file_path: filePath,
    duration_seconds: meta.duration_seconds,
    resolution: meta.resolution,
    tags,
    metadata: {
      file_size: meta.file_size,
      file_name: fileName,
      auto_tagged: true,
      ingested_at: new Date().toISOString(),
    },
    // Note: user_id needs to be set — for now we use a placeholder
    // In production, this would be the admin user ID
  }
  
  try {
    const url = new URL(`${SUPABASE_URL}/rest/v1/videos`)
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(payload),
    })
    
    if (res.ok) {
      const created = await res.json()
      console.log(`[ingest] ✅ Cataloged: ${fileName} (${meta.resolution || 'unknown res'}, ${meta.duration_seconds ? `${meta.duration_seconds}s` : 'unknown duration'})`)
      
      // Log to ingest log
      await logIngest(fileName, filePath, meta.file_size, 'completed', created[0]?.id)
      return created[0]
    } else {
      const error = await res.text()
      console.error(`[ingest] ❌ Failed to catalog ${fileName}: ${error}`)
      await logIngest(fileName, filePath, meta.file_size, 'failed', null, error)
      return null
    }
  } catch (err) {
    console.error(`[ingest] ❌ Network error for ${fileName}:`, err.message)
    await logIngest(fileName, filePath, meta.file_size, 'failed', null, err.message)
    return null
  }
}

/**
 * Log ingest event to Supabase
 */
async function logIngest(fileName, filePath, fileSize, status, videoId, errorMsg) {
  try {
    const url = new URL(`${SUPABASE_URL}/rest/v1/video_ingest_log`)
    await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_name: fileName,
        file_path: filePath,
        file_size: fileSize || 0,
        status,
        video_id: videoId,
        error_message: errorMsg || null,
      }),
    })
  } catch {
    // Don't fail on logging errors
  }
}

/**
 * Scan directory for video files
 */
function scanDirectory(dirPath) {
  const files = []
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      if (entry.isDirectory()) {
        files.push(...scanDirectory(fullPath))
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        if (VIDEO_EXTENSIONS.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  } catch (err) {
    console.error(`[ingest] Cannot scan ${dirPath}:`, err.message)
  }
  return files
}

/**
 * Initial scan — catalog all existing unprocessed files
 */
async function initialScan() {
  console.log(`[ingest] Scanning ${WATCH_PATH} for existing videos...`)
  
  if (!fs.existsSync(WATCH_PATH)) {
    console.warn(`[ingest] Watch path does not exist: ${WATCH_PATH}`)
    console.warn('[ingest] Will retry on next poll interval.')
    return
  }
  
  const files = scanDirectory(WATCH_PATH)
  console.log(`[ingest] Found ${files.length} video files`)
  
  for (const file of files) {
    if (!processedFiles.has(file)) {
      await catalogVideo(file)
      processedFiles.add(file)
    }
  }
}

/**
 * Watch for new files — compare current scan against processed set
 */
async function watchForNewFiles() {
  if (!fs.existsSync(WATCH_PATH)) return
  
  const files = scanDirectory(WATCH_PATH)
  for (const file of files) {
    if (!processedFiles.has(file)) {
      console.log(`[ingest] 🆕 New file detected: ${path.basename(file)}`)
      await catalogVideo(file)
      processedFiles.add(file)
    }
  }
}

// Main loop
async function main() {
  console.log('[ingest] Video Ingest Watcher starting...')
  console.log(`[ingest] Watching: ${WATCH_PATH}`)
  console.log(`[ingest] Polling every ${POLL_INTERVAL_MS / 1000}s`)
  
  // Initial scan
  await initialScan()
  
  // Watch loop
  setInterval(async () => {
    await watchForNewFiles()
  }, POLL_INTERVAL_MS)
  
  console.log('[ingest] Watching for new files...')
}

main().catch(err => {
  console.error('[ingest] Fatal error:', err)
  process.exit(1)
})