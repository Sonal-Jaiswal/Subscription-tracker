# Subscription Tracker

A modern, full-stack web application for tracking and managing your subscriptions. Built with Node.js, Express, MongoDB, and vanilla JavaScript with a beautiful, responsive UI.

## Features

### 📊 Dashboard & Analytics
- **Real-time Statistics**: View total subscriptions, monthly costs, and upcoming renewals
- **Visual Overview**: Beautiful cards displaying key metrics
- **Smart Calculations**: Automatic monthly cost conversion for different billing cycles

### 🔍 Subscription Management
- **Add Subscriptions**: Easy form to add new subscriptions with all details
- **Edit & Update**: Modify existing subscription information
- **Delete Subscriptions**: Remove subscriptions with confirmation
- **Search & Filter**: Find subscriptions by name, category, or billing cycle

### 📅 Smart Tracking
- **Billing Cycles**: Support for monthly, yearly, weekly, and quarterly billing
- **Renewal Alerts**: Visual indicators for upcoming renewals (color-coded by urgency)
- **Date Management**: Automatic calculation of days until next billing

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Beautiful Interface**: Modern gradient design with glassmorphism effects
- **Interactive Elements**: Smooth animations and hover effects
- **Accessibility**: Clean, readable interface with proper contrast

### 🗂️ Organization
- **Categories**: Organize subscriptions by category (Entertainment, Work, etc.)
- **URL Links**: Direct links to subscription websites
- **Descriptions**: Add notes and descriptions for each subscription

## Tech Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Express Validator**: Input validation
- **CORS**: Cross-origin resource sharing

### Frontend
- **Vanilla JavaScript**: No framework dependencies
- **Modern CSS**: Flexbox, Grid, and CSS animations
- **Font Awesome**: Icons
- **Google Fonts**: Inter font family

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Subscription-tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/subscription-tracker
PORT=3000
NODE_ENV=development
```

For MongoDB Atlas, use your connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/subscription-tracker
```

### 4. Start the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `GET /api/subscriptions/:id` - Get subscription by ID
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription

### Statistics
- `GET /api/subscriptions/stats/summary` - Get summary statistics

## Usage

### Adding a Subscription
1. Click the "Add Subscription" button
2. Fill in the required fields:
   - **Name**: Subscription name
   - **Cost**: Amount in dollars
   - **Billing Cycle**: Monthly, Yearly, Weekly, or Quarterly
   - **Next Billing Date**: When the next payment is due
3. Optionally add:
   - **Category**: For organization
   - **Website URL**: Direct link to the service
   - **Description**: Additional notes
4. Click "Save Subscription"

### Managing Subscriptions
- **Search**: Use the search bar to find specific subscriptions
- **Filter**: Filter by category or billing cycle
- **Edit**: Click the edit button on any subscription card
- **Delete**: Click the delete button and confirm
- **Visit**: Click "Visit" to go directly to the subscription website

### Understanding the Dashboard
- **Total Subscriptions**: Number of active subscriptions
- **Monthly Cost**: Total monthly expenditure (converted from all billing cycles)
- **Upcoming Renewals**: Number of renewals in the next 30 days

## Project Structure

```
Subscription-tracker/
├── bin/
│   └── www                 # Server entry point
├── models/
│   └── subscription.js     # MongoDB schema
├── public/
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   └── script.js          # Frontend JavaScript
├── routes/
│   ├── index.js           # Main route
│   └── subscriptions.js   # API routes
├── app.js                 # Express application
├── package.json           # Dependencies and scripts
└── readme.md             # This file
```

## Database Schema

### Subscription Model
```javascript
{
  name: String (required),
  cost: Number (required),
  billingCycle: String (monthly/yearly/weekly/quarterly),
  nextBillingDate: Date (required),
  category: String (default: 'Other'),
  description: String,
  url: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:
1. Check the console for error messages
2. Ensure MongoDB is running
3. Verify all environment variables are set correctly
4. Check that all dependencies are installed

## Future Enhancements

- [ ] User authentication and multi-user support
- [ ] Email notifications for upcoming renewals
- [ ] Export functionality (CSV, PDF)
- [ ] Dark mode toggle
- [ ] Mobile app version
- [ ] Integration with payment methods
- [ ] Budget tracking and alerts
- [ ] Subscription usage analytics
