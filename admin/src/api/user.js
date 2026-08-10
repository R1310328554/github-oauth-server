import request from './index'

export function loginSelf(data) {
  return request({
    url: '/auth/login',
    method: 'POST',
    data
  })
}

export function registerSelf(data) {
  return request({
    url: '/auth/register',
    method: 'POST',
    data
  })
}

export function logout() {
  return request({
    url: '/auth/logout',
    method: 'GET'
  })
}

export function getUserInfo() {
  return request({
    url: '/auth/me',
    method: 'GET',
    silentError: true
  })
}

export function updateProfile(data) {
  return request({
    url: '/auth/profile',
    method: 'PATCH',
    data
  })
}

export function getProviders() {
  return request({
    url: '/oauth/providers',
    method: 'GET'
  })
}

export function getAllUsers(params) {
  return request({
    url: '/users',
    method: 'GET',
    params
  })
}

export function getUserStats() {
  return request({
    url: '/users/stats',
    method: 'GET'
  })
}

export function unbindProvider(provider) {
  return request({
    url: `/oauth/${provider}/unbind`,
    method: 'DELETE'
  })
}

export function startOAuth(provider, { mode = 'login', returnTo } = {}) {
  const params = new URLSearchParams({
    return_to: returnTo || window.location.origin + '/#/',
    mode
  })
  window.location.href = `/v1/oauth/${provider}/authorize?${params.toString()}`
}

export function sendWhatsAppOtp(data) {
  return request({
    url: '/oauth/whatsapp/otp/send',
    method: 'POST',
    data
  })
}

export function verifyWhatsAppOtp(data) {
  return request({
    url: '/oauth/whatsapp/otp/verify',
    method: 'POST',
    data
  })
}
