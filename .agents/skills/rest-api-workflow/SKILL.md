---
name: rest-api-workflow
description: دليل ومعايير ونماذج الأكواد الجاهزة لتصميم وبناء واختبار واجهات الـ REST API الاحترافية والمستدامة في موديولات لارافيل (Routes, Requests, DTOs, Actions, Transformers, Responses, Filtering, Pagination, Error Handling, Testing).
---

# مهارة تصميم وتطوير واجهات برمجة التطبيقات (REST API Architecture & Workflow)

> **المرجع الشامل والعملي لتصميم وتطوير واجهات REST API نظيفة، قابلة للتنبؤ، متوافقة مع معايير الويب ومعمارية الموديولات في النظام.**

---

## 1. الفلسفة المعمارية للواجهات في النظام

تعتمد واجهات الـ API في هذا المشروع على مبدأ **التصميم الموجه للموارد (Resource-Oriented Architecture)** بالتكامل مع طبقات المعمارية الصارمة للمشروع:

```text
HTTP Request
    ↓
Routes (api.php)             ← توجيه الموارد بإصدار v1 وحماية sanctum
    ↓
Form Request                 ← التحقق من صحة المدخلات والصلاحيات (Validation & Auth)
    ↓
DTO (Data Transfer Object)   ← تغليف البيانات النظيفة في كائن ثابت (Immutable)
    ↓
Action (Domain Use-Case)     ← تنفيذ حالة الاستخدام وقواعد العمل وإدارة Transactions
    ↓
Transformer / Resource       ← تحويل الموديل/البيانات إلى حمولة الـ API الخارجية
    ↓
Standard ApiResponse         ← إرجاع الرد بهيكل موحد ورمز HTTP دلالي سليم
```

---

## 2. جدول القرارات السريعة لتصميم الروابط (Endpoint URI Matrix)

| العملية | الفعل | المسار (URI) | رمز النجاح | مثال الاستخدام |
|---|---|---|---|---|
| سرد مجموعة مفلترة ومصفحة | `GET` | `/api/v1/orders` | `200 OK` | قائمة الطلبات مع البحث والتصفح |
| جلب مورد مفرد | `GET` | `/api/v1/orders/{order}` | `200 OK` | تفاصيل طلب محدد |
| إنشاء مورد جديد | `POST` | `/api/v1/orders` | `201 Created` | إنشاء طلب جديد |
| استبدال المورد بالكامل | `PUT` | `/api/v1/orders/{order}` | `200 OK` | استبدال كامل بيانات الطلب |
| تعديل جزئي لمورد | `PATCH` | `/api/v1/orders/{order}` | `200 OK` | تعديل عنوان أو هاتف العميل فقط |
| حذف مورد | `DELETE` | `/api/v1/orders/{order}` | `204 No Content` | حذف طلب أو أرشفته |
| علاقة تابعة (مستوى واحد) | `GET` | `/api/v1/orders/{order}/items` | `200 OK` | جلب عناصر طلب محدد |
| إضافة عنصر لعلاقة تابعة | `POST` | `/api/v1/orders/{order}/items` | `201 Created` | إضافة عنصر إلى طلب محدد |
| أمر عملي / تغيير حالة | `POST` | `/api/v1/orders/{order}/cancel` | `200 OK` | إلغاء الطلب عبر مسار أمر فرعي |
| تغيير حالة عبر حقل الحالة | `PATCH` | `/api/v1/orders/{order}/status` | `200 OK` | تحديث الحالة مع سبب التغيير |

---

## 3. خطة العمل المنهجية خطوة بخطوة (Step-by-Step Implementation Workflow)

---

### الخطوة 1: تعريف المسارات في `Modules/{ModuleName}/routes/api.php`

