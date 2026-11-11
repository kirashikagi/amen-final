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

The client connects to the AMEN Firebase project from `src/firebase.js`. The Firebase web configuration in that file is public client configuration; Firestore Security Rules and Firebase Authentication must protect user data. Do not put Firebase Admin credentials or other server secrets in client code.

## Payments

Payments are disabled. The checkout interface, YooKassa client script, payment API, webhook, and Firebase Admin dependency have been removed. All background themes are available without payment.

## Deployment

The app is a static Vite site and can be deployed to Vercel using its Vite framework preset. Preview deployments should use a non-production Firebase project before they are used for interactive testing.
