if [ -f ./.nvmrc ]; then
    nvm install
    nvm use
else
    nvm install 10
    nvm use 10
fi

npm install
