GIT_OPS_DIR=node_git_ops_tools
image_name={{ image_name }}

git clone https://github.com/unalterable/node-git-ops.git $GIT_OPS_DIR
cd $GIT_OPS_DIR
npm i
version=$(node -e "require('./src/docker-hub').getNextVersion({ dockerHubRepo: '$image_name', increment: '$versionIncrement' })")
cd ..

docker login -u "$docker_username" -p "$(echo $docker_password)"
docker build -t $image_name:$version .
docker tag $image_name:$version $image_name:latest
docker push $image_name:$version
docker push $image_name:latest
