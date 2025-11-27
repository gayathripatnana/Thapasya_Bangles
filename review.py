import firebase_admin
from firebase_admin import credentials, firestore
import json
import random
from datetime import datetime, timedelta

# Initialize Firebase Admin SDK
def initialize_firebase(service_account_path):
    try:
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
        print("✅ Firebase initialized successfully")
        return firestore.client()
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
        return None

# Sample review data
def generate_sample_reviews():
    customers = [
        {
            "name": "Priya Sharma",
            "image": "https://images.unsplash.com/photo-1494790108755-2616b612b672?w=60&h=60&fit=crop&crop=face",
            "location": "Mumbai"
        },
        {
            "name": "Anita Patel", 
            "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
            "location": "Delhi"
        },
        {
            "name": "Meera Gupta",
            "image": "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=60&h=60&fit=crop&crop=face", 
            "location": "Bangalore"
        },
        {
            "name": "Sneha Reddy",
            "image": "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=60&h=60&fit=crop&crop=face",
            "location": "Hyderabad"
        },
        {
            "name": "Riya Singh",
            "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=face",
            "location": "Kolkata"
        },
        {
            "name": "Divya Kumar",
            "image": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop&crop=face",
            "location": "Chennai"
        },
        {
            "name": "Pooja Mehta",
            "image": "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=60&h=60&fit=crop&crop=face",
            "location": "Ahmedabad"
        },
        {
            "name": "Neha Joshi",
            "image": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop&crop=face",
            "location": "Pune"
        }
    ]

    review_texts = [
        "Absolutely love these bangles! The quality is exceptional and they look even better in person.",
        "Perfect for my wedding! Got so many compliments. The craftsmanship is outstanding.",
        "Beautiful traditional designs with a modern touch. Exactly what I was looking for.",
        "The packaging was so elegant and the bangles arrived safely. Great customer service!",
        "These bangles are stunning! The colors are vibrant and they fit perfectly.",
        "High-quality materials and excellent finish. Worth every penny!",
        "Fast delivery and beautiful products. Will definitely order again for festivals.",
        "The attention to detail is remarkable. Each bangle is a piece of art!",
        "Comfortable to wear all day and the design is timeless. Highly recommended!",
        "Excellent value for money. The bangles look much more expensive than they are.",
        "Perfect gift for my sister. She loved them! The sizing was accurate.",
        "Great collection for traditional occasions. The gold plating is very durable.",
        "Lightweight yet sturdy. Perfect for daily wear as well as special occasions.",
        "The customer support team was very helpful in helping me choose the right size.",
        "Beautiful craftsmanship! These bangles have become my favorite accessory.",
        "Quick delivery and secure packaging. The bangles exceeded my expectations.",
        "Authentic traditional designs with excellent finishing. Very happy with my purchase!",
        "The bangles are even more beautiful in person. Photos don't do them justice!",
        "Perfect for bridal wear. The intricate designs are absolutely gorgeous.",
        "Great quality and beautiful designs. Will be purchasing more for my collection."
    ]

    return customers, review_texts

# Add reviews to a specific product
def add_reviews_to_product(db, product_id, reviews_data):
    try:
        # Create or update the reviews document for this product
        reviews_ref = db.collection('reviews').document(product_id)
        
        # Get existing reviews if any
        existing_doc = reviews_ref.get()
        existing_reviews = []
        
        if existing_doc.exists:
            existing_data = existing_doc.to_dict()
            existing_reviews = existing_data.get('reviews', [])
        
        # Add new reviews to existing ones
        all_reviews = existing_reviews + reviews_data
        
        # Update the document
        reviews_ref.set({
            'reviews': all_reviews,
            'lastUpdated': firestore.SERVER_TIMESTAMP,
            'totalReviews': len(all_reviews),
            'averageRating': sum(review['rating'] for review in all_reviews) / len(all_reviews)
        })
        
        print(f"✅ Added {len(reviews_data)} reviews to product {product_id}")
        print(f"📊 Total reviews: {len(all_reviews)}, Average rating: {sum(review['rating'] for review in all_reviews) / len(all_reviews):.1f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error adding reviews to product {product_id}: {e}")
        return False

# Generate random reviews for products
def generate_reviews_for_products(db, product_ids, reviews_per_product=3):
    customers, review_texts = generate_sample_reviews()
    
    for product_id in product_ids:
        print(f"\n🎯 Generating reviews for product: {product_id}")
        
        product_reviews = []
        used_customers = random.sample(customers, min(reviews_per_product, len(customers)))
        
        for i, customer in enumerate(used_customers):
            # Generate random date within last 6 months
            random_days = random.randint(1, 180)
            review_date = datetime.now() - timedelta(days=random_days)
            
            review = {
                'customerName': customer['name'],
                'customerImage': customer['image'],
                'customerLocation': customer['location'],
                'reviewText': random.choice(review_texts),
                'rating': random.randint(4, 5),  # Mostly 4-5 star ratings
                'reviewDate': review_date,
                'verifiedPurchase': random.choice([True, True, True, False]),  # Mostly verified
                'helpfulVotes': random.randint(0, 15)
            }
            
            product_reviews.append(review)
            print(f"   👤 {customer['name']} - {review['rating']}⭐ - {review['reviewText'][:50]}...")
        
        # Add reviews to Firestore
        add_reviews_to_product(db, product_id, product_reviews)

