# Windows Troubleshooting - Bun Installation Issues

## EPERM: Operation not permitted, symlink

If you encounter an error like this when installing Smite plugins on Windows:

```
Error: Failed to install: EPERM: operation not permitted, symlink
'C:\Users\...\.bun\@types+jest@29.5.14\node_modules\@types\jest'
-> 'C:\Users\...\cache\temp_local_...\node_modules\@types\jest'
```

### Root Cause

Bun's default `symlink` linker requires Windows Developer Mode or Administrator privileges to create symbolic links. Standard Windows users do not have the `SeCreateSymbolicLinkPrivilege` permission required.

### Solution

Configure Bun to use the `hoisted` linker, which copies files instead of creating symlinks.

#### Option 1: Permanent Fix (Recommended)

Create or edit `bunfig.toml` in your user home directory (`C:\Users\YourName\bunfig.toml`):

```toml
[install]
linker = "hoisted"
```

Then run:
```bash
bun install
```

#### Option 2: One-time Flag

```bash
bun install --linker=hoisted
```

#### Option 3: Use npm

```bash
npm install
```

### Trade-offs

| Linker Type | Disk Space | Install Speed | Permissions Required |
|-------------|------------|---------------|---------------------|
| symlink (default) | Low | Fast | Admin/Dev Mode |
| hoisted | Medium | Medium | None |

### Related Issues

- [Bun Issue #11250](https://github.com/oven-sh/bun/issues/11250) - EPERM on Windows
- [Bun Issue #25970](https://github.com/oven-sh/bun/issues/25970) - Symlink hangs on Windows

### Verifying the Fix

After applying the fix, installation should complete without EPERM errors:

```bash
$ bun install
bun install v1.x.x
Resolved, downloaded and extracted [N]
XXX packages installed [X.XXs]
```
