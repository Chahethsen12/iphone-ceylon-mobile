# Absolute Beginner's Guide: Agile Project Deployment

Welcome! If you're a new developer, a junior contributor, or a Scrum Master trying to get this project successfully onto the internet, you are in the right place. 

Deploying an application simply means taking the code from your personal computer and putting it onto public servers so that anyone in the world can type a URL and access your website.

In our Agile team, we typically run deployments at the end of a "Sprint" (a 1-2 week development cycle). Below is the exact, step-by-step pipeline we use to deploy our **Backend API**, **Customer Store**, and **Admin Dashboard**.

---

## STEP 1: Upload Your Code to GitHub
Before any server can host your app, your code needs to be saved securely on the cloud. We use GitHub for this.

1. Go to [GitHub.com](https://github.com) and create a free account if you don't have one.
2. Click the **`+`** icon in the top right and select **New repository**.
3. Name it `iphone-ceylon-mobile` and click **Create repository**.
4. Open the terminal inside your project folder on your computer and type these commands exactly to push your code up:
   ```bash
   git init
   git add .
   git commit -m "Initial sprint ready for deployment"
   git branch -M main
   # Replace the URL below with YOUR repository URL from GitHub
   git remote add origin https://github.com/YourUsername/iphone-ceylon-mobile.git
   git push -u origin main
   ```
*Success! Your code is now backed up on GitHub.*

---

## STEP 2: Deploy the Backend (The Brain)
Your backend (Node.js/Express) is the "brain" of the app. It handles the MongoDB and Firebase logic. We will put this brain on an incredibly fast hosting site called **Railway**.

1. Go to [Railway.app](https://railway.app) and sign up using your GitHub account.
2. Click the big **New Project** button on your dashboard.
3. Select **Deploy from GitHub repo** and choose your `iphone-ceylon-mobile` repository.
4. Railway will analyze your code. Since our backend is inside a `backend` folder, we need to tell Railway exactly where to look:
   - Go to your newly created service settings in Railway.
   - Look for the **Root Directory** setting and change it to `/backend`.
5. **VERY IMPORTANT (The Keys)**: The backend needs keys to unlock your databases. 
   - Click on the **Variables** tab for your service.
   - Open your `backend/.env` file on your computer. Click **Raw Editor** in Railway and paste your entire `.env` file contents, or add each variable (like `MONGO_URI`, `JWT_SECRET`) one by one.
6. Railway will automatically rebuild your project using these settings. Wait a few minutes. 
7. Once your project has built successfully, click on the **Settings** tab and go to **Networking**. Click **Generate Domain**.
8. Railway will give you a public web address (e.g., `iphone-api-production.up.railway.app`). **Copy this link!** We need it for the next step.

---

## STEP 3: Deploy the Customer Store (The Frontend)
Now we'll deploy the beautiful interface the customer sees using **Vercel**, the easiest hosting platform for React.

1. Go to [Vercel.com](https://vercel.com) and sign up with your GitHub account.
2. Click **Add New...** and select **Project**.
3. You will see your GitHub repositories listed. Click **Import** next to `iphone-ceylon-mobile`.
4. We must tell Vercel to only build the `frontend-store` folder.
   - Scroll down to "Root Directory". Click **Edit** and select the `frontend-store` folder.
5. **Connecting the Brain:** The frontend needs to know how to talk to the backend you just built!
   - Under "Environment Variables", add a new variable.
   - For **Name**, type: `VITE_API_URL`
   - For **Value**, paste the Railway link you copied from Step 2, and add `/api` to the end. (Example: `https://iphone-api-production.up.railway.app/api`).
6. Click **Deploy**. Wait about 2 minutes. 
*Success! Customers can now browse your store online!*

---

## STEP 4: Deploy the Admin Dashboard
You need a private dashboard to manage products and orders. We will deploy this exactly like we did the store.

1. Go back to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your `iphone-ceylon-mobile` repository again.
4. This time, set the "Root Directory" to `frontend-admin`.
5. Add the exact same **Environment Variable**:
   - Name: `VITE_API_URL`
   - Value: `https://iphone-api-production.up.railway.app/api` (You must use your own Railway link).
6. Click **Deploy**.

---

### 🎉 Congratulations!
You have successfully completed a full-stack Agile deployment! 
1. The **Backend API** is live.
2. The **Store** is live.
3. The **Admin Panel** is live.

As your Agile team finishes new features in the future, all they have to do is type `git push origin main`. GitHub will automatically inform Railway and Vercel to update your live websites within minutes!
