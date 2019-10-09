### Release Steps
- Bump version in `package.json`
- Make sure all changes are pushed to master
- Merge changes to the `release` branch
- run `npm run build` to create the `dist` folder
- Tag the `release` branch and push
- Create a release based on the new tag
- run `npm publish`

