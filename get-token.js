require('dotenv/config')
const Spotify = require('spotify-web-api-node')
const express = require('express')
const fs = require('fs')
const { CLIENT_ID, CLIENT_SECRET } = process.env

const app = express()
app.get('/', async (req, res) => {
  const code = req.query.code
  res.send('done')
  const { body } = await spotify.authorizationCodeGrant(code)
  const token = body['refresh_token']
  fs.writeFileSync('token.json', JSON.stringify(token))
  process.exit(0)
})
app.listen(1337)

const spotify = new Spotify({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: 'http://localhost:1337/'
})

//  scope: ' user-read-playback-state'
console.log(spotify.createAuthorizeURL([ 'user-read-currently-playing' ]))