```php
<?php

use Illuminate\Support\Facades\Route;
use Modules\Shop\Http\Controllers\Api\V1\OrderApiController;

/*
|--------------------------------------------------------------------------
| API Routes - Shop Module (v1)
|--------------------------------------------------------------------------
| 1. جميع المسارات تبدأ ببادئة الإصدار v1
| 2. محمية بالـ sanctum middleware إلا إذا كانت عامة صراحةً (Public)
| 3. استخدام أسماء الجمع و kebab-case
*/

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    // 1. مسارات الـ CRUD القياسية
    Route::apiResource('orders', OrderApiController::class)
        ->names('api.v1.orders');

    // 2. مسارات العمليات الفرعية والأوامر (Command Endpoints)
    Route::prefix('orders/{order}')->name('api.v1.orders.')->group(function () {
        Route::post('cancel', [OrderApiController::class, 'cancel'])->name('cancel');
        Route::post('deliver', [OrderApiController::class, 'deliver'])->name('deliver');
        Route::patch('status', [OrderApiController::class, 'updateStatus'])->name('status.update');
    });
});
```

---

### الخطوة 2: طبقة التحقق `Form Request`

تضمن فحص الترويسات والمدخلات مع حظر المعالجة إن فشل التحقق، وتلقائياً ترجع `422 Unprocessable Entity`.

```php
<?php

namespace Modules\Shop\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderApiRequest extends FormRequest
{
    /**
     * تحديد صلاحية المستخدم لإنشاء الطلب.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', \Modules\Shop\Models\Order::class);
    }

    /**
     * قواعد التحقق الصارمة للمدخلات.
     */
    public function rules(): array
    {
        return [
            'merchant_id' => ['required', 'integer', 'exists:merchants,id'],
            'customer_name' => ['required', 'string', 'max:150'],
            'customer_phone' => ['required', 'string', 'regex:/^(05)[0-9]{8}$/'],
            'delivery_address' => ['required', 'array'],
            'delivery_address.city' => ['required', 'string', 'max:50'],
            'delivery_address.street' => ['required', 'string', 'max:255'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ];
    }
}
```

---

### الخطوة 3: كائن نقل البيانات `DTO`

يقوم بنقل البيانات النظيفة والمفحوصة من الـ Request إلى طبقة الـ Action مع منع تسريب كائن الـ Request داخل النطاق.

```php
<?php

namespace Modules\Shop\DTOs;

use Modules\Shop\Http\Requests\Api\V1\StoreOrderApiRequest;

readonly class CreateOrderDTO
{
    /**
     * @param array<int, array{product_id: int, quantity: int, unit_price: float}> $items
     */
    public function __construct(
        public int $userId,
        public int $merchantId,
        public string $customerName,
        public string $customerPhone,
        public array $deliveryAddress,
        public array $items
    ) {}

    public static function fromRequest(StoreOrderApiRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            userId: (int) $request->user()->id,
            merchantId: (int) $validated['merchant_id'],
            customerName: (string) $validated['customer_name'],
            customerPhone: (string) $validated['customer_phone'],
            deliveryAddress: (array) $validated['delivery_address'],
            items: (array) $validated['items']
        );
    }
}
```

---

### الخطوة 4: طبقة التنفيذ وحالات الاستخدام `Action`

تنسق العمليات وتدير الـ Transactions ورمي الـ Domain Exceptions المعبرة.

```php
<?php

namespace Modules\Shop\Actions;

use Illuminate\Support\Facades\DB;
use Modules\Shop\DTOs\CreateOrderDTO;
use Modules\Shop\Models\Order;
use Modules\Shop\Exceptions\InsufficientStockException;

class CreateOrderAction
{
    /**
     * تنفيذ إنشاء الطلب وحساب التكاليف بشكل ذري.
     *
     * @throws InsufficientStockException
     */
    public function execute(CreateOrderDTO $dto): Order
    {
        return DB::transaction(function () use ($dto) {
            // 1. التحقق من توفر المخزون عبر حارس (Guard Clause)
            $this->ensureStockAvailability($dto->items);

            // 2. إنشاء رأس الطلب
            $order = Order::create([
                'user_id' => $dto->userId,
                'merchant_id' => $dto->merchantId,
                'customer_name' => $dto->customerName,
                'customer_phone' => $dto->customerPhone,
                'delivery_address' => $dto->deliveryAddress,
                'status' => 'pending',
            ]);

            // 3. إضافة العناصر وحساب الإجمالي الحقيقي على السيرفر
            foreach ($dto->items as $itemData) {
                $order->items()->create([
                    'product_id' => $itemData['product_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'subtotal' => $itemData['quantity'] * $itemData['unit_price'],
                ]);
            }

            return $order->load(['items', 'merchant']);
        });
    }

    private function ensureStockAvailability(array $items): void
    {
        // فحص المخزون الفعلي ورمي استثناء دقيق برمز آلي
    }
}
```

