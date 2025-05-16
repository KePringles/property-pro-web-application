import requests
from bs4 import BeautifulSoup
import re
import psycopg2
import schedule
import time
import os
from difflib import get_close_matches
from urllib.parse import urlparse
import hashlib
import urllib.parse

# Parish mapping from URL keywords to parish_id
PARISH_MAPPING = {
    'kingston': 1,
    'st-andrew': 2,
    'st-thomas': 3,
    'portland': 4,
    'st-mary': 5,
    'st-ann': 6,
    'trelawny': 7,
    'st-james': 8,
    'hanover': 9,
    'westmoreland': 10,
    'st-elizabeth': 11,
    'manchester': 12,
    'clarendon': 13,
    'st-catherine': 14,
}

urls = [
    "https://www.realtor.com/international/jm/766-peak-way-runaway-bay-st-ann-parish-310098285626",
    "https://www.realtor.com/international/jm/vista-cielo-cardiff-hall-unit-2-runaway-bay-st-ann-parish-310098230109",
    "https://www.realtor.com/international/jm/main-road-runaway-bay-unit-80-runaway-bay-st-ann-parish-310090792445",
    "https://www.realtor.com/international/jm/138-orange-street-kingston-kingston-parish-310098141848",
    "https://www.realtor.com/international/jm/1-3-ocean-boulevard-unit-4h-kingston-kingston-parish-310097048752",
    "https://www.realtor.com/international/jm/3-reading-manor-unit-1-montego-bay-st-james-parish-310098229107",
    "https://www.realtor.com/international/jm/321-sixth-ave-montego-hills-montego-bay-st-james-parish-310098285608",
    "https://www.realtor.com/international/jm/stonebrook-vista-falmouth-trelawny-parish-310098285614",
    "https://www.realtor.com/international/jm/664-florence-hall-village-falmouth-trelawny-parish-310097956009",
    "https://www.realtor.com/international/jm/the-waves-tower-isle-unit-d4-tower-isle-st-mary-parish-310098141903",
    "https://www.realtor.com/international/jm/richard-s-pen-farm-hill-st-mary-unit-lot-43-gayle-st-mary-parish-310097620024",
    "https://www.realtor.com/international/jm/skibo-portland-spring-garden-portland-parish-310097921729",
    "https://www.realtor.com/international/jm/105-san-san-estate-san-san-portland-parish-310095327970",
    "https://www.realtor.com/international/jm/sedgewick-pen-pilot-wilmi-wilmington-saint-thomas-parish-310097869649",
    "https://www.realtor.com/international/jm/12-highbury-road-2936-saint-thomas-parish-310097566250",
    "https://www.realtor.com/international/jm/64-queen-street-morant-bay-morant-bay-saint-thomas-parish-310096625658",
    "https://www.realtor.com/international/jm/30-st-paul-s-way-green-acres-saint-catherine-green-acres-saint-catherine-parish-120095319528",
    "https://www.realtor.com/international/jm/former-thetford-estate-old-harbour-saint-catherine-old-harbour-saint-catherine-parish-120095260200",
    "https://www.realtor.com/international/jm/45-york-circle-may-pen-clarendon-310098080931",
    "https://www.realtor.com/international/jm/foga-road-clarendon-unit-lot-4-denbigh-clarendon-310098235081",
    "https://www.realtor.com/international/jm/lot-2-caledonia-lane-mandeville-manchester-parish-310098285594",
    "https://www.realtor.com/international/jm/jackson-drive-mandeville-mandeville-manchester-parish-310098229110",
    "https://www.realtor.com/international/jm/6-orchid-drive-santa-cruz-st-elizabeth-parish-310098227953",
    "https://www.realtor.com/international/jm/dunder-hill-junction-st-elizabeth-parish-310097544215",
    "https://www.realtor.com/international/jm/little-bay-country-club-unit-75-negril-westmoreland-parish-310098096421",
    "https://www.realtor.com/international/jm/west-wing-whitehouse-unit-202-whitehouse-westmoreland-parish-310097956100",
    "https://www.realtor.com/international/jm/30-hillview-drive-bethel-town-westmoreland-parish-310098080900",
    "https://www.realtor.com/international/jm/33-sonway-crescent-unit-7-lucea-hanover-parish-310098285613",
    "https://www.realtor.com/international/jm/53-oceanpointe-lucea-hanover-parish-310096891861",
    "https://www.realtor.com/international/jm/haughton-court-seaview-haughton-court-hanover-parish-310097678346"
]

