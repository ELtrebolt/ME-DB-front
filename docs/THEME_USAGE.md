# ME-DB Theme System Usage Guide

## Overview

The ME-DB theme system centralizes all UI styling constants in `src/theme.js`, making it easy to customize the entire application's appearance from one location.

## Quick Start

### Importing the Theme

```javascript
const theme = require('./theme');
// Or with ES6:
import theme from './theme';
```

### Basic Usage

```javascript
// Access colors
style={{ backgroundColor: theme.colors.primary }}

// Access typography
style={{ fontSize: theme.typography.fontSize.lg }}

// Access spacing
style={{ padding: theme.spacing.md }}

// Access component-specific styles
style={{ height: theme.components.navbar.height }}
```

### Destructuring for Cleaner Code

```javascript
const { colors, typography, spacing } = theme;

// Now use them directly
style={{ 
  color: colors.primary,
  fontSize: typography.fontSize.lg,
  padding: spacing.md
}}
```

## Theme Structure

### 1. Colors

The color palette is organized into logical groups:

```javascript
// Primary brand colors
theme.colors.primary          // #ffc107 (Warning/Orange)
theme.colors.secondary        // #2c3e50 (Dark blue-gray)

// Background colors
theme.colors.background.primary    // Main page background
theme.colors.background.secondary  // Alternate sections
theme.colors.background.dark       // Tables, footer
theme.colors.background.overlay    // Modal backdrop
theme.colors.background.cardGlass  // Glass-morphism effect

// Text colors
theme.colors.text.primary     // #ffffff (Main text)
theme.colors.text.secondary   // #9ca3af (Muted text)
theme.colors.text.muted       // Very light text
theme.colors.text.light       // Light gray

// Status colors (Bootstrap-compatible)
theme.colors.status.success   // Green
theme.colors.status.danger    // Red
theme.colors.status.warning   // Orange
theme.colors.status.info      // Blue

// Border colors
theme.colors.border.default   // rgba(255, 255, 255, 0.1)
theme.colors.border.light     // rgba(255, 255, 255, 0.2)
```

### 2. Typography

Font families, sizes, weights, and spacing:

```javascript
// Font families
theme.typography.fontFamily.base
theme.typography.fontFamily.heading
theme.typography.fontFamily.mono

// Font sizes (xs to 5xl)
theme.typography.fontSize.xs     // 0.75rem
theme.typography.fontSize.sm     // 0.875rem
theme.typography.fontSize.base   // 1rem
theme.typography.fontSize.lg     // 1.25rem
theme.typography.fontSize.xl     // 1.5rem
theme.typography.fontSize['2xl'] // 1.875rem
// ... up to 5xl

// Font weights
theme.typography.fontWeight.light      // 300
theme.typography.fontWeight.normal     // 400
theme.typography.fontWeight.bold       // 700

// Line heights
theme.typography.lineHeight.tight   // 1.2
theme.typography.lineHeight.normal  // 1.5
theme.typography.lineHeight.relaxed // 1.6
```

### 3. Spacing

Consistent spacing scale for padding and margins:

```javascript
theme.spacing.xs    // 4px
theme.spacing.sm    // 8px
theme.spacing.md    // 16px
theme.spacing.lg    // 24px
theme.spacing.xl    // 32px
theme.spacing['2xl'] // 48px
theme.spacing['3xl'] // 64px
theme.spacing['4xl'] // 96px

// Shorthand accessors
theme.spacing.padding.md   // Same as theme.spacing.md
theme.spacing.margin.lg    // Same as theme.spacing.lg
```

### 4. Component-Specific Styles

Pre-configured styling for common components:

#### Navbar

```javascript
theme.components.navbar.height              // 70px
theme.components.navbar.backgroundColor     // #34495e
theme.components.navbar.logoFontSize        // 1.5rem
theme.components.navbar.hr.thickness        // 2px
theme.components.navbar.hr.color            // #9ca3af
```

#### Cards (Media Items)

