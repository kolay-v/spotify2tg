require('dotenv/config')
const { Airgram, Auth, prompt } = require('airgram')
const Spotify = require('spotify-web-api-node')
const token = require('./token.json')
const {
  CLIENT_SECRET,
  CLIENT_ID
} = process.env

const spotify = new Spotify({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: 'http://localhost:1337/'
})
spotify.setRefreshToken(token)

let trackId = null

const airgram = new Airgram({
  apiId: 21724,
  apiHash: '3e0cb5efcd52300aec5994fdfc5bdc16',
  databaseEncryptionKey: 'a'.repeat(32),
  useFileDatabase: false,
  useChatInfoDatabase: false,
  useMessageDatabase: false,
  useSecretChats: false,
  enableStorageOptimizer: true,
  logVerbosityLevel: 0
})
const auth = new Auth(airgram)

auth.use({
  phoneNumber: () => prompt('phone'),
  code: () => prompt('code'),
  password: () => prompt('pass')
})

const updateTrack = async () => {
  const { item, is_playing: playing } = (await spotify.getMyCurrentPlaybackState()).body
  if (!item) {
    if (trackId !== null) {
      airgram.api.setBio({ bio: '' })
      trackId = null
    }
    return
  }
  const { id, name, artists } = item
  if (trackId === id) return
  if (!playing) {
    airgram.api.setBio({ bio: '' })
    trackId = null
    return
  }
  const trackFrom = artists.map(({ name }) => name).join(' & ')
  const bio = `Now listining to ${trackFrom} - ${name}`
  airgram.api.setBio({ bio })
  trackId = id
}

const refreshToken = async () => {
  const { body } = await spotify.refreshAccessToken()
  spotify.setAccessToken(body['access_token'])
  return body['expires_in']
}

const autoRefreshToken = () => refreshToken().then(expr =>
  setTimeout(autoRefreshToken, (expr - 30) * 1000)
)

airgram.api.setBio({ bio: '' })
  .then(autoRefreshToken)
  .then(() => setInterval(updateTrack, 2000))
  .catch(console.error)
