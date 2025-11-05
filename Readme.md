 Project Structure

ecommerce-app/
├── backend/
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── imageController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   └── userController.js
│   ├── services/
│   │   ├── productService.js
│   │   ├── imageService.js
│   │   ├── cartService.js
│   │   ├── orderService.js
│   │   └── userService.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── routes/
│   │   ├── productRoutes.js
│   │   ├── imageRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   └── userRoutes.js
│   ├── models/
│   │   ├── database.js
│   │   ├── Product.js
│   │   ├── Image.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   └── User.js
│   ├── utils/
│   │   ├── helpers.js
│   │   ├── constants.js
│   │   └── emailService.js
│   ├── config/
│   │   └── database.js
│   └── server.js
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── uploads/
│   ├── admin-register.html
│   ├── product-upload.html
│   ├── cart.html
│   ├── checkout.html
│   ├── orders.html
│   ├── order-details.html
│   └── user-profile.html
└── package.json


Setup Instructions

1. Install dependencies:
  
   npm install
   
2. Set up MySQL database:

   mysql -u root -p
   CREATE DATABASE ecommerce_db;

3. Configure environment variables in .env file


4. Create uploads directory:
 
   mkdir backend/uploads
   
   
5. Start the server:
 
 
   npm start


The application will be available at http://localhost:3000