```javascript
theme.components.cards.desktop.height       // 70px
theme.components.cards.desktop.fontSize     // 1rem
theme.components.cards.desktop.padding      // 8px
theme.components.cards.desktop.minWidth     // 140px
theme.components.cards.desktop.maxWidth     // 150px

theme.components.cards.shadow.default
theme.components.cards.shadow.hover
theme.components.cards.hoverTransform       // translateY(-5px)
```

#### Buttons

```javascript
theme.components.buttons.borderRadius       // 4px
theme.components.buttons.padding.md         // 8px 16px
theme.components.buttons.fontSize.md        // 1rem
```

#### Modals

```javascript
theme.components.modals.backdrop            // rgba(0, 0, 0, 0.5)
theme.components.modals.sizes.md            // 500px
theme.components.modals.shadow
```

#### Tables

```javascript
theme.components.tables.backgroundColor     // #1a252f
theme.components.tables.rowHeight          // 50px
theme.components.tables.headerFontSize     // 1rem
```

#### Forms

```javascript
theme.components.forms.inputHeight         // 38px
theme.components.forms.inputPadding        // 8px 12px
theme.components.forms.validation.success  // #28a745
theme.components.forms.validation.error    // #dc3545
```

#### Footer

```javascript
theme.components.footer.backgroundColor    // #1a252f
theme.components.footer.padding           // 16px 0
theme.components.footer.linkColor         // rgba(255, 255, 255, 0.5)
```

### 5. Effects & Animations

Shadows, transitions, and hover effects:

```javascript
// Box shadows
theme.effects.shadow.sm
theme.effects.shadow.md
theme.effects.shadow.lg

// Transitions
theme.effects.transition.fast    // all 0.15s ease
theme.effects.transition.base    // all 0.2s ease
theme.effects.transition.slow    // all 0.3s ease

// Hover effects
theme.effects.hover.opacity      // 0.8
theme.effects.hover.lift         // translateY(-5px)
theme.effects.hover.scale        // scale(1.05)

// Border radius
theme.effects.borderRadius.base  // 4px
theme.effects.borderRadius.pill  // 50rem
theme.effects.borderRadius.circle // 50%

// Z-index layers
theme.effects.zIndex.modal       // 1050
theme.effects.zIndex.dropdown    // 1000
```

### 6. Responsive Breakpoints

Mobile-first breakpoints:

```javascript
theme.breakpoints.xs   // 0px
theme.breakpoints.sm   // 576px
theme.breakpoints.md   // 768px
theme.breakpoints.lg   // 992px
theme.breakpoints.xl   // 1200px
theme.breakpoints.xxl  // 1400px
```

## Real-World Examples

### Example 1: Creating a Custom Card Component

```jsx
import theme from '../theme';

const CustomCard = ({ title, content }) => {
  const { colors, spacing, effects, typography } = theme;
  
  return (
    <div style={{
      backgroundColor: colors.background.cardGlass,
      padding: spacing.md,
      borderRadius: effects.borderRadius.lg,
      boxShadow: effects.shadow.md,
      transition: effects.transition.base,
      color: colors.text.primary,
      fontSize: typography.fontSize.base
    }}>
      <h3 style={{ 
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.sm
      }}>
        {title}
      </h3>
      <p>{content}</p>
    </div>
  );
};
```

### Example 2: Styling a Page Layout

```jsx
import theme from '../theme';

const MyPage = () => {
  return (
    <div style={{ 
      backgroundColor: theme.colors.background.primary,
      minHeight: '100vh',
      padding: theme.spacing.lg
    }}>
      <div className="container">
        <h1 style={{
          fontSize: theme.typography.fontSize['4xl'],
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.xl
        }}>
          Page Title
        </h1>
        
        <section style={{
          backgroundColor: theme.colors.background.secondary,
          padding: theme.spacing['2xl'],
          borderRadius: theme.effects.borderRadius.lg,
          boxShadow: theme.effects.shadow.lg
        }}>
          {/* Content */}
        </section>
      </div>
    </div>
  );
};
```

### Example 3: Using Component Presets

