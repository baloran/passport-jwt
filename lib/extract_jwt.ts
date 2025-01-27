import { parseAuthHeader } from './auth_header'
import url from 'url'

// Note: express http converts all headers
// to lower case.
const AUTH_HEADER = 'authorization',
  LEGACY_AUTH_SCHEME = 'JWT',
  BEARER_AUTH_SCHEME = 'bearer'

const fromHeader = function (header_name) {
  return function (request) {
    let token = null
    if (request.headers[header_name]) {
      token = request.headers[header_name]
    }
    return token
  }
}

const fromBodyField = function (field_name) {
  return function (request) {
    let token = null
    if (
      request.body &&
      Object.prototype.hasOwnProperty.call(request.body, field_name)
    ) {
      token = request.body[field_name]
    }
    return token
  }
}

const fromUrlQueryParameter = function (param_name) {
  return function (request) {
    let token: string | string[] | null = null,
      parsed_url = url.parse(request.url, true)
    if (parsed_url.query && parsed_url.query[param_name]) {
      token = parsed_url.query[param_name]
    }
    return token
  }
}

const fromAuthHeaderWithScheme = function (auth_scheme) {
  const auth_scheme_lower = auth_scheme.toLowerCase()
  return function (request) {
    let token: string | null = null
    if (request.headers[AUTH_HEADER]) {
      const auth_params = parseAuthHeader(request.headers[AUTH_HEADER])
      if (
        auth_params &&
        auth_scheme_lower === auth_params.scheme.toLowerCase()
      ) {
        token = auth_params.value
      }
    }
    return token
  }
}

const fromAuthHeaderAsBearerToken = function () {
  return fromAuthHeaderWithScheme(BEARER_AUTH_SCHEME)
}

const fromExtractors = function (extractors) {
  if (!Array.isArray(extractors)) {
    throw new TypeError('extractors.fromExtractors expects an array')
  }

  return function (request) {
    let token = null
    let index = 0
    while (!token && index < extractors.length) {
      token = extractors[index].call(this, request)
      index++
    }
    return token
  }
}

/**
 * This extractor mimics the behavior of the v1.*.* extraction logic.
 *
 * This extractor exists only to provide an easy transition from the v1.*.* API to the v2.0.0
 * API.
 *
 * This extractor first checks the auth header, if it doesn't find a token there then it checks the
 * specified body field and finally the url query parameters.
 *
 * @param options
 *          authScheme: Expected scheme when JWT can be found in HTTP Authorize header. Default is JWT.
 *          tokenBodyField: Field in request body containing token. Default is auth_token.
 *          tokenQueryParameterName: Query parameter name containing the token. Default is auth_token.
 */
const versionOneCompatibility = function (options) {
  const authScheme = options.authScheme || LEGACY_AUTH_SCHEME,
    bodyField = options.tokenBodyField || 'auth_token',
    queryParam = options.tokenQueryParameterName || 'auth_token'

  return function (request) {
    let token: string | string[] | null = null

    const authHeaderExtractor = fromAuthHeaderWithScheme(authScheme)
    token = authHeaderExtractor(request)

    if (!token) {
      const bodyExtractor = fromBodyField(bodyField)
      token = bodyExtractor(request)
    }

    if (!token) {
      const queryExtractor = fromUrlQueryParameter(queryParam)
      token = queryExtractor(request)
    }

    return token
  }
}

/**
 * Export the Jwt extraction functions
 */
export {
  fromHeader,
  fromBodyField,
  fromUrlQueryParameter,
  fromAuthHeaderWithScheme,
  fromAuthHeaderAsBearerToken,
  fromExtractors,
  versionOneCompatibility,
}
