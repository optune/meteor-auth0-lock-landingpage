import { Random } from './utils/Random'
import { Base64 } from './utils/Base64'

Auth0 = {}

let auht0Lock

const Auth0ClientId = process.env.AUTH0_CLIENT_ID
const Auth0Domain = process.env.AUTH0_DOMAIN
const LoginUrl = process.env.LOGIN_URL

const theme = {
  logo:
    'https://res.cloudinary.com/optune-me/image/upload/c_pad,h_58,w_200/v1558014130/onescreener-v2/app/logo-onescreener.png',
  primaryColor: '#27E200',
}

// Source: https://github.com/meteor/meteor/blob/master/packages/reload/reload.js
//
// This logic for sessionStorage detection is based on browserstate/history.js
const KEY_NAME = 'Meteor_Reload'

// Source: https://github.com/meteor/meteor/blob/master/packages/oauth/oauth_client.js
Auth0._getCookie = ({ migrationData }) => {
  const cookie = `${KEY_NAME}=${encodeURIComponent(JSON.stringify(migrationData))}; domain=${
    process.env.COOKIE_ORIGIN
  }; max-age=${5 * 60}; path=/;`

  return cookie
}

Auth0._saveDataForRedirect = ({ credentialToken }) => {
  if (credentialToken === undefined || credentialToken === null) return false

  var migrationData = {
    oauth: {
      loginService: 'auth0',
      credentialToken,
    },
  }

  try {
    document.cookie = Auth0._getCookie({ migrationData })
  } catch (err) {
    // We should have already checked this, but just log - don't throw
    console.error(err)
    throw "Couldn't save data for migration to cookie"
  }

  return true
}

// Source: https://github.com/meteor/meteor/blob/master/packages/oauth/oauth_client.js
Auth0._stateParam = (credentialToken, redirectUrl) => {
  const state = {
    loginStyle: 'redirect',
    credentialToken,
    isCordova: false,
  }

  console.log(state)

  state.redirectUrl = redirectUrl || '' + window.location

  // Encode base64 as not all login services URI-encode the state
  // parameter when they pass it back to us.
  // Use the 'base64' package here because 'btoa' isn't supported in IE8/9.
  return Base64.encode(JSON.stringify(state))
}

// @params type: Can be 'login' or 'signup'
// @params loginUrl: Login base url
// @params containerId: Id of the html element the lock widget shall be shown inline. If not set a overlay will be shown
Auth0.showLock = (options = { type: 'login' }) => {
  const credentialToken = Random.secret()
  Auth0._saveDataForRedirect({ credentialToken })

  const isLogin = options.type === 'login'
  const isSignup = options.type === 'signup'
  let redirectUrl = `${LoginUrl}/_oauth/auth0`

  if (options.type) {
    redirectUrl = `${redirectUrl}#${options.type}`
  }

  const languageDictionary = {
    title: isLogin && 'Log in',
    signUpTitle: 'Get started for free',
  }

  // Combine lock options
  const lockOptions = {
    auth: {
      redirectUrl,
      params: {
        state: Auth0._stateParam(credentialToken, `${LoginUrl}/`),
      },
    },
    allowedConnections: (isSignup && ['Username-Password-Authentication']) || null,
    rememberLastLogin: true,
    languageDictionary,
    theme,
    closable: true,
    container: options.containerId,
    allowLogin: isLogin,
    allowSignUp: isSignup,
  }

  // Initialize lock
  auht0Lock = new Auth0Lock(Auth0ClientId, Auth0Domain, lockOptions)

  // Show lock
  auht0Lock.show()
}

Auth0.closeLock = (options = {}) => {
  auht0Lock = null

  if (options.containerId) {
    // Get the container element
    var container = document.getElementById(options.containerId)

    // As long as <ul> has a child node, remove it
    if (container.hasChildNodes()) {
      container.removeChild(container.firstChild)
    }
  }
}
