// src/styles/soft-ascii/petted.js
// Happy purring / petted frames with hearts for Soft ASCII style.

module.exports = {
  emotion: 'petted',
  sizes: {
    large: {
      frameDelayMs: 250,
      frames: [
`     .---.          .---.
    / /"\\ \\________/ /"\\ \\
   |  \\_/            \\_/  |
   |   /""\\        /""\\   |
   |  | ♥  |  /\\  | ♥  |  |
   |   \\__/  (__)  \\__/   |
   |       \\(  ^  )/  ♥   |
    \\        \\____/      /
     '-.______________.-'`,

`     .---.          .---.
    / /"\\ \\________/ /"\\ \\
   |  \\_/            \\_/  |
   |   /""\\        /""\\   |
   |  | ^  |  /\\  | ^  |  |
   |   \\__/  (__)  \\__/   |
   |     ♥  ( 'v' )  ♥    |
    \\        \\____/      /
     '-.______________.-'`
      ]
    },
    medium: {
      frameDelayMs: 250,
      frames: [
`  (o)_______(o)
 /   ♥     ♥   \\
|     ( 'v' )   |
 \\     \\_/     /
  '-----------'`,

`  (o)_______(o)
 /   ^     ^   \\
|   ♥ ( ^v^ ) ♥ |
 \\     \\_/     /
  '-----------'`
      ]
    },
    tiny: {
      frameDelayMs: 250,
      frames: [
` (o)____(o)
 (  ♥  ♥  )
   ( 'v' )`,

` (o)____(o)
 (  ^  ^  )
   ( ^v^ )`
      ]
    }
  }
};
