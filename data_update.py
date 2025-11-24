import firebase_admin
from firebase_admin import credentials, firestore
import json

# Initialize Firebase
cred = credentials.Certificate("ServiceAccount.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Sample featured products data
featured_products_data = {
    "products": [
        {
            "id": 1,
            "name": "Royal Kundan Bangles Set",
            "category": "Kundan Bangles",
            "price": 1299,
            "rating": 4.8,
            "image": "https://drive.google.com/file/d/18pMwmGDFxcC03z9XR8D48DUjY_yLxr78/view?usp=drive_link",
            "inStock": True,
            "description": "Exquisite royal kundan bangles with intricate gold work and traditional craftsmanship."
        },
        {
            "id": 2,
            "name": "Traditional Glass Bangles",
            "category": "Glass Bangles",
            "price": 299,
            "rating": 4.6,
            "image": "https://drive.google.com/file/d/1eWuHxr7kup1H_t5GmMM6TC6kMLbvyC2K/view?usp=drive_link",
            "inStock": True,
            "description": "Colorful traditional glass bangles perfect for festivals and daily wear."
        },
        {
            "id": 3,
            "name": "Designer Pearl Bangles",
            "category": "Designer",
            "price": 899,
            "rating": 4.9,
            "image": "https://drive.google.com/file/d/1D7sdyYxnENum6u60rWo0Mm4yntN5o4jD/view?usp=drive_link",
            "inStock": True,
            "description": "Elegant designer bangles with pearl accents and modern styling."
        },
        {
            "id": 4,
            "name": "Bridal Gold Bangles",
            "category": "Bridal",
            "price": 2499,
            "rating": 4.7,
            "image": "https://drive.google.com/file/d/18pMwmGDFxcC03z9XR8D48DUjY_yLxr78/view?usp=drive_link",
            "inStock": True,
            "description": "Premium bridal collection with intricate gold work and gemstone details."
        },
        {
            "id": 5,
            "name": "Antique Silver Bangles",
            "category": "Traditional",
            "price": 799,
            "rating": 4.5,
            "image": "https://drive.google.com/file/d/1eWuHxr7kup1H_t5GmMM6TC6kMLbvyC2K/view?usp=drive_link",
            "inStock": True,
            "description": "Antique finish silver bangles with traditional motifs and patterns."
        },
        {
            "id": 6,
            "name": "Modern Minimalist Set",
            "category": "Designer",
            "price": 599,
            "rating": 4.4,
            "image": "https://drive.google.com/file/d/1D7sdyYxnENum6u60rWo0Mm4yntN5o4jD/view?usp=drive_link",
            "inStock": True,
            "description": "Contemporary minimalist bangles for the modern woman."
        },
        {
            "id": 7,
            "name": "Lacquer Work Bangles",
            "category": "Traditional",
            "price": 499,
            "rating": 4.3,
            "image": "https://drive.google.com/file/d/18pMwmGDFxcC03z9XR8D48DUjY_yLxr78/view?usp=drive_link",
            "inStock": True,
            "description": "Beautiful lacquer work bangles with traditional art forms."
        },
        {
            "id": 8,
            "name": "Pearl & Stone Bangles",
            "category": "Designer",
            "price": 1199,
            "rating": 4.7,
            "image": "https://drive.google.com/file/d/1eWuHxr7kup1H_t5GmMM6TC6kMLbvyC2K/view?usp=drive_link",
            "inStock": True,
            "description": "Elegant combination of pearls and semi-precious stones."
        }
    ]
}

def save_featured_products():
    try:
        # Reference to the document
        doc_ref = db.collection("featured_products").document("products")
        
        # Set the data
        doc_ref.set(featured_products_data)
        
        print("✅ Featured products saved successfully!")
        print(f"📦 Total products: {len(featured_products_data['products'])}")
        
        # Print product names for verification
        for product in featured_products_data["products"]:
            print(f"  - {product['name']} (₹{product['price']})")
            
    except Exception as e:
        print(f"❌ Error saving featured products: {e}")

def read_featured_products():
    try:
        # Read the data back to verify
        doc_ref = db.collection("featured_products").document("products")
        doc = doc_ref.get()
        
        if doc.exists:
            data = doc.to_dict()
            print("\n📖 Reading back featured products:")
            print(f"Total products: {len(data['products'])}")
            for product in data["products"]:
                print(f"  - {product['name']} | {product['category']} | ₹{product['price']}")
        else:
            print("❌ No featured products found!")
            
    except Exception as e:
        print(f"❌ Error reading featured products: {e}")

if __name__ == "__main__":
    save_featured_products()
    read_featured_products()