const Route = require('route-parser');

const createActionRouter = () => {
  const actionRoutes = [];
  const thisRouter = {
    newRoute: (route, action) => actionRoutes
      .push({ route: (new Route(route)), action }),
    filesToActions: files => Promise.all(files
      .map(file => {
        let params;
        const { route, action } = actionRoutes
          .find(({ route }) => (params = route.match(file.path)));
        return { route, action, params, file };
      })
      .map(({ route, action, params, file }) => {
        console.info(`'${file.path}' ${action ? 'routed' : 'not routed to an action'}`);
        return action({ ...file, params })
      })),
  }
  return thisRouter;
}

module.exports = {
  createActionRouter,
};
