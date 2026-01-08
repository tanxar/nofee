# NoFee - Food Delivery App

Μια σύγχρονη εφαρμογή παραγγελίας φαγητού τύπου Wolt/Efood, χτισμένη με React Native και Expo.

## Χαρακτηριστικά

- 🏠 Αρχική οθόνη με λίστα εστιατορίων
- 🍕 Προβολή εστιατορίου με μενού
- 🛒 Καλάθι αγορών με διαχείριση ποσοτήτων
- 👤 Προφίλ χρήστη
- ⭐ Προτεινόμενα εστιατόρια
- 🎨 Σύγχρονο και καθαρό UI/UX
- 📱 Mock data για δοκιμές

## Εγκατάσταση

1. Εγκαταστήστε τις dependencies:
```bash
npm install
```

2. Ξεκινήστε την εφαρμογή:
```bash
npm start
```

3. Σαρώστε το QR code με την Expo Go app (iOS/Android) ή πατήστε:
   - `i` για iOS simulator
   - `a` για Android emulator
   - `w` για web browser

## Δομή Project

```
src/
  ├── screens/          # Οθόνες της εφαρμογής
  ├── context/          # Context για state management
  └── data/             # Mock data
```

## Technologies

- React Native
- Expo
- TypeScript
- React Navigation
- Expo Linear Gradient

## Mock Data

Η εφαρμογή περιλαμβάνει mock data για:
- 6 εστιατόρια
- Πολλαπλές κατηγορίες φαγητού
- Μενού για κάθε εστιατόριο

## Notes

Για production, θα χρειαστεί να:
- Συνδεθείτε με backend API
- Προσθέσετε authentication
- Προσθέσετε πληρωμές
- Προσθέσετε tracking παραγγελιών

