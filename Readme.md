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
  - Browse the menu with live stock updates.
  - Place orders and track their status.
  - Make secure payments using OTP-based authentication and Razorpay integration.

- **👩‍🍳 Business Owners** (Useful for Business):
  - Effortlessly manage menus and update inventory.
  - Monitor and fulfill orders through a real-time kitchen dashboard.
  - Generate invoices and accept payments via Phonepe.



---

## **🎥 Demo**
| Feature                  | Preview                                                                                  |
|--------------------------|------------------------------------------------------------------------------------------|
| **Customer Portal**      | ![Customer Demo](https://via.placeholder.com/400x200?text=Customer+Portal+Demo)          |
| **Admin Management**     | ![Alt Text](media/admin.gif)            |
| **Kitchen Dashboard**    | ![Kitchen Dashboard](https://via.placeholder.com/400x200?text=Kitchen+Dashboard+Demo)    |

📌 _For a live demo, visit [FreshServe](https://tanujasbatterhouse.vercel.app)._

---

## **⚙️ Installation**
### **🔧 Prerequisites**
1. **Python 3.10+**
2. **Virtual Environment Tool** (e.g., `venv` or `virtualenv`)
3. **Node.js** (for frontend dependencies, if applicable)

### **📥 Steps**
1. Clone the repository:
   ```bash
   git clone https://github.com/hritikvalluvar/FreshServe.git
   cd FreshServe




# FreshServe Catering Management System

The **FreshServe Catering Management System** is a web application designed to simplify the management of a small-scale catering business. It provides a user-friendly interface for customers to place orders and make payments while offering an admin dashboard for efficient business management.

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
- **Payment Integration**: Razorpay and PhonePe

---

## 🛠 **Setup Instructions**
Follow these steps to set up the project locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/username/repository.git
   cd repository
