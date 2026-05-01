/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  'extends': [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
  ],
  parserOptions: {ecmaVersion: 'latest'},
  rules: {
    // 1. Refactor component usage formatting
    // Allow up to 3 attributes on a single line if they fit
    'vue/max-attributes-per-line': ['error', {
      singleline: { max: 3 },
      multiline: { max: 1 }
    }],
    
    // Attributes follow a consistent and logical ordering
    'vue/attributes-order': ['error', {
      order: [
        'DEFINITION',
        'LIST_RENDERING',
        'CONDITIONALS',
        'RENDER_MODIFIERS',
        'GLOBAL',
        ['UNIQUE', 'SLOT'],
        'TWO_WAY_BINDING',
        'OTHER_DIRECTIVES',
        'OTHER_ATTR',
        'EVENTS',
        'CONTENT'
      ],
      alphabetical: false
    }],
    
    // Allow the first attribute to be on the same line as the tag for singleline
    'vue/first-attribute-linebreak': ['error', {
      singleline: 'beside',
      multiline: 'below'
    }],
    'vue/html-closing-bracket-newline': ['error', {
      singleline: 'never',
      multiline: 'always'
    }],
    
    // 2. Optimize import style
    // All imported components must be listed on separate lines for readability if there are multiple
    'object-curly-newline': ['error', { 
      ObjectExpression: {
        multiline: true,
        minProperties: 2 
      },
      ObjectPattern: {
        multiline: true,
        minProperties: 2 
      },
      ImportDeclaration: {
        multiline: true,
        minProperties: 2 
      },
      ExportDeclaration: {
        multiline: true,
        minProperties: 2 
      }
    }],
    'object-property-newline': ['error', { allowAllPropertiesOnSameLine: false }],
    
    // 3. Enforce logical structure in Vue component files
    'vue/order-in-components': ['error', {
      'order': [
        'el',
        'name',
        'key',
        'parent',
        'functional',
        ['delimiters', 'comments'],
        ['components', 'directives', 'filters'],
        'extends',
        'mixins',
        ['provide', 'inject'],
        'ROUTER_GUARDS',
        'layout',
        'middleware',
        'validate',
        'scrollToTop',
        'transition',
        'loading',
        'inheritAttrs',
        'model',
        ['props', 'propsData'],
        'emits',
        'setup',
        'asyncData',
        'data',
        'fetch',
        'head',
        'computed',
        'watch',
        'watchQuery',
        'LIFECYCLE_HOOKS',
        'methods',
        ['template', 'render'],
        'renderError'
      ]
    }],

    // 4. Consistent indentation and line endings
    'indent': ['error', 2, { SwitchCase: 1 }],
    'vue/html-indent': ['error', 2],
    'eol-last': ['error', 'always'],

    // Avoid throwing errors for components with multi-word names
    'vue/multi-word-component-names': 'off'
  }
}
