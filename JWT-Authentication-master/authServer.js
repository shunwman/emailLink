require('dotenv').config()
const cors = require('cors')
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
app.use(cors())
app.use(express.json())
// import { auth } from '../FirebaseConfig';
const auth = require("./FirebaseConfig");
//import { isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink } from 'firebase/auth';
const authFunctions = require("firebase/auth")
let refreshTokens = []

app.post('/token', (req, res) => {
  const refreshToken = req.body.token
  if (refreshToken == null) return res.sendStatus(401)
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    const accessToken = generateAccessToken({ name: user.name })
    res.json({ accessToken: accessToken })
  })
})

app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  res.sendStatus(204)
})

app.post('/login', (req, res) => {
  // Authenticate User

  const email = req.body.email
  const user = { email: email }

  const accessToken = generateAccessToken(user)
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
  refreshTokens.push(refreshToken)
  console.log("accessToken", accessToken, " refreshToken", refreshToken)
  res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

app.post('/emailLink', (req, res) => {
  // Authenticate User

  const email = req.body.email
  authFunctions.sendSignInLinkToEmail(auth, email, {
    // this is the URL that we will redirect back to after clicking on the link in mailbox
    url: 'http://localhost:3000/login',
    handleCodeInApp: true,
  })
  // res.json({ accessToken: accessToken, refreshToken: refreshToken })
  res.json({message: "ok"});
})
app.post('/isSignInWithEmailLink', (req, res) => {
  // Authenticate User

  const window_location_href = req.body.href
 
  // sendSignInLinkToEmail(auth, email, {
    // this is the URL that we will redirect back to after clicking on the link in mailbox
  //   url: 'http://localhost:3000/login',
  //   handleCodeInApp: true,
  // })
  const result = authFunctions.isSignInWithEmailLink(auth, window_location_href)
  console.log("isSignInWithEmailLink", result)
  res.json({isSignInWithEmailLink: result})
})
app.post('/signInWithEmailLink', async (req, res) => {
  // Authenticate User
  try {
  const email = req.body.email
  const window_location_href = req.body.href
  // sendSignInLinkToEmail(auth, email, {
    // this is the URL that we will redirect back to after clicking on the link in mailbox
  //   url: 'http://localhost:3000/login',
  //   handleCodeInApp: true,
  // })
  const result = await authFunctions.signInWithEmailLink(auth, email, window_location_href)
  console.log("signInWithEmailLink", result)
  res.json({result})
  }catch(e){
    res.status(500).json(e)
  }
})
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30000s' })
} 

app.listen(4000)