---

### الخطوة 5: طبقة التحويل والعرض `Transformer / Resource`

تضمن عزل هيكل قاعدة البيانات الداخلي وتوحيد أسماء الحقول بصيغة `snake_case` وتنسيق التواريخ بـ ISO 8601.

```php
<?php

namespace Modules\Shop\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \Modules\Shop\Models\Order
 */
class OrderResource extends JsonResource
{
    /**
     * تحويل الموديل إلى مصفوفة API صريحة ونظيفة.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_number' => $this->reference_number,
            'status' => $this->status,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'total_amount' => number_format((float) $this->total_amount, 2, '.', ''),
            'currency' => 'SAR',
            'delivery_address' => $this->delivery_address,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),

            // منع N+1 Queries عبر التحميل الشرطي فقط
            'merchant' => MerchantResource::make($this->whenLoaded('merchant')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
```

---

### الخطوة 6: صنف الردود الموحد `ApiResponse`

كلاس مساعد مركزي يضمن التزام كافة الردود بالهيكل الرسمي ورموز الحالة الصحيحة:

```php
<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class ApiResponse
{
    /**
     * رد نجاح قياسي 200 OK.
     */
    public static function success(mixed $data = null, string $message = 'Success'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], Response::HTTP_OK);
    }

    /**
     * رد إنشاء مورد بنجاح 201 Created.
     */
    public static function created(mixed $data = null, string $message = 'Resource created successfully'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], Response::HTTP_CREATED);
    }

    /**
     * رد نجاح بدون محتوى 204 No Content.
     */
    public static function noContent(): JsonResponse
    {
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * رد فشل منظم وموحد (Client or Server Error).
     */
    public static function error(
        string $code,
        string $message,
        int $statusCode = Response::HTTP_BAD_REQUEST,
        mixed $details = null,
        array $errors = []
    ): JsonResponse {
        $payload = [
            'success' => false,
            'error' => array_filter([
                'code' => $code,
                'message' => $message,
                'details' => $details,
                'errors' => ! empty($errors) ? $errors : null,
            ]),
        ];

        return response()->json($payload, $statusCode);
    }
}
```

---

### الخطوة 7: المتحكم الرفيع `OrderApiController`

المتحكم لا يحتوي على منطق عمل ولا استعلامات SQL، مهمته الوحيدة الربط بين الطبقات:

