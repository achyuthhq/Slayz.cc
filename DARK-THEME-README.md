# Modern Dark Theme with Glassmorphism

This update implements a consistent modern dark theme with glassmorphism across all dashboard pages. The theme applies to cards, buttons, modals, input fields, dropdowns, and sidebar menus throughout the application.

## Key Features

- **Dark Background**: All pages now use a consistent dark gray (#0f0f0f) background
- **Glassmorphism Effect**: Cards, modals, and UI elements now have a glass-like appearance with blur effects
- **Consistent Styling**: All components follow the same design language
- **Improved Visual Hierarchy**: Better contrast and focus on content
- **Modern Look and Feel**: Rounded corners, subtle shadows, and glowing effects

## CSS Classes Added

The following CSS classes have been added to `client/src/index.css`:

### Glass Card Elevated
```css
.glass-card-elevated {
  backdrop-filter: blur(60px);
  box-shadow: rgba(0, 0, 0, 0.4) 0px 20px 60px, rgba(255, 255, 255, 0.15) 0px 1px inset;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.glass-card-elevated:hover {
  box-shadow: rgba(0, 0, 0, 0.5) 0px 25px 65px, rgba(255, 255, 255, 0.2) 0px 1px inset;
  transform: translateY(-2px);
}
```

### Glass Input
```css
.glass-input {
  backdrop-filter: blur(60px);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #ffffff;
  transition: all 0.3s ease;
}

.glass-input:focus {
  box-shadow: 0 0 0 2px rgba(127, 90, 240, 0.4);
  border-color: rgba(127, 90, 240, 0.5);
}
```

### Glass Button
```css
.glass-button {
  backdrop-filter: blur(60px);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #ffffff;
  transition: all 0.3s ease;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 20px rgba(127, 90, 240, 0.3);
}
```

### Solid Button
```css
.solid-button {
  background: #7f5af0;
  background: linear-gradient(135deg, #7f5af0 0%, #6b46c1 100%);
  border-radius: 12px;
  color: #ffffff;
  transition: all 0.3s ease;
}

.solid-button:hover {
  box-shadow: 0 0 20px rgba(127, 90, 240, 0.5);
  transform: translateY(-2px);
}
```

### Glass Dropdown
```css
.glass-dropdown {
  backdrop-filter: blur(60px);
  background: rgba(15, 15, 15, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.3) 0px 10px 30px;
}
```

### Glass Modal
```css
.glass-modal {
  backdrop-filter: blur(60px);
  background: rgba(15, 15, 15, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 20px 60px, rgba(255, 255, 255, 0.1) 0px 1px inset;
}
```

## Components Updated

The following components have been updated to use the new theme:

1. **Card Component**: Now uses `.glass-card-elevated` for a consistent glassmorphism effect
2. **Button Component**: Updated with `.glass-button` and `.solid-button` styles
3. **Input Component**: Now uses `.glass-input` for transparent inputs with visible borders
4. **Dropdown Menu**: Updated with `.glass-dropdown` style
5. **Dialog/Modal**: Updated with `.glass-modal` style
6. **Dashboard Layout**: Updated sidebar and navigation elements with glassmorphism

## Theme Colors

The dark theme colors have been updated in the CSS variables:

```css
.dark {
  --background: 0 0% 6%;  /* #0f0f0f */
  --foreground: 0 0% 100%;  /* #ffffff */
  --card: 0 0% 6%;
  --card-foreground: 0 0% 100%;
  --popover: 0 0% 6%;
  --popover-foreground: 0 0% 100%;
  --primary: 262 80% 60%;  /* #7f5af0 */
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 10%;
  --secondary-foreground: 0 0% 80%;  /* #cccccc */
  --muted: 0 0% 12%;
  --muted-foreground: 0 0% 80%;
  --accent: 262 80% 60%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 15%;
  --input: 0 0% 15%;
  --ring: 262 80% 60%;
}
```

## Tailwind Config Updates

The `tailwind.config.ts` file has been updated with new utility classes:

```ts
boxShadow: {
  'glass': 'rgba(0, 0, 0, 0.4) 0px 20px 60px, rgba(255, 255, 255, 0.15) 0px 1px inset',
  'glass-hover': 'rgba(0, 0, 0, 0.5) 0px 25px 65px, rgba(255, 255, 255, 0.2) 0px 1px inset',
},
backdropBlur: {
  'glass': '60px',
},
backgroundColor: {
  'glass': 'rgba(255, 255, 255, 0.03)',
  'glass-hover': 'rgba(255, 255, 255, 0.08)',
  'dark': '#0f0f0f',
},
```

## Usage

The updated theme is automatically applied to all dashboard pages. No additional configuration is needed to use the new styles. 