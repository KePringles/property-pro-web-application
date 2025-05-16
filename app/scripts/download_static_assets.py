#!/usr/bin/env python3
"""
Static Asset Downloader

This script downloads missing static assets referenced in the 404 logs.
"""

import os
import requests
from PIL import Image, ImageDraw, ImageFont
import shutil

# Base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, 'static')

# Create directories if they don't exist
for folder in ['images', 'styles', 'js']:
    os.makedirs(os.path.join(STATIC_DIR, folder), exist_ok=True)

# List of static files to create
STATIC_FILES = [
    # Images
    {'type': 'image', 'path': 'images/hero-banner.jpg', 'width': 1200, 'height': 400},
    {'type': 'image', 'path': 'images/feature-banner-1.jpg', 'width': 800, 'height': 400},
    {'type': 'image', 'path': 'images/property-1.jpg', 'width': 800, 'height': 600},
    {'type': 'image', 'path': 'images/property-2.jpg', 'width': 800, 'height': 600},
    {'type': 'image', 'path': 'images/property-3.jpg', 'width': 800, 'height': 600},
    
    # CSS & JS files
    {'type': 'css', 'path': 'styles/style.css'},
    {'type': 'js', 'path': 'js/script.js'},
]

def create_placeholder_image(filename, width, height, text=None):
    """Create a placeholder image with the given dimensions"""
    if text is None:
        text = os.path.basename(filename)
    
    # Create image
    image = Image.new('RGB', (width, height), color=(240, 240, 240))
    draw = ImageDraw.Draw(image)
    
    # Add border
    draw.rectangle([(0, 0), (width-1, height-1)], outline=(200, 200, 200), width=2)
    
    # Add text
    try:
        font = ImageFont.truetype("Arial", 24)
    except:
        font = ImageFont.load_default()
    
    # Check if it's a property image
    if 'property' in filename:
        property_id = os.path.basename(filename).split('.')[0].split('-')[1]
        draw.text((width//2, height//2), f"Property {property_id}", 
                  fill=(100, 100, 100), font=font, anchor="mm")
    elif 'hero' in filename or 'banner' in filename:
        draw.text((width//2, height//2), "Banner Image", 
                  fill=(100, 100, 100), font=font, anchor="mm")
    else:
        draw.text((width//2, height//2), text, 
                  fill=(100, 100, 100), font=font, anchor="mm")
    
    return image

def create_css_file(filename):
    """Create a basic CSS file"""
    css = """
    /* Basic styles */
    body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        color: #333;
    }
    
    .container {
        width: 90%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 15px;
    }
    
    header {
        background-color: #333;
        color: #fff;
        padding: 1rem 0;
    }
    
    nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .hero {
        height: 500px;
        background-position: center;
        background-size: cover;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: #fff;
    }
    
    .property-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin: 2rem 0;
    }
    
    .property-card {
        border: 1px solid #ddd;
        border-radius: 5px;
        overflow: hidden;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .property-card img {
        width: 100%;
        height: 200px;
        object-fit: cover;
    }
    
    .property-info {
        padding: 15px;
    }
    
    footer {
        background-color: #333;
        color: #fff;
        padding: 2rem 0;
        margin-top: 2rem;
    }
    """
    
    with open(filename, 'w') as f:
        f.write(css)

def create_js_file(filename):
    """Create a basic JavaScript file"""
    js = """
    // Basic JavaScript functionality
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM fully loaded');
        
        // Add event listeners to property cards if they exist
        const propertyCards = document.querySelectorAll('.property-card');
        if (propertyCards.length > 0) {
            propertyCards.forEach(card => {
                card.addEventListener('click', function() {
                    const propertyId = this.dataset.propertyId;
                    if (propertyId) {
                        window.location.href = `/properties/${propertyId}`;
                    }
                });
            });
        }
        
        // Handle search form if it exists
        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const searchTerm = document.getElementById('search-input').value;
                window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
            });
        }
    });
    """
    
    with open(filename, 'w') as f:
        f.write(js)

def main():
    """Main function to create all static assets"""
    for file_info in STATIC_FILES:
        file_path = os.path.join(STATIC_DIR, file_info['path'])
        file_dir = os.path.dirname(file_path)
        
        # Ensure directory exists
        os.makedirs(file_dir, exist_ok=True)
        
        print(f"Creating {file_info['path']}...")
        
        if file_info['type'] == 'image':
            image = create_placeholder_image(
                file_info['path'], 
                file_info['width'], 
                file_info['height']
            )
            image.save(file_path, quality=90)
            
        elif file_info['type'] == 'css':
            create_css_file(file_path)
            
        elif file_info['type'] == 'js':
            create_js_file(file_path)
    
    print("✅ All static assets created successfully!")

if __name__ == "__main__":
    main()