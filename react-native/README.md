# ArtQuestia

ArtQuestia is a location-based Augmented Reality (AR) mobile application that lets users discover artworks in the real world and collect them as digital stickers. By exploring their surroundings with an interactive map, users can unlock artworks at physical locations and experience them through AR scenes.

The app aims to make art discovery more interactive by combining location services, AR, and light gamification.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [How the App Works](#how-the-app-works)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [Development Tips](#development-tips)
- [Project Contributors](#project-contributors)

## Overview

ArtQuestia allows users to explore nearby artworks using a map and unlock them by visiting real-world locations. When near an artwork, users can start an AR experience to view it and collect a digital sticker.

Users can:
- Explore a map showing nearby artworks  
- Visit physical locations to unlock artworks  
- Experience artworks in AR  
- Collect digital stickers  
- View detailed information about each artwork  

The project consists of three main parts:

1. **React Native Mobile App**  
   The iOS and Android application built with Expo.
2. **Strapi Backend**  
   Hosted on Strapi Cloud to manage artworks, users, and unlocks.
3. **Firebase**  
   Used for user authentication.

## Features

### User Experience
- **Authentication**: Users can register and log in with Firebase  
- **Interactive Map**: MapLibre map showing the user's location and nearby artworks  
- **Location-Based Discovery**: Artworks unlock automatically when users are within range  
- **AR Scanner**: AR scenes to view artworks through the camera  
- **Sticker Collection**: View all unlocked stickers and artworks  
- **User Profile**: Update basic information such as name and age  
- **Onboarding Flow**: First-time user experience explaining the app and requesting permissions

### Technical Features
- Cross-platform support (iOS and Android)  
- Real-time location tracking  
- REST API integration with Strapi  
- Responsive layout for different screen sizes

## Technology Stack

### Mobile App
- **Framework**: Expo with React Native 
- **Language**: TypeScript  
- **Routing**: Expo Router
- **AR**: React Viro
- **Maps**: MapLibre React Native  
- **Authentication**: Firebase Auth  
- **Storage**: AsyncStorage  
- **Location**: Expo Location  
- **Camera**: Expo Camera  
- **State Management**: React Context API  

### Backend
- **CMS**: Strapi 
- **Database**: SQLite
- **Authentication**: Firebase Admin SDK + Strapi Users-Permissions  
- **Node Version**: 20.x – 24.x  

### External Services
- Firebase Authentication (project: bap-devine)  
- Strapi Cloud (`colorful-charity-cafd22260f.strapiapp.com`)  


## Project Structure

- `app/` - Screens and navigation
- `components/` - Reusable components
- `contexts/` - React Context providers
- `services/` - API services
- `config/` - Firebase configuration

## Prerequisites

Before setting up the project, make sure you have:

- Node.js (version 20 or higher)
- npm or yarn
- Git

### Development environment

- iOS: macOS with Xcode
- Android: Android Studio
- (Optional but recommended): `npm install -g expo-cli`

## Installation & Setup

1. Navigate to the project
   ```bash
   cd ArtQuestia
   ```

2. Install mobile app dependencies
   ```bash
   cd react-native
   npm install
   ```

3. Firebase Configuration

   Firebase is already configured in `config/firebase.ts` using the existing project:
   - Project ID: `bap-devine`
   - Auth Domain: `bap-devine.firebaseapp.com`

   If you want to use your own Firebase project, replace the config values in that file.

## Running the Application

From the `react-native` directory:

```bash
npm run android
npm run ios --device
```

### Testing Notes

- AR and location features work best on a physical device
- Simulators don't work for AR testing

## How the App Works

### User Flow

1. **Onboarding**
   First-time users go through onboarding screens and grant required permissions.

2. **Registration / Login**
   Users authenticate using Firebase. A token is exchanged with Strapi for API access.

3. **Home Screen**
   Displays nearby artworks and basic information.

4. **Map View**
   Shows the user's location and artwork markers. Locked and unlocked artworks are visually distinguished. Here you can make routes to these artworks.

5. **Unlocking Artworks**
   When within range of an artwork, users can start the AR experience to unlock a sticker of that artwork.

6. **AR Scanner**
   Each artwork has its own AR scene with 3D elements and interactions.

7. **Sticker Gallery**
   Shows all collected stickers and progress.

8. **Settings**
   Users can update profile information or log out.

### Authentication Flow

1. User Login
2. Firebase Authentication
3. Firebase ID Token
4. Strapi (`/api/auth/firebase`)
5. JWT stored in AsyncStorage
6. Used for API requests

### Data Flow

- Artworks are stored in Strapi and fetched via REST
- Unlocked artworks are linked to users in a separate collection
- Location data is compared with artwork coordinates
- State is managed using React Context and AsyncStorage

## Architecture

### Key Files

- `app/_layout.tsx` - Root layout and providers
- `app/(tabs)/_layout.tsx` - Tab navigation
- `components/ArtworkCard.tsx` - Artwork display component
- `components/ar/` - AR scene implementations
- `contexts/ClaimedStickersContext.tsx` - Unlocked artwork state
- `services/userService.ts` - API communication

### API Endpoints

Base URL: `https://colorful-charity-cafd22260f.strapiapp.com`

- `POST /api/auth/firebase`
- `GET /api/artworks`
- `GET /api/themes`
- `GET /api/user-unlocked-artworks`
- `POST /api/user-unlocked-artworks`
- `GET /api/users/me`
- `PUT /api/users/:id`

## Troubleshooting

### AR not working

- Requires a physical device
- Check camera permissions
- Device must support ARCore or ARKit

### Location issues

- Enable location permissions
- GPS must be active
- Test on a real device

### API errors

- Check network connection
- Verify JWT token
- Restart app if needed

---

## Project Contributors

This project was developed as a Bachelor Thesis at Devine by Group 12.