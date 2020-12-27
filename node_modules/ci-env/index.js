let drone = require('./utils/drone');
// platform denotes code hosting provider i.e github, gitlab, bitbucket etc.
// Had to introduce this variable as there are cases when CI is run on the same platform where code is hosted as those cases need to be handled differently.
// Default value is github
let platform = 'github';
let repo,
  sha,
  event,
  commit_message,
  pull_request_target_branch,
  pull_request_number,
  branch,
  ci,
  jobUrl,
  buildUrl;

if (process.env.TRAVIS) {
  // Reference: https://docs.travis-ci.com/user/environment-variables

  repo = process.env.TRAVIS_REPO_SLUG;
  sha = process.env.TRAVIS_PULL_REQUEST_SHA || process.env.TRAVIS_COMMIT;
  event = process.env.TRAVIS_EVENT_TYPE;
  commit_message = process.env.TRAVIS_COMMIT_MESSAGE;
  pull_request_number = process.env.TRAVIS_PULL_REQUEST;
  jobUrl = `https://travis-ci.org/${repo}/jobs/${process.env.TRAVIS_JOB_ID}`;
  buildUrl = `https://travis-ci.org/${repo}/builds/${process.env.TRAVIS_JOB_ID}`;

  branch =
    process.env.TRAVIS_EVENT_TYPE === 'push'
      ? process.env.TRAVIS_BRANCH
      : process.env.TRAVIS_PULL_REQUEST_BRANCH;
  pull_request_target_branch =
    process.env.TRAVIS_EVENT_TYPE === 'push' 
      ? ''
      : process.env.TRAVIS_BRANCH;

  ci = 'travis';
} else if (process.env.CIRCLECI) {
  // Reference: https://circleci.com/docs/1.0/environment-variables

  repo =
    process.env.CIRCLE_PROJECT_USERNAME +
    '/' +
    process.env.CIRCLE_PROJECT_REPONAME;

  sha = process.env.CIRCLE_SHA1;
  event = 'push';
  commit_message = ''; // circle does not expose commit message
  if (process.env.CI_PULL_REQUEST) {
    pull_request_number = process.env.CI_PULL_REQUEST.split('/').pop(); // take number from returns url
    event = 'pull_request';
  } else pull_request_number = '';
  branch = process.env.CIRCLE_BRANCH;
  ci = 'circle';
} else if (process.env.WERCKER) {
  // Reference: https://devcenter.wercker.com/docs/environment-variables/available-env-vars

  repo =
    process.env.WERCKER_GIT_OWNER + '/' + process.env.WERCKER_GIT_REPOSITORY;

  sha = process.env.WERCKER_GIT_COMMIT;
  event = 'push';
  commit_message = ''; // wercker does not expose commit message
  pull_request_number = ''; // wercker does not expose pull request number
  pull_request_target_branch = ''; // wercker does not expose pr target branch
  branch = process.env.WERCKER_GIT_BRANCH;
  ci = 'wercker';
} else if (process.env.DRONE) {
  // Reference: http://readme.drone.io/usage/environment-reference

  repo =
    process.env.DRONE_REPO ||
    process.env.CI_REPO ||
    drone.getLegacyRepo(process.env);
  sha = process.env.DRONE_COMMIT || process.env.CI_COMMIT;
  // DRONE_BUILD_EVENT available in drone > v0.5
  // DRONE_EVENT, CI_EVENT available in drone < v0.5
  // no EVENT available in drone < v0.4
  event =
    process.env.DRONE_BUILD_EVENT ||
    process.env.DRONE_EVENT ||
    process.env.CI_EVENT ||
    'push';
  commit_message = ''; // drone does not expose commit message
  pull_request_number = process.env.DRONE_PULL_REQUEST;
  pull_request_target_branch = process.env.DRONE_TARGET_BRANCH;
  branch = process.env.DRONE_BRANCH || process.env.CI_BRANCH;
  ci = 'drone';
} else if (process.env.GITLAB_CI) {
  // Reference: https://docs.gitlab.com/ee/ci/variables/predefined_variables.html
  // except buildUrl we get all the other variables for gitlab CI
  repo = process.env.CI_PROJECT_PATH;
  branch = process.env.CI_MERGE_REQUEST_SOURCE_BRANCH_NAME || process.env.CI_COMMIT_REF_NAME;
  commit_message = process.env.CI_COMMIT_MESSAGE;
  pull_request_number = process.env.CI_MERGE_REQUEST_ID || ''; // no pull request numnber in case the CI is run for the branch without a pull request
  pull_request_target_branch = process.env.CI_MERGE_REQUEST_TARGET_BRANCH_NAME || process.env.CI_EXTERNAL_PULL_REQUEST_TARGET_BRANCH_NAME;
  sha = process.env.CI_COMMIT_SHA;
  event = process.env.CI_PIPELINE_SOURCE;
  jobUrl = process.env.CI_JOB_URL;
  platform = 'gitlab';
  ci = 'gitlab';
} else if (process.env.CI_NAME === 'codeship') {
  // Reference: https://documentation.codeship.com/basic/builds-and-configuration/set-environment-variables/#default-environment-variables

  repo = process.env.CI_REPO_NAME;
  branch = process.env.CI_BRANCH;
  commit_message = process.env.CI_COMMIT_MESSAGE || process.env.CI_MESSAGE;

  event = 'push';
  pull_request_number = process.env.CI_PR_NUMBER;
  pull_request_target_branch = ''; // codeship does not export pr target branch
  (sha = process.env.CI_COMMIT_ID), (buildUrl = process.env.CI_BUILD_URL);

  ci = 'codeship';
} else if (process.env.GITHUB_ACTION) {
  // GitHub Actions
  // Reference: https://developer.github.com/actions/creating-github-actions/accessing-the-runtime-environment/

  // for pull_request event, GITHUB_REF is of the form refs/pull/<pull_request_number>/merge
  // for push event, GITHUB_REF is of the form refs/heads/<branch>

  const pull_request_numberORbranch = process.env.GITHUB_REF.split('/')[2];

  repo = process.env.GITHUB_REPOSITORY;
  sha = process.env.GITHUB_SHA;
  event = process.env.GITHUB_EVENT_NAME;
  commit_message = '';
  pull_request_number =
    event === 'pull_request' ? pull_request_numberORbranch : '';
  // GITHUB_HEAD_REF for pull requests. For commits, GITHUB_REF is of the form refs/heads/master, for example
  branch =
    event === 'pull_request'
      ? process.env.GITHUB_HEAD_REF
      : pull_request_numberORbranch;
  // GITHUB_BASE_REF for pull requests, otherwise GITHUB_BASE_REF is empty
  pull_request_target_branch = process.env.GITHUB_BASE_REF;
  ci = 'github_actions';
} else if (process.env.NETLIFY) {
  // Reference: https://www.netlify.com/docs/continuous-deployment/#environment-variables
  repo = process.env.REPOSITORY_URL.split('@github.com/').pop();
  event = process.env.PULL_REQUEST ? 'pull_request' : 'push';
  pull_request_number = process.env.PULL_REQUEST ? process.env.REVIEW_ID : '';
  pull_request_target_branch = ''; // netlify does not export pr target branch
  sha = process.env.COMMIT_REF;
  branch = process.env.HEAD;
  ci = 'netlify';
} else if (process.env.NOW_GITHUB_ORG) {
  // Reference: https://zeit.co/docs/v2/advanced/now-for-github/
  repo = process.env.NOW_GITHUB_ORG + '/' + process.env.NOW_GITHUB_REPO;
  event = 'push';
  pull_request_number = '';
  sha = process.env.NOW_GITHUB_COMMIT_SHA;
  branch = process.env.NOW_GITHUB_COMMIT_REF;
  ci = 'now';
} else if(process.env.BUDDY) {
  repo = process.env.BUDDY_PROJECT_NAME;
  branch = process.env.BUDDY_EXECUTION_BRANCH;
  commit_message = process.env.BUDDY_EXECUTION_REVISION_MESSAGE;
  pull_request_number = process.env.BUDDY_EXECUTION_PULL_REQUEST_NO;
  pull_request_target_branch = process.env.BUDDY_EXECUTION_PULL_REQUEST_BASE_BRANCH;
  sha = process.env.BUDDY_EXECUTION_REVISION;
  event = process.env.BUDDY_EXECUTION_MODE;
  jobUrl = process.env.BUDDY_EXECUTION_REVISION_URL;
  platform = 'buddy';
  ci = 'buddy';
} else if(process.env.CF_BUILD_URL) {
  // Reference: https://codefresh.io/docs/docs/codefresh-yaml/variables/#system-provided-variables
  repo = process.env.CF_REPO_NAME;
  branch = process.env.CF_BRANCH;
  commit_message = process.env.CF_COMMIT_MESSAGE;
  pull_request_number = process.env.CF_PULL_REQUEST_NUMBER;
  pull_request_target_branch = process.env.CF_PULL_REQUEST_TARGET;
  sha = process.env.CF_REVISION;
  event = 'push';
  buildUrl = process.env.CF_BUILD_URL;
  platform = 'codefresh';
  ci = 'codefresh';
} else if (process.env.CI) {
  // Generic variables for docker images, custom CI builds, etc.

  platform = process.env.CI_PLATFORM;
  repo = process.env.CI_REPO_OWNER + '/' + process.env.CI_REPO_NAME;
  sha = process.env.CI_COMMIT_SHA;
  event = process.env.CI_EVENT || 'push';
  commit_message = process.env.CI_COMMIT_MESSAGE;
  pull_request_number = process.env.CI_MERGE_REQUEST_ID;
  pull_request_target_branch = process.env.CI_TARGET_BRANCH;
  branch = process.env.CI_BRANCH;
  ci = process.env.CI;
}

module.exports = {
  repo,
  sha,
  event,
  commit_message,
  branch,
  pull_request_number,
  pull_request_target_branch,
  ci,
  platform,
  jobUrl,
  buildUrl,
};
