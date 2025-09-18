export const colorUtils = {
  // Convert hex to rgba
  hexToRgba: (hex: string, alpha: number = 1): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  // Generate gradient string
  createGradient: (colors: string[], direction: number = 45): string => {
    return `linear-gradient(${direction}deg, ${colors.join(', ')})`;
  },

  // Get color palette
  getPalette: (type: 'modern' | 'vibrant' | 'muted' | 'dark'): string[] => {
    const palettes = {
      modern: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
      vibrant: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'],
      muted: ['#a8a8a8', '#c7c7c7', '#e0e0e0', '#f5f5f5'],
      dark: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6'],
    };
    return palettes[type] || palettes.modern;
  },

  // Lighten color
  lighten: (color: string, amount: number): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (!result) return color;

    const r = Math.min(255, parseInt(result[1], 16) + amount);
    const g = Math.min(255, parseInt(result[2], 16) + amount);
    const b = Math.min(255, parseInt(result[3], 16) + amount);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  },

  // Darken color
  darken: (color: string, amount: number): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (!result) return color;

    const r = Math.max(0, parseInt(result[1], 16) - amount);
    const g = Math.max(0, parseInt(result[2], 16) - amount);
    const b = Math.max(0, parseInt(result[3], 16) - amount);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  },
};