const axios = require('axios');

const HOST = 'https://api.github.com';
const getCollaboratorsUrl = ({ repo: { owner, name }, username }) => `${HOST}/repos/${owner}/${name}/collaborators/${username}`;
const getHooksUrl = ({ repo: { owner, name } }) => `${HOST}/repos/${owner}/${name}/hooks`;
const getRepoInfoUrl = ({ repo: { owner, name } }) => `${HOST}/repos/${owner}/${name}`;
const getRepoNotExistMsg = ({ repo: { owner, name } }) => `Err: Repo ${owner}/${name} does not exist`;
const getNotCollaboratorMsg = ({ repo: { owner, name }, username }) => `Err: ${username} is not a collaborator on ${owner}/${name}`;
const getHookExistsMsg = ({ repo: { owner, name }, hookEndpoint }) => `Err: ${hookEndpoint} already exists as a hook on ${owner}/${name}`;

const createWebhookObj = ({ hookEndpoint }) => ({
  name: 'web',
  active: true,
  events: [ 'push' ],
  config: { url: hookEndpoint, contentType: 'json' },
});

const initGithub = ({ username, token }) => {
  const auth = { username, password: token };

  const getHooks = async ({ repo }) => {
    const { data } = await axios.get(getHooksUrl({ repo }), { auth });
    return data;
  }

  const checkIsRepoExisting = async({ repo }) => {
    const res = await axios.get(getRepoInfoUrl({ repo }), { auth, validateStatus: false })
    if (res.status !== 200) throw Error(getRepoNotExistMsg({ repo }));
  }

  const checkIsCollaborator = async({ repo }) => {
    const res = await axios.get(getCollaboratorsUrl({ repo, username }), { auth, validateStatus: false })
    if (res.status !== 204) throw Error(getNotCollaboratorMsg({ repo, username }));
  }

  const checkIsHookExisting = async ({ hookEndpoint, repo, auth }) => {
    const hooks = await getHooks({ repo, auth });
    const hookExists = !!hooks.find(hook => hook.config.url === hookEndpoint);
    if(hookExists) throw Error(getHookExistsMsg({ hookEndpoint, repo }));
  }

  const setWebhook = async ({ repo, hookEndpoint }) => {
    await checkIsRepoExisting({ repo })
    await checkIsCollaborator({ repo });
    await checkIsHookExisting({ hookEndpoint, auth, repo });
    const res = await axios.post(getHooksUrl({ repo }), createWebhookObj({ hookEndpoint }), { auth });
    return res.data;
  }

  return {
    setWebhook,
  }
}

module.exports = initGithub;
