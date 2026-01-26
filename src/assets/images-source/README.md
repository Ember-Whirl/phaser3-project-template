# Images Source Folder

This folder contains your source PNG files organized by category. The system **automatically** detects all images in each folder - no manual configuration needed!

## How It Works

1. **Add images** to any folder here (characters, enemies, ui, etc.)
2. **Run** `npm run pack` to generate the asset manifest
3. **Use in code** with `this.addSprite('folder', 'filename')`

That's it! The system automatically:
- Scans all folders and creates a manifest
- Loads individual images in development mode
- Packs into atlases and loads them in production mode

## Folder Organization

- **characters/** - Player, NPCs, and character sprites
- **enemies/** - Enemy sprites and bosses
- **ui/** - User interface elements (buttons, panels, icons)
- **environment/** - Background elements, tiles, decorations

## Example Usage

If you add: `src/assets/images-source/characters/player.png`

Then run: `npm run pack`

Use in code:
```javascript
const player = this.addSprite('characters', 'player');
player.setPosition(400, 300);
```

## Commands

- `npm run dev` - Development mode (loads individual images)
- `npm run pack` - Generate manifest and atlases
- `npm run build` - Production build (auto-runs pack)

## Guidelines

- Use descriptive filenames (e.g., `player_idle.png`, `button_close.png`)
- Keep related sprites in the same folder
- Filenames become the sprite keys (without .png extension)
- Each folder becomes one texture atlas in production

For detailed instructions, see [TEXTUREPACKER_QUICKSTART.md](../../../TEXTUREPACKER_QUICKSTART.md) in the project root.
