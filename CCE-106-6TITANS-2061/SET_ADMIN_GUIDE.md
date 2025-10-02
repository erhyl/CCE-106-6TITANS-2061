# 🔑 How to Set Admin Accounts in Firebase

## Method 1: Firebase Console (Easiest) ⭐

### Step-by-Step:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project: `titans-8d454`

2. **Navigate to Firestore Database**
   - Click "Firestore Database" in the left sidebar
   - Click on the "users" collection

3. **Find Your User**
   - Look for the document with your user's UID
   - Click on that document

4. **Add/Edit the accountType Field**
   - If `accountType` field exists:
     - Click the value
     - Change it to: `admin`
     - Press Enter or click away to save
   
   - If `accountType` field doesn't exist:
     - Click "+ Add field"
     - Field name: `accountType`
     - Type: `string`
     - Value: `admin`
     - Click "Save"

5. **Verify**
   - The field should now show: `accountType: "admin"`
   - ✅ Done!

---

## Method 2: Using Firebase Realtime Database (If using RTDB)

If your app also uses Realtime Database:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project: `titans-8d454`

2. **Navigate to Realtime Database**
   - Click "Realtime Database" in the left sidebar
   - Click on "Data" tab

3. **Find users → [your-uid]**
   - Expand the `users` node
   - Find your user's UID
   - Click on it

4. **Add/Edit accountType**
   - Click the `+` icon next to your user
   - Or click on existing `accountType` field
   - Set value to: `admin`

5. **Save**
   - The change is saved automatically
   - ✅ Done!

---

## Method 3: Automated Script (Recommended for Multiple Admins)

Use this script to promote users to admin from the browser console:

### Quick Admin Promotion Script

1. **Open any page on your site** (while logged in as admin)
2. **Open Browser Console** (F12 → Console tab)
3. **Paste this code:**

```javascript
// ADMIN PROMOTION SCRIPT
(async function() {
  const { getAuth } = await import("https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js");
  const { getFirestore, doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js");
  const { getDatabase, ref, update } = await import("https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js");
  
  const auth = getAuth();
  const db = getFirestore();
  const rtdb = getDatabase();
  
  // Replace with the user's UID you want to make admin
  const userUid = "PASTE_USER_UID_HERE";
  
  try {
    // Update Firestore
    await updateDoc(doc(db, "users", userUid), {
      accountType: "admin"
    });
    
    // Update RTDB (if using)
    await update(ref(rtdb, 'users/' + userUid), {
      accountType: "admin"
    });
    
    console.log("✅ User promoted to admin successfully!");
    alert("User promoted to admin!");
  } catch (error) {
    console.error("Error:", error);
    alert("Error promoting user: " + error.message);
  }
})();
```

4. **Replace `PASTE_USER_UID_HERE`** with the actual UID
5. **Press Enter**
6. **Wait for success message** ✅

---

## Method 4: Find Your User UID

Not sure what your UID is? Here's how to find it:

### Option A: From Firebase Console
1. Go to Firebase Console → Authentication
2. Click "Users" tab
3. Find your email
4. Copy the User UID (long string like `abc123xyz...`)

### Option B: From Your App
1. Login to your site
2. Open Console (F12)
3. Type: `firebase.auth().currentUser.uid`
4. Press Enter
5. Copy the UID shown

### Option C: Quick Console Script
Open console on your site and run:
```javascript
const auth = firebase.auth();
auth.onAuthStateChanged(user => {
  if (user) {
    console.log("Your UID:", user.uid);
    console.log("Your Email:", user.email);
  }
});
```

---

## Example: Full Process

Let's say your email is `admin@6titans.com`:

1. ✅ Register account with email `admin@6titans.com`
2. ✅ Login to get authenticated
3. ✅ Open browser console, run:
   ```javascript
   console.log(firebase.auth().currentUser.uid)
   ```
   Output: `K8sF9dL2mNpQ1rT3vX5yZ7a`
4. ✅ Go to Firebase Console → Firestore → users → `K8sF9dL2mNpQ1rT3vX5yZ7a`
5. ✅ Set `accountType` = `admin`
6. ✅ Refresh your site
7. ✅ You should see 👑 icon and "ADMIN" badge!

---

## Verification Checklist

After setting admin, verify it worked:

- [ ] Login to your site
- [ ] Check navigation - should see 👑 icon
- [ ] Check navigation - should see gold "ADMIN" badge next to name
- [ ] Click "Dashboard" - should go to `admin.html`
- [ ] Try visiting `user-dashboard.html` - should redirect to `admin.html`
- [ ] No notifications visible (admins use admin panel)

If all checks pass → ✅ **Admin account successfully configured!**

---

## Make Multiple Admins

To make multiple admin accounts:

1. **Method 1**: Repeat Firebase Console steps for each user
2. **Method 2**: Use the script above with different UIDs
3. **Method 3**: Create admin accounts directly:

### Create New Admin Account (Register as Admin)

Modify `register.html` temporarily:

```javascript
// In register.html, change line ~356
accountType: "admin",  // Changed from "member"
```

Then:
1. Register new account
2. Will be created as admin automatically
3. Change back to "member" after creating admin accounts

---

## Security Note ⚠️

**Important**: Only give admin access to trusted individuals!

Admins have full control over:
- All user data
- All coaches
- All bookings
- All classes
- All memberships
- System settings

Keep admin accounts secure!

---

## Troubleshooting

### Issue: Still showing as Member after setting admin

**Solution**:
1. Logout completely
2. Clear browser cache (Ctrl + Shift + Delete)
3. Close all browser tabs
4. Login again
5. Should now show as admin

### Issue: Can still access user dashboard as admin

**Solution**:
1. Check that `role-guard.js` is loaded
2. Check browser console for errors
3. Verify `accountType` is exactly `"admin"` (lowercase, string)
4. Hard refresh page (Ctrl + F5)

### Issue: UID not found in Firestore

**Solution**:
1. Check Firestore → users collection
2. If user not there, check Realtime Database → users
3. User might be in RTDB instead
4. Set `accountType: "admin"` in whichever database has the user

---

## Quick Reference

| What | Where | Field | Value |
|------|-------|-------|-------|
| Admin | Firestore | `accountType` | `"admin"` |
| Coach | Firestore | `accountType` | `"coach"` |
| Member | Firestore | `accountType` | `"member"` |

**Remember**: The value must be exactly as shown (lowercase, in quotes in Firebase Console).

---

Need help? Check the Firebase Console at:
https://console.firebase.google.com/project/titans-8d454

