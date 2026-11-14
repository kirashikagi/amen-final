# AMEN

AMEN is a Russian-language prayer and reflection app built with React 19, Vite, Tailwind CSS, Framer Motion, and Firebase.

## Local development

Requirements: Node.js 20.19+ or 22.12+, and npm.

```sh
npm ci
npm run dev
```

Vite prints the local URL after startup. Create a production build with `npm run build`, preview it with `npm run preview`, and run ESLint with `npm run lint`.

## Firebase

Copy `.env.example` to `.env.local` and fill it with the Firebase web app configuration for the environment you intend to use. Firebase web configuration is public client configuration; protect data with Firebase Authentication and Firestore Security Rules. Never put Firebase Admin credentials or other server secrets in Vite variables or client code.

Use a separate Firebase project for local development and Vercel Preview. In Vercel, add the `VITE_FIREBASE_*` variables to the Preview environment using the test project's values. Add the production project's values to the Production environment before merging changes into the production branch. Do not reuse production credentials in Preview.

## Payments

Payments are disabled. The checkout interface, YooKassa client script, payment API, webhook, and Firebase Admin dependency have been removed. All background themes are available without payment.

## Deployment

The app is a static Vite site and can be deployed to Vercel using its Vite framework preset. Preview deployments should use a non-production Firebase project before they are used for interactive testing.
