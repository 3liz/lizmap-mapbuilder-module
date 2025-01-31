# Contributing

## Testing with linters

Before the next part, you must have installed the dependencies with `npm install` at the project root.

### StyleLint for CSS

If you want to see all your issues on the CSS code without fixing it, you
can run the following command:
```bash
npm run stylelint-check
```
If you want to fix the issues automatically, you can run the following command:
```bash
npm run stylelint-fix
```
_Note : The command `npm run stylelint-fix` may not fix all the issues and print them on the screen.
You'll need to fix them manually._

If you add a new CSS file that you won't modify (egg. bootstrap css file), you need to add it in the `stylelint.config.mjs`
configuration file in `ignoreFiles[...]`.

```mjs
ignoreFiles: [
    "mapBuilder/www/css/fontawesome-free-web/**/*.css",
    "mapBuilder/www/css/bootstrap.min.css",
    "...",
  ],
```
