import os
import re
from io import BytesIO
from flask import send_file, current_app, abort
from PIL import Image, ImageDraw, ImageFont

def generate_placeholder_image(filename, width=800, height=600):
    """Generate a placeholder image for missing images"""
    # Create a new image with light gray background
    image = Image.new('RGB', (width, height), color=(240, 240, 240))
    draw = ImageDraw.Draw(image)
    
    # Add a border
    draw.rectangle([(0, 0), (width-1, height-1)], outline=(200, 200, 200), width=2)
    
    # Try to use a system font, or use default if not found
    try:
        font = ImageFont.truetype("Arial", 24)
        small_font = ImageFont.truetype("Arial", 18)
    except IOError:
        font = ImageFont.load_default()
        small_font = font
    
    # Draw text with the filename
    draw.text((width//2, height//2-30), "Image not found", 
              fill=(100, 100, 100), font=font, anchor="mm")
    draw.text((width//2, height//2+30), filename, 
              fill=(100, 100, 100), font=small_font, anchor="mm")
    
    # Save to BytesIO
    img_io = BytesIO()
    image.save(img_io, 'JPEG', quality=70)
    img_io.seek(0)
    
    return img_io

def generate_property_image(property_id, image_num=1):
    """Generate a placeholder for a property image"""
    width, height = 800, 600
    image = Image.new('RGB', (width, height), color=(240, 248, 255))  # Light blue background
    draw = ImageDraw.Draw(image)
    
    # Add a border
    draw.rectangle([(0, 0), (width-1, height-1)], outline=(70, 130, 180), width=3)
    
    # Try to use a system font, or use default if not found
    try:
        large_font = ImageFont.truetype("Arial", 36)
        medium_font = ImageFont.truetype("Arial", 24)
        small_font = ImageFont.truetype("Arial", 18)
    except IOError:
        large_font = ImageFont.load_default()
        medium_font = large_font
        small_font = large_font
    
    # Draw text
    draw.text((width//2, height//3), f"Property {property_id}", 
              fill=(25, 25, 112), font=large_font, anchor="mm")
    
    if image_num:
        draw.text((width//2, height//2), f"Image {image_num}", 
                fill=(25, 25, 112), font=medium_font, anchor="mm")
    
    draw.text((width//2, 2*height//3), "Placeholder Image", 
              fill=(25, 25, 112), font=small_font, anchor="mm")
    
    # Save to BytesIO
    img_io = BytesIO()
    image.save(img_io, 'JPEG', quality=70)
    img_io.seek(0)
    
    return img_io

def generate_placeholder_css():
    """Generate a basic CSS file for style.css"""
    css = """
    /* Placeholder CSS */
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
    
    img {
        max-width: 100%;
        height: auto;
    }
    """
    return css

def generate_placeholder_js():
    """Generate a basic JavaScript file"""
    js = """
    // Placeholder JavaScript
    console.log('Script loaded successfully');
    
    // Basic functionality
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM fully loaded');
    });
    """
    return js

def serve_static_with_fallback(folder_type, filename):
    """Serve static file with appropriate fallback if missing"""
    # Check if file exists
    file_path = os.path.join(current_app.static_folder, folder_type, filename)
    
    if os.path.exists(file_path):
        return current_app.send_static_file(f'{folder_type}/{filename}')
    
    # Generate appropriate fallback based on file type
    if folder_type == 'images':
        # Special handling for property images with format property-X-Y.jpg
        property_match = re.match(r'property-(\d+)-(\d+)\.jpg', filename)
        if property_match:
            property_id = int(property_match.group(1))
            image_num = int(property_match.group(2))
            return send_file(generate_property_image(property_id, image_num), mimetype='image/jpeg')
        
        # Special handling for property images with format property-X.jpg (older format)
        property_simple_match = re.match(r'property-(\d+)\.jpg', filename)
        if property_simple_match:
            property_id = int(property_simple_match.group(1))
            return send_file(generate_property_image(property_id), mimetype='image/jpeg')
        
        # For hero banners and other images
        if 'hero' in filename or 'banner' in filename:
            width, height = 1200, 400
        else:
            width, height = 800, 600
            
        return send_file(generate_placeholder_image(filename, width, height), mimetype='image/jpeg')
    
    elif folder_type == 'styles':
        css_content = generate_placeholder_css()
        return css_content, 200, {'Content-Type': 'text/css'}
    
    elif folder_type == 'js':
        js_content = generate_placeholder_js()
        return js_content, 200, {'Content-Type': 'application/javascript'}
    
    # Default: 404 for unhandled file types
    return abort(404)