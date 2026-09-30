# FAST MAN – UI Spec
**Brand:** #F97316 | **Platform:** React Native Android+iOS | **RTL Arabic + EN**

## Tokens
primary=#F97316 | bg=#F8FAFC | surface=#FFF | text=#0F172A | muted=#94A3B8 | border=#E2E8F0
success=#22C55E | warning=#F59E0B | danger=#EF4444 | info=#3B82F6 | gold=#F59E0B
Fonts: Cairo(AR) Inter(EN) | Tap-min:44px | Btn-h:48px | Radius:12-16px

---
## [AUTH] Login
Logo+tagline · Tabs: Courier(phone+pw) / Admin(email+pw) · Orange sign-in btn
3 demo pills: Courier/Admin/Dispatcher · Inline error state

## [COURIER] Home
Header: logo + theme-toggle + track-btn + lang-toggle
**CompanyHeader:** logo+name+tier-badge+switcher-chevron
**Vault Card:** "عهدة التحصيل" + gold 2,450ج + Remit-btn + SLA-99.2%-badge
**Status Banner:** greeting+vehicle · ONLINE/OFFLINE/BUSY badge · 56px toggle
**Push Banner:** bell → IncomingOrderPushModal
**Stats 2x2:** Orders · Completed · Pending · Earnings
**Delivery Card:** order#+status+GPS-preview+COD-bar+Navigate/Call+CTA
Empty: icon + "لا يوجد طلب نشط"

## [COURIER] Orders
Tabs: Active | Completed
Card: order# · package · status-badge · address · COD · chevron

## [COURIER] Delivery Execution (8 stages)
Topbar: back · order#+invoice · SOS-btn · status-badge
**SLA Banner:** "متبقي N دقيقة" + green tag
**Pipeline Pills (horizontal scroll, tap any stage):**
1.إسناد 2.قبول 3.توجه 4.وصلت-استلام 5.استلمت 6.طريق-عميل 7.وصلت-عميل 8.تسليم
**GPS Card:** route-anim + speedometer + ETA + battery
**Manifest Card:** weight-chip · Store-row(icon+name+addr+notes+call) · Customer-row · Ledger(subtotal+fee+VAT+COD) + calc-btn
**Stage Actions:**
- ASSIGNED → Accept(orange) + Reject(outline)
- COURIER_ACCEPTED → Navigate+Call + "بدء التحرك"(48px) + swipe
- GOING_TO_PICKUP → Navigate+Call + **"وصلت لنقطة الاستلام"**(orange 48px) + swipe
- ARRIVED_AT_PICKUP → **"تم استلام الشحنة"** + swipe(cyan)
- PICKED_UP → **"بدء التوجه للعميل"** + swipe
- OUT_FOR_DELIVERY → Navigate+Call + **"وصلت لموقع العميل"**(green) + swipe
- ARRIVED_AT_CUSTOMER → OTP-card(hint+autofill+4-digit-input) + COD-card(expected+actual+discrepancy) + SignaturePad + **"تأكيد التسليم"**(green 52px)
- DELIVERED → CheckCircle-52px + message + Home-btn

## [COURIER] Earnings
Balance card: total(28px gold)+breakdown · FlatList: order#+date+amount+Settled/Pending

## [COURIER] Profile
Avatar+name+role-badge · info rows(phone/email/vehicle) · theme+lang settings · Logout-btn

## [ADMIN] Dashboard
CompanyHeader + zone-filter-chips(scroll)
Telemetry card: active-count+SLA%+velocity+alerts
Stats 2x2: ActiveDeliveries · AvailCouriers · DeliveredToday · Revenue
5 recent orders + "تعيين لمندوب" btn · WebSocket auto-refresh

## [ADMIN] Couriers
Search + courier cards: avatar+name+status+phone+plate+call-btn

## [ADMIN] Orders
Search + filter-tabs(All/Pending/Active/Delivered/Cancelled) + left-bar status card + assignment-modal

## [ADMIN] Live Fleet
Courier list: name+status+battery+last-seen+call · Selected: GPS+speed+ETA+order#
Map: pins+polylines | WS: location_updated/online/offline

## [ADMIN] Reports
Tabs: Today/Week/Month · Metrics: orders/delivered/failed/revenue/avg-time · Chart areas

## [ADMIN] Companies (SaaS)
Company card: color-bar+name+plan-badge+status+stats+license-key(masked+copy)+actions(View/Suspend/Renew)
Add-modal: name+slug+email+plan+expiry+color
License-modal: mono-key+copy+share

## [PUBLIC] Track (/track – no login)
Search input + "تتبع الآن" btn + demo pills
Result: status-card(ETA+bar) + GPS-route + traffic-banner
Timeline: completed(icon+time) / current(pulsing) / future(muted)
Courier-card: name+plate+rating+call
OTP-card (at ARRIVED_AT_CUSTOMER): 4-digit mono
Invoice: subtotal+fee+VAT+print-btn
After DELIVERED: 5-star rating + tip-pills(5/10/20/50ج)

---
## Components
| Name | Key UI |
|---|---|
| IncomingOrderPushModal | Lock-screen overlay · order details · 30s ring · Accept/Reject |
| CustomerStatusPushToast | Slide-in-top 4s · status · brand-border |
| CompanyWorkspaceHeader | Logo+name+badge + switcher-sheet |
| SwipeStatusSlider | Animated fill track + thumb · tap or swipe |
| CodCalculatorModal | Amount received → auto change-due + exact-chip |
| CustomerSignaturePad | Finger canvas + clear + save + camera |
| EmergencySupportModal | 4 types + GPS alert to dispatch |
| GpsRouteSimulator | Route anim + speedometer + ETA + battery |
| Badge | 12 status variants |
| ThemeToggle | Sun/Moon 36px |

## Status Badge Colors (BG/Text)
NEW=#FEF3C7/#B45309 · ASSIGNED=#EDE9FE/#6D28D9 · ACCEPTED=#DBEAFE/#1D4ED8
GOING=#FFEDD5/#C2410C · AT_PICKUP=#CFFAFE/#0E7490 · PICKED_UP=#CFFAFE/#0E7490
OUT=#FFEDD5/#C2410C · AT_CUSTOMER=#DCFCE7/#15803D · DELIVERED=#DCFCE7/#15803D
FAILED/CANCELLED=#FEE2E2/#B91C1C

## Order Flow
NEW→ASSIGNED→ACCEPTED→GOING→ARRIVED_PICKUP→PICKED_UP→OUT→ARRIVED_CUSTOMER→DELIVERED
Any→FAILED→RETURN_REQUESTED→RETURNING→RETURNED | Any→CANCELLED

## Roles
SUPER_ADMIN:all · ADMIN:company · DISPATCHER:assign+track · COURIER:delivery · CUSTOMER:tracking

##

