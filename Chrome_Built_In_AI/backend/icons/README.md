# Icon Setup Instructions

Since we can't create PNG files directly via scripts, here are instructions to create icons:

## Option 1: Use Online Icon Generator
1. Visit: https://www.favicon-generator.org/
2. Upload a brain emoji screenshot or any image you like
3. Download the generated icons
4. Rename and move them to the `icons/` folder:
   - icon16.png
   - icon32.png
   - icon48.png
   - icon128.png

## Option 2: Use Text-to-Icon Tools
1. Visit: https://favicon.io/favicon-generator/
2. Create a simple icon with text "CR" (for ContextRecall)
3. Use a purple/blue gradient background
4. Download and place in `icons/` folder

## Option 3: Quick Placeholder (For Testing)
You can use any square PNG images as placeholders:
1. Find any 4 PNG images
2. Rename them to: icon16.png, icon32.png, icon48.png, icon128.png
3. Place in the `backend/icons/` folder

## Option 4: Create with Python (if you have PIL/Pillow)
Run this Python script to generate simple placeholder icons:

```python
from PIL import Image, ImageDraw, ImageFont

sizes = [16, 32, 48, 128]
for size in sizes:
    img = Image.new('RGB', (size, size), color='#667eea')
    draw = ImageDraw.Draw(img)
    
    # Draw a circle
    margin = size // 4
    draw.ellipse([margin, margin, size-margin, size-margin], fill='#764ba2')
    
    img.save(f'icon{size}.png')
```

## Recommended Design
- **Theme**: Purple gradient (matching the extension UI)
- **Symbol**: Brain emoji 🧠, or "CR" initials, or a memory/recall symbol
- **Colors**: #667eea to #764ba2 (gradient from light to dark purple)
