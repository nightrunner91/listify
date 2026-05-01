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
    // 1. All attributes within HTML/Vue template tags must be placed on separate lines
    'vue/max-attributes-per-line': ['error', {
      singleline: { max: 1 },
      multiline: { max: 1 }
    }],
    
    // 2. Attributes should follow a consistent and logical ordering
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
    
    // Ensure the first attribute breaks to a new line and the closing bracket does too
    'vue/first-attribute-linebreak': ['error', {
      singleline: 'below',
      multiline: 'below'
    }],
    'vue/html-closing-bracket-newline': ['error', {
      singleline: 'never',
      multiline: 'always'
    }],
    
    // 3. Enforce consistent indentation using 2 spaces
    'indent': ['error', 2, { SwitchCase: 1 }],
    'vue/html-indent': ['error', 2],
    
    // 4. JS functions are written in human-readable format (Object properties on new lines)
    'object-curly-newline': ['error', { 
      ObjectExpression: {
        multiline: true,
        minProperties: 2 
      },
      ObjectPattern: { multiline: true },
      ImportDeclaration: { multiline: true },
      ExportDeclaration: { multiline: true }
    }],
    'object-property-newline': ['error', {allowAllPropertiesOnSameLine: false}],
    
    // 5. Each file should have 1 empty line at the end by default
    'eol-last': ['error', 'always'],

    // Avoid throwing errors for components with multi-word names for simplicity unless desired
    'vue/multi-word-component-names': 'off'
  }
}
