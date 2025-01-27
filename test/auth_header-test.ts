import { parse } from '../lib/auth_header'
import { describe, it } from 'vitest'

describe('Parsing Auth Header field-value', function () {
  it('Should handle single space separated values', function () {
    var res = parse('SCHEME VALUE')
    expect(res).to.deep.equal({ scheme: 'SCHEME', value: 'VALUE' })
  })

  it('Should handle CRLF separator', function () {
    var res = parse('SCHEME\nVALUE')
    expect(res).to.deep.equal({ scheme: 'SCHEME', value: 'VALUE' })
  })

  it('Should handle malformed authentication headers with no scheme', function () {
    var res = parse('malformed')
    expect(res).to.not.be.ok
  })

  it('Should return null when the auth header is not a string', function () {
    var res = parse({})
    expect(res).to.be.null
  })
})
