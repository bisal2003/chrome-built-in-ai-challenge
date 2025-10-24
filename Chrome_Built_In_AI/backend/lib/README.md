# Required Libraries for ContextRecall

This folder should contain the external JavaScript libraries needed for the extension.

## Required Files

### 1. Readability.js
**Purpose**: Extracts clean article content from web pages
**Source**: Mozilla's Readability library
**File**: `Readability.js`

#### Download Options:
- **Automatic**: Run `../setup.ps1` from the project root
- **Manual**: 
  1. Visit: https://github.com/mozilla/readability
  2. Download: https://raw.githubusercontent.com/mozilla/readability/main/Readability.js
  3. Save as: `Readability.js` in this folder

#### Alternative CDN (for development):
```html
<!-- Not recommended for production extension -->
<script src="https://cdn.jsdelivr.net/npm/@mozilla/readability@0.5.0/Readability.js"></script>
```

### 2. Fuse.js
**Purpose**: Provides fuzzy search functionality
**Source**: Fuse.js library
**File**: `fuse.min.js`

#### Download Options:
- **Automatic**: Run `../setup.ps1` from the project root
- **Manual**:
  1. Visit: https://fusejs.io/
  2. Download: https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js
  3. Save as: `fuse.min.js` in this folder

#### Alternative Versions:
- Latest: https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.min.js
- Specific version: https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js

## Verification

After downloading, this folder should contain:
```
lib/
├── Readability.js      (~66 KB)
└── fuse.min.js         (~24 KB)
```

## Manual Download Steps

If the setup script doesn't work:

### Using PowerShell:
```powershell
# Download Readability.js
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/mozilla/readability/main/Readability.js" -OutFile "Readability.js"

# Download Fuse.js
Invoke-WebRequest -Uri "https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js" -OutFile "fuse.min.js"
```

### Using curl (Git Bash or WSL):
```bash
# Download Readability.js
curl -o Readability.js https://raw.githubusercontent.com/mozilla/readability/main/Readability.js

# Download Fuse.js
curl -o fuse.min.js https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js
```

### Using a Web Browser:
1. **Readability.js**:
   - Open: https://raw.githubusercontent.com/mozilla/readability/main/Readability.js
   - Right-click → Save As → `Readability.js`
   - Save to this `lib/` folder

2. **Fuse.js**:
   - Open: https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js
   - Right-click → Save As → `fuse.min.js`
   - Save to this `lib/` folder

## Licensing

### Readability.js
- **License**: Apache License 2.0
- **Copyright**: Mozilla Corporation
- **Repository**: https://github.com/mozilla/readability

### Fuse.js
- **License**: Apache License 2.0
- **Copyright**: Kirollos Risk
- **Repository**: https://github.com/krisk/fuse

Both libraries are open-source and free to use.

## Troubleshooting

### Files not loading in extension
1. Verify files are in the correct location (`backend/lib/`)
2. Check file names match exactly (case-sensitive)
3. Ensure files are not empty (check file sizes)
4. Reload extension in `chrome://extensions`

### Download issues
1. Try alternative download methods above
2. Check your internet connection
3. Disable antivirus/firewall temporarily
4. Use a different browser to download
5. Download from alternative CDN sources

### Permission errors
1. Make sure you have write permissions to the folder
2. Run PowerShell as Administrator if needed
3. Check folder is not read-only

## Alternative: Local Copies

If downloads consistently fail, you can clone the repositories:

```bash
# Clone Readability
git clone https://github.com/mozilla/readability.git temp-readability
cp temp-readability/Readability.js .
rm -rf temp-readability

# Clone Fuse.js
git clone https://github.com/krisk/fuse.git temp-fuse
cp temp-fuse/dist/fuse.min.js .
rm -rf temp-fuse
```

## Need Help?

If you're still having trouble:
1. Check the main README.md for setup instructions
2. Review TESTING.md for troubleshooting
3. Open an issue with details of the problem
