const test = require('ava')
const drone = require('./drone')

test('getLegacyRepo', t => {
  const valid = [{
    DRONE_REMOTE: 'git://github.com/siddharthkp/ci-env.git'
  }, {
    CI_REMOTE: 'git://github.com/siddharthkp/ci-env.git'
  }]
  const invalid = [{}]
  const expected = 'siddharthkp/ci-env'
  
  valid.forEach(env => {
    const actual = drone.getLegacyRepo(env)
    t.is(actual, expected)
  })

  invalid.forEach(env => {
    const actual = drone.getLegacyRepo(env)
    t.is(actual, '')
  })
})