# PostgreSQL database config
DB_NAME = "property_pro_dev"
DB_USER = "postgres"
DB_PASSWORD = "Khayondra@1"
DB_HOST = "localhost"
DB_PORT = "5432"

# Directory to save images
IMAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "../static/images")

# Create images directory if it doesn't exist
if not os.path.exists(IMAGE_DIR):
    os.makedirs(IMAGE_DIR, exist_ok=True)

def detect_parish_id(url):
    for keyword, pid in PARISH_MAPPING.items():
        if keyword in url:
            return pid
    return None

def extract_amenities(soup):
    amenities_section = soup.find_all('li')
    amenities = []
    for item in amenities_section:
        text = item.get_text(strip=True).lower()
        if any(keyword in text for keyword in ['air', 'pool', 'garage', 'security', 'internet', 'balcony']):
            if 'air' in text:
                amenities.append(1)
            if 'pool' in text:
                amenities.append(2)
            if 'garage' in text:
                amenities.append(3)
            if 'security' in text:
                amenities.append(4)
            if 'internet' in text:
                amenities.append(5)
            if 'balcony' in text:
                amenities.append(6)
    return list(set(amenities))[:5] or [1, 2, 3]

def download_image(image_url, property_id, image_num):
    """Download an image and save it with the correct filename pattern"""
    try:
        # Skip invalid URLs
        if not image_url or not isinstance(image_url, str) or not image_url.startswith(('http://', 'https://')):
            print(f"❌ Invalid URL for property {property_id}, image {image_num}: {image_url}")
            return None
            
        # Create proper filename with the pattern property-{id}-{num}.jpg
        filename = f"property-{property_id}-{image_num}.jpg"
        file_path = os.path.join(IMAGE_DIR, filename)
        
        # Get the image data with a proper user agent
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(image_url, headers=headers, stream=True, timeout=10)
        response.raise_for_status()
        
        # Save the image
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"  ✅ Downloaded: {filename}")
        
        # Return the URL path for database storage
        return f"/images/{filename}"
    except Exception as e:
        print(f"  ❌ Error downloading image {image_url}: {e}")
        return None

def extract_images_from_property_page(url, property_id):
    """Scrape a property page for images"""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all image elements - look for various common patterns
        image_elements = []
        
        # Try different selectors for property images
        selectors = [
            'img.property-image', 
            '.property-gallery img',
            '.carousel img',
            '.slider img',
            '.photo-gallery img',
            'img[src*="photo"]',
            'img[src*="image"]',
            'img[src*="property"]',
            '.main-img img',
            '.hero-img img',
            '.gallery img'
        ]
        
        for selector in selectors:
            images = soup.select(selector)
            if images:
                image_elements.extend(images)
        
        # If we still don't have images, try getting all img tags with certain attributes
        if not image_elements:
            for img in soup.find_all('img'):
                src = img.get('src', '')
                srcset = img.get('srcset', '')
                alt = img.get('alt', '').lower()
                
                if any(term in src.lower() for term in ['property', 'house', 'home', 'photo', 'image', 'listing']):
                    image_elements.append(img)
                elif any(term in alt for term in ['property', 'house', 'home', 'interior', 'exterior']):
                    image_elements.append(img)
                elif any(term in srcset.lower() for term in ['property', 'house', 'home']):
                    image_elements.append(img)
        
        # Extract image URLs 
        image_urls = []
        for img in image_elements:
            # Try to get the best quality image
            src = img.get('src')
            data_src = img.get('data-src')
            
            # Prefer data-src as it often contains the full-resolution image
            image_url = data_src if data_src else src
            
            if image_url:
                # Make sure URL is absolute
                if not image_url.startswith(('http://', 'https://')):
                    parsed_uri = urllib.parse.urlparse(url)
                    base_url = f"{parsed_uri.scheme}://{parsed_uri.netloc}"
                    image_url = urllib.parse.urljoin(base_url, image_url)
                
                image_urls.append(image_url)
        
        # Remove duplicates while preserving order
        image_urls = list(dict.fromkeys(image_urls))
        
        # Limit to 3 images per property
        image_urls = image_urls[:3]
        
        print(f"  Found {len(image_urls)} images")
        
        # Download images and get local paths
        local_image_paths = []
        for i, img_url in enumerate(image_urls, 1):
            local_path = download_image(img_url, property_id, i)
            if local_path:
                is_primary = (i == 1)
                local_image_paths.append({
                    "image_url": local_path,
                    "is_primary": is_primary
                })
                
                # Insert into database
                insert_image_to_db(property_id, local_path, is_primary)
                
        return len(local_image_paths)
    
    except Exception as e:
        print(f"  ❌ Error scraping images from {url}: {e}")
        return 0

