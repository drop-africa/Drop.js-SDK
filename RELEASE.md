# Drop.js SDK Release Process

This document outlines the release process for the Drop.js SDK. Follow this checklist for every release to ensure consistency and prevent errors.

## Prerequisites

Before starting the release process, ensure you have:

- [ ] Write access to the GitHub repository
- [ ] npm publish permissions for `@drop-africa/drop-js`
- [ ] `NPM_TOKEN` configured in GitHub Secrets
- [ ] `CDN_UPLOAD_KEY` configured in GitHub Secrets (for CDN deployment)
- [ ] Clean working directory (`git status` shows no uncommitted changes)

## Pre-Release Verification

### 1. Code Quality Checks

- [ ] All tests pass locally: `npm test`
  - Expected: 105/105 tests passing
- [ ] Build completes successfully: `npm run build`
  - Verify `dist/drop.js`, `dist/drop.umd.cjs`, `dist/index.d.ts` are generated
- [ ] Bundle size is acceptable:
  - ESM: <25 KB gzipped (currently ~22 KB)
  - UMD: <22 KB gzipped (currently ~19 KB)
- [ ] TypeScript types are generated correctly
- [ ] No TypeScript errors: `tsc --noEmit`

### 2. Documentation Updates

- [ ] `CHANGELOG.md` updated with new version and release date
  - Follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format
  - Include all new features, changes, deprecations, removals, fixes, and security notes
  - Add link to GitHub release at bottom
- [ ] `README.md` is up to date
  - Installation instructions correct
  - API examples work
  - Version badges point to correct version
