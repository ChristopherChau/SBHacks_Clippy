import { google } from 'googleapis'
import { shell } from 'electron'
import Store from 'electron-store'
import http from 'http'
import url from 'url'

const store = new (typeof Store === 'function' ? Store : Store.default)()
const CLIENT_ID = import.meta.env.MAIN_VITE_GOOGLE_CLIENT_ID
const CLIENT_SECRET = import.meta.env.MAIN_VITE_GOOGLE_CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:3000'

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

async function getAuthenticatedClient() {
  store.delete('google_tokens')
  const savedTokens = store.get('google_tokens')
  if (savedTokens) {
    oauth2Client.setCredentials(savedTokens)
    return oauth2Client
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events']
  })

  await shell.openExternal(authUrl)

  const tokens = await new Promise((resolve) => {
    const server = http
      .createServer(async (req, res) => {
        if (req.url.includes('/?code=')) {
          const code = new url.URL(req.url, REDIRECT_URI).searchParams.get('code')
          res.end('Authenticated! You can close this window.')
          server.close()
          const { tokens } = await oauth2Client.getToken(code)
          resolve(tokens)
        }
      })
      .listen(3000)
  })

  oauth2Client.setCredentials(tokens)
  store.set('google_tokens', tokens)
  return oauth2Client
}

export async function exportRoadmapToCalendar(roadmap) {
  const auth = await getAuthenticatedClient()
  const calendar = google.calendar({ version: 'v3', auth })
  const results = []

  for (const step of roadmap) {
    const event = {
      summary: `Roadmap: ${step.title}`,
      description: `${step.description}\n\nRecommended Resource: ${step.link}`,
      start: {
        dateTime: step.start,
        timeZone: 'UTC'
      },
      end: {
        dateTime: step.end,
        timeZone: 'UTC'
      }
    }

    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event
      })
      results.push(response.data)
    } catch (error) {
      console.error(`Failed to insert ${step.title}:`, error.message)
      throw new Error(`Google API Error: ${error.message}`)
    }
  }

  return results
}

export async function createCalendarEvent(eventDetails) {
  const auth = await getAuthenticatedClient()
  const calendar = google.calendar({ version: 'v3', auth })
  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: {
      summary: eventDetails.title,
      description: eventDetails.description,
      start: { dateTime: eventDetails.start },
      end: { dateTime: eventDetails.end }
    }
  })

  return response.data
}
