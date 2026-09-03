# @hst/contracts

Shared enum / permission key / error code / DTO type ระหว่าง `hst-api` และ `hst-web`
สร้างขึ้นตาม **[ADR-001](../docs/90-workspace/DECISIONS.md)** เพื่อกันปัญหา enum ไม่ตรงกันระหว่าง repo
ซึ่งเอกสารระบุไว้ว่าเป็น "จุดตายของระบบนี้"

## กฎการใช้งาน

1. **enum สถานะทุกตัวต้อง import จาก package นี้เท่านั้น** — ห้ามประกาศซ้ำใน repo ปลายทาง
2. การแก้ค่าใด ๆ ในนี้ ต้องแก้เอกสารต้นทางใน `docs/10-domain/` ก่อนเสมอ (กฎเหล็กข้อ 3 ของ CLAUDE.md)
3. ห้ามใส่ business logic ที่ต้องพึ่ง DB / network — package นี้เป็น pure TypeScript

## เนื้อหา

| ไฟล์ | เนื้อหา | เอกสารต้นทาง |
|---|---|---|
| `enums/order.ts` | `OrderStatus` (10) · `AssignmentStatus` (4) · `AssignmentRole` (3) · transition table | DOM-02 |
| `enums/equipment.ts` | `EquipmentLocationStatus` (5) · `AccountStatus` · แมป order→equipment | DOM-04 §4.8, ADR-006 |
| `enums/profile.ts` | `Availability` · `LineLinkStatus` · `ServiceRequestStatus` · `AddressType` | DOM-02 §2.8, ADR-007 |
| `enums/line.ts` | `LineChannel` 3 channel | TEC-05 |
| `enums/audit.ts` | `AuditAction` | DOM-04 §4.7 |
| `enums/security.ts` | `PasswordPolicy` + เกณฑ์แต่ละระดับ | FT-01 |
| `permissions/` | `PermissionSubject` (12 เมนู) · `PermissionLevel` (3) · `satisfiesLevel()` | DOM-03 |
| `api/` | response envelope · error code · pagination · setting key | TEC-03, FT-11 |
| `ui/status-colors.ts` | สี hex ทุกสถานะ + `resolveDisplayOrderStatus()` (NO_ACTION derived) | DOM-02 §2.2, ADR-003 |

## Build

```bash
npm install
npm run build
```

## การใช้จาก repo อื่น (multi-repo — ADR-001)

**Local dev** — ทั้ง 3 repo ต้องอยู่ระดับเดียวกัน:

```
hst/
├── hst-contracts/
├── hst-api/
└── hst-web/
```

`hst-api` และ `hst-web` อ้างถึงด้วย `"@hst/contracts": "file:../hst-contracts"`

**CI / production** — ดู `SETUP-CHECKLIST.md` ของแต่ละ repo หัวข้อ "@hst/contracts"
(ต้องเลือกอย่างใดอย่างหนึ่ง: private npm registry, git URL + tag, หรือ GitHub Packages)
