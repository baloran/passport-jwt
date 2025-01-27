import * as chai from 'chai'
const chaidPassportStrategy = require('chai-passport-strategy')

chai.use(chaidPassportStrategy)
global.expect = chai.expect
