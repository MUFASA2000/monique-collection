# Connect the shop product manager

The shop uses Firebase for owner sign-in, shared product records, and uploaded product photos. Product reads and photos are public; only the verified `dannnymuasa@gmail.com` account can add, remove, or change availability.

1. Create a Firebase project and register a Web app. In **Authentication**, enable the Email/Password provider, add `dannnymuasa@gmail.com` as a user, and verify that email. The website has no sign-up form, and the deployed rules deny catalog writes to every other account.
2. Create a Firestore database and enable Firebase Storage for the project.
3. Copy the Web app configuration into `firebase-config.js`, replacing each `YOUR_...` value. Keep `ownerEmail` set to the owner account.
4. From this folder, install or run the Firebase CLI, sign in, and deploy the rules to your project:

   ```powershell
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules,storage --project YOUR_PROJECT_ID
   ```

5. Serve the website over HTTPS (or localhost while testing). Open `shop.html`, expand **Owner product manager**, and sign in. Choose **Import starter products** once to move the existing catalog online. After that, all products can be marked sold/available or removed there. On a phone, choose a photo from the device when adding a product.

The rules in `firestore.rules` and `storage.rules` must be deployed to the same Firebase project used in `firebase-config.js`. Do not create public write rules. The Web app config is intended to be used in a website; the deployed Firebase rules provide the access control.
