/**
 * ME-DB Theme Configuration
 * 
 * Centralized UI styling constants for easy customization.
 * Import this file in components: import theme from '../theme';
 * 
 * Usage Examples:
 * - Inline styles: style={{ color: theme.colors.primary }}
 * - Destructure for cleaner code: const { colors, spacing } = theme;
 * - Access nested values: theme.components.navbar.height
 * 
 * To customize the entire app's look:
 * 1. Update colors in the 'colors' section
 * 2. Adjust typography in the 'typography' section
 * 3. Modify component-specific styles in the 'components' section
 */

const theme = {
  // ============================================
  // COLOR PALETTE
  // ============================================
  colors: {
    // Primary Brand Colors
    primary: '#ffc107',        // Warning/Orange - used for buttons and accents
    secondary: '#2c3e50',      // Dark blue-gray - main background
    
    // Background Colors
    background: {
      primary: '#2c3e50',      // Main page background
      secondary: '#34495e',    // Alternate section background
      dark: '#1a252f',         // Darker background (tables, footer)
      light: '#ffffff',        // Light background
      overlay: 'rgba(0, 0, 0, 0.5)',         // Modal backdrop
      cardGlass: 'rgba(255, 255, 255, 0.1)', // Glass-morphism effect
      cardGlassHover: 'rgba(255, 255, 255, 0.05)',
    },
    
    // Text Colors
    text: {
      primary: '#ffffff',      // Main text color
      secondary: '#9ca3af',    // Muted/secondary text
      muted: 'rgba(255, 255, 255, 0.5)',     // Very light text
      light: '#cbd5e1',        // Light gray text
      dark: '#000000',         // Dark text for light backgrounds
    },
    
    // Status Colors (Bootstrap-compatible)
    status: {
      success: '#28a745',      // Green
      danger: '#dc3545',       // Red
      warning: '#ffc107',      // Orange/Yellow
      info: '#17a2b8',         // Blue
    },
    
    // Border Colors
    border: {
      default: 'rgba(255, 255, 255, 0.1)',
      light: 'rgba(255, 255, 255, 0.2)',
      dark: '#1a252f',
    },
    
    // Link Colors
    link: {
      default: '#0d6efd',      // Bootstrap primary blue
      hover: '#0a58ca',        // Darker blue on hover
    },
    
    // Accent Colors (for highlights and special elements)
    accent: {
      anime: '#ff7675',        // Red
      tv: '#74b9ff',           // Blue
      movies: '#ffeaa7',       // Yellow
      games: '#55efc4',        // Green
    },
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    // Font Families
    fontFamily: {
      base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    
    // Font Sizes
    fontSize: {
      xs: '0.75rem',       // 12px
      sm: '0.875rem',      // 14px
      base: '1rem',        // 16px
      md: '1.125rem',      // 18px
      lg: '1.25rem',       // 20px
      xl: '1.5rem',        // 24px
      '2xl': '1.875rem',   // 30px
      '3xl': '2.25rem',    // 36px
      '4xl': '3rem',       // 48px
      '5xl': '3.75rem',    // 60px
    },
    
    // Font Weights
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    
    // Line Heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.6,
      loose: 2,
    },
    
    // Letter Spacing
    letterSpacing: {
      tight: '-0.05em',
      normal: '0',
      wide: '0.05em',
    },
  },

  // ============================================
  // SPACING SYSTEM
  // ============================================
  spacing: {
    // Base spacing scale (in pixels)
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
    
    // Common padding presets
    padding: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
    
    // Common margin presets
    margin: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
  },

  // ============================================
  // COMPONENT-SPECIFIC STYLES
  // ============================================
  components: {
    // Navbar
    navbar: {
      // Desktop values
      height: '64px',
      heightScrolled: '60px',
      padding: '1.5rem 1rem',
      paddingScrolled: '0.5rem 1rem',
      backgroundColor: '#ffffff',
      backgroundColorScrolled: '#ffffff',
      logoFontSize: '1.25rem',
      linkFontSize: '1rem',
      buttonFontSize: '0.9rem',
      
      // Mobile values
      mobile: {
        height: '48px',
        logoFontSize: '1rem',
        linkFontSize: '0.875rem',
        buttonFontSize: '0.875rem',
        dropdownItemFontSize: '0.75rem',
        dropdownPadding: '0.25rem 0.75rem',
        profileImageSize: '24px',
      },
      
      // Desktop dropdown values
      desktop: {
        dropdownItemFontSize: '0.875rem',
        dropdownPadding: '0.25rem 1rem',
        profileImageSize: '32px',
        dropdownPaddingLarge: '0.5rem 1rem',
      },
      
      // Colors
      colors: {
        background: '#ffffff',
        text: {
          default: '#6b7280',
          hover: '#374151',
          dark: '#1f2937',
        },
        border: '#e5e7eb',
        dropdownBackground: '#ffffff',
        dropdownItemText: '#374151',
        avatarBackground: '#e5e7eb',
      },
      
      // Shadows
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      dropdownShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      
      // Border radius
      borderRadius: '0.375rem',
      
      hr: {
        thickness: '2px',
        color: '#9ca3af',
        margin: '8px 0',
      },
      
      transition: 'all 0.3s ease',
      linkTransition: 'color 0.2s ease',
    },

    // Cards (Media Items)
    cards: {
      desktop: {
        height: '70px',
        minWidth: '140px',
        maxWidth: '150px',
        fontSize: '1rem',
        titleFontSize: '1rem',
        yearFontSize: '0.875rem',
        padding: '8px',
        borderRadius: '4px',
      },
      
      mobile: {
        height: '60px',
        minWidth: '120px',
        maxWidth: '130px',
        fontSize: '0.875rem',
        titleFontSize: '0.875rem',
        yearFontSize: '0.75rem',
        padding: '6px',
        borderRadius: '4px',
      },
      
      shadow: {
        default: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        hover: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
        strong: '0 10px 25px rgba(0, 0, 0, 0.3)',
      },
      
      transition: 'all 0.3s ease',
      hoverTransform: 'translateY(-5px)',
    },

    // Buttons
    buttons: {
      borderRadius: '4px',
      borderRadiusPill: '50rem', // Bootstrap pill style
      padding: {
        sm: '4px 12px',
        md: '8px 16px',
        lg: '12px 24px',
      },
      fontSize: {
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
      },
      transition: 'all 0.2s ease',
      
      // Custom Google Sign-In button styling
      google: {
        backgroundColor: '#ffffff',
        color: '#444',
        padding: '12px 16px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
      },
    },

    // Modals
    modals: {
      backdrop: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '8px',
      padding: '20px',
      
      sizes: {
        sm: '300px',
        md: '500px',
        lg: '800px',
        xl: '1140px',
      },
      
      shadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    },

    // Tables
    tables: {
      backgroundColor: '#1a252f',
      rowHeight: '50px',
      cellPadding: '12px',
      headerFontSize: '1rem',
      cellFontSize: '0.875rem',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      hoverBackground: 'rgba(255, 255, 255, 0.05)',
    },

    // Forms
    forms: {
      inputHeight: '38px',
      inputPadding: '8px 12px',
      inputBorderRadius: '4px',
      inputFontSize: '1rem',
      labelFontSize: '0.875rem',
      labelMarginBottom: '4px',
      
      // Spacing between form elements
      elementSpacing: '16px',
      
      // Validation colors
      validation: {
        success: '#28a745',
        error: '#dc3545',
      },
    },

    // Footer
    footer: {
      backgroundColor: '#1a252f',
      padding: '16px 0',
      fontSize: '0.875rem',
      linkColor: 'rgba(255, 255, 255, 0.5)',
      linkHoverColor: '#ffffff',
    },

    // Accordions
    accordions: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      itemBackground: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      buttonPadding: '12px 16px',
    },

    // Hero Section
    hero: {
      minHeight: '100vh',
      paddingTop: '80px',
      titleFontSize: '3rem',
      subtitleFontSize: '1.25rem',
    },

    // Features Section
    features: {
      cardPadding: '24px',
      iconSize: '48px',
      titleFontSize: '1.25rem',
      descriptionFontSize: '1rem',
    },

    // Intro Page (Landing Page)
    introPage: {
      // Background colors - professional medium scheme (between dark and light)
      bg1: '#475569',        // Main hero/primary sections - medium slate blue-gray
      bg2: '#64748b',        // Alternate sections (Features, FAQ) - lighter slate blue-gray
      
      // Text colors
      text: {
        primary: '#ffffff',           // Main headings and important text
        secondary: '#f1f5f9',         // Body text and descriptions - light gray
        muted: 'rgba(241, 245, 249, 0.8)',  // Muted/secondary text
        accent: '#e2e8f0',            // Accent text (like "SCROLL TO EXPLORE")
      },
      
      // Navbar colors (for intro page navbar)
      navbar: {
        backgroundColor: '#64748b',  // Navbar background when not scrolled
        backgroundColorScrolled: '#ffffff',  // Navbar background when scrolled
        textColor: '#ffffff',         // Navbar text when not scrolled
        textColorScrolled: '#1f2937', // Navbar text when scrolled
      },
      
      // Card/Glass effect colors
      cardGlass: 'rgba(255, 255, 255, 0.15)',      // Glass-morphism background - more visible on medium bg
      cardGlassHover: 'rgba(255, 255, 255, 0.2)', // Glass-morphism hover
      cardBorder: 'rgba(255, 255, 255, 0.2)',     // Card border - more visible
      
      // Accordion colors
      accordionBackground: 'rgba(255, 255, 255, 0.15)',
      accordionItemBackground: 'rgba(255, 255, 255, 0.1)',
      accordionBorder: 'rgba(255, 255, 255, 0.2)',
    },

    // Tier Titles
    tiers: {
      fontSize: '1.5rem',
      fontWeight: 700,
      padding: '12px 16px',
      marginBottom: '16px',
      borderRadius: '4px',
      
      // Tier-specific colors (S-F)
      colors: {
        S: '#ff6b6b',
        A: '#feca57',
        B: '#48dbfb',
        C: '#1dd1a1',
        D: '#ee5a6f',
        F: '#c8d6e5',
      },
    },
  },

  // ============================================
  // RESPONSIVE BREAKPOINTS
  // ============================================
  breakpoints: {
    // Mobile first approach
    xs: '0px',        // Extra small devices (portrait phones)
    sm: '576px',      // Small devices (landscape phones)
    md: '768px',      // Medium devices (tablets)
    lg: '992px',      // Large devices (desktops)
    xl: '1200px',     // Extra large devices (large desktops)
    xxl: '1400px',    // Extra extra large devices
  },

  // ============================================
  // EFFECTS & ANIMATIONS
  // ============================================
  effects: {
    // Box Shadows
    shadow: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      md: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
      lg: '0 10px 25px rgba(0, 0, 0, 0.3)',
      xl: '0 20px 40px rgba(0, 0, 0, 0.4)',
    },
    
    // Transitions
    transition: {
      fast: 'all 0.15s ease',
      base: 'all 0.2s ease',
      slow: 'all 0.3s ease',
      slowest: 'all 0.5s ease',
    },
    
    // Hover Effects
    hover: {
      opacity: 0.8,
      lift: 'translateY(-5px)',
      scale: 'scale(1.05)',
    },
    
    // Border Radius
    borderRadius: {
      sm: '2px',
      base: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
      pill: '50rem',
      circle: '50%',
    },
    
    // Z-Index layers
    zIndex: {
      dropdown: 1000,
      sticky: 1020,
      fixed: 1030,
      modalBackdrop: 1040,
      modal: 1050,
      popover: 1060,
      tooltip: 1070,
    },
  },

  // ============================================
  // BOOTSTRAP OVERRIDES
  // ============================================
  // These values can be used to override Bootstrap's default variables
  bootstrap: {
    // Primary color override
    primary: '#ffc107',
    
    // Body background
    bodyBg: '#2c3e50',
    bodyColor: '#ffffff',
    
    // Link colors
    linkColor: '#0d6efd',
    linkHoverColor: '#0a58ca',
    
    // Enable/disable features
    enableGradients: false,
    enableShadows: true,
    enableRoundedCorners: true,
  },
};

// Export the theme object as default
module.exports = theme;

