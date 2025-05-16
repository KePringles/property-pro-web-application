# app/scripts/download_property_images.py

import os
import psycopg2
import sys
import requests

# Add the project root to the path so we can import the scraper module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from app.scrapers.realtor_scraper import download_image  # Import your download function

# PostgreSQL database config
DB_NAME = "property_pro_dev"
DB_USER = "postgres"
DB_PASSWORD = "Khayondra@1"
DB_HOST = "localhost"
DB_PORT = "5432"

def download_images_for_existing_properties():
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
        
        # First, let's check the actual column names in the property_images table
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'property_images'
        """)
        columns = [row[0] for row in cursor.fetchall()]
        print(f"Property_images table columns: {columns}")
        
        # Determine the primary key column name
        id_column = 'id'  # Default
        if 'id' not in columns:
            # Try other common primary key names
            if 'image_id' in columns:
                id_column = 'image_id'
            elif 'prop_image_id' in columns:
                id_column = 'prop_image_id'
            else:
                print("⚠️ Could not determine primary key column for property_images table")
                print("Proceeding with prop_id and image_url only")
                id_column = None
        
        # Get all properties with listing_url
        cursor.execute("""
            SELECT prop_id, listing_url 
            FROM properties 
            WHERE listing_url IS NOT NULL
        """)
        properties = cursor.fetchall()
        
        print(f"Found {len(properties)} properties with listing URLs")
        
        for prop_id, listing_url in properties:
            print(f"Processing property {prop_id}: {listing_url}")
            
            # Fetch existing images for this property
            if id_column:
                cursor.execute(f"""
                    SELECT {id_column}, image_url, is_primary 
                    FROM property_images 
                    WHERE prop_id = %s
                """, (prop_id,))
            else:
                cursor.execute("""
                    SELECT image_url, is_primary 
                    FROM property_images 
                    WHERE prop_id = %s
                """, (prop_id,))
            
            existing_images = cursor.fetchall()
            
            if existing_images:
                print(f"  Property has {len(existing_images)} existing images")
                
                # Process each image depending on whether we have an ID column
                if id_column:
                    for img_row in existing_images:
                        img_id, img_url, is_primary = img_row
                        # If image URL is remote, download it
                        if img_url and img_url.startswith(('http://', 'https://')):
                            img_num = 1 if is_primary else 2  # Default to image 2 if not primary
                            local_path = download_image(img_url, prop_id, img_num)
                            
                            if local_path:
                                # Update the database with the local path
                                cursor.execute(f"""
                                    UPDATE property_images 
                                    SET image_url = %s 
                                    WHERE {id_column} = %s
                                """, (local_path, img_id))
                                print(f"  ✅ Updated image {img_id} to {local_path}")
                else:
                    # No ID column, so we'll update based on the URL
                    for i, img_row in enumerate(existing_images):
                        if len(img_row) == 2:
                            img_url, is_primary = img_row
                        else:
                            img_url = img_row[0]
                            is_primary = False
                            
                        # If image URL is remote, download it
                        if img_url and img_url.startswith(('http://', 'https://')):
                            img_num = 1 if is_primary else i + 1
                            local_path = download_image(img_url, prop_id, img_num)
                            
                            if local_path:
                                # Update the database with the local path
                                cursor.execute("""
                                    UPDATE property_images 
                                    SET image_url = %s 
                                    WHERE prop_id = %s AND image_url = %s
                                """, (local_path, prop_id, img_url))
                                print(f"  ✅ Updated image to {local_path}")
            else:
                print(f"  No existing images for property {prop_id}")
                
                # For properties with no images, you could implement a simplified image extraction here
                
        cursor.close()
        conn.close()
        print("🎉 Property image download completed!")
        
    except Exception as e:
        print("❌ Database error:", e)

if __name__ == "__main__":
    download_images_for_existing_properties()