```php
<?php

namespace Modules\Shop\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Shop\Actions\CancelOrderAction;
use Modules\Shop\Actions\CreateOrderAction;
use Modules\Shop\DTOs\CreateOrderDTO;
use Modules\Shop\Http\Requests\Api\V1\StoreOrderApiRequest;
use Modules\Shop\Models\Order;
use Modules\Shop\Repositories\OrderRepository;
use Modules\Shop\Transformers\OrderResource;

class OrderApiController extends Controller
{
    public function __construct(
        protected OrderRepository $orders,
        protected CreateOrderAction $createOrder,
        protected CancelOrderAction $cancelOrder
    ) {}

    /**
     * GET /api/v1/orders
     * جلب قائمة الطلبات مع معاملات الفلترة والترتيب والتصفح.
     */
    public function index(Request $request): JsonResponse
    {
        $orders = $this->orders->paginateFromRequest($request);

        return ApiResponse::success([
            'items' => OrderResource::collection($orders->items()),
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
                'last_page' => $orders->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/v1/orders
     * إنشاء طلب جديد وإرجاع 201 Created.
     */
    public function store(StoreOrderApiRequest $request): JsonResponse
    {
        $dto = CreateOrderDTO::fromRequest($request);
        $order = $this->createOrder->execute($dto);

        return ApiResponse::created(
            data: OrderResource::make($order),
            message: __('shop::orders.created_successfully')
        );
    }

    /**
     * GET /api/v1/orders/{order}
     * جلب تفاصيل طلب محدد.
     */
    public function show(Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        $order->load(['merchant', 'items.product']);

        return ApiResponse::success(OrderResource::make($order));
    }

    /**
     * POST /api/v1/orders/{order}/cancel
     * تنفيذ أمر إلغاء الطلب.
     */
    public function cancel(Request $request, Order $order): JsonResponse
    {
        $this->authorize('cancel', $order);

        $reason = (string) $request->input('reason', '');
        $this->cancelOrder->execute($order, $reason);

        return ApiResponse::success(
            data: OrderResource::make($order->fresh()),
            message: __('shop::orders.cancelled_successfully')
        );
    }

    /**
     * DELETE /api/v1/orders/{order}
     * حذف طلب وإرجاع 204 No Content.
     */
    public function destroy(Order $order): JsonResponse
    {
        $this->authorize('delete', $order);

        $order->delete();

        return ApiResponse::noContent();
    }
}
```

---

## 4. معالجة معاملات الاستعلام المتقدمة (Query Parameters Pattern)

للحفاظ على مسارات الروابط نظيفة، يتم استخراج معايير الفلترة والترتيب والتضمين عبر مستودع أو استعلام مخصص:

```php
// في OrderRepository.php
public function paginateFromRequest(Request $request): LengthAwarePaginator
{
    $query = Order::query();

    // 1. فلترة دقيقة (Filtering)
    if ($request->filled('status')) {
        $query->where('status', $request->query('status'));
    }

    if ($request->filled('merchant_id')) {
        $query->where('merchant_id', (int) $request->query('merchant_id'));
    }

    // 2. البحث النصي (Searching)
    if ($request->filled('search')) {
        $search = $request->query('search');
        $query->where(function ($q) use ($search) {
            $q->where('reference_number', 'like', "%{$search}%")
              ->orWhere('customer_name', 'like', "%{$search}%")
              ->orWhere('customer_phone', 'like', "%{$search}%");
        });
    }

    // 3. الترتيب الآمن (Safe Sorting with Whitelist)
    $sort = $request->query('sort', '-created_at');
    $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
    $field = ltrim($sort, '-');

    $allowedSortFields = ['created_at', 'total_amount', 'status'];
    if (in_array($field, $allowedSortFields, true)) {
        $query->orderBy($field, $direction);
    } else {
        $query->latest('id');
    }

    // 4. التضمين الشرطي للعلاقات (Includes)
    if ($request->filled('include')) {
        $includes = explode(',', (string) $request->query('include'));
        $allowedIncludes = ['merchant', 'items', 'customer'];
        $safeIncludes = array_intersect($includes, $allowedIncludes);
        $query->with($safeIncludes);
    }

    // 5. التصفح (Pagination)
    $perPage = min((int) $request->query('per_page', 15), 100);

    return $query->paginate($perPage);
}
```

---

## 5. اختبار الـ API التلقائي (Feature Testing)

يجب كتابة اختبارات تكاملية شاملة تحت مجلد `Modules/{ModuleName}/tests/Feature/Api/`:

```php
<?php

namespace Modules\Shop\Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Shop\Models\Order;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_orders_with_valid_token(): void
    {
        $user = User::factory()->create();
        Order::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/orders');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'items' => [
                        '*' => [
                            'id',
                            'reference_number',
                            'status',
                            'total_amount',
                            'created_at',
                        ],
                    ],
                    'pagination' => ['current_page', 'per_page', 'total', 'last_page'],
                ],
            ]);
    }

    public function test_returns_422_when_validation_fails_on_store(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/orders', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['merchant_id', 'customer_name', 'items']);
    }

    public function test_returns_401_when_unauthenticated(): void
    {
        $response = $this->getJson('/api/v1/orders');

        $response->assertUnauthorized();
    }
}
```

