# NOMAD Brand Guidelines

## Brand Identity

**NOMAD** - The Spatial Operating System for Modern Hospitality

---

## Typography

### Primary Brand Font

| Property | Value |
|:---|:---|
| **Font Family** | Archivo Black |
| **Source** | Google Fonts |
| **Weight** | 400 (appears bold by design) |
| **Style** | Normal |

### Brand Name Usage

The brand name should always be written as **NOMAD** (all caps) using:

```css
font-family: "Archivo Black", sans-serif;
font-weight: 900; /* font-black in Tailwind */
letter-spacing: -0.05em; /* tracking-tighter in Tailwind */
```

**Tailwind CSS Usage:**
```jsx
<span className="font-brand font-black tracking-tighter">NOMAD</span>
```

---

## Color Palette

### Primary Brand Gradient

| Color | Hex Code | Usage |
|:---|:---|:---|
| **Azure Blue** | `#007FFF` | Gradient start (brand-primary) |
| **Royal Blue** | `#2A52BE` | Gradient end (brand-secondary) |

**CSS Gradient:**
```css
background: linear-gradient(135deg, #007FFF 0%, #2A52BE 100%);
```

**Tailwind CSS:**
```jsx
<span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
  NOMAD
</span>
```

---

## Logo Styling

### Header Logo (45px)
```jsx
<h1 className="text-[45px] font-brand font-black bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent tracking-tighter leading-none">
  NOMAD
</h1>
```

### Compact Logo (24px)
```jsx
<span className="text-2xl font-brand font-black tracking-tighter">
  NOMAD
</span>
```

---

## Font Import

Add to `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap" rel="stylesheet">
```

Tailwind config (`tailwind.config.js`):
```javascript
fontFamily: {
  brand: ['"Archivo Black"', 'sans-serif'],
}
```