- [ ] `package.json` version bumped
  - Follow [Semantic Versioning](https://semver.org/)
  - Pre-1.0: Breaking changes allowed in minor versions
  - Post-1.0: Breaking changes require major version bump

### 3. Package Validation

- [ ] Create test package: `npm pack`
- [ ] Extract and inspect: `tar -xzf drop-africa-drop-js-X.Y.Z.tgz`
- [ ] Verify `package/` contains only:
  - `dist/` directory with build outputs
  - `README.md`
  - `CHANGELOG.md`
  - `package.json`
  - `LICENSE` (if present)
- [ ] Verify NO source files included (`src/`, `*.test.ts`, config files)
- [ ] Package size is reasonable (<100 KB)

### 4. Integration Testing

- [ ] Test installation in fresh project:
  ```bash
  mkdir test-install && cd test-install
  npm init -y
  npm install ../drop-js/drop-africa-drop-js-X.Y.Z.tgz
  ```
- [ ] Test ESM import:
  ```javascript
  import { Drop } from '@drop-africa/drop-js';
  console.log(Drop);
  ```
- [ ] Test UMD/CDN bundle in browser:
  ```html
  <script src="../drop-js/dist/drop.umd.cjs"></script>
  <script>console.log(Drop);</script>
  ```
- [ ] Test TypeScript types work (no compiler errors)

## Release Process

### 1. Update Version

```bash
# Update package.json version manually or with npm version
npm version patch   # For bug fixes (0.1.0 -> 0.1.1)
npm version minor   # For new features (0.1.0 -> 0.2.0)
npm version major   # For breaking changes (0.1.0 -> 1.0.0)

# Or manually edit package.json, then:
git add package.json CHANGELOG.md
git commit -m "chore(sdk): release vX.Y.Z"
```

### 2. Create Git Tag

```bash
# Format: sdk-vX.Y.Z (e.g., sdk-v0.1.0)
git tag sdk-vX.Y.Z
```

### 3. Push to GitHub

```bash
# Push commit and tag together
git push origin main --tags
```

### 4. Monitor GitHub Actions

- [ ] Navigate to https://github.com/Fabaladibbasey/drop/actions
- [ ] Wait for `Publish Drop.js SDK` workflow to start
- [ ] Monitor all three jobs:
  - **build-and-test**: Ensure tests pass and build succeeds
  - **publish-to-npm**: Verify npm publish completes
  - **deploy-to-cdn**: Confirm CDN deployment succeeds
- [ ] Check for any errors in workflow logs

## Post-Release Verification

### 1. npm Package

- [ ] Package appears on npm: https://www.npmjs.com/package/@drop-africa/drop-js
- [ ] Correct version number displayed
- [ ] README renders correctly
- [ ] Install from npm works:
  ```bash
  npm install @drop-africa/drop-js@X.Y.Z
  ```
- [ ] Verify published files match expectations:
  ```bash
  npm view @drop-africa/drop-js@X.Y.Z
  ```

### 2. CDN Deployment

- [ ] Versioned URL works: `https://cdn.drop.africa/sdk/X.Y.Z/drop.js`
  - Should serve UMD bundle
  - Cache-Control header: `max-age=31536000` (1 year, immutable)
- [ ] Latest URL updated: `https://cdn.drop.africa/sdk/drop.js`
  - Should serve same version
  - Cache-Control header: `max-age=300` (5 minutes)
- [ ] Test CDN bundle in browser:
  ```html
  <script src="https://cdn.drop.africa/sdk/X.Y.Z/drop.js"></script>
  <script>console.log(Drop.create);</script>
  ```

### 3. GitHub Release

- [ ] Release created at: https://github.com/Fabaladibbasey/drop/releases/tag/sdk-vX.Y.Z
- [ ] Release notes populated from CHANGELOG
- [ ] Release assets uploaded (if any)

### 4. Smoke Test

- [ ] Create test payment intent in production
- [ ] Use SDK to render QR code
- [ ] Verify QR code scans correctly
- [ ] Verify polling works
- [ ] Verify status callbacks fire

## Rollback Procedure

If critical issues are discovered after release:

### Option 1: Deprecate and Release Hotfix

```bash
# Deprecate bad version
npm deprecate @drop-africa/drop-js@X.Y.Z "Critical bug - use X.Y.Z+1 instead"

# Release hotfix
npm version patch
git add package.json CHANGELOG.md
git commit -m "chore(sdk): release vX.Y.Z+1 (hotfix)"
git tag sdk-vX.Y.Z+1
git push origin main --tags
```

### Option 2: Unpublish (Only within 72 hours)

```bash
# Only works if version was published <72 hours ago
npm unpublish @drop-africa/drop-js@X.Y.Z
```

**Note**: Unpublishing is discouraged by npm. Prefer deprecation + hotfix.

### Option 3: CDN Rollback

```bash
# Manually update cdn.drop.africa/sdk/drop.js to point to previous version
# Requires CDN credentials and manual intervention
./scripts/deploy-cdn.sh X.Y.Z-1
```

## Troubleshooting

### Build Fails

- Check TypeScript errors: `tsc --noEmit`
- Ensure all dependencies installed: `npm ci`
- Clear build cache: `rm -rf dist/ .tsbuildinfo`

### Tests Fail

- Run tests with verbose output: `npm test -- --reporter=verbose`
- Check for environment-specific issues (Node version, OS)
- Ensure no uncommitted changes affecting tests

### npm Publish Fails

- Verify `NPM_TOKEN` secret is set correctly
- Check npm registry status: https://status.npmjs.org/
- Ensure version doesn't already exist (can't republish same version)
- Verify package name isn't taken

### CDN Deployment Fails

- Verify `CDN_UPLOAD_KEY` secret is set correctly
- Check CDN provider status (Cloudflare R2, AWS S3)
- Ensure bucket/path exists and is writable
- Verify script permissions: `chmod +x scripts/deploy-cdn.sh`

### GitHub Actions Workflow Not Triggering

- Verify tag format matches `sdk-v*` pattern
- Ensure workflow file is on `main` branch
- Check GitHub Actions are enabled for repository
- Verify workflow file syntax: https://www.yamllint.com/

## Version History

| Version | Release Date | Notes |
|---------|--------------|-------|
| 0.1.0   | 2026-01-31   | Initial release |

## Contacts

- **Release Manager**: [Your Name/Team]
- **npm Package Owner**: https://www.npmjs.com/package/@drop-africa/drop-js/access
- **GitHub Repository**: https://github.com/Fabaladibbasey/drop

## References

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
