<p align="center">
  <br>
  <b>Environment variables exposed by CI tools</b>
  <br><br>
  <img src="https://travis-ci.org/siddharthkp/ci-env.svg?branch=master&maxAge=3600"/>
</p>

&nbsp;

Supports travis, circle, gitlab, wercker, drone, codeship, now(zeit), netlify, GitHub Actions, Buddy and Codefresh.

Kinda supports custom CI as well. [Specs here](https://github.com/siddharthkp/ci-env/blob/master/index.js#L68-L79)

&nbsp;

#### Installation

```
npm install ci-env
```

&nbsp;

#### Usage

```js
const { repo, sha, event, commit_message, pull_request_number, branch, ci } = require('ci-env')
```

&nbsp;

#### like it?

⭐️ this repo

&nbsp;

#### License

MIT © siddharthkp
