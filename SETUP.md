# Monique Collections: owner setup

The shop works as soon as you open it, showing the starter products in `products.js`.
To let the owner add, sell and remove products online, set up Firebase once:

1. Create a Firebase project and register a Web app. In **Authentication**, enable the Email/Password provider, add `dannnymuasa@gmail.com` as a user, and verify that email. The website has no sign-up form, and the deployed rules deny catalog writes to every other account.
2. Create a Firestore database and enable Firebase Storage for the project.
3. Copy the Web app configuration into `firebase-config.js`, replacing each `YOUR_...` value. Keep `ownerEmail` set to the owner account.
4. From this folder, install or run the Firebase CLI, sign in, and deploy the rules to your project:

   ```powershell
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules,storage --project YOUR_PROJECT_ID
   ```

5. Serve the website over HTTPS (or localhost while testing, e.g. `python -m http.server 8000`, then open http://localhost:8000/shop.html). Open `shop.html`, expand **Owner product manager**, and sign in. Choose **Import starter products** once to move the existing catalog online. After that, all products can be marked sold/available or removed there. On a phone, choose a photo from the device when adding a product; it is resized before upload.

Notes
- Opening the files by double-clicking (file://) still shows the starter products, but sign-in and live products need step 5.
- If you change the owner email, change it in `firebase-config.js`, `firestore.rules` and `storage.rules`, then redeploy the rules.
