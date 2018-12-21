This is an application that maintains a CI/CD using configuration from a git repo.

The idea is to point this application at a git repo which has been constructed to reflect the desired state of a kubernetes cluster.

This application must also be pointed at a jenkins instance which this application will setup with jobs that build applications as docker images and deploy them onto a kubernetes platform.

Currently the platform only works effectively with applications built purely in Node.js. Although it does allow for overwriting of default processes which would allow for other application types.

To use this application you must write your own config file and put it in the config directory:

```
{
  "git": {
    "gitOpsRepoUrl": "YOUR GIT OPS REPO URL"
  },
  "jenkins": {
    "host": "YOUR JENKINS URL",
    "username": "A JENKINS USERNAME",
    "password": "A JENKINS PASSWORD"
  },
  "github": {
    "username": "A GITHUB USER (FOR SETTING UP WEBHOOKS)",
    "token": "A TOKEN FOR GITHUB API CALLS (FOR SETTING UP WEBHOOKS)"
  }
}
```
