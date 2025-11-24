# convert_drive_links.py
import re

def convert_google_drive_link(drive_link):
    """
    Convert Google Drive shareable link to direct image URL
    """
    # Pattern to extract file ID from Google Drive URL
    patterns = [
        r'/d/([a-zA-Z0-9_-]+)',  # Standard format
        r'id=([a-zA-Z0-9_-]+)',   # Alternative format
        r'([a-zA-Z0-9_-]{25,})'   # Fallback: look for long ID
    ]
    
    file_id = None
    for pattern in patterns:
        match = re.search(pattern, drive_link)
        if match:
            file_id = match.group(1)
            break
    
    if file_id:
        return f"https://drive.google.com/uc?export=view&id={file_id}"
    else:
        return None

def convert_multiple_links(links_list):
    """
    Convert multiple Google Drive links at once
    """
    converted_links = []
    failed_links = []
    
    for link in links_list:
        converted = convert_google_drive_link(link)
        if converted:
            converted_links.append(converted)
        else:
            failed_links.append(link)
    
    return converted_links, failed_links

def main():
    print("Google Drive Link Converter")
    print("=" * 40)
    
    # Example usage with your link
    example_links = [
        "https://drive.google.com/file/d/18pMwmGDFxcC03z9XR8D48DUjY_yLxr78/view?usp=drive_link",
    ]
    
    print("Converting links...")
    converted_links, failed_links = convert_multiple_links(example_links)
    
    print("\n✅ Converted Links:")
    for i, link in enumerate(converted_links, 1):
        print(f"{i}. {link}")
    
    if failed_links:
        print("\n❌ Failed to convert:")
        for link in failed_links:
            print(f" - {link}")

if __name__ == "__main__":
    main()