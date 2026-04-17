# DesignOps — Proje Dokümantasyonu

> Son güncelleme: 2026-04-16

---

## İçindekiler

1. [Proje Özeti ve Amaç](#1-proje-özeti-ve-amaç)
2. [Tech Stack ve Bağımlılıklar](#2-tech-stack-ve-bağımlılıklar)
3. [Klasör Yapısı](#3-klasör-yapısı)
4. [Veritabanı Şeması](#4-veritabanı-şeması)
5. [Kimlik Doğrulama Akışı](#5-kimlik-doğrulama-akışı)
6. [Temel Özellikler ve Modüller](#6-temel-özellikler-ve-modüller)
7. [Ortam Değişkenleri](#7-ortam-değişkenleri)
8. [API Route'ları](#8-api-routeları)
9. [Sayfalar ve Bileşenler](#9-sayfalar-ve-bileşenler)
10. [Gerçek Zamanlı Mimari](#10-gerçek-zamanlı-mimari)
11. [AI Entegrasyonu](#11-ai-entegrasyonu)
12. [Deployment](#12-deployment)
13. [Bilinen Sorunlar ve Yapılacaklar](#13-bilinen-sorunlar-ve-yapılacaklar)

---

## 1. Proje Özeti ve Amaç

**DesignOps**, müşteriler (proje yöneticileri), tasarımcılar ve organizasyon yöneticileri arasındaki tasarım iş akışlarını düzenleyen çok kiracılı (multi-tenant) bir SaaS platformdur. Görev yönetimi, gerçek zamanlı işbirliği, marka yönetimi, yapay zeka destekli brief analizi ve faturalandırmayı tek bir üründe bir araya getirir.

**Temel değer önerisi:**
- Müşteriler, zengin brief'lerle tasarım talepleri gönderir; yapay zeka bunları otomatik olarak puanlar ve iyileştirir.
- Tasarımcılar, otomatik atanan işlerini alır, canlı güncellemelerle Kanban panosunda takip eder ve çıktıları yükler.
- Yöneticiler, ekibi, markaları, faturalandırmayı ve analitiği dashboard üzerinden yönetir.

Uygulama **Türkçe** arayüzle inşa edilmiştir ve tasarım ajanslarını veya kurum içi tasarım ekiplerini hedefler.

**Durum:** Temel özellikleri çalışan, erken aşamada bir ürün. Stripe faturalandırması ve bazı bildirim tercihleri henüz tamamlanmamış.

---

## 2. Tech Stack ve Bağımlılıklar

### Runtime

| Katman      | Teknoloji                                  |
|-------------|---------------------------------------------|
| Framework   | Next.js 16.2.3 (App Router, Turbopack)     |
| Dil         | TypeScript 5 (strict mode)                  |
| Runtime     | Node.js (server components + API routes)   |
| Styling     | Tailwind CSS v4 + shadcn/ui v4             |

### Temel Kütüphaneler

| Kategori        | Kütüphane                                         | Amaç                                          |
|-----------------|---------------------------------------------------|-----------------------------------------------|
| Veritabanı/Auth | `@supabase/supabase-js`, `@supabase/ssr`          | Supabase istemcisi (browser + server + admin) |
| State/Data      | `@tanstack/react-query` v5                        | Sunucu durumu önbellekleme ve mutasyonlar     |
| Formlar         | `react-hook-form` + `@hookform/resolvers` + `zod` | Form yönetimi ve doğrulama                    |
| Sürükle-Bırak   | `@dnd-kit/core`, `@dnd-kit/sortable`              | Kanban sürükle-bırak                          |
| AI              | `openai` SDK (Groq endpoint ile)                  | LLaMA modelleri — brief analizi, öneriler     |
| Animasyon       | `framer-motion` v12                               | UI animasyonları                              |
| Grafikler       | `recharts`                                        | Dashboard analitiği                           |
| Dosya Yükleme   | `react-dropzone`                                  | Dosya yükleme UI                              |
| Bildirimler     | `sonner`                                          | Toast bildirimleri                            |
| Faturalandırma  | `stripe`                                          | Ödeme işleme (kısmen uygulandı)               |
| E-posta         | `resend`                                          | İşlemsel e-posta                              |
| UI Primitives   | `@radix-ui/*`, `@base-ui/react`, `cmdk`           | Erişilebilir UI bileşenleri                   |
| Fontlar         | Bricolage Grotesque, Instrument Sans, JetBrains Mono | Google Fonts via next/font               |
| Tarih           | `date-fns` v4                                     | Tarih formatlama ve manipülasyon              |

### Geliştirici Bağımlılıkları

- ESLint 9 + `eslint-config-next`
- `@tailwindcss/postcss`
- TypeScript strict mode

---

## 3. Klasör Yapısı

```
designops/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (fontlar, ThemeProvider, Toaster)
│   ├── globals.css                   # Global Tailwind stilleri
│   ├── Providers.tsx                 # Uygulama genelinde provider'lar
│   │
│   ├── (marketing)/                  # Herkese açık pazarlama sayfaları (auth gerekmez)
│   │   ├── layout.tsx                # Pazarlama layout (navbar + footer)
│   │   ├── page.tsx                  # Landing sayfası
│   │   ├── about/page.tsx            # Hakkında sayfası
│   │   ├── pricing/page.tsx          # Fiyatlandırma sayfası
│   │   ├── privacy/page.tsx          # Gizlilik politikası
│   │   └── terms/page.tsx            # Kullanım şartları
│   │
│   ├── (auth)/                       # Kimlik doğrulama sayfaları
│   │   ├── layout.tsx                # Auth layout (tam ekran)
│   │   ├── login/page.tsx            # Giriş formu
│   │   ├── signup/page.tsx           # Kayıt (org + yönetici kullanıcı oluşturur)
│   │   ├── forgot-password/page.tsx  # Şifre sıfırlama
│   │   ├── invite/[token]/page.tsx   # Davet kabul sayfası
│   │   └── pending/page.tsx          # Yönetici onayı bekleme ekranı
│   │
│   ├── (onboarding)/                 # Yeni organizasyon kurulumu (kayıt sonrası)
│   │   ├── onboarding/page.tsx       # Ana kurulum sihirbazı
│   │   ├── create-organization/page.tsx
│   │   ├── join/page.tsx
│   │   └── role/page.tsx
│   │
│   ├── (app)/                        # Korumalı uygulama sayfaları
│   │   ├── layout.tsx                # Auth guard + sidebar + topbar kabuğu
│   │   ├── dashboard/page.tsx        # Analitik dashboard (yönetici only)
│   │   ├── requests/
│   │   │   ├── page.tsx              # Talep listesi (filtreli)
│   │   │   ├── new/page.tsx          # Yeni talep formu
│   │   │   └── [id]/page.tsx         # Talep detayı (yorumlar, dosyalar, AI paneli)
│   │   ├── kanban/page.tsx           # Gerçek zamanlı Kanban panosu
│   │   ├── brands/
│   │   │   ├── page.tsx              # Marka kütüphanesi listesi
│   │   │   ├── new/page.tsx          # Marka oluştur
│   │   │   └── [id]/page.tsx         # Marka detayı
│   │   ├── team/page.tsx             # Ekip yönetimi (davet, onayla, rol değiştir)
│   │   ├── archive/page.tsx          # Tamamlanan/iptal edilen talepler
│   │   ├── notifications/page.tsx    # Tüm bildirimler
│   │   └── settings/
│   │       ├── page.tsx              # Ayarlar genel bakış
│   │       ├── profile/page.tsx      # Profil ayarları
│   │       ├── organization/page.tsx # Organizasyon ayarları
│   │       ├── notifications/page.tsx # Bildirim tercihleri
│   │       └── billing/page.tsx      # Stripe faturalandırma (stub)
│   │
│   └── api/                          # API Route'ları (21 endpoint)
│       ├── auth/
│       │   ├── callback/route.ts     # OAuth / magic-link kod değişimi
│       │   ├── register/route.ts     # Kullanıcı kaydı
│       │   └── check-email/route.ts  # E-posta kullanılabilirlik kontrolü
│       ├── requests/
│       │   ├── route.ts              # GET (liste), POST (oluştur)
│       │   ├── [id]/route.ts         # GET, PATCH, DELETE
│       │   └── [id]/status/route.ts  # PATCH (durum geçişi)
│       ├── invitations/
│       │   ├── route.ts              # POST (oluştur + e-posta gönder)
│       │   ├── [token]/route.ts      # GET (token doğrula)
│       │   └── [token]/accept/route.ts # POST (daveti kabul et)
│       ├── team/
│       │   ├── [userId]/approve/route.ts
│       │   ├── [userId]/reject/route.ts
│       │   └── [userId]/role/route.ts
│       ├── ai/
│       │   ├── analyze-brief/route.ts
│       │   ├── design-suggestion/route.ts
│       │   └── revision-translate/route.ts
│       ├── notifications/mark-read/route.ts
│       ├── upload/sign/route.ts      # İmzalı Supabase Storage URL'leri
│       ├── organizations/
│       │   ├── route.ts              # POST (org oluştur)
│       │   └── rename/route.ts       # PATCH (org yeniden adlandır)
│       ├── account/delete/route.ts   # Hesap silme
│       └── join-requests/route.ts    # Katılma istekleri
│
├── components/                       # 75+ bileşen dosyası
│   ├── ui/                           # shadcn/ui primitives + özel atomlar
│   ├── layout/                       # AppSidebar, AppTopbar, NotificationBell
│   ├── requests/                     # Talep özel bileşenler
│   ├── kanban/                       # KanbanBoard, KanbanColumn, KanbanCard
│   ├── comments/                     # Yuvalanmış yorum sistemi (gerçek zamanlı)
│   ├── files/                        # FileUploadZone, FileList
│   ├── ai/                           # BriefAIPanel
│   ├── dashboard/                    # RequestsByTypeChart, PeriodSelector
│   ├── team/                         # InviteTeamMember, ApproveUserButton, RejectUserButton
│   ├── billing/                      # Faturalandırma bileşenleri (stub)
│   └── QueryProvider.tsx             # TanStack Query kurulumu
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase istemcisi
│   │   ├── server.ts                 # Sunucu Supabase istemcisi + admin istemci (RLS bypass)
│   │   ├── middleware.ts             # Oturum yenileme yardımcısı
│   │   └── queries/
│   │       ├── requests.ts           # Talep sorgu yardımcıları
│   │       ├── users.ts              # Kullanıcı sorgu yardımcıları
│   │       └── analytics.ts          # Dashboard veri sorguları
│   ├── ai/
│   │   ├── client.ts                 # Groq singleton (openai SDK ile)
│   │   ├── analyze-brief.ts          # Brief analiz orkestratörü
│   │   └── prompts/
│   │       ├── brief-analysis.ts
│   │       ├── design-suggestion.ts
│   │       └── revision-translation.ts
│   ├── stripe/                       # Stripe yardımcıları (planlandı, boş)
│   ├── validations/
│   │   └── request.ts                # Talep oluşturma için Zod şeması
│   ├── email.ts                      # Resend e-posta yardımcıları
│   └── utils.ts                      # cn(), castRows(), castRow(), getInitials()
│
├── types/
│   └── database.ts                   # El yazısıyla Supabase tip tanımları
│
├── supabase/
│   ├── migrations/                   # SQL migration dosyaları (Supabase SQL Editor'de çalıştır)
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_indexes.sql
│   │   ├── 004_functions.sql
│   │   ├── 005_realtime.sql
│   │   ├── 006_enhancements.sql
│   │   ├── 007_fix_notifications.sql
│   │   ├── 008_single_org.sql
│   │   ├── 009_add_soft_delete.sql
│   │   ├── 010_onboarding_flow.sql
│   │   ├── 011_join_request_notifications_and_org_rename.sql
│   │   ├── 012_fix_self_notifications.sql
│   │   └── 013_delete_account_rpc.sql
│   ├── seed.sql                      # Opsiyonel test verisi
│   └── test_users.sql
│
├── hooks/                            # Özel React hook'ları
├── public/                           # Statik varlıklar, logolar
├── next.config.ts                    # Turbopack yapılandırması
├── tsconfig.json                     # TypeScript strict mode
├── components.json                   # shadcn/ui yapılandırması
└── CLAUDE.md                         # AI asistan talimatları
```

---

## 4. Veritabanı Şeması

Supabase (PostgreSQL) tarafından yönetilir. Tipler `types/database.ts` içinde el yazısıyla oluşturulmuştur.

### Tablolar

| Tablo                    | Açıklama                                                                                              |
|--------------------------|-------------------------------------------------------------------------------------------------------|
| `organizations`          | Multi-tenant kök. Plan, Stripe ID'leri, AI kredi limitleri, depolama limitleri.                       |
| `users`                  | Org'a bağlı uygulama kullanıcıları. Roller: `admin`, `designer`, `client`. Durumlar: `active`, `invited`, `suspended`, `deactivated`. |
| `invitations`            | HMAC token, son kullanma tarihi ve kabul zaman damgasıyla e-posta davetleri.                          |
| `brands`                 | Org başına marka profilleri: renkler, fontlar, logo, yönergeler, ses tonu.                            |
| `requests`               | Tasarım talepleri. Durum makinesi, öncelik, AI brief puanı, revizyon sayısı, zaman takibi.            |
| `request_status_history` | Değişmez durum geçiş günlüğü (yalnızca ekleme).                                                      |
| `comments`               | Taleplerdeki yorumlar. Türler: `general`, `revision_request`, `approval`, `rejection`, `ai_suggestion`. Dahili ve çözümlendi bayraklarını destekler. |
| `files`                  | Sürüm oluşturma, `file_type` enum ve Supabase Storage yolu referansıyla yüklenen dosyalar.            |
| `notifications`          | `read_at` zaman damgasıyla kullanıcı başına bildirimler.                                              |
| `ai_requests`            | Her AI API çağrısı için denetim günlüğü (token'lar, gecikme, durum, geri bildirim).                  |
| `time_logs`              | Talep başına tasarımcı zaman takibi.                                                                  |
| `audit_logs`             | Oluşturma/güncelleme/silme/giriş/durum değişikliği olayları için tam denetim izi.                    |

### Enum Türleri

| Enum                   | Değerler                                                                                                              |
|------------------------|-----------------------------------------------------------------------------------------------------------------------|
| `UserRole`             | `admin`, `designer`, `client`                                                                                         |
| `UserStatus`           | `active`, `invited`, `suspended`, `deactivated`                                                                       |
| `OrgPlan`              | `free`, `pro`, `enterprise`                                                                                           |
| `SubscriptionStatus`   | `trialing`, `active`, `past_due`, `canceled`, `incomplete`                                                            |
| `RequestType`          | `social_post`, `banner`, `logo`, `video`, `presentation`, `email_template`, `brochure`, `infographic`, `other`        |
| `RequestStatus`        | `new`, `brief_review`, `design`, `revision`, `approval`, `completed`, `archived`, `cancelled`                         |
| `RequestPriority`      | `low`, `medium`, `high`, `urgent`                                                                                     |
| `CommentType`          | `general`, `revision_request`, `approval`, `rejection`, `ai_suggestion`                                               |
| `FileType`             | `logo`, `image`, `pdf`, `font`, `guideline`, `design_output`, `ai_generated`, `other`                                 |
| `NotificationType`     | `request_assigned`, `status_changed`, `comment_added`, `revision_requested`, `approved`, `mention`, `deadline_reminder` |
| `AIFeature`            | `brief_analysis`, `design_suggestion`, `moodboard`, `revision_suggestion`, `brand_check`                             |

### Veritabanı Fonksiyonları (RPC'ler)

| Fonksiyon                                             | Amaç                                                |
|-------------------------------------------------------|-----------------------------------------------------|
| `get_dashboard_stats(p_org_id)`                       | Dashboard için toplu istatistikler                  |
| `get_requests_by_type(p_org_id, p_days?)`             | Türe göre gruplandırılmış talep sayıları            |
| `get_designer_workload(p_org_id)`                     | Tasarımcı başına aktif talep sayıları               |
| `get_avg_delivery_time(p_org_id)`                     | `new` → `completed` ortalama süresi (saat)          |
| `transition_request_status(p_request_id, p_new_status, p_note?)` | Atomik durum değişikliği + geçmiş kaydı  |
| `check_and_consume_ai_credit(p_org_id)`               | Kredi mevcutsa `true` döner ve azaltır              |
| `delete_account(p_user_id)`                           | Kullanıcı hesabını ve ilgili verileri siler         |

### RLS Yardımcıları (public şema)

`public.org_id()`, `public.is_admin()`, `public.is_designer_or_admin()` — `auth.*` şema fonksiyonları yerine RLS politikalarında kullanılır.

---

## 5. Kimlik Doğrulama Akışı

### 5.1 Kullanıcı Kimlik Doğrulama (Supabase Auth)

```
Kullanıcı /login'i ziyaret eder
  → Supabase Auth ile e-posta + şifre girişi
  → Oturum çerezi verilir

OAuth / magic link
  → GET /api/auth/callback?code=...
  → Supabase kodu oturum ile değiştirir
  → /dashboard'a yönlendir

Route koruması ((app)/layout.tsx — sunucu tarafı guard):
  1. getUser() — 401 → /login'e yönlendir
  2. users satırı alınır → bulunamadı + org mevcut → /login?error=unregistered
  3. Bulunamadı + org yok → /onboarding'e yönlendir
  4. status === 'invited' → /pending'e yönlendir
  5. status === 'suspended' | 'deactivated' → /login'e yönlendir
```

### 5.2 Onboarding Akışı

```
Yeni kullanıcı /signup'ı ziyaret eder
  → Rol seçimi (admin olarak başla / org'a katıl)
  → Organizasyon oluştur veya katılma isteği gönder
  → POST /api/organizations (org + yönetici kullanıcı oluşturur)
  → /dashboard'a yönlendir
```

### 5.3 Davet Akışı

```
Yönetici /team üzerinden e-posta davet eder
  → POST /api/invitations (davetler satırı oluşturur + Resend ile e-posta gönderir)
  → Davet edilen kişi linki alır: /invite/[token]
  → GET /api/invitations/[token] — token'ı doğrular, org/rol bilgisini döner
  → Kullanıcı ad + şifre doldurur
  → POST /api/invitations/[token]/accept — Supabase auth kullanıcısı + users satırı oluşturur (status: 'invited')
  → /pending'e yönlendir (yönetici onayı bekle)
  → Yönetici ekip sayfasından onaylar → POST /api/team/[userId]/approve → status: 'active'
```

---

## 6. Temel Özellikler ve Modüller

### 6.1 Talep Yaşam Döngüsü

- Müşteriler, başlık, tür, marka, öncelik, son tarih, açıklama ve etiketlerle talep oluşturur (`/requests/new`).
- Oluşturma sırasında: en az meşgul tasarımcıya otomatik atanır, asenkron AI brief analizi tetiklenir (engelleyici değil).
- Ücretsiz plan `monthly_request_limit` uygular (varsayılan: 10).
- **Durum makinesi:** `new` → `brief_review` → `design` → `revision` → `approval` → `completed`
- Arşivleme ve iptal dalları mevcuttur.
- Her geçiş `request_status_history`'ye kaydedilir ve veritabanı bildirimleri tetikler.

### 6.2 Kanban Panosu

- Supabase Realtime (`requests` tablosunda `postgres_changes`) ile desteklenen gerçek zamanlı pano.
- `@dnd-kit` aracılığıyla sürükle-bırak. Aktif sürükleme sırasındaki güncellemeler kuyruğa alınır, bırakıldığında boşaltılır.
- Canlı bağlantı durumu göstergesi (yeşil/sarı/kırmızı nokta).
- Rol bazlı: müşteriler durumu güncelleyemez.

### 6.3 Marka Yönetimi

- Organizasyonlar renk paleti, fontlar, logo, yönergeler ve ses tonu içeren marka kütüphanesi tutar.
- Markalar taleplere eklenebilir; AI analizi marka bağlamını kullanır.

### 6.4 Dosya Yüklemeleri

- İmzalı URL deseni: `POST /api/upload/sign` → sunucu imzalı Supabase Storage URL'si döner → istemci doğrudan yükler.
- Meta veriler yüklemeden sonra `files` tablosunda saklanır.
- `version` + `parent_file_id` aracılığıyla sürüm oluşturma desteklenir.

### 6.5 Yorumlar ve İşbirliği

- Taleplerde yuvalanmış yorumlar.
- Yorum türleri: `general`, `revision_request`, `approval`, `rejection`, `ai_suggestion`.
- Dahili notlar + çözümlendi bayrakları desteklenir.
- Gerçek zamanlı güncellemeler.

### 6.6 Bildirimler

- Veritabanı seviyesinde trigger'lar, temel olaylarda (yeni atama, durum değişikliği vb.) otomatik bildirim oluşturur.
- Supabase Realtime kanalı abonelikleri aracılığıyla `NotificationBell` içinde gerçek zamanlı teslimat.
- `POST /api/notifications/mark-read` bir veya tüm bildirimleri okundu olarak işaretler.

### 6.7 Analitik Dashboard

- Toplu veri için Supabase RPC fonksiyonları.
- Recharts görselleştirmeleri: türe göre talepler, tasarımcı iş yükü, ortalama teslimat süresi.
- Dönem seçici (günlük, haftalık, aylık, yıllık, tümü).

### 6.8 Ekip Yönetimi

- Yöneticiler belirli bir rolle e-posta ile kullanıcı davet eder.
- Davet edilen kullanıcılar onaylanana kadar "Bekleyen Onaylar" bölümünde görünür.
- Rol değişikliği: `PATCH /api/team/[userId]/role`.
- Kullanıcı reddetme: `POST /api/team/[userId]/reject`.

---

## 7. Ortam Değişkenleri

Proje kökünde `.env.local` oluşturun:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# AI (Groq — openai SDK uyumlu endpoint)
GROQ_API_KEY=<groq-api-key>

# Uygulama URL'si
NEXT_PUBLIC_APP_URL=http://localhost:3000

# E-posta (Resend)
RESEND_API_KEY=<resend-api-key>
EMAIL_FROM=noreply@<domain>

# Stripe (henüz uygulanmadı)
STRIPE_SECRET_KEY=<stripe-secret-key>
STRIPE_PUBLISHABLE_KEY=<stripe-publishable-key>
STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>
STRIPE_PRICE_PRO=<price-id>
STRIPE_PRICE_ENTERPRISE=<price-id>
```

> **Not:** `NEXT_PUBLIC_SUPABASE_URL` geçerli bir HTTP URL'si değilse, Supabase istemcisi placeholder'a geri düşer ve auth kontrolleri atlanır.

---

## 8. API Route'ları

### Kimlik Doğrulama

| Metod | Yol                        | Açıklama                                      |
|-------|----------------------------|-----------------------------------------------|
| GET   | `/api/auth/callback`       | OAuth / magic-link kod değişimi               |
| POST  | `/api/auth/register`       | Yeni kullanıcı kaydı (onboarding sırasında)   |
| GET   | `/api/auth/check-email`    | E-posta kullanılabilirlik kontrolü            |

### Organizasyonlar

| Metod | Yol                          | Açıklama                                   |
|-------|------------------------------|--------------------------------------------|
| POST  | `/api/organizations`         | Organizasyon + yönetici kullanıcı oluştur  |
| PATCH | `/api/organizations/rename`  | Organizasyonu yeniden adlandır             |

### Talepler

| Metod  | Yol                           | Açıklama                                             |
|--------|-------------------------------|------------------------------------------------------|
| GET    | `/api/requests`               | Talepleri listele (duruma, atanana göre filtrele)    |
| POST   | `/api/requests`               | Talep oluştur (otomatik atama, AI brief, plan limiti)|
| GET    | `/api/requests/[id]`          | İlişkilerle tek talep al                             |
| PATCH  | `/api/requests/[id]`          | Talebi güncelle                                      |
| DELETE | `/api/requests/[id]`          | Talebi sil                                           |
| PATCH  | `/api/requests/[id]/status`   | Talep durumunu geçir                                 |

### Davetler

| Metod | Yol                               | Açıklama                            |
|-------|-----------------------------------|-------------------------------------|
| POST  | `/api/invitations`                | Davet e-postası gönder              |
| GET   | `/api/invitations/[token]`        | Token doğrula, davet detaylarını al |
| POST  | `/api/invitations/[token]/accept` | Daveti kabul et, kullanıcı oluştur  |

### Ekip

| Metod | Yol                           | Açıklama                       |
|-------|-------------------------------|--------------------------------|
| POST  | `/api/team/[userId]/approve`  | Davet edilen kullanıcıyı onayla|
| POST  | `/api/team/[userId]/reject`   | Katılma isteğini reddet        |
| PATCH | `/api/team/[userId]/role`     | Kullanıcı rolünü değiştir      |

### Bildirimler

| Metod | Yol                             | Açıklama                        |
|-------|---------------------------------|---------------------------------|
| POST  | `/api/notifications/mark-read`  | Bildirimleri okundu olarak işaretle |

### Dosya Yükleme

| Metod | Yol               | Açıklama                                   |
|-------|-------------------|--------------------------------------------|
| POST  | `/api/upload/sign` | İmzalı Supabase Storage yükleme URL'si al |

### AI

| Metod | Yol                           | Açıklama                                 |
|-------|-------------------------------|------------------------------------------|
| POST  | `/api/ai/analyze-brief`       | AI brief kalite analizi çalıştır         |
| POST  | `/api/ai/design-suggestion`   | AI tasarım önerileri al                  |
| POST  | `/api/ai/revision-translate`  | Revizyon yorumlarını tasarım yönüne çevir|

### Hesap & Diğer

| Metod  | Yol                    | Açıklama               |
|--------|------------------------|------------------------|
| DELETE | `/api/account/delete`  | Kendi hesabını sil     |
| POST   | `/api/join-requests`   | Org'a katılma isteği   |

---

## 9. Sayfalar ve Bileşenler

### Sayfalar

| Yol                            | Açıklama                              | Rol           |
|--------------------------------|---------------------------------------|---------------|
| `/`                            | Pazarlama landing sayfası             | Herkese açık  |
| `/about`, `/pricing`, `/privacy`, `/terms` | Pazarlama sayfaları       | Herkese açık  |
| `/login`                       | E-posta/şifre girişi                  | Misafir       |
| `/signup`                      | Kayıt formu                           | Misafir       |
| `/forgot-password`             | Şifre sıfırlama                       | Misafir       |
| `/invite/[token]`              | Davet kabul sayfası                   | Misafir       |
| `/pending`                     | Yönetici onayı bekleniyor             | Davetli       |
| `/onboarding/role`             | Rol seçimi adımı                      | Yeni kullanıcı|
| `/onboarding/create-organization` | Org oluşturma adımı              | Yeni kullanıcı|
| `/onboarding/join`             | Org'a katılma adımı                   | Yeni kullanıcı|
| `/dashboard`                   | Analitik dashboard                    | Admin         |
| `/requests`                    | Talep listesi                         | Tümü          |
| `/requests/new`                | Yeni talep formu                      | Client/Admin  |
| `/requests/[id]`               | Talep detay sayfası                   | Tümü          |
| `/kanban`                      | Gerçek zamanlı Kanban panosu          | Tümü          |
| `/brands`                      | Marka kütüphanesi                     | Tümü          |
| `/brands/new`                  | Marka oluştur                         | Admin         |
| `/brands/[id]`                 | Marka detayı                          | Tümü          |
| `/team`                        | Ekip yönetimi                         | Admin         |
| `/archive`                     | Arşivlenmiş talepler                  | Tümü          |
| `/notifications`               | Bildirimler merkezi                   | Tümü          |
| `/settings/profile`            | Profil ayarları                       | Tümü          |
| `/settings/organization`       | Organizasyon ayarları                 | Admin         |
| `/settings/notifications`      | Bildirim tercihleri                   | Tümü          |
| `/settings/billing`            | Stripe faturalandırma (stub)          | Admin         |

### Önemli Bileşenler

| Bileşen              | Konum                         | Açıklama                                        |
|----------------------|-------------------------------|-------------------------------------------------|
| `ModernSidebar`      | `components/layout/`          | Navigasyon kenar çubuğu                         |
| `AppTopbar`          | `components/layout/`          | Başlık ile kullanıcı menüsü                     |
| `NotificationBell`   | `components/layout/`          | Gerçek zamanlı bildirim UI                      |
| `KanbanBoard`        | `components/kanban/`          | Sürükle-bırak talep panosu                      |
| `KanbanColumn`       | `components/kanban/`          | Tek durum sütunu                                |
| `KanbanCard`         | `components/kanban/`          | Sürüklenebilir talep kartı                      |
| `BriefAIPanel`       | `components/ai/`              | AI analiz sonuçları paneli                      |
| `CommentThread`      | `components/comments/`        | Yuvalanmış yorum tartışması                     |
| `FileUploadZone`     | `components/files/`           | Dosya yükleme dropzone                          |
| `InviteTeamMember`   | `components/team/`            | E-posta davet formu                             |
| `ApproveUserButton`  | `components/team/`            | Kullanıcı onaylama eylemi                       |
| `RejectUserButton`   | `components/team/`            | Kullanıcı reddetme eylemi                       |
| `RequestsByTypeChart`| `components/dashboard/`       | Recharts analitik grafiği                       |
| `PeriodSelector`     | `components/dashboard/`       | Analitik dönem filtresi                         |
| `QueryProvider`      | `components/`                 | TanStack Query kurulumu                         |

---

## 10. Gerçek Zamanlı Mimari

Uygulama gerçek zamanlı işlevler için Supabase Realtime kullanır:

### Kanallar

| Kanal                | Tablo        | Olaylar          | Kullanım                        |
|----------------------|--------------|------------------|---------------------------------|
| `requests-realtime`  | `requests`   | INSERT, UPDATE   | Kanban pano canlı güncellemeleri|
| `notifications-*`    | `notifications` | INSERT        | NotificationBell canlı sayaç    |
| `comments-*`         | `comments`   | INSERT, UPDATE   | Yorum thread canlı güncellemeleri |

### Sürükle-Bırak + Realtime Senkronizasyonu

Kullanıcı bir Kanban kartını sürüklediğinde:
1. Gelen Realtime güncellemeleri kuyruğa alınır (görüntü donmaz).
2. Kullanıcı bıraktığında `PATCH /api/requests/[id]/status` çağrılır.
3. Kuyruklanmış güncellemeler boşaltılır ve uygulanır.

---

## 11. AI Entegrasyonu

### Sağlayıcı: Groq (OpenAI SDK uyumlu)

`lib/ai/client.ts` — OpenAI SDK `baseURL` Groq endpoint'e yönlendirilmiş Groq singleton istemcisini yönetir.

```typescript
// Kullanılan model'ler
const SMART_MODEL = "llama-3.3-70b-versatile";  // Kompleks analiz için
const FAST_MODEL  = "llama-3.1-8b-instant";      // Hızlı yanıtlar için
```

### AI Özellikleri

| Özellik               | Route                          | Model        | Açıklama                                              |
|-----------------------|--------------------------------|--------------|-------------------------------------------------------|
| Brief Analizi         | `POST /api/ai/analyze-brief`   | Smart (70B)  | Brief puanlama (0-100), boşlukları tespit et, iyileştir |
| Tasarım Önerisi       | `POST /api/ai/design-suggestion` | Smart (70B) | Renk paleti, font, layout önerileri                  |
| Revizyon Çevirisi     | `POST /api/ai/revision-translate` | Fast (8B)  | Revizyon yorumlarını tasarım yönüne çevir             |

### AI Kredi Sistemi

- Her org'un `ai_credits_remaining` sayacı vardır.
- AI çağrısı öncesinde `check_and_consume_ai_credit(p_org_id)` RPC çalışır.
- Kredi kalmadıysa istek reddedilir.
- Tüm AI çağrıları `ai_requests` tablosuna kaydedilir (token, gecikme, durum, geri bildirim).

### Prompt'lar

```
lib/ai/prompts/
├── brief-analysis.ts       # Brief kalite değerlendirme talimatları
├── design-suggestion.ts    # Tasarım öneri talimatları
└── revision-translation.ts # Revizyon çeviri talimatları
```

---

## 12. Deployment

### Geliştirme

```bash
npm run dev       # Turbopack ile development server
npm run build     # Production build
npm run start     # Production server
npm run lint      # ESLint
```

### Vercel Deployment

Platform **Vercel** için optimize edilmiştir:
- `next/font` otomatik optimizasyon
- Sunucusuz uyumlu API route'ları
- Edge runtime uyumluluğu

### Supabase Kurulumu

Migration'lar otomatik çalıştırılmaz. Supabase Dashboard → SQL Editor üzerinden sırayla çalıştırın:

```
001_initial_schema.sql
002_rls_policies.sql
003_indexes.sql
004_functions.sql
005_realtime.sql
006_enhancements.sql
007_fix_notifications.sql
008_single_org.sql
009_add_soft_delete.sql
010_onboarding_flow.sql
011_join_request_notifications_and_org_rename.sql
012_fix_self_notifications.sql
013_delete_account_rpc.sql
```

**Zorunlu Supabase Yapılandırması:**
- Authentication → Providers → Email → "Confirm email" → **KAPALI**
- Realtime → aktifleştirilmeli (`requests`, `notifications`, `comments` tabloları için)

---

## 13. Bilinen Sorunlar ve Yapılacaklar

### Tamamlanmamış Özellikler

| Özellik                     | Durum        | Notlar                                                                      |
|-----------------------------|--------------|-----------------------------------------------------------------------------|
| Stripe Faturalandırma        | Stub         | `lib/stripe/` boş. Fiyat listesi, yükseltme akışı, webhook handler eksik.  |
| Bildirim Tercihleri API     | UI mevcut    | `settings/notifications/page.tsx` var ama backend API henüz yok.            |
| E-posta Otomasyonu (n8n)    | Planlandı    | Kurulmadı.                                                                  |
| Seed Verisi                 | Opsiyonel    | `supabase/seed.sql` henüz çalıştırılmadı.                                   |

### Teknik Borç

| Konu                                | Açıklama                                                                                       |
|-------------------------------------|------------------------------------------------------------------------------------------------|
| Tiplenmemiş Supabase istemcisi      | `types/database.ts` el yazısıyla; `supabase gen types typescript` kullanılmalı.               |
| Cast desenleri                      | Tiplenmemiş istemci nedeniyle `as unknown as Type` kullanımı yaygın.                           |
| shadcn/ui v4 uyumsuzluğu           | `Button asChild` prop'u yok. Çözüm: `buttonVariants()` + `<Link>` wrapper.                    |
| AI model açıklaması                 | Bazı eski yorumlar "Gemini" diyor ama gerçek implementasyon Groq/LLaMA kullanıyor.             |

### Yapılandırma Gereksinimleri

- **Supabase Email Onayı** — Supabase Dashboard'da devre dışı bırakılmalı. Açıksa onboarding yönlendirmeleri başarısız olur.
- **GROQ_API_KEY** — Yeterli kota olmalı; kredi biterse AI özellikleri sessizce atlanır.
- **STRIPE_* anahtarları** — Eklenene kadar faturalandırma devre dışı.
