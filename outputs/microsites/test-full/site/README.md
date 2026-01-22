# Generated Microsite

This microsite was generated from the Ritual Research Graph pipeline.

## Generated Files

- `src/config.js` - Contains all research data in the SITE_CONFIG format
- `public/artifacts/` - Source documents and extracted data

## Manual Integration

To use the generated config in App.jsx:

1. Add import at top of App.jsx:
   ```javascript
   import { PROJECTS, EXECUTIVE_SUMMARY, DEEP_DIVES, SOURCE_ARTIFACTS } from './config.js';
   ```

2. Remove the inline data constants (PROJECTS, EXECUTIVE_SUMMARY, DEEP_DIVES, SOURCE_ARTIFACTS)

3. The app will now use your generated research data

## Build Commands

```bash
npm install
npm run build
npm run preview  # To test locally
```

## Deployment

The `dist/` folder contains the static site ready for deployment to any static host.
