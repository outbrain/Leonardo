### Release Steps
- Run `npm version patch` to bump the version (you can also bump `minor` or `major` version, depending on your change)
- Run `git push --follow-tags`
- Run `npm run build` to create the `dist` folder
- Run `npm publish`
