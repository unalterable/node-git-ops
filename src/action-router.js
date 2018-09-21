const Route = require('route-parser');

const FILE_ADDED = 'fileAdded';
const FILE_ALTERED = 'fileAltered';
const FILE_REMOVED = 'fileRemoved';
const ANY_CHANGE = 'anyChange';

const log = (...messages) => console.info(...messages);

const routeSuccessMsg = ({ file, route }) => `'${file.path}': sucessfully routed by '${route.spec}'`;

const routeFailMsg = ({ file, route }) => `'${file.path}': not routed`;

const printRouting = routeInfo => {
  log(routeInfo.action ? routeSuccessMsg(routeInfo) : routeFailMsg(routeInfo));
  return routeInfo;
}

const isMatchForType = (type, file) => {
  if(type === ANY_CHANGE) return true;
  if(type === FILE_ADDED) return file.added || file.renamed;
  if(type === FILE_REMOVED) return file.deleted;
  if(type === FILE_ALTERED) return !file.added && !file.renamed && !file.deleted;
  return false;
};

const fileToRouteInfo = actionRoutes => file => {
  let params;
  const { route, action } = actionRoutes.find(({ type, route }) =>
    (isMatchForType(type, file) && (params = route.match(file.path))))
  return { route, action, params, file };
};

const executeAction = async ({ action, params, file }) => {
  try {
    await action({ ...file, params });
    log(`'${file.path}': successfully actioned`)
  } catch(e){
    log(`'${file.path}': action failed:`, e)
  }
}

const createActionRouter = () => {
  const actionRoutes = [];

  const newRoute = (type, route, action) => actionRoutes.push({ type, route: new Route(route), action });

  const thisRouter = {
    fileAdded: (route, action) => newRoute(FILE_ADDED, route, action),
    fileChanged: (route, action) => newRoute(FILE_ALTERED, route, action),
    fileRemoved: (route, action) => newRoute(FILE_REMOVED, route, action),
    anyChange: (route, action) => newRoute(ANY_CHANGE, route, action),
    filesToActions: files => Promise.all(files
      .map(fileToRouteInfo(actionRoutes))
      .map(printRouting)
      .map(executeAction)),
  }
  return thisRouter;
}

module.exports = {
  createActionRouter,
};
