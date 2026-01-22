# Dichir - Medical Dashboard Application

A full-stack medical dashboard application built with Flask (Python) backend and Vanilla JavaScript Web Components frontend.

## Technology Stack

### Backend
- **Python 3.x** with Flask
- **SQLite** database with SQLAlchemy ORM
- **JWT** authentication (PyJWT)
- **Flask-CORS** for cross-origin requests

### Frontend
- **Vanilla JavaScript (ES6 Modules)**
- **Web Components (Custom Elements v1 with Shadow DOM)**
- **CSS3** for styling
- **HTML5**

## Architecture

### Backend - Layered Architecture
- **Controller Layer** (`app/api/`): HTTP request handling, input validation, JSON responses
- **Service Layer** (`app/services/`): Business logic implementation
- **Data Access Layer** (`app/models/`): Database models and interactions
- **Factory Pattern**: Flask application factory in `app/__init__.py`

### Frontend - Component-Based Architecture
- **BaseComponent**: Abstract class for all Web Components
- **ApiService**: Singleton for HTTP requests with JWT token management
- **Router**: Hash-based SPA routing
- **Custom Elements**: 
  - `<dichir-login>`: Authentication component
  - `<dichir-dashboard>`: Dashboard overview
  - `<patient-form>`: Patient registration form
  - `<patient-list>`: Patient listing with search
  - `<vital-signs>`: Vital signs management

## Project Structure

```
Assignment/
├── app/
│   ├── __init__.py              # Flask app factory
│   ├── api/                      # Controller layer (Blueprints)
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── patients.py          # Patient & vitals endpoints
│   │   └── decorators.py        # JWT middleware
│   ├── services/                 # Business logic layer
│   │   ├── auth_service.py      # Authentication service
│   │   ├── patient_service.py   # Patient service
│   │   └── vital_service.py     # Vital signs service
│   └── models/                   # Data access layer
│       ├── base.py              # SQLAlchemy base
│       ├── user.py              # User model
│       ├── patient.py           # Patient model
│       └── vital.py             # Vital signs model
├── static/
│   ├── index.html               # SPA entry point
│   ├── css/
│   │   └── main.css             # Global styles
│   └── js/
│       ├── app.js               # Application entry
│       ├── router.js            # SPA router
│       ├── services/
│       │   └── api-service.js   # HTTP service singleton
│       └── components/
│           ├── base-component.js        # Base component class
│           ├── login-component.js       # Login component
│           ├── dashboard-component.js   # Dashboard component
│           ├── patient-form.js          # Patient form component
│           ├── patient-list.js          # Patient list component
│           └── vital-signs.js           # Vital signs component
├── config.py                    # Configuration
├── requirements.txt             # Python dependencies
├── run.py                       # Application entry point
└── README.md                    # This file
```

## Setup Instructions

### 1. Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### 2. Installation

```powershell
# Navigate to the project directory
cd d:\Projects\Assignment

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Initialize Database

The database will be automatically created when you first run the application. However, you'll need to create a default user for login.

Run the following Python script to create a test user:

```python
# Create a file called init_db.py
from app import create_app, db_session
from app.models.user import User

app = create_app()
with app.app_context():
    # Create test user
    user = User(username='admin', email='admin@dichir.com')
    user.set_password('admin123')
    
    db_session.add(user)
    db_session.commit()
    
    print("Database initialized with test user:")
    print("Username: admin")
    print("Password: admin123")
```

### 4. Run the Application

```powershell
python run.py
```

The application will start on `http://localhost:5000`

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:5000/static/index.html
```

**Default Login Credentials:**
- Username: `admin`
- Password: `admin123`

## API Endpoints

### Authentication
- `POST /api/login` - User login (returns JWT token)
- `POST /api/register` - User registration

### Patients
- `GET /api/patients` - Get all patients (supports `?search=<term>`)
- `POST /api/patients` - Create new patient
- `GET /api/patients/<id>` - Get patient by ID
- `PUT /api/patients/<id>` - Update patient

### Vital Signs
- `POST /api/patients/<id>/vitals` - Add vital signs
- `GET /api/patients/<id>/vitals` - Get patient vital signs
- `GET /api/patients/<id>/vitals?latest=true` - Get latest vitals
- `GET /api/patients/<id>/vitals/stats` - Get vital signs statistics

All endpoints except `/login` and `/register` require JWT authentication via `Authorization: Bearer <token>` header.

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Automatic token management (stored in localStorage)
- Protected routes

### Patient Management
- Add new patients with comprehensive information
- View patient list with search functionality
- Patient details including demographics and medical history

### Vital Signs Tracking
- Record multiple vital signs:
  - Blood Pressure (Systolic/Diastolic)
  - Heart Rate
  - Temperature
  - Respiratory Rate
  - Oxygen Saturation
- View complete vital signs history
- Calculate and display average statistics
- Add notes to vital sign records

### Dashboard
- Overview of total patients
- Recent patient list
- Quick actions for common tasks

## Development

### Adding New Components

1. Create a new component file in `static/js/components/`
2. Extend the `BaseComponent` class
3. Implement the `render()` method
4. Define the custom element using `customElements.define()`
5. Import the component in `static/index.html`

Example:
```javascript
import { BaseComponent } from './base-component.js';

class MyComponent extends BaseComponent {
    render() {
        this.shadowRoot.innerHTML = `
            ${this.getCommonStyles()}
            <style>
                /* Component-specific styles */
            </style>
            <div>My Component Content</div>
        `;
    }
}

customElements.define('my-component', MyComponent);
```

### Adding New API Endpoints

1. Add service method in `app/services/`
2. Create controller endpoint in `app/api/`
3. Register blueprint in `app/__init__.py` (if new blueprint)
4. Add corresponding method to `ApiService` in `static/js/services/api-service.js`

## Design Patterns Implemented

1. **Factory Pattern**: Flask application factory for configuration
2. **Layered Architecture**: Separation of concerns (Controller/Service/Data layers)
3. **Singleton Pattern**: Single ApiService instance for HTTP requests
4. **Component Pattern**: Reusable Web Components with Shadow DOM
5. **Decorator Pattern**: JWT middleware for route protection

## Security Considerations

- Passwords are hashed using Werkzeug's `generate_password_hash`
- JWT tokens for stateless authentication
- CORS configured for API endpoints
- Input validation on both client and server
- Shadow DOM encapsulation for component isolation

## Browser Compatibility

- Chrome/Edge 79+
- Firefox 63+
- Safari 12.1+

(Requires support for Custom Elements v1 and Shadow DOM)

## Future Enhancements

- [ ] User profile management
- [ ] Advanced patient search and filtering
- [ ] Data visualization (charts for vital signs trends)
- [ ] Appointment scheduling
- [ ] Medical records upload
- [ ] Email notifications
- [ ] Role-based access control (Admin, Doctor, Nurse)
- [ ] Export patient data (PDF, CSV)

## License

This project is for educational purposes.

## Support

For issues or questions, please create an issue in the project repository.
