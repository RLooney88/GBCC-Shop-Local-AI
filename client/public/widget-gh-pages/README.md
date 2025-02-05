# Shop Local Assistant Widget

A lightweight, embeddable chat widget for the Shop Local Assistant.

## Deployment to GitHub Pages

1. Create a new repository on GitHub (e.g., `shop-local-widget`)
2. Clone the repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/shop-local-widget.git
   ```
3. Copy these files into the repository:
   - `index.html`
   - `widget.js`
4. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial widget setup"
   git push origin main
   ```
5. Enable GitHub Pages:
   - Go to repository Settings
   - Navigate to Pages
   - Select "main" branch and "/ (root)" folder
   - Click Save

Your widget will be available at: `https://YOUR-USERNAME.github.io/shop-local-widget/`

## Usage

Add this code to your website:

```html
<script>
(function() {
    const script = document.createElement('script');
    script.src = 'https://YOUR-USERNAME.github.io/shop-local-widget/widget.js';
    script.async = true;
    document.body.appendChild(script);
})();
</script>
```

## Features
- Lightweight and responsive
- No external dependencies
- Clean animations
- Mobile-friendly
- Cross-origin compatible

## Customization
To customize the appearance:
- Primary color: Change `#00A7B7` to your preferred color in `widget.js`
- Position: Modify `bottom` and `right` values in the CSS
- Size: Adjust `width` and `height` values