def extract_listing_data(url, prop_id):
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        soup = BeautifulSoup(response.content, 'html.parser')

        title = soup.find('h1')
        price = soup.find('span', string=re.compile(r'\$|J\$'))
        description = soup.find('p')

        details = soup.find_all('li')
        bedrooms = bathrooms = area = '0'
        for li in details:
            text = li.get_text(strip=True)
            if 'bed' in text.lower():
                bedrooms = re.sub(r'[^\d]', '', text)
            elif 'bath' in text.lower():
                bathrooms = re.sub(r'[^\d]', '', text)
            elif 'sqft' in text.lower():
                area = re.sub(r'[^\d]', '', text)

        address_tag = soup.find('div', string=re.compile(r'address', re.IGNORECASE))
        address = address_tag.get_text(strip=True) if address_tag else 'Unknown Address'
        city = 'Unknown City'
        match = re.search(r'jm/(.+?)-parish', url)
        if match:
            city = match.group(1).replace('-', ' ').title()

        # Extract image URLs
        images = soup.find_all('img')
        image_urls = []
        for img in images:
            src = img.get('src')
            if src and ('photo' in src or 'image' in src or 'property' in src):
                if not src.startswith(('http://', 'https://')):
                    # Make relative URLs absolute
                    parsed_uri = urllib.parse.urlparse(url)
                    base_url = f"{parsed_uri.scheme}://{parsed_uri.netloc}"
                    src = f"{base_url}{src}" if src.startswith('/') else f"{base_url}/{src}"
                image_urls.append(src)
        
        # Download images and get local paths
        local_image_paths = []
        for i, img_url in enumerate(image_urls[:3], 1):  # Limit to 3 images per property
            local_path = download_image(img_url, prop_id, i)
            if local_path:
                local_image_paths.append({
                    "image_url": local_path,
                    "is_primary": i == 1
                })
        
        # Get parish_id and amenities
        parish_id = detect_parish_id(url)
        amenities = extract_amenities(soup)

        return {
            'prop_id': prop_id,
            'title': title.get_text(strip=True) if title else 'Listing',
            'description': description.get_text(strip=True) if description else 'No description.',
            'price': int(re.sub(r'[^\d]', '', price.get_text())) if price else 30000000,
            'property_type_id': 1,
            'bedrooms': int(bedrooms or 0),
            'bathrooms': int(bathrooms or 0),
            'area_sqft': int(area or 0),
            'address': address,
            'city': city,
            'parish_id': parish_id,
            'is_for_sale': True,
            'owner_id': 1,
            'listing_url': url,
            'images': local_image_paths,
            'amenities': amenities
        }
    except Exception as e:
        print(f"❌ Error scraping {url}: {e}")
        return None

