// src/utils/propertyUtils.js

export const getPropertyId = (property) => {
    return property?.id || property?.property_id || property?.prop_id || null;
  };
  
  export const getPrimaryImageUrl = (property) => {
    if (property?.property_images?.length > 0) {
      return property.property_images[0].image_url;
    }
    return property?.image || property?.image_url || property?.main_image_url || '/images/property-default.jpg';
  };
  
  export const getPropertyLocationString = (property) => {
    const city = property?.city || '';
    const parish = property?.parish?.name || property?.parish || '';
    if (city && parish) return `${city}, ${parish}`;
    if (city) return city;
    if (parish) return parish;
    return 'Jamaica';
  };
  