---

## 6. سير عمل وقوالب توثيق الواجهات بمواصفات عالمية (World-Class API Documentation Workflow)

> **قاعدة إلزامية**: لا يُعتبر أي API مكتملاً حتى يتم توثيقه بالكامل في ملف التوثيق المقابل له داخل مجلد `api-docs/` مع فهرس تنقلي تفصيلي وتصميم احترافي يضاهي التوثيقات العالمية (Stripe / GitHub / Shopify).

---

### أ. الهيكل التنظيمي لمجلد `api-docs/`

```text
api-docs/
├── README.md              ← الفهرس الرئيسي للنظام، الترويسات العامة، وبيئات التشغيل
├── orders.md              ← كائن وتوثيق كافة واجهات الطلبات
├── products.md            ← كائن وتوثيق كافة واجهات المنتجات والكتالوج
├── couriers.md            ← كائن وتوثيق كافة واجهات المناديب ومسارات التوصيل
├── wallets.md             ← كائن وتوثيق كافة واجهات المحافظ والعمليات المالية
├── users.md               ← كائن وتوثيق كافة واجهات المستخدمين والصلاحيات
└── auth.md                ← كائن وتوثيق كافة واجهات المصادقة والتوكنات
```

---

### ب. القالب العالمي المعتمد لتوثيق أي خدمة (`api-docs/{resource}.md`)

يجب أن يحتوي كل ملف توثيق على **5 أركان إلزامية**:
1. **البيانات الوصفية وشارات التوثيق (Metadata & Badges)**.
2. **فهرس المحتويات التنقلي (Table of Contents)** مع روابط داخلية سريعة.
3. **معجم كائن المورد (The Resource Object Schema)** لشرح تركيبة البيانات والحقول.
4. **جدول العمليات السريع (Endpoints Quick Reference)** مع أفعال الـ HTTP وحالات الجاهزية.
5. **المواصفات التفصيلية لكل نقطة نهاية (Endpoint Deep Dive)** متضمنة:
   - مسار الـ URI ببانر واضح.
   - كود cURL للاستدعاء السريع.
   - جداول المعاملات والترويسات والـ Body Schema.
   - أمثلة الردود الناجحة الكاملة.
   - جدول كافة سيناريوهات الخطأ ورموزها البرمجية.

```markdown
# 📦 توثيق واجهات الطلبات (Orders API Reference)

<div dir="rtl">

> **النطاق التجاري**: `Modules/Shop`  
> **الإصدار الحالي**: `v1`  
> **المسار الأساسي**: `https://api.domain.test/api/v1/orders`  
> **تاريخ آخر مراجعة**: 2026-09-08  

</div>

---

## 📑 فهرس المحتويات (Table of Contents)

