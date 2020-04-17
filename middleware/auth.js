const crypto = require('crypto')

const secret = process.env.JWT_SECRET
const algorithm = 'aes-192-cbc'
// Key length is dependent on the algorithm. In this case for aes192, it is
// 24 bytes (192 bits).
const key = crypto.scryptSync(secret, 'salt', 24)
const iv = Buffer.alloc(16, 0) // Initialization crypto vector

module.exports = {
  /**
   * Encrypts text
   * @param {string} text - text to encrypt
   */

  encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, key, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return encrypted
  }
}