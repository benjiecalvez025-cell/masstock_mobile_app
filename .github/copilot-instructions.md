# Masstock Mobile App - Development Guide

This is a React Native mobile application for the Masstock B2B marketplace platform built with Expo and TypeScript.

## Project Overview

**Masstock Mobile App** is a comprehensive B2B marketplace platform featuring:
- E-commerce marketplace (B2B Marketplace)
- Financial management hub (Financial Hub)
- E-commerce negotiation hub (E-Negosyo Hub)
- E-wallet and payment solutions
- Order tracking and management
- Store management and analytics

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation & Expo Router
- **State Management**: Context API (built-in)
- **UI Framework**: React Native with custom styling
- **Build Tool**: Expo CLI
- **Package Manager**: npm

## Project Structure

```
masstock-mobile-app/
├── app/                    # Expo Router navigation screens
├── components/             # Reusable UI components
├── constants/              # App constants and theme
├── hooks/                  # Custom React hooks
├── assets/                 # Images, fonts, and media
├── scripts/                # Utility scripts
├── .vscode/                # VS Code configuration
├── .github/                # GitHub configuration
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo Go app (for iOS/Android development on device)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

### Development Commands

- **Start Dev Server**: `npm start`
- **Run on Web**: `npm run web`
- **Run on Android**: `npm run android`
- **Lint Code**: `npm run lint`
- **Reset Project**: `npm run reset-project`

## Available VS Code Tasks

Launch tasks from VS Code using `Ctrl+Shift+B`:

1. **Expo: Start Development Server** (Default) - Starts the Expo CLI development server
2. **Expo: Start Web** - Runs the app in a web browser
3. **Expo: Start Android** - Runs the app on an Android emulator
4. **Expo: Lint Code** - Runs ESLint to check code quality

## Features to Implement

### 1. Home Screen
- Display platform hubs (B2B Marketplace, Financial Hub, E-Negosyo Hub)
- Quick access menu
- E-wallet balance
- Active orders and notifications

### 2. B2B Marketplace
- Product browsing by category
- Wholesale pricing display
- Add to cart functionality
- Bulk order management

### 3. E-wallet
- Balance display
- Cash in/out options
- Transaction history
- Payment method management

### 4. Orders Management
- Active orders tracking
- Order history
- Order details view
- Track order status
- Reorder functionality

### 5. My Store (Seller)
- Store dashboard
- Sales overview
- Best sellers display
- E-Lista Credit management
- Loyalty rewards program
- Store settings

### 6. Cart & Checkout
- Cart management
- Payment options (E-Lista Credit, GCash, Maya)
- Order summary
- Delivery options

### 7. Authentication
- Login/Sign up
- Session management
- User profile

## Code Style Guidelines

- Use TypeScript for type safety
- Follow React hooks best practices
- Use functional components
- Maintain component modularity
- Use consistent naming conventions (camelCase for variables/functions, PascalCase for components)

## Dependencies

Key packages installed:
- `react`: UI library
- `react-native`: Mobile framework
- `expo`: Development platform
- `expo-router`: File-based routing
- `react-navigation`: Navigation
- `@expo/vector-icons`: Icon library
- `typescript`: Type checking

## Debugging

1. **React DevTools**: Connected via Expo CLI
2. **Network Tab**: Monitor API calls
3. **Console**: View logs and errors
4. **Error Boundaries**: Handle runtime errors gracefully

## Performance Optimization

- Use React.memo for component optimization
- Implement lazy loading for screens
- Optimize images with expo-image
- Use FlatList for large lists
- Implement pagination

## Testing

To add tests:
```bash
npm install --save-dev jest @testing-library/react-native
```

## Deployment

### Web Build
```bash
expo export --platform web
```

### Android Build
```bash
eas build --platform android
```

### iOS Build
```bash
eas build --platform ios
```

## Environment Variables

Create a `.env` file in the root directory for sensitive data:
```
API_URL=https://api.example.com
ENVIRONMENT=development
```

## Troubleshooting

- **Port already in use**: Use `expo start --clear` to reset the dev server
- **Module not found**: Run `npm install` to ensure all dependencies are installed
- **Build errors**: Try `npm run reset-project` to reset the project state

## Contributing

When adding new features:
1. Create feature branches from main
2. Follow the project structure
3. Write reusable components
4. Test on multiple platforms
5. Update documentation

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation Docs](https://reactnavigation.org/)
- [TypeScript React Guide](https://www.typescriptlang.org/docs/handbook/react.html)

## Next Steps

1. Set up API integration with Masstock backend
2. Implement authentication system
3. Create core screens and navigation
4. Add state management (Context API or Redux)
5. Implement e-wallet and payment features
6. Add real-time notifications

---

**Last Updated**: May 11, 2026
**Version**: 1.0.0
