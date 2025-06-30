# Store & Billing System - React Frontend

A modern, responsive React frontend for the Store and Billing management system. Built with the latest UI/UX design principles using Tailwind CSS and Headless UI components.

## 🚀 Features

### ✨ Modern UI/UX Design
- **Tailwind CSS** for utility-first styling
- **Headless UI** for accessible, unstyled components
- **Heroicons** for beautiful SVG icons
- Responsive design that works on all devices
- Dark mode support (coming soon)

### 🏪 Store Management
- **Customer Management**: Create, update, view, and search customers
- **Product Inventory**: Manage products with stock tracking and pricing
- **Transaction Processing**: Complete sales workflow with payment processing
- **Real-time Search**: Dynamic search across all entities
- **Status Tracking**: Visual status indicators for transactions and inventory

### 🎨 UI Components
- **Reusable Components**: Modal, Loading Spinner, Status Badges, Empty States
- **Form Validation**: React Hook Form with comprehensive validation
- **Toast Notifications**: User-friendly success/error messages
- **Confirmation Dialogs**: Safe deletion and action confirmations
- **Data Tables**: Sortable, searchable data presentation

## 📦 Tech Stack

- **React 18** - Latest React with hooks and concurrent features
- **React Router v6** - Modern routing solution
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Unstyled, accessible UI components
- **React Hook Form** - Performant forms with easy validation
- **Axios** - HTTP client for API communication
- **React Toastify** - Toast notifications

## 🛠️ Installation

1. **Navigate to the UI directory:**
   ```bash
   cd ui
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Tailwind CSS dependencies:**
   ```bash
   npm install -D @tailwindcss/forms
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the `ui` directory:

```env
REACT_APP_API_URL=http://localhost:8080
```

### API Integration
The frontend is configured to work with your Spring Boot backend:
- Base URL: `http://localhost:8080`
- Proxy configuration in `package.json` for development
- Axios interceptors for error handling and authentication

## 📱 Pages & Features

### 🏠 Dashboard
- Overview of key metrics
- Quick action buttons
- Recent transactions
- Low stock alerts

### 👥 Customer Management
- **Customer List**: Searchable table with pagination
- **Customer Form**: Create/edit with validation
- **Customer Detail**: Complete customer profile
- **Search**: Dynamic search by name, email, phone

### 📦 Product Management
- **Product Catalog**: Grid/list view with filters
- **Product Form**: Comprehensive product creation
- **Inventory Tracking**: Stock levels and alerts
- **Pricing Management**: Cost, sale price, and MRP

### 💰 Transaction Management
- **Transaction List**: Complete transaction history
- **Transaction Creation**: Multi-product sales workflow
- **Payment Processing**: Partial and full payment support
- **Return Processing**: Handle product returns

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones for main actions
- **Success**: Green for positive actions
- **Warning**: Yellow for alerts
- **Danger**: Red for destructive actions
- **Gray**: Neutral tones for text and backgrounds

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: Responsive typography scale
- **Weights**: 300, 400, 500, 600, 700

### Components
- **Cards**: Clean containers with shadows
- **Buttons**: Multiple variants with loading states
- **Forms**: Consistent styling with validation
- **Tables**: Responsive data presentation
- **Modals**: Accessible overlays

## 🔄 API Integration

### Customer API
- `GET /customer/{id}` - Get customer by ID
- `POST /customer/create` - Create new customer
- `PUT /customer/update/{id}` - Update customer
- `PUT /customer/delete/{id}` - Delete customer
- `GET /customer/search` - Search customers

### Product API
- `GET /product/{id}` - Get product by ID
- `POST /product/create` - Create new product
- `PUT /product/update/{id}` - Update product
- `PUT /product/delete/{id}` - Delete product
- `GET /product/search` - Search products

### Transaction API
- `GET /transaction/{id}` - Get transaction by ID
- `POST /transaction/create` - Create new transaction
- `PUT /transaction/update/{id}` - Update transaction
- `PUT /transaction/pay/{id}` - Process payment
- `PUT /transaction/return` - Process return

## 🚀 Build & Deploy

### Development Build
```bash
npm run build
```

### Production Deployment
1. Build the application:
   ```bash
   npm run build
   ```

2. Serve the `build` folder using any static file server
3. Configure your web server to serve `index.html` for all routes (SPA routing)

## 📝 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🎯 Future Enhancements

- [ ] Dark mode support
- [ ] Advanced filtering and sorting
- [ ] Export functionality (PDF, Excel)
- [ ] Real-time notifications
- [ ] Offline support with PWA
- [ ] Advanced reporting and analytics
- [ ] Multi-language support
- [ ] Role-based access control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using React and Tailwind CSS**
