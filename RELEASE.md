### Release Steps
- Make sure you're on the `next` branch
- Run  `npm vesion patch` to bump the version (you can also bump `minor` or `major` version, depending on your change)
- Run `git push --follow-tags`
- Create a pull request from `next` branch to `master`
- Once PR is merged to `master`, run `npm run build` to create the `dist` folder
- Run `npm publish`
