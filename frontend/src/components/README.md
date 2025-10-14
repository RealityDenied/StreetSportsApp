# Components Organization

This directory contains all React components organized into logical folders for better maintainability and structure.

## Folder Structure

### `auth/`
Authentication-related components:
- `LoginForm.jsx` - User login form
- `SignupForm.jsx` - User registration form  
- `ForgotPasswordForm.jsx` - Password reset form

### `event/`
Event management components:
- `AllEventsPanel.jsx` - Panel displaying all events
- `CreateEventModal.jsx` - Modal for creating new events
- `EventCard.jsx` - Individual event card component
- `MatchManagement.jsx` - Match management interface
- `MyEventsSection.jsx` - User's events section
- `PosterUpload.jsx` - Event poster upload component
- `QuickCreateModal.jsx` - Quick creation modal

### `team/`
Team management components:
- `TeamManagement.jsx` - Team management interface
- `TeamMemberSearch.jsx` - Team member search functionality

### `ui/`
Reusable UI components:
- `NotificationBar.jsx` - Notification display bar
- `ProfileCard.jsx` - User profile card
- `SettingsDropdown.jsx` - Settings dropdown menu
- `Toast.jsx` - Toast notification component

### `Onboarding/`
User onboarding flow components:
- `WelcomeSlide.jsx` - Welcome screen
- `FeatureSlide.jsx` - Features overview
- `ProfileInfoSlide.jsx` - Profile information collection
- `PreferencesSlide.jsx` - User preferences
- `FinalSlide.jsx` - Onboarding completion

## Usage

### Individual Imports
```javascript
import LoginForm from '../components/auth/LoginForm';
import EventCard from '../components/event/EventCard';
import TeamManagement from '../components/team/TeamManagement';
import Toast from '../components/ui/Toast';
```

### Folder Imports (using index files)
```javascript
import { LoginForm, SignupForm } from '../components/auth';
import { EventCard, MatchManagement } from '../components/event';
import { TeamManagement } from '../components/team';
import { Toast, NotificationBar } from '../components/ui';
```

### Main Components Import
```javascript
import { LoginForm, EventCard, TeamManagement, Toast } from '../components';
```

## Benefits

- **Better Organization**: Components are grouped by functionality
- **Easier Navigation**: Developers can quickly find related components
- **Scalability**: Easy to add new components to appropriate folders
- **Clean Imports**: Index files provide cleaner import statements
- **Maintainability**: Clear separation of concerns makes code easier to maintain
