# script-append-cross-origin-webpack-plugin

## Features

- inject crossorigin attribute to script with src attribute

- user can select script what you want by matcher


## options

```ts
interface CrossOriginWebpackPluginOptions {
  crossorigin?: string
  matcher?: string | string[]
}
```

### matcher

matcher regexp string, such as `"https?://crossorigin.com"`

## TODO

- [ ] 使用ast

- [x] support user select scripts by src