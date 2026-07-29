# Nexus HMS — Candidate Portal (Auth Screens)

React + Vite + Tailwind CSS implementation of the Nexus HMS **Login** and **Create Account** screens, built with reusable, composable components.

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` — it redirects to `/login`. The signup page is at `/signup`.

## Pages

- `/login` — "Welcome Back" sign-in form (email, password, remember me, forgot password link) with the 6-tile feature grid (Search Jobs, Apply, AI Screening, Interview, Offer, Join).
- `/signup` — "Create Account" form (full name, email, phone with country code, password + confirm, resume upload, optional additional documents, terms checkbox) with the 4-tile feature grid (Create Account, Complete Profile, Find Opportunities, Apply & Grow).

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AuthLayout.jsx    # shared two-column shell (marketing copy + form card)
│   │   ├── Header.jsx        # top nav: logo, Need Help?, FAQ, Contact HR
│   │   └── Footer.jsx        # bottom links: Privacy, Terms, Accessibility
│   └── ui/
│       ├── Button.jsx        # primary/ghost CTA button, optional trailing arrow
│       ├── TextField.jsx     # labeled input with optional leading icon
│       ├── PasswordField.jsx # password input with show/hide toggle
│       ├── PhoneField.jsx    # country-code select + phone number input
│       ├── Checkbox.jsx      # custom styled checkbox
│       ├── FeatureCard.jsx   # icon tile used in the feature grids
│       └── FileUpload.jsx    # drag-and-drop resume/document uploader
├── pages/
│   ├── LoginPage.jsx
│   └── SignupPage.jsx
├── App.jsx                    # routes (/login, /signup)
├── main.jsx
└── index.css
```

## Design Tokens

Defined in `tailwind.config.js`:

- **brand** — indigo scale (`brand-600` = `#4f3ee0`) used for the logo mark, primary buttons, links, and accents.
- **surface** — warm off-white page background (`#f6f5f1`).
- **font** — Poppins, loaded via Google Fonts in `index.html`.

## Notes

- Forms are functional (controlled inputs, validation hooks like password-confirmation match, disabled submit while "submitting") but the actual API calls are stubbed with `// TODO` — wire these to your real auth endpoints.
- All components are intentionally generic/reusable so you can build additional screens (Forgot Password, OTP, Profile) using the same primitives.
- Run `npm install` before `npm run dev` — `node_modules` is not included in this archive.
