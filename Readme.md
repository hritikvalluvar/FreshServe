# **📔 FreshServe**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/hritikvalluvar/FreshServe)
[![Python](https://img.shields.io/badge/Built%20with-Python%203.10%2B-blue?logo=python)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Framework-Django%205.1.3-green?logo=django)](https://www.djangoproject.com/)
[![Vercel](https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel)](https://vercel.com/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-blue?logo=supabase)](https://supabase.com/)

---

## **📖 About FreshServe**
**FreshServe** is a dynamic web application built using Django, designed to simplify managing orders, inventory, and payments for a catering business. It provides seamless solutions for both business owners and customers, ensuring streamlined operations and a user-friendly experience.

---

## **🌟 Key Use Cases**
- **👥 Customers** (Easy for Customers):
  - Browse the menu, select products, and place orders with seamless online payments.
  - Check shop status and view available products before ordering.
  - Contact the business for inquiries or feedback and access policies for transparency.

- **👩‍🍳 Business Owners** (Useful for Business):
  - Manage shop status, item availability, and order processing in real time.
  - View summarized product quantities for efficient preparation in the kitchen.
  - Streamline packaging with order-specific views and bulk receipt printing.



---

## **🎥 Demo**

📌 _For a live demo, visit [FreshServe](https://tanujasbatterhouse.vercel.app)._

| Feature                  | Preview                                                                                  |
|--------------------------|------------------------------------------------------------------------------------------|
| **Customer Portal**      | ![Customer Demo](media/customer.gif)          |
| **Admin Dashboard**     | ![Admin Demo](media/admin.gif)            |



---

## 🌟 **Customer Features**

### 🏠 **Landing Page**
- **Announcements**: Displays whether the shop is currently taking orders or not, ensuring customers are informed in real-time.
- **Navigation Bar**:
  - Access the **Menu** to browse products.
  - Explore **Policies** for terms, privacy, refunds, and shipping.
- **Place Order Button**: Quickly navigate to the order placement page.

---

### 🍴 **Menu**
- Displays all products offered by the business:
  - Includes product names, descriptions, prices, and quantities.
  - Visually appealing layout for easy browsing.
- **Place Order Button**: Redirects users to the order page to start placing their orders.

---

### 📦 **Orders Page**
- Lists all available products with:
  - **Increment/Decrement Buttons**: Adjust quantities for each item, with custom increment sizes based on product type.
- Collects essential customer information:
  - **Name**, **House Number**, **Area**, and **Phone Number**.
- **Payment Integration**:
  - After order placement, redirects to the **PhonePe** payment page.
  - Confirms successful transactions on the **Payment Success Page**.

---

### 📝 **About Us**
- A dedicated section sharing the story behind the business, its mission, and its values.

---

### 📞 **Contact Us**
- Provides business contact details for inquiries or support.

---

### 📑 **Policies**
- Comprehensive policy pages for transparency:
  - **Terms and Conditions**
  - **Privacy Policy**
  - **Refund Policy**
  - **Shipping Policy**

---

## 🔑 **Admin Features**

### 📊 **Admin Dashboard**
- A centralized management panel to oversee the business.

#### **Key Sections**:
1. **Shop Management**:
   - Open or close the shop based on operational requirements.
2. **View Orders**:
   - Monitor all incoming orders and their statuses.
3. **Kitchen View**:
   - Manage orders in preparation and track ingredient requirements.
4. **Sorting Bay**:
   - Organize items for packaging.
5. **Packaging Bay**:
   - Finalize and package customer orders efficiently.

#### **Database Editing Capabilities**:
Admins can edit critical business parameters, including:
- **Shop Status**: Open or close the shop.
- **Gate Status**: Manage gate availability for order pickups.
- **Order Availability**: Enable or disable products for ordering.
- **Order Items**: Modify items in customer orders.
- **Orders**: Update order details.
- **Products**: Add, edit, or remove products from the menu.

---

## 🚀 **Technologies Used**
- **Backend**: Django
- **Frontend**: HTML, CSS, Bootstrap
- **Database**: Supabase
- **Deployment**: Vercel
- **Payment Integration**: PhonePe

---

## 🛠 **Setup Instructions**
Follow these steps to set up the project locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/hritikvalluvar/FreshServe.git
   cd FreshServe
   ```

2. **Create Virtual Environment**:
    ```bash
    virtualenv venv  
    source venv/bin/activate  
    ```

3. **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4. **Configure Environment Variables**:
    Create a `.env` file in the project root and include the following:
    ```bash
    SECRET_KEY=your_secret_key 
    DATABASE_USER=your_supabase_database_user
    DATABASE_PASSWORD=your_supabase_database_password
    PHONEPE_MERCHANT_ID=your_phonepe_merchant_id
    PHONEPE_SECRET_KEY=your_phonepe_secret_key
    ```

5. **Run Migrations**
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

6. **Start Development Server**:
    ```bash
    python manage.py runserver
    ```
