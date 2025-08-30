# إعداد Firebase مع ميزات الإدارة - دليل شامل

## 🔥 إعداد Firebase للتطبيق مع لوحة الإدارة

### الخطوة 1: إنشاء مشروع Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. انقر على "Create a project" أو "إنشاء مشروع"
3. أدخل اسم المشروع (مثل: job-tracker-app)
4. اختر إعدادات Google Analytics (اختياري)
5. انقر على "Create project"

### الخطوة 2: تفعيل Authentication

1. في لوحة تحكم Firebase، اذهب إلى **Authentication**
2. انقر على **Sign-in method**
3. فعّل **Email/Password** provider
4. احفظ التغييرات

### الخطوة 3: إنشاء Firestore Database

1. اذهب إلى **Firestore Database**
2. انقر على **Create database**
3. اختر **Start in test mode** (سنغير القواعد لاحقاً)
4. اختر موقع الخادم (اختر الأقرب لك)
5. انقر على **Done**

### الخطوة 4: إعداد قواعد الأمان المحدثة

في **Firestore Database > Rules**، استبدل القواعد الافتراضية بالقواعد التالية:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // قواعد مجموعة المستخدمين
    match /users/{userId} {
      // المستخدمون يمكنهم قراءة وكتابة ملفاتهم الشخصية فقط
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // المديرون يمكنهم قراءة جميع ملفات المستخدمين
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // المديرون يمكنهم تحديث أدوار المستخدمين الآخرين
      allow update: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' &&
        // التأكد من أن المدير لا يغير دوره الخاص
        (userId != request.auth.uid || request.resource.data.role == resource.data.role);
    }
    
    // قواعد طلبات التوظيف
    match /jobApplications/{applicationId} {
      // المستخدمون يمكنهم إدارة طلباتهم فقط
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      
      // السماح بإنشاء طلبات جديدة للمستخدم المسجل
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      
      // المديرون يمكنهم قراءة جميع الطلبات (للإحصائيات)
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### الخطوة 5: الحصول على إعدادات التطبيق

1. اذهب إلى **Project Settings** (أيقونة الترس)
2. انتقل إلى تبويب **General**
3. في قسم **Your apps**، انقر على **Add app** ثم اختر **Web**
4. أدخل اسم التطبيق (مثل: Job Tracker)
5. انسخ كود التكوين

### الخطوة 6: تحديث إعدادات التطبيق

في ملف `src/firebase.js`، استبدل القيم الافتراضية بقيم مشروعك:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "your-actual-app-id"
};
```

### الخطوة 7: إعداد المديرين

لجعل مستخدم مديراً، عدّل ملف `src/utils/userRoles.js` وأضف البريد الإلكتروني للمدير:

```javascript
const ADMIN_EMAILS = [
  'admin@jobtracker.com',
  'your-email@example.com',  // أضف بريدك الإلكتروني هنا
  // أضف المزيد من المديرين حسب الحاجة
];
```

## 🔐 ميزات الأمان المضافة

### 1. نظام الأدوار
- **مدير (Admin)**: وصول كامل لجميع البيانات ولوحة الإدارة
- **مشرف (Moderator)**: صلاحيات محدودة (يمكن توسيعها لاحقاً)
- **مستخدم عادي (User)**: وصول لبياناته الشخصية فقط

### 2. قواعد الأمان
- المستخدمون يرون طلباتهم فقط
- المديرون يمكنهم رؤية جميع البيانات
- حماية من تعديل الأدوار غير المصرح به
- التحقق من الهوية في جميع العمليات

### 3. لوحة الإدارة
- عرض إحصائيات المستخدمين
- إدارة أدوار المستخدمين
- تفعيل/تعطيل المستخدمين
- مراقبة النشاط

## 🚀 الميزات الجديدة

### للمديرين:
- **لوحة إدارة شاملة**: إحصائيات وإدارة المستخدمين
- **تغيير الأدوار**: ترقية المستخدمين أو تخفيض رتبتهم
- **إدارة الحسابات**: تفعيل أو تعطيل المستخدمين
- **مراقبة النشاط**: رؤية آخر دخول وتاريخ التسجيل

### للمستخدمين العاديين:
- **الأمان المحسن**: حماية البيانات الشخصية
- **واجهة محسنة**: تجربة مستخدم أفضل
- **أداء أسرع**: تحسينات في التحميل

## 🔧 اختبار النظام

### 1. اختبار المستخدم العادي:
1. سجل حساب جديد ببريد إلكتروني عادي
2. تأكد من عدم ظهور زر لوحة الإدارة
3. تأكد من رؤية البيانات الشخصية فقط

### 2. اختبار المدير:
1. سجل حساب ببريد إلكتروني مدرج في قائمة المديرين
2. تأكد من ظهور زر لوحة الإدارة
3. اختبر جميع ميزات الإدارة

## 📱 الوصول للوحة الإدارة

بعد تسجيل الدخول كمدير:
1. ستجد أيقونة الإدارة (⚙️) في الشريط العلوي
2. انقر عليها للوصول للوحة الإدارة
3. يمكنك إدارة المستخدمين وعرض الإحصائيات

## ⚠️ ملاحظات مهمة

1. **النسخ الاحتياطي**: احتفظ بنسخة احتياطية من قواعد البيانات
2. **الأمان**: لا تشارك معلومات Firebase مع أشخاص غير مصرح لهم
3. **المراقبة**: راقب استخدام Firebase لتجنب تجاوز الحدود المجانية
4. **التحديثات**: احرص على تحديث قواعد الأمان عند إضافة ميزات جديدة

## 🆘 استكشاف الأخطاء

### خطأ في الصلاحيات:
- تأكد من قواعد Firestore
- تحقق من إعدادات Authentication
- راجع قائمة المديرين في الكود

### عدم ظهور لوحة الإدارة:
- تأكد من إضافة بريدك الإلكتروني لقائمة المديرين
- تحقق من تسجيل الدخول بالبريد الصحيح
- راجع console للأخطاء

---

**تم إنشاء هذا الدليل لمساعدتك في إعداد نظام إدارة متكامل وآمن لتطبيق Job Tracker**