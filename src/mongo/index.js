const { MongoClient } = require('mongodb');

const mongoUrl = process.env['MONGO_URL'];
const mongoUsername = process.env['MONGO_USERNAME'];
const mongoPassword = process.env['MONGO_PASSWORD'];

const newUserName = process.env['NEW_USER_USERNAME'];
const newUserPassword = process.env['NEW_USER_PASSWORD'];
const newUserDb = process.env['NEW_USER_DB'];

const auth = { user: mongoUsername, password: mongoPassword };

(async () => {
  let client;
  try {
    client = await MongoClient.connect(mongoUrl, { auth, useNewUrlParser: true });

    const admin = client.db('admin').admin();

    /* console.log(await admin.command({ usersInfo: 1.0 })) */
    const newUserInfo = await admin.addUser(
      newUserName,
      newUserPassword,
      { roles: [{ role: 'readWrite', db: newUserDb }], passwordDigestor: 'server' }
    );
    console.info(newUserInfo);

    client.close();
  } catch (e){
    console.error(e);
    client.close();
    process.exit(1);
  }
})();
