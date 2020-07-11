# stylelint-css-modules

[![NPM version](http://img.shields.io/npm/v/stylelint-css-modules.svg)](https://www.npmjs.org/package/stylelint-css-modules)
[![CircleCI status](https://circleci.com/gh/juanca/stylelint-css-modules.svg?style=shield)](https://circleci.com/gh/juanca/stylelint-css-modules)

> Extended ruleset for stylelint on CSS modules

## Example usage

1. Install

```
npm install stylelint-css-modules --save-dev
```

2. Configure

```
plugins: [
  'stylelint-css-modules',
],
rules: {
  'css-modules/composed-class-names': true,
  'css-modules/css-variables': true,
},
```

## Contributing

1. Fork
2. Build
3. Test: `npm test`
4. Submit a Pull Request

We are looking for simple and tested code.
A green build is a requirement.

## Ruleset

### css-modules/composed-class-names

Ensures each composed class name exists in the targeted file.

#### Good

```
.solo-class {}

.nested-root .intermediary-node .nested-child {}

.chained-root.chained-node.chained-child {}

.lots-of-compositions {
  composes: solo-class;
  composes: nested-root;
  composes: intermediary-node;
  composes: nested-child;
  composes: chained-root;
  composes: chained-node;
  composes: chained-child;
  composes: solo-class nested-child;
  composes: global from global;
  composes: baz from './baz.css';
}
```

where `baz.css`:

```
.baz {}
```


#### Bad

```
.lots-of-compositions {
  composes: does-not-exist;
  composes: does-not-exist from './baz.css';
}
```

where `baz.css`

```
.baz {}
```

### css-modules/css-variables

Ensures each CSS variable is defined locally or in some imported file unless it has a fallback.

#### Good

```
@import './baz.css';

:root {
  --some-var: 1;
}

.foo {
  margin: var(--some-var);
  padding: var(--baz-some-var);
  padding: var(--bar-some-var, 10px);
}
```

where `baz.css`:

```
:root {
  --bar-some-var: 1;
}
```

#### Bad

```
.foo {
  margin: var(--some-undefined-var);
  padding: var(--baz-some-var);
}
```

where `baz.css`:

```
:root {
  --bar-some-var: 1;
}
```
