// Source: https://github.com/meteor/meteor/blob/master/packages/base64/base64.js

// Base 64 encoding

const BASE_64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

const BASE_64_VALS = Object.create(null)

const getChar = (val) => BASE_64_CHARS.charAt(val)
const getVal = (ch) => (ch === '=' ? -1 : BASE_64_VALS[ch])

for (let i = 0; i < BASE_64_CHARS.length; i++) {
  BASE_64_VALS[getChar(i)] = i
}

const encode = (array) => {
  if (typeof array === 'string') {
    const str = array
    array = newBinary(str.length)
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i)
      if (ch > 0xff) {
        throw new Error('Not ascii. Base64.encode can only take ascii strings.')
      }

      array[i] = ch
    }
  }

  const answer = []
  let a = null
  let b = null
  let c = null
  let d = null

  for (let i = 0; i < array.length; i++) {
    switch (i % 3) {
      case 0:
        a = (array[i] >> 2) & 0x3f
        b = (array[i] & 0x03) << 4
        break
      case 1:
        b = b | ((array[i] >> 4) & 0xf)
        c = (array[i] & 0xf) << 2
        break
      case 2:
        c = c | ((array[i] >> 6) & 0x03)
        d = array[i] & 0x3f
        answer.push(getChar(a))
        answer.push(getChar(b))
        answer.push(getChar(c))
        answer.push(getChar(d))
        a = null
        b = null
        c = null
        d = null
        break
    }
  }

  if (a != null) {
    answer.push(getChar(a))
    answer.push(getChar(b))
    if (c == null) {
      answer.push('=')
    } else {
      answer.push(getChar(c))
    }

    if (d == null) {
      answer.push('=')
    }
  }

  return answer.join('')
}

// XXX This is a weird place for this to live, but it's used both by
// this package and 'ejson', and we can't put it in 'ejson' without
// introducing a circular dependency. It should probably be in its own
// package or as a helper in a package that both 'base64' and 'ejson'
// use.
const newBinary = (len) => {
  if (typeof Uint8Array === 'undefined' || typeof ArrayBuffer === 'undefined') {
    const ret = []
    for (let i = 0; i < len; i++) {
      ret.push(0)
    }

    ret.$Uint8ArrayPolyfill = true
    return ret
  }
  return new Uint8Array(new ArrayBuffer(len))
}

export const Base64 = { encode }
