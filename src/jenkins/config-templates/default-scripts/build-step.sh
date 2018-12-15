GIT_OPS_DIR=node_git_ops_tools
git clone https://github.com/unalterable/node-git-ops.git $GIT_OPS_DIR
cd $GIT_OPS_DIR
npm i
version=$(node -e "require('./src/docker/hub').getNextVersionFromHub({ dockerHubRepo: '{{{ imageName }}}', increment: '$versionIncrement' })")
cd ..

docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
if [ ! -f Dockerfile ]; then
    echo Using default Dockerfile
    cp ./src/docker/default-Dockerfile ./Dockerfile
fi
docker build -t {{{ imageName }}}:$version .

echo ==============================
echo Successfully built {{{ imageName }}}:$version
echo ==============================

docker tag {{{ imageName }}}:$version {{{ imageName }}}:latest
docker push {{{ imageName }}}:$version
docker push {{{ imageName }}}:latest

echo ==============================
echo Successfully pushed {{{ imageName }}}:$version
echo ...and {{{ imageName }}}:latest
echo ==============================