def insert_image_to_db(prop_id, image_url, is_primary):
    """Insert an image into the database"""
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO property_images (prop_id, image_url, is_primary) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING",
            (prop_id, image_url, is_primary)
        )
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"  ❌ Error inserting image to database: {e}")
        return False

def insert_listing(cursor, listing):
    cursor.execute("""
        INSERT INTO properties (
            prop_id, title, description, price, property_type_id, bedrooms, bathrooms,
            area_sqft, address, city, parish_id, is_for_sale, owner_id, listing_url
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (prop_id) DO NOTHING;
    """, (
        listing['prop_id'], listing['title'], listing['description'], listing['price'],
        listing['property_type_id'], listing['bedrooms'], listing['bathrooms'],
        listing['area_sqft'], listing['address'], listing['city'],
        listing['parish_id'], listing['is_for_sale'], listing['owner_id'], listing['listing_url']
    ))

    for img in listing['images']:
        cursor.execute(
            "INSERT INTO property_images (prop_id, image_url, is_primary) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING;",
            (listing['prop_id'], img['image_url'], img['is_primary'])
        )

    for amenity_id in listing['amenities']:
        cursor.execute(
            "INSERT INTO property_amenities (prop_id, amen_id) VALUES (%s, %s) ON CONFLICT DO NOTHING;",
            (listing['prop_id'], amenity_id)
        )

def process_properties_without_images():
    """Find properties without images and scrape them"""
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Get all properties with listing URLs but no images
        cursor.execute("""
            SELECT p.prop_id, p.listing_url
            FROM properties p
            LEFT JOIN (
                SELECT prop_id, COUNT(*) as image_count
                FROM property_images
                GROUP BY prop_id
            ) i ON p.prop_id = i.prop_id
            WHERE p.listing_url IS NOT NULL
            AND (i.image_count IS NULL OR i.image_count = 0)
        """)
        
        properties = cursor.fetchall()
        print(f"Found {len(properties)} properties without images")
        
        total_images_added = 0
        
        for prop_id, listing_url in properties:
            print(f"Processing property {prop_id}: {listing_url}")
            images_added = extract_images_from_property_page(listing_url, prop_id)
            total_images_added += images_added
            
            # Add a small delay to avoid rate limiting
            time.sleep(1)
        
        cursor.close()
        conn.close()
        
        print(f"🎉 Added {total_images_added} images to {len(properties)} properties!")
        
    except Exception as e:
        print(f"❌ Database error: {e}")

def run_scraper():
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.autocommit = True
        cursor = conn.cursor()

        for i, url in enumerate(urls, start=6):
            data = extract_listing_data(url, i)
            if data:
                insert_listing(cursor, data)
                print(f"✅ Inserted: {data['title']}")
                print(f"   Images: {len(data['images'])} downloaded")

        cursor.close()
        conn.close()
        print("🎉 All listings inserted into the database!")

    except Exception as e:
        print("❌ Database error:", e)

def add_fallback_image_handler(cursor):
    """Add function to handle missing images"""
    cursor.execute("""
    CREATE OR REPLACE FUNCTION get_property_image(prop_id INTEGER, image_num INTEGER)
    RETURNS TEXT AS $$
    DECLARE
        image_path TEXT;
    BEGIN
        -- Try to get the specific image
        SELECT image_url INTO image_path
        FROM property_images
        WHERE prop_id = $1
        ORDER BY is_primary DESC, id ASC
        OFFSET image_num - 1
        LIMIT 1;
        
        -- Return default if not found
        IF image_path IS NULL THEN
            RETURN '/images/property-default.jpg';
        END IF;
        
        RETURN image_path;
    END;
    $$ LANGUAGE plpgsql;
    """)

def main():
    # First run the scraper to ensure all properties exist
    run_scraper()
    
    # Then process any properties that don't have images
    process_properties_without_images()
    
    # Set up scheduled tasks
    schedule.every().day.at("01:00").do(run_scraper)
    print("⏱️ Scheduler started. Scraper will run daily at 01:00 AM.")
    
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    main()  # Call the main function that handles everything