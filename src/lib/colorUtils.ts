const BRANDING_COLORS_KEY = "brandingColors";
interface BrandingColors {
  primary: string;
  secondary: string;
  [key: string]: string; 
}


export const updateThemeColors = (brandingColors: any) => {
  if (!brandingColors) return;

  // Save to localStorage
  localStorage.setItem(BRANDING_COLORS_KEY, JSON.stringify(brandingColors));

  // Update CSS variables
  const root = document.documentElement;
  Object.entries(brandingColors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value as string);
  });
};

export const loadThemeColors = () => {
  try {
    const storedColors = localStorage.getItem(BRANDING_COLORS_KEY);
    if (!storedColors) return;

    const brandingColors = JSON.parse(storedColors);
    const root = document.documentElement;

    Object.entries(brandingColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value as string);
    });
  } catch (error) {
    console.error("Error loading theme colors from storage:", error);
  }
};

export const resetThemeColors = () => {
  const root = document.documentElement;
  const defaultColors: BrandingColors = {
    primary: "#3E5B93", 
    secondary: "#228AB9",
    background: "#f8f9fa", 
    text: "#343a40", 
  };
  Object.entries(defaultColors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

};
