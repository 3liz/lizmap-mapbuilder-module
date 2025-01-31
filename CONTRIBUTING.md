# Contributing

## Testing with linters

Before the next part, you must have installed the dependencies with `npm install` and `composer install` at the project root.

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

### PHP CS Fixer for PHP

If you want to see all your issues on the PHP code without fixing it, you
can run the following command:

```bash
composer cs-check
```

If you want to fix the issues automatically, you can run the following command:

```bash
composer cs-fix
```

### PHPStan for PHP

If you want to see all your issues on the PHP code through PHPStan, you can run the following command:

```bash
composer phpstan
```
