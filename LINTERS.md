## Testing with linters

Before the next part, you must have installed the dependencies with `npm install` at the project root.

### ESLint for Javascript

If you want to see all your issues on the Javascript code without fixing it, you
can run the following command:

```bash
npm run eslint-check
```

If you want to fix the issues automatically, you can run the following command:

```bash
npm run eslint-fix
```

_Note : The command `npm run eslint-fix` may not fix all the issues and print them on the screen.
You'll need to fix them manually._
