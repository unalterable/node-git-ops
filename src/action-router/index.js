const Route = require('route-parser');

const FILE_ADDED = 'fileAdded';
const FILE_CHANGED = 'fileChanged';
const FILE_REMOVED = 'fileRemoved';
const ANY_CHANGE = 'anyChange';

const log = (...messages) => console.info(...messages);

const routeSuccessMsg = ({ type, file, route }) => `'${file.path}': sucessfully routed to '${type} | ${route.spec}'`;

const routeFailMsg = ({ file }) => `'${file.path}': not routed`;

const printRouting = routeInfo => {
  log(routeInfo.action ? routeSuccessMsg(routeInfo) : routeFailMsg(routeInfo));
  return routeInfo;
};

const isMatchForType = (type, file) => {
  if(type === ANY_CHANGE) return true;
  if(type === FILE_ADDED) return file.added || file.renamed;
  if(type === FILE_REMOVED) return file.deleted;
  if(type === FILE_CHANGED) return !file.added && !file.renamed && !file.deleted;
  return false;
};

const fileToRouteInfo = actionRoutes => file => {
  let params;
  const { type, route, action } = actionRoutes.find(({ type, route }) =>
    (isMatchForType(type, file) && (params = route.match(file.path))));
  return { type, route, action, params, file };
};

const createActionRouter = () => {
  const actionRoutes = [];

  const newRoute = (type, route, action) => actionRoutes.push({ type, route: new Route(route), action });

  const thisRouter = {
    fileAdded: (route, action) => newRoute(FILE_ADDED, route, action),
    fileChanged: (route, action) => newRoute(FILE_CHANGED, route, action),
    fileRemoved: (route, action) => newRoute(FILE_REMOVED, route, action),
    anyChange: (route, action) => newRoute(ANY_CHANGE, route, action),
    filesToActions: files => files.map(fileToRouteInfo(actionRoutes)).map(printRouting),
  };
  return thisRouter;
};

module.exports = {
  createActionRouter,
};
