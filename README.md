# Angular Ionic PWA Skeleton

A reusable Angular Ionic Progressive Web App skeleton with device-aware installation instructions.

## 🚀 Features

- **Angular 17** with TypeScript
- **Ionic 7** for native mobile UI components
- **Tailwind CSS** for utility-first styling
- **PWA Support** with service workers
- **Device Detection** (iOS, Android, Desktop)
- **Smart Installation Flow** with device-specific instructions
- **Native App Feel** with iOS/Android styling
- **Dark Mode Support** with system preference detection
- **Offline Capable** with service worker caching

## 📁 Project Structure

```
angular-skeleton/
├── src/
│   ├── app/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components (Home page)
│   │   ├── services/      # DeviceService, PwaService
│   │   ├── app.component.ts
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   ├── assets/
│   │   └── icons/         # PWA icons
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── styles.scss        # Global styles + Tailwind
│   ├── index.html         # PWA meta tags
│   └── manifest.webmanifest
├── angular.json
├── package.json
├── tailwind.config.js
└── build.sh              # Build and deploy script
```

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
cd /var/www/pwa.toybits.cloud/angular-skeleton
npm install
```

### 2. Build and Deploy
```bash
./build.sh
```

### 3. Development Server
```bash
npm start
# Access at http://localhost:4200
```

## 🎯 Device Detection Logic

The skeleton automatically detects:
- **iOS Devices**: Shows Safari-specific installation instructions
- **Android Devices**: Shows Chrome-specific installation instructions  
- **Desktop**: Shows browser-specific install instructions
- **Already Installed**: Hides instructions, shows app features

## 📱 PWA Features

- **Service Worker**: Offline caching and background sync
- **Install Prompt**: Native install button when supported
- **App Manifest**: Complete PWA configuration
- **Push Notifications**: Ready for implementation
- **App Shortcuts**: Quick actions from home screen
- **Share Target**: Can receive shared content

## 🎨 Styling

- **Ionic Components**: Native iOS/Android UI components
- **Tailwind CSS**: Utility classes for rapid styling
- **CSS Variables**: Theme customization
- **Dark Mode**: Automatic based on system preference
- **Responsive Design**: Mobile-first approach

## 🔧 Services

### DeviceService
- Detects device type (iOS/Android/Desktop)
- Detects browser type
- Checks if app is installed
- Provides device-specific instructions
- Manages installation state

### PwaService
- Handles install prompts
- Manages online/offline status
- Controls dark mode
- Handles notifications
- Prevents pull-to-refresh

## 🚀 Deployment

1. Build the app: `./build.sh`
2. Files are copied to `/var/www/pwa.toybits.cloud/public/`
3. Apache serves the built files
4. Access at: https://pwa.toybits.cloud

## 📦 Extending the Skeleton

### Add New Pages
```bash
# Generate new page
ng generate page pages/new-page
```

### Add New Components
```bash
# Generate new component
ng generate component components/new-component
```

### Add New Services
```bash
# Generate new service
ng generate service services/new-service
```

## 🔄 Reusability

This skeleton is designed to be reusable for any PWA project:

1. **Clone the structure** to new projects
2. **Update branding** (colors, icons, name)
3. **Add your specific pages** and components
4. **Connect to your APIs**
5. **Deploy to any hosting**

## 📄 License

MIT - Free to use and modify for any project.

## 🤝 Support

Part of the **TOYBITS** Business Process Automation Ecosystem
- Website: https://toybits.cloud
- PWA: https://pwa.toybits.cloud
- Documentation: Check workspace memory files