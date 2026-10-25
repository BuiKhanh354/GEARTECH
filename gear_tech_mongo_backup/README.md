# HUONG DAN IMPORT DU LIEU GEAR TECH SANG MAY KHAC

Thu muc nay chua toan bo du lieu Database MongoDB cua du an GEAR TECH.

---

## Cach Import vao MongoDB tren may moi:

### Buoc 1: Copy thu muc nay sang may moi
Copy nguyen thu muc `gear_tech_mongo_backup` sang may tinh moi (qua USB, Google Drive, Zalo...).

### Buoc 2: Dam bao MongoDB da duoc bat tren may moi
MongoDB dang chay tren cong mac dinh `mongodb://localhost:27017`.

### Buoc 3: Chay lenh Import
Mo Terminal (PowerShell / CMD) tai thu muc `gear_tech_mongo_backup` va chay:

```bash
node import-db.js
```

*(Luu y: Neu may moi chua co san thu vien mongodb, ban chi can chay: `npm install mongodb bson` hoac chay script nay ben trong thu muc `Backend` cua du an).*

---
Toan bo tai khoan admin, shop, san pham, danh muc, don hang se duoc khoi phuc nguyen ven!