- [1. كائن الطلب (The Order Object)](#1-كائن-الطلب-the-order-object)
  - [مخطط الحقول (Field Attributes)](#مخطط-الحقول-field-attributes)
  - [نموذج كائن الـ JSON](#نموذج-كائن-الـ-json)
- [2. الدليل السريع للنقاط النهائية (Endpoints Directory)](#2-الدليل-السريع-للنقاط-النهائية-endpoints-directory)
- [3. المواصفات التفصيلية للعمليات (Endpoint Specifications)](#3-المواصفات-التفصيلية-للعمليات-endpoint-specifications)
  - [جلب قائمة الطلبات (List Orders)](#get-apiv1orders)
  - [جلب تفاصيل طلب محدد (Retrieve Order)](#get-apiv1ordersorder)
  - [إنشاء طلب جديد (Create Order)](#post-apiv1orders)
  - [إلغاء الطلب (Cancel Order)](#post-apiv1ordersorderback-cancel)
  - [تحديث حالة الطلب (Update Status)](#patch-apiv1ordersorderstatus)
- [4. معجم أكواد الأخطاء الشائعة (Domain Error Codes)](#4-معجم-أكواد-الأخطاء-الشائعة-domain-error-codes)

---

## 1. كائن الطلب (The Order Object)

يمثل كائن `Order` السجل المالي والتشغيلي لعملية الشراء في النظام.

### مخطط الحقول (Field Attributes)

| الحقل (Attribute) | النوع (Type) | إمكانية الـ null | الوصف التجاري والقيود |
|---|---|---|---|
| `id` | `integer` | لا | المعرف الرقمي الفريد للطلب |
| `reference_number` | `string` | لا | الرقم المرجعي الظاهر للعميل (مثل `ORD-2026-001420`) |
| `status` | `string` | لا | حالة الطلب: `pending`, `processing`, `delivered`, `cancelled` |
| `customer_name` | `string` | لا | اسم العميل المستلم |
| `customer_phone` | `string` | لا | رقم جوال العميل بصيغة دولية أو محلية معتمدة |
| `total_amount` | `string` | لا | إجمالي الطلب بصيغة عشرية ثابتة (`150.00`) |
| `currency` | `string` | لا | رمز العملة المعتمدة بمعيار ISO (`SAR`) |
| `delivery_address` | `object` | لا | كائن يحتوي على تفاصيل العنوان (`city`, `street`, `lat`, `lng`) |
| `created_at` | `string (ISO 8601)` | لا | تاريخ ووقت الإنشاء بالتوقيت العالمي UTC |
| `updated_at` | `string (ISO 8601)` | لا | تاريخ آخر تعديل على السجل |

### نموذج كائن الـ JSON

```json
{
  "id": 1420,
  "reference_number": "ORD-2026-001420",
  "status": "pending",
  "customer_name": "محمد عبدالله",
  "customer_phone": "0512345678",
  "total_amount": "150.00",
  "currency": "SAR",
  "delivery_address": {
    "city": "الرياض",
    "street": "طريق الملك فهد",
    "district": "العليا"
  },
  "created_at": "2026-09-08T10:12:49Z",
  "updated_at": "2026-09-08T10:12:49Z"
}
```

---

## 2. الدليل السريع للنقاط النهائية (Endpoints Directory)

| العملية | الفعل والمسار (Method & URI) | الحالة (Status) | الصلاحية (Permission) |
|---|---|---|---|
| [سرد الطلبات المفلترة](#get-apiv1orders) | `GET /api/v1/orders` | 🟢 جاهز ومستقر | `orders.view` |
| [تفاصيل طلب محدد](#get-apiv1ordersorder) | `GET /api/v1/orders/{order}` | 🟢 جاهز ومستقر | `orders.view` |
| [إنشاء طلب جديد](#post-apiv1orders) | `POST /api/v1/orders` | 🟢 جاهز ومستقر | `orders.create` |
| [إلغاء الطلب](#post-apiv1ordersorderback-cancel) | `POST /api/v1/orders/{order}/cancel` | 🟢 جاهز ومستقر | `orders.cancel` |
| [تحديث حالة الطلب](#patch-apiv1ordersorderstatus) | `PATCH /api/v1/orders/{order}/status` | 🟡 قيد التطوير | `orders.status.update` |

---

## 3. المواصفات التفصيلية للعمليات (Endpoint Specifications)

### `POST /api/v1/orders`
#### إنشاء طلب جديد (Create a New Order)

يسجل طلباً جديداً ويقوم بالتحقق الذري من توفر المخزون وحجز الكميات واحتساب التكاليف المالية على السيرفر.

- **الحالة**: 🟢 `جاهز ومستقر (Ready / Stable)`
- **الصلاحية المطلوبة**: `orders.create`

#### ترويسات الطلب (Request Headers)
| الترويسة | النوع | القيمة | إلزامي؟ |
|---|---|---|---|
| `Authorization` | `string` | `Bearer {sanctum_token}` | نعم |
| `Accept` | `string` | `application/json` | نعم |
| `Content-Type` | `string` | `application/json` | نعم |
| `Idempotency-Key` | `string (UUID)` | `9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d` | نعم (للعمليات المالية) |

#### كود الاستدعاء السريع (Example cURL)
```bash
curl -X POST "https://api.domain.test/api/v1/orders" \
  -H "Authorization: Bearer 1|abcdef123456" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d" \
  -d '{
    "merchant_id": 12,
    "customer_name": "محمد عبدالله",
    "customer_phone": "0512345678",
    "delivery_address": {
      "city": "الرياض",
      "street": "طريق الملك فهد"
    },
    "items": [
      {
        "product_id": 105,
        "quantity": 2,
        "unit_price": 45.00
      }
    ]
  }'
```

#### مخطط جسم الطلب (Request Body Schema)
| الحقل | النوع | إلزامي؟ | القيود والشروط |
|---|---|---|---|
| `merchant_id` | `integer` | نعم | يجب أن يكون متجراً نشطاً في النظام (`exists:merchants,id`) |
| `customer_name` | `string` | نعم | الحد الأقصى 150 حرفاً |
| `customer_phone` | `string` | نعم | رقم جوال سعودي يبدأ بـ 05 (10 أرقام) |
| `delivery_address` | `object` | نعم | كائن العنوان الإلزامي |
| `delivery_address.city` | `string` | نعم | اسم المدينة (حد أقصى 50 حرفاً) |
| `delivery_address.street` | `string` | نعم | اسم الشارع ورقم المبنى |
| `items` | `array` | نعم | مصفوفة تحتوي على عنصر واحد على الأقل (`min:1`) |
| `items.*.product_id` | `integer` | نعم | معرف المنتج (`exists:products,id`) |
| `items.*.quantity` | `integer` | نعم | قيمة صحيحة بين 1 و 100 |
| `items.*.unit_price` | `number` | نعم | سعر الوحدة الإيجابي |

#### الرد الناجح المتوقع (Success Response)
- **رمز الـ HTTP**: `201 Created`
- **الترويسة المرتجعة**: `Location: /api/v1/orders/1420`

```json
{
  "success": true,
  "message": "تم إنشاء الطلب بنجاح",
  "data": {
    "id": 1420,
    "reference_number": "ORD-2026-001420",
    "status": "pending",
    "customer_name": "محمد عبدالله",
    "customer_phone": "0512345678",
    "total_amount": "90.00",
    "currency": "SAR",
    "delivery_address": {
      "city": "الرياض",
      "street": "طريق الملك فهد"
    },
    "created_at": "2026-09-08T10:12:49Z",
    "updated_at": "2026-09-08T10:12:49Z"
  }
}
```

#### جدول ردود الأخطاء المتوقعة (Expected Errors)

| رمز الـ HTTP | رمز الخطأ الآلي (`error.code`) | السبب التجاري | نموذج الرد |
|---|---|---|---|
| `401 Unauthorized` | `UNAUTHENTICATED` | غياب توكن المصادقة أو عدم صحته | `{"success":false,"error":{"code":"UNAUTHENTICATED","message":"المستخدم غير مسجل الدخول"}}` |
| `403 Forbidden` | `FORBIDDEN` | المستخدم لا يملك صلاحية `orders.create` | `{"success":false,"error":{"code":"FORBIDDEN","message":"غير مصرح لك بإنشاء الطلبات"}}` |
| `409 Conflict` | `INSUFFICIENT_STOCK` | عدم توفر كمية المخزون المطلوبة للمنتج | انظر تفاصيل الرد أدناه |
| `422 Unprocessable Entity` | `VALIDATION_FAILED` | فشل التحقق من صحة المدخلات | انظر تفاصيل الرد أدناه |

**تفاصيل رد خطأ التحقق (`422 Unprocessable Entity`):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "البيانات المدخلة غير صالحة",
    "errors": {
      "customer_phone": [
        "رقم الهاتف يجب أن يتكون من 10 أرقام تبدأ بـ 05"
      ],
      "items.0.quantity": [
        "الكمية المطلوبة يجب أن تكون قيمة صحيحة لا تقل عن 1"
      ]
    }
  }
}
```

**تفاصيل رد خطأ المخزون (`409 Conflict`):**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "الكمية المطلوبة غير متوفرة في المستودع حالياً",
    "details": {
      "product_id": 105,
      "requested_quantity": 2,
      "available_stock": 0
    }
  }
}
```

---

## 4. معجم أكواد الأخطاء الشائعة (Domain Error Codes)

| كود الخطأ (`code`) | رمز الـ HTTP | المعنى وسيناريو المعالجة لدى العميل |
|---|---|---|
| `ORDER_NOT_FOUND` | `404` | معرف الطلب غير موجود بالنظام |
| `ORDER_ALREADY_CANCELLED` | `409` | تم إلغاء الطلب مسبقاً ولا يمكن إلغاؤه مجدداً |
| `ORDER_CANNOT_BE_CANCELLED`| `409` | حالة الطلب لا تسمح بالإلغاء (تم شحنه أو تسليمه بالفعل) |
| `INSUFFICIENT_STOCK` | `409` | مخزون أحد المنتجات غير كافٍ لإتمام العملية |
| `IDEMPOTENCY_CONFLICT` | `409` | تم استلام طلب بنفس ترويسة الـ Idempotency-Key مع معالجة سابقة |
| `VALIDATION_FAILED` | `422` | تحقق من كائن `errors` لتحديد الحقول غير الصالحة |
```

---

### ج. خطوات توثيق الواجهة بمجرد الانتهاء منها

1. **التحقق من ملف الخدمة**: افتح ملف الخدمة المقابل في `api-docs/{resource}.md` (أو أنشئه من القالب أعلاه إن لم يكن موجوداً).
2. **تحديث كائن المورد**: تأكد من أن جدول مخطط الحقول (The Resource Object Schema) يطابق بدقة مخرجات `Transformer / Resource`.
3. **تحديث فهرس المحتويات (TOC)**: أضف رابط العملية الجديدة في الفهرس العلوي لتسهيل التنقل السريع.
4. **توثيق كافة تفاصيل النقطة**: أضف قسماً كاملاً يتضمن مسار الـ URI، كود cURL، جداول المعاملات، الرد الناجح الحقيقي، وجدول الأخطاء المتوقعة.
5. **ربط الملف بالفهرس الرئيسي**: تأكد من إضافة رابط الملف وتحديث حالته داخل `api-docs/README.md`.

---

## 7. قائمة التحقق الإلزامية قبل اعتماد أي نقطة نهاية (API Readiness Checklist)

- [ ] هل المسار اسم بصيغة الجمع وخالٍ تمامًا من الأفعال (Nouns, Not Verbs)؟
- [ ] هل الكلمات المركبة في الرابط مكتوبة بنمط `kebab-case`؟
- [ ] هل تم تغليف المسار ببادئة الإصدار `/api/v1/`؟
- [ ] هل رمز الحالة المرتجع دلالي ودقيق (`200`, `201`, `204`, `422`, `403`, `404`, `409`)؟
- [ ] هل يتم تمرير الفلترة والبحث والترتيب عبر معاملات الاستعلام `Query Parameters` وليس في المسار؟
- [ ] هل مفاتيح JSON في الطلب والاستجابة موحدة بنمط `snake_case`؟
- [ ] هل كافة التواريخ منسقة بمعيار ISO 8601 UTC؟
- [ ] هل تم تجنب تسريب استعلامات الـ N+1 باستخدام `$this->whenLoaded(...)` في الريسورس؟
- [ ] هل تم إخفاء كافة تفاصيل الـ SQL والاستثناءات الخام عن العميل؟
- [ ] هل تم كتابة اختبار Feature للتحقق من حالات النجاح والفشل والصلاحيات؟
- [ ] **هل تم توثيق الـ API بالكامل مع فهرس تنقلي ومعجم للكائن وأمثلة JSON وأكواد الأخطاء في `api-docs/{resource}.md` وفق القالب العالمي وتحديث `api-docs/README.md`؟**


