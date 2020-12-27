/**
 * Parses a git URL, extracting the org and repo name.
 * 
 * Older versions of drone (< v4.0) do not export `DRONE_REPO` or `CI_REPO`.
 * They do export `DRONE_REMOTE` and / or `CI_REMOTE` with the git URL.
 * 
 * e.g., `DRONE_REMOTE=git://github.com/siddharthkp/ci-env.git`
 * 
 * @param {Object} env object in shape of `process.env`
 * @param {String} env.DRONE_REMOTE git URL of remote repository
 * @param {String} env.CI_REMOTE git URL of remote repository
 * @returns {String} org/repo (without .git extension)
 */
function getLegacyRepo(env) {
  // default to process.env if no argument provided
  if (!env) { env = process.env }

  // bail if neither variable exists
  let remote = env.DRONE_REMOTE || env.CI_REMOTE
  if (!remote) { return '' }

  // parse out the org and repo name from the git URL
  let parts = remote.split('/').slice(-2)
  let org = parts[0]
  let reponame = parts[1].replace(/\.git$/, '')
  let repo = '' + org + '/' + reponame
  return repo
}

module.exports.getLegacyRepo = getLegacyRepo;