
const urlParse = require('url-parse');
const axios = require('axios');

const HOST = 'https://api.github.com';
const getCollaboratorsUrl = ({ repo: { owner, name }, username }) =>
  `${HOST}/repos/${owner}/${name}/collaborators/${username}`;
const getHooksUrl = ({ repo: { owner, name } }) =>
  `${HOST}/repos/${owner}/${name}/hooks`;
const getRepoInfoUrl = ({ repo: { owner, name } }) =>
  `${HOST}/repos/${owner}/${name}`;
const getRepoNotExistMsg = ({ repo: { owner, name } }) =>
  `Err: Repo ${owner}/${name} does not exist`;
const getNotCollaboratorMsg = ({ repo: { owner, name }, username }) =>
  `Err: ${username} is not a collaborator on ${owner}/${name}`;
const getHookExistsMsg = ({ repo: { owner, name }, hookEndpoint }) =>
  `Err: ${hookEndpoint} already exists as a hook on ${owner}/${name}`;
const getHookNotExistsMsg = ({ repo: { owner, name }, hookEndpoint }) =>
  `Err: ${hookEndpoint} does not exist as a hook on ${owner}/${name}`;

const createWebhookObj = ({ hookEndpoint }) => ({
  name: 'web',
  active: true,
  events: [ 'push' ],
  config: { url: hookEndpoint, contentType: 'json' },
});

const initConnection = ({ username, token }) => {
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

  const checkHookNotExisting = async ({ hookEndpoint, repo }) => {
    const hooks = await getHooks({ repo, auth });
    const hook = hooks.find(hook => hook.config.url === hookEndpoint);
    if (hook) throw Error(getHookExistsMsg({ hookEndpoint, repo }));
  }

  const checkHookExistingAndGet = async ({ hookEndpoint, repo }) => {
    const hooks = await getHooks({ repo, auth });
    const hook = hooks.find(hook => hook.config.url === hookEndpoint);
    if (!hook) throw Error(getHookNotExistsMsg({ hookEndpoint, repo }));
    return hook;
  }

  const setWebhook = async ({ repo, hookEndpoint }) => {
    await checkIsRepoExisting({ repo })
    await checkIsCollaborator({ repo });
    await checkHookNotExisting({ hookEndpoint, repo });
    const res = await axios.post(getHooksUrl({ repo }), createWebhookObj({ hookEndpoint }), { auth });
    return res.data;
  }

  const removeWebhook = async ({ repo, hookEndpoint }) => {
    await checkIsRepoExisting({ repo })
    await checkIsCollaborator({ repo });
    const hook = await checkHookExistingAndGet({ hookEndpoint, repo });
    const res = await axios.delete(`${getHooksUrl({ repo })}/${hook.id}`, { auth });
    return res.data;
  }

  return { setWebhook, removeWebhook }
}

const parseRepoUrl = (url) => {
  const parsedUrl = urlParse(url);
  const path = parsedUrl.pathname.split('/');
  const owner = path[1];
  const name = path[2].split('.')[0];
  return { name, owner };
}

module.exports = { initConnection, parseRepoUrl };