```jsx
import theme from '../theme';

// Using navbar presets
<nav style={{
  height: theme.components.navbar.height,
  backgroundColor: theme.components.navbar.backgroundColor,
  padding: '0 1rem'
}}>
  <span style={{ fontSize: theme.components.navbar.logoFontSize }}>
    ME-DB
  </span>
</nav>

// Using button presets
<button style={{
  padding: theme.components.buttons.padding.md,
  fontSize: theme.components.buttons.fontSize.md,
  borderRadius: theme.components.buttons.borderRadius,
  backgroundColor: theme.colors.primary,
  color: theme.colors.text.primary,
  transition: theme.effects.transition.base
}}>
  Click Me
</button>

// Using table presets
<table style={{
  backgroundColor: theme.components.tables.backgroundColor,
  color: theme.colors.text.primary
}}>
  <thead>
    <tr style={{ fontSize: theme.components.tables.headerFontSize }}>
      <th>Column 1</th>
    </tr>
  </thead>
</table>
```

## Customization Guide

### Changing the Global Color Scheme

To change your app's color scheme, edit `src/theme.js`:

```javascript
colors: {
  primary: '#your-color',        // Update primary color
  secondary: '#your-color',      // Update secondary color
  background: {
    primary: '#your-bg-color',   // Update main background
    // ...
  }
}
```

### Adding New Components

To add styling for a new component:

```javascript
// In theme.js, under components section:
components: {
  // ... existing components
  
  myNewComponent: {
    height: '60px',
    padding: '12px',
    backgroundColor: '#custom-color',
    fontSize: '1rem',
    // Add any properties you need
  }
}
```

### Creating Theme Variants

You can create multiple theme objects for light/dark modes:

```javascript
// theme.js
const baseTheme = { /* shared values */ };

const lightTheme = {
  ...baseTheme,
  colors: { /* light colors */ }
};

const darkTheme = {
  ...baseTheme,
  colors: { /* dark colors */ }
};

// Export based on user preference
module.exports = darkTheme; // or lightTheme
```

## Best Practices

1. **Always use theme values instead of hardcoded values**
   - ❌ Bad: `color: '#ffc107'`
   - ✅ Good: `color: theme.colors.primary`

2. **Destructure for readability in larger components**
   ```javascript
   const { colors, spacing, typography } = theme;
   ```

3. **Create reusable style objects**
   ```javascript
   const cardStyle = {
     backgroundColor: theme.colors.background.cardGlass,
     padding: theme.spacing.md,
     borderRadius: theme.effects.borderRadius.lg
   };
   ```

4. **Document custom additions**
   - Add inline comments when adding new theme properties
   - Update this guide when making significant changes

5. **Test theme changes globally**
   - Change one theme value and verify it updates everywhere
   - Use consistent naming conventions

## Migration from Old System

If you're updating old code that used `constants.mainColors` or `constants.components`:

### Before (constants.js)
```javascript
const constants = require('./constants');
style={{ backgroundColor: constants.mainColors.background }}
```

### After (theme.js)
```javascript
const theme = require('./theme');
style={{ backgroundColor: theme.colors.background.primary }}
```

### Quick Reference Mapping

| Old (constants.js) | New (theme.js) |
|-------------------|----------------|
| `constants.mainColors.background` | `theme.colors.background.primary` |
| `constants.mainColors.buttons` | `theme.colors.primary` |
| `constants.mainColors.table` | `theme.colors.background.dark` |
| `constants.components.navbar.hr.thickness` | `theme.components.navbar.hr.thickness` |
| `constants.components.navbar.hr.color` | `theme.components.navbar.hr.color` |
| `constants.components.cards.desktop.*` | `theme.components.cards.desktop.*` |

## Troubleshooting

### Issue: Theme changes not reflecting

**Solution:** Restart your development server to pick up theme.js changes.

### Issue: Property undefined error

**Solution:** Check the exact path in theme.js. Use optional chaining:
```javascript
style={{ color: theme.colors?.primary }}
```

### Issue: Mixing old and new system

**Solution:** Search for `constants.mainColors` and `constants.components` in your codebase and replace with theme equivalents.

## Support

For questions or issues with the theme system:
1. Check this guide for usage examples
2. Review `src/theme.js` for available properties
3. Check the inline documentation in `theme.js`

---

**Last Updated:** December 2025  
**Theme Version:** 1.0.0