# Get all product IDs from the products collection
def get_all_product_ids(db):
    try:
        products_ref = db.collection('products')
        docs = products_ref.stream()
        
        product_ids = []
        for doc in docs:
            product_ids.append(doc.id)
        
        print(f"📦 Found {len(product_ids)} products in database")
        return product_ids
        
    except Exception as e:
        print(f"❌ Error fetching product IDs: {e}")
        return []

# Add specific review to a product
def add_specific_review(db, product_id, customer_name, review_text, rating=5, customer_image=None, location="India"):
    if customer_image is None:
        customer_image = "https://images.unsplash.com/photo-1494790108755-2616b612b672?w=60&h=60&fit=crop&crop=face"
    
    review = {
        'customerName': customer_name,
        'customerImage': customer_image,
        'customerLocation': location,
        'reviewText': review_text,
        'rating': rating,
        'reviewDate': datetime.now(),
        'verifiedPurchase': True,
        'helpfulVotes': 0
    }
    
    return add_reviews_to_product(db, product_id, [review])

# Main function
def main():
    # Path to your service account key JSON file
    SERVICE_ACCOUNT_PATH = "ServiceAccount.json"
    
    # Initialize Firebase
    db = initialize_firebase(SERVICE_ACCOUNT_PATH)
    if not db:
        return
    
    print("\n" + "="*50)
    print("🎯 FIREBASE REVIEWS MANAGER")
    print("="*50)
    
    while True:
        print("\nOptions:")
        print("1. Add sample reviews to all products")
        print("2. Add sample reviews to specific products")
        print("3. Add custom review to specific product")
        print("4. View existing reviews for a product")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ").strip()
        
        if choice == '1':
            # Add reviews to all products
            product_ids = get_all_product_ids(db)
            if product_ids:
                reviews_per_product = int(input("Enter number of reviews per product (default 3): ") or "3")
                generate_reviews_for_products(db, product_ids, reviews_per_product)
            else:
                print("❌ No products found in database")
        
        elif choice == '2':
            # Add reviews to specific products
            product_ids_input = input("Enter product IDs (comma-separated): ").strip()
            if product_ids_input:
                product_ids = [pid.strip() for pid in product_ids_input.split(',')]
                reviews_per_product = int(input("Enter number of reviews per product (default 3): ") or "3")
                generate_reviews_for_products(db, product_ids, reviews_per_product)
            else:
                print("❌ No product IDs provided")
        
        elif choice == '3':
            # Add custom review
            product_id = input("Enter product ID: ").strip()
            customer_name = input("Enter customer name: ").strip()
            review_text = input("Enter review text: ").strip()
            rating = int(input("Enter rating (1-5, default 5): ") or "5")
            location = input("Enter location (default India): ").strip() or "India"
            
            if product_id and customer_name and review_text:
                success = add_specific_review(db, product_id, customer_name, review_text, rating, location=location)
                if success:
                    print("✅ Custom review added successfully!")
            else:
                print("❌ Please provide all required fields")
        
        elif choice == '4':
            # View reviews for a product
            product_id = input("Enter product ID: ").strip()
            if product_id:
                try:
                    reviews_ref = db.collection('reviews').document(product_id)
                    doc = reviews_ref.get()
                    
                    if doc.exists:
                        data = doc.to_dict()
                        reviews = data.get('reviews', [])
                        
                        print(f"\n📊 Reviews for product {product_id}:")
                        print(f"Total Reviews: {len(reviews)}")
                        print(f"Average Rating: {data.get('averageRating', 0):.1f}⭐")
                        print("-" * 50)
                        
                        for i, review in enumerate(reviews, 1):
                            print(f"{i}. {review['customerName']} ({review['customerLocation']})")
                            print(f"   Rating: {review['rating']}⭐")
                            print(f"   Review: {review['reviewText']}")
                            print(f"   Date: {review['reviewDate'].strftime('%Y-%m-%d') if hasattr(review['reviewDate'], 'strftime') else review['reviewDate']}")
                            print(f"   Verified: {'✅' if review.get('verifiedPurchase') else '❌'}")
                            print()
                    else:
                        print("❌ No reviews found for this product")
                        
                except Exception as e:
                    print(f"❌ Error fetching reviews: {e}")
        
        elif choice == '5':
            print("👋 Exiting...")
            break
        
        else:
            print("❌ Invalid choice. Please try again.")

# Alternative: Simple one-time execution
def quick_setup():
    """
    Quick setup to add reviews to all products
    """
    SERVICE_ACCOUNT_PATH = "path/to/your/serviceAccountKey.json"
    
    db = initialize_firebase(SERVICE_ACCOUNT_PATH)
    if not db:
        return
    
    print("🚀 Starting quick reviews setup...")
    
    # Get all product IDs
    product_ids = get_all_product_ids(db)
    
    if product_ids:
        # Add 3 reviews for each product
        generate_reviews_for_products(db, product_ids, reviews_per_product=3)
        print("✅ Quick setup completed!")
    else:
        print("❌ No products found to add reviews")

if __name__ == "__main__":
    # Run the interactive menu
    main()
    
    # Or run quick setup directly:
    # quick_setup()