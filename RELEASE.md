### Release Steps (bower and npm)
- Bump version in `bower.json` and `package.json`
- Make sure all changes are pushed to master
- Merge changes to the `release` branch
- run `gulp build` to create the `dist` folder
- Tag the `release` branch and push
- Create a release based on the new tag
- run `npm publish`

