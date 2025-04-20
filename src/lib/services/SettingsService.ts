import axios from 'axios';

export interface SettingsData {
  siteName: string;
  siteEmail: string;
  sitePhone: string;
  siteAddress: string;
  showVirtualTours: boolean;
  social: {
    facebook: string;
    instagram: string;
    youtube: string;
    whatsapp: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  smtp: {
    host: string;
    port: string;
    user: string;
    password: string;
  };
}

// Default settings
export const defaultSettings: SettingsData = {
  siteName: "360° Real Estate",
  siteEmail: "info@360degreesrealestate.in",
  sitePhone: "+91 9759866333",
  siteAddress: "Dehradun, Uttarakhand",
  showVirtualTours: true,
  social: {
    facebook: "",
    instagram: "",
    youtube: "",
    whatsapp: "",
  },
  seo: {
    metaTitle: "360° Real Estate - Properties in Uttarakhand",
    metaDescription: "Find your dream property in Uttarakhand with 360° Real Estate. We offer a wide range of properties including residential, commercial, and agricultural.",
  },
  smtp: {
    host: "",
    port: "",
    user: "",
    password: "",
  },
};

/**
 * Get the website settings from the API
 */
export async function getSettings(): Promise<SettingsData> {
  try {
    const response = await axios.get('/api/settings');
    
    if (response.status === 200) {
      // Converting old settings format to new format if needed
      if ('contactEmail' in response.data) {
        const oldData = response.data;
        const newData: SettingsData = {
          siteName: oldData.siteName || defaultSettings.siteName,
          siteEmail: oldData.contactEmail || defaultSettings.siteEmail,
          sitePhone: oldData.phoneNumber || defaultSettings.sitePhone,
          siteAddress: oldData.mainLocation || defaultSettings.siteAddress,
          showVirtualTours: oldData.enableVirtualTours !== undefined ? oldData.enableVirtualTours : defaultSettings.showVirtualTours,
          social: {
            facebook: oldData.socialLinks?.facebook || "",
            instagram: oldData.socialLinks?.instagram || "",
            youtube: oldData.socialLinks?.youtube || "",
            whatsapp: oldData.socialLinks?.whatsapp || "",
          },
          seo: {
            metaTitle: oldData.metaTitle || defaultSettings.seo.metaTitle,
            metaDescription: oldData.metaDescription || defaultSettings.seo.metaDescription,
          },
          smtp: {
            host: oldData.smtpHost || "",
            port: oldData.smtpPort || "",
            user: oldData.smtpUser || "",
            password: oldData.smtpPass || "",
          },
        };
        return newData;
      }
      
      return response.data as SettingsData;
    }
    
    console.error('Failed to fetch settings:', response.statusText);
    return defaultSettings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return defaultSettings;
  }
}

/**
 * Save settings to the API
 */
export async function saveSettings(settings: SettingsData): Promise<boolean> {
  try {
    // Convert new settings format to old format for backward compatibility
    const oldFormatData = {
      siteName: settings.siteName,
      contactEmail: settings.siteEmail,
      phoneNumber: settings.sitePhone,
      mainLocation: settings.siteAddress,
      metaTitle: settings.seo.metaTitle,
      metaDescription: settings.seo.metaDescription,
      enableVirtualTours: settings.showVirtualTours,
      socialLinks: {
        facebook: settings.social.facebook,
        instagram: settings.social.instagram,
        youtube: settings.social.youtube,
        whatsapp: settings.social.whatsapp,
      },
      smtpHost: settings.smtp.host,
      smtpPort: settings.smtp.port,
      smtpUser: settings.smtp.user,
      smtpPass: settings.smtp.password,
    };

    const response = await axios.post('/api/settings', oldFormatData);
    
    if (response.status === 200) {
      return true;
    }
    
    console.error('Failed to save settings:', response.statusText);
    return false;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}