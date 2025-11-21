import streamlit as st
import requests
from supabase import create_client, Client
from datetime import datetime
import pandas as pd

# ==============================================
# STEP 1: CONFIGURE YOUR SUPABASE CREDENTIALS
# ==============================================
# Replace these with your actual Supabase credentials
SUPABASE_URL = "https://xsqmivfbwrbinzjxairi.supabase.co"
SUPABASE_KEY = "sb_publishable_TBUOKH8aWO4d9apKsrGsiA_TmQGqv2E"
# Initialize Supabase client
@st.cache_resource
def init_supabase():
    return create_client(SUPABASE_URL, SUPABASE_KEY)

supabase: Client = init_supabase()

# Platzi Fake Store API base URL
PLATZI_API_URL = "https://api.escuelajs.co/api/v1"

# ==============================================
# FUNCTIONS FOR PLATZI API
# ==============================================

def get_all_products():
    """Fetch all products from Platzi API"""
    response = requests.get(f"{PLATZI_API_URL}/products")
    if response.status_code == 200:
        return response.json()
    return []

def get_product_by_id(product_id):
    """Fetch a specific product by ID"""
    response = requests.get(f"{PLATZI_API_URL}/products/{product_id}")
    if response.status_code == 200:
        return response.json()
    return None

def get_categories():
    """Fetch all categories"""
    response = requests.get(f"{PLATZI_API_URL}/categories")
    if response.status_code == 200:
        return response.json()
    return []

# ==============================================
# FUNCTIONS FOR SUPABASE
# ==============================================

def save_favorite_to_supabase(product_data):
    """Save a favorite product to Supabase"""
    try:
        data = {
            "product_id": product_data["id"],
            "title": product_data["title"],
            "price": product_data["price"],
            "description": product_data["description"],
            "image_url": product_data["images"][0] if product_data.get("images") else None,
            "created_at": datetime.now().isoformat()
        }
        result = supabase.table("favorites").insert(data).execute()
        return True, "Product saved to favorites!"
    except Exception as e:
        return False, f"Error: {str(e)}"

def get_favorites_from_supabase():
    """Retrieve all favorites from Supabase"""
    try:
        result = supabase.table("favorites").select("*").execute()
        return result.data
    except Exception as e:
        st.error(f"Error fetching favorites: {str(e)}")
        return []

def delete_favorite_from_supabase(favorite_id):
    """Delete a favorite from Supabase"""
    try:
        supabase.table("favorites").delete().eq("id", favorite_id).execute()
        return True
    except Exception as e:
        st.error(f"Error deleting favorite: {str(e)}")
        return False

# ==============================================
# STREAMLIT APP UI
# ==============================================

st.set_page_config(page_title="Platzi Store", page_icon="🛍️", layout="wide")

st.title("🛍️ Platzi Fake Store with Supabase")
st.markdown("Browse products and save your favorites to Supabase!")

# Sidebar navigation
page = st.sidebar.selectbox("Navigation", ["Browse Products", "My Favorites", "Setup Instructions"])

# ==============================================
# PAGE: SETUP INSTRUCTIONS
# ==============================================

if page == "Setup Instructions":
    st.header("📋 Setup Instructions")
    
    st.markdown("""
    ### Step 1: Create a Supabase Account
    1. Go to [supabase.com](https://supabase.com)
    2. Sign up for a free account
    3. Create a new project
    
    ### Step 2: Create the Favorites Table
    1. In your Supabase dashboard, go to **Table Editor**
    2. Click **New Table**
    3. Name it `favorites`
    4. Add the following columns:
       - `id` (int8, primary key, auto-increment)
       - `product_id` (int8)
       - `title` (text)
       - `price` (float8)
       - `description` (text)
       - `image_url` (text)
       - `created_at` (timestamp)
    5. Click **Save**
    
    ### Step 3: Get Your Credentials
    1. Go to **Settings** → **API**
    2. Copy your **Project URL** (e.g., `https://xxxxx.supabase.co`)
    3. Copy your **anon/public key**
    
    ### Step 4: Add Credentials to Code
    1. Open the Python file
    2. Find lines 11-12 (SUPABASE_URL and SUPABASE_KEY)
    3. Replace with your actual credentials
    
    ### Step 5: Install Dependencies
    ```bash
    pip install streamlit requests supabase pandas
    ```
    
    ### Step 6: Run the App
    ```bash
    streamlit run app.py
    ```
    """)
    
    st.info("💡 The Platzi API requires no authentication and is ready to use!")

# ==============================================
# PAGE: BROWSE PRODUCTS
# ==============================================

elif page == "Browse Products":
    st.header("🛒 Browse Products")
    
    # Fetch categories
    categories = get_categories()
    category_names = ["All"] + [cat["name"] for cat in categories]
    selected_category = st.selectbox("Filter by Category", category_names)
    
    # Fetch products
    with st.spinner("Loading products..."):
        products = get_all_products()
    
    if products:
        # Filter by category if selected
        if selected_category != "All":
            products = [p for p in products if p.get("category", {}).get("name") == selected_category]
        
        st.write(f"Showing {len(products)} products")
        
        # Display products in a grid
        cols = st.columns(3)
        for idx, product in enumerate(products[:30]):  # Limit to 30 products for performance
            with cols[idx % 3]:
                st.image(product["images"][0] if product.get("images") else "https://via.placeholder.com/200", 
                        use_container_width=True)
                st.subheader(product["title"][:50])
                st.write(f"**Price:** ${product['price']}")
                st.write(f"*{product['description'][:100]}...*")
                
                if st.button(f"❤️ Save to Favorites", key=f"save_{product['id']}"):
                    success, message = save_favorite_to_supabase(product)
                    if success:
                        st.success(message)
                    else:
                        st.error(message)
                
                st.divider()
    else:
        st.warning("No products found")

# ==============================================
# PAGE: MY FAVORITES
# ==============================================

elif page == "My Favorites":
    st.header("❤️ My Favorite Products")
    
    favorites = get_favorites_from_supabase()
    
    if favorites:
        st.write(f"You have {len(favorites)} favorite products")
        
        # Display as a dataframe
        if st.checkbox("Show as table"):
            df = pd.DataFrame(favorites)
            st.dataframe(df[["title", "price", "created_at"]], use_container_width=True)
        
        # Display as cards
        for fav in favorites:
            col1, col2, col3 = st.columns([1, 3, 1])
            
            with col1:
                st.image(fav.get("image_url", "https://via.placeholder.com/100"), width=100)
            
            with col2:
                st.subheader(fav["title"])
                st.write(f"**Price:** ${fav['price']}")
                st.write(fav["description"][:150])
                st.caption(f"Added: {fav['created_at']}")
            
            with col3:
                if st.button("🗑️ Remove", key=f"delete_{fav['id']}"):
                    if delete_favorite_from_supabase(fav["id"]):
                        st.success("Removed!")
                        st.rerun()
            
            st.divider()
    else:
        st.info("No favorites yet. Go to 'Browse Products' to add some!")

# Footer
st.sidebar.markdown("---")
st.sidebar.markdown("Built with Streamlit + Platzi API + Supabase")
