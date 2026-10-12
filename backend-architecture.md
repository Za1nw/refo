# Backend Architecture & Coding Standards

## 1. Purpose

This document is the backend architectural source of truth for the project.

It defines:

- Laravel backend architecture.
- `nwidart/laravel-modules` module structure.
- Separation of responsibilities.
- Backend folder and file placement.
- Naming conventions.
- Clean Code rules.
- Controller responsibilities.
- Actions, DTOs, Requests, Responses, Services, Repositories, Transformers, Events, Listeners, Jobs, Policies, Middleware, Models, and Support responsibilities.
- Rules that AI coding assistants must follow before creating or modifying backend code.

The project must remain modular, maintainable, testable, and easy to extend.

For frontend architecture (React/Inertia modules under `modules/[module-name]/resources/assets/admin`), see **`frontend-architecture.md`**. Read that document instead when the task is frontend-only.

---

# 3. Technology Stack

## Backend

- PHP
- Laravel
- `nwidart/laravel-modules`
- Laravel HTTP layer
- Laravel Eloquent
- Laravel Queues / Jobs
- Laravel Events / Listeners
- Laravel Policies / Gates
- Laravel Form Requests
- Laravel API Resources / Collections

The frontend stack (React, Inertia.js, TypeScript, Tailwind, shadcn/ui, TanStack Table) is documented separately in `frontend-architecture.md`.

---

# 4. Main Architectural Rule

The most important rule is:

> Every piece of code must have one clear responsibility and must live in the correct architectural layer.

Do not place code somewhere simply because it is convenient.

Before creating a class, determine:

1. What responsibility does it have?
2. Is the responsibility global or module-specific?
3. Which layer owns that responsibility?
4. Does an existing class already provide this responsibility?
5. Can the responsibility be reused instead of duplicated?

---

# 5. Module Architecture

The project uses the modern `nwidart/laravel-modules` structure.

Each business domain is represented by a Module.

A Module follows the Laravel application structure rather than placing application classes directly under the Module root.

Correct:

```text
Modules/
└── Orders/
    ├── app/
    ├── database/
    ├── resources/
    ├── routes/
    ├── tests/
    ├── config/
    └── module.json
```

Incorrect:

```text
Modules/
└── Orders/
    ├── Actions/
    ├── Services/
    ├── Models/
    └── Database/
```

The application code belongs under:

```text
Modules/{ModuleName}/app/
```

Database-related files belong under:

```text
Modules/{ModuleName}/database/
```

---

# 6. Complete Project Structure

A recommended high-level structure is:

```text
project/
│
├── app/
│   ├── Actions/
│   ├── DTOs/
│   ├── Exceptions/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Requests/
│   │   └── Responses/
│   ├── Jobs/
│   ├── Listeners/
│   ├── Models/
│   ├── Policies/
│   ├── Providers/
│   ├── Repositories/
│   ├── Rules/
│   ├── Services/
│   ├── Support/
│   └── Transformers/
│
├── Modules/
│   ├── Orders/
│   │   ├── app/
│   │   │   ├── Actions/
│   │   │   ├── DTOs/
│   │   │   ├── Events/
│   │   │   ├── Exceptions/
│   │   │   ├── Http/
│   │   │   │   ├── Controllers/
│   │   │   │   ├── Middleware/
│   │   │   │   ├── Requests/
│   │   │   │   └── Responses/
│   │   │   ├── Jobs/
│   │   │   ├── Listeners/
│   │   │   ├── Models/
│   │   │   ├── Policies/
│   │   │   ├── Providers/
│   │   │   ├── Repositories/
│   │   │   ├── Rules/
│   │   │   ├── Services/
│   │   │   ├── Support/
│   │   │   └── Transformers/
│   │   │
│   │   ├── database/
│   │   │   ├── factories/
│   │   │   ├── migrations/
│   │   │   └── seeders/
│   │   │
│   │   ├── resources/
│   │   ├── routes/
│   │   ├── tests/
│   │   ├── config/
│   │   └── module.json
│   │
│   ├── Couriers/
│   ├── Merchants/
│   ├── Accounting/
│   └── Payments/
│
├── routes/
├── tests/
├── config/
├── database/
├── public/
└── ...
```

The exact folders are created only when needed. Do not create empty folders/classes just to satisfy the structure.

Each Module's own frontend assets live under `Modules/{ModuleName}/resources/assets/admin/` — see `frontend-architecture.md` for that structure in full.

---

# 7. Global `app/` vs Module `app/`

This distinction is extremely important.

## Global `app/`

Use the root `app/` directory only for functionality that is genuinely shared by multiple modules or belongs to application-wide infrastructure.

Examples:

```text
app/
├── Http/
│   ├── Middleware/
│   └── Responses/
├── Support/
├── Exceptions/
└── Providers/
```

A global class should be placed there only when it is not owned by a specific business domain.

## Module `app/`

If functionality belongs to one business domain, it must live inside that Module.

For example:

```text
Modules/Couriers/app/Services/CourierBalanceService.php
```

not:

```text
app/Services/CourierBalanceService.php
```

if the service is only used by the Couriers domain.

Similarly:

```text
Modules/Orders/app/Actions/CreateOrderAction.php
```

not:

```text
app/Actions/CreateOrderAction.php
```

---

# 8. Modules Represent Business Domains

A Module should represent a meaningful business domain.

Examples:

```text
Modules/
├── Orders/
├── Couriers/
├── Merchants/
├── Accounting/
├── Payments/
├── Users/
└── Reports/
```

Do not create Modules based only on technical concepts.

Bad:

```text
Modules/
├── Controllers/
├── Services/
└── Helpers/
```

Good:

```text
Modules/
├── Orders/
├── Couriers/
└── Accounting/
```

A Module owns its domain-specific code.

---

# 9. Module Independence

A Module should be as independent as practical.

A Module should own:

- Models.
- Actions.
- DTOs.
- Requests.
- Responses.
- Services.
- Repositories.
- Transformers.
- Events.
- Listeners.
- Jobs.
- Policies.
- Rules.
- Module-specific middleware.
- Routes.
- Database migrations.
- Factories.
- Seeders.
- Tests.
- Module configuration.

Example:

```text
Modules/Orders/
├── app/
├── database/
├── resources/
├── routes/
├── tests/
├── config/
└── module.json
```

---

# 10. Cross-Module Communication

Do not tightly couple modules by directly reaching into another module's internal implementation.

Prefer explicit boundaries.

For example:

```text
Orders
   ↓
OrderCreated event
   ↓
Accounting listener
```

instead of:

```text
Orders Action
   ↓
Directly manipulate Accounting internals
```

The exact mechanism depends on the use case, but the goal is to keep module boundaries clear.

---

# 11. Actions

Actions represent application use cases.

Examples:

```text
CreateOrderAction
UpdateOrderAction
CancelOrderAction
AssignCourierAction
CreateSettlementAction
ApproveSettlementAction
CloseAccountingPeriodAction
```

An Action answers:

> What is the application trying to accomplish?

Example:

```php
final class CreateOrderAction
{
    public function __construct(
        private OrderRepository $orders,
        private OrderPricingService $pricing,
    ) {}

    public function execute(CreateOrderDTO $data): Order
    {
        // Coordinate the use case.
    }
}
```

## Action rules

- One Action should represent one meaningful use case.
- Prefer verb-based names.
- Prefer `execute()` as the main entry point.
- Actions may coordinate multiple dependencies.
- Actions may use Services.
- Actions may use Repositories.
- Actions may dispatch Events.
- Actions may dispatch Jobs.
- Actions may use database transactions when the use case must be atomic.
- Actions should not become giant business containers.

Bad:

```text
OrderAction
    create()
    update()
    cancel()
    assign()
    refund()
    export()
    notify()
```

Good:

```text
CreateOrderAction
UpdateOrderAction
CancelOrderAction
AssignCourierAction
RefundOrderAction
ExportOrdersAction
```

---

# 12. DTOs

DTO means Data Transfer Object.

DTOs transport structured data between layers.

Example:

```php
final readonly class CreateOrderDTO
{
    public function __construct(
        public int $merchantId,
        public int $customerId,
        public float $amount,
        public ?string $notes,
    ) {}
}
```

## DTO rules

- DTOs carry data.
- DTOs should not contain business workflows.
- DTOs should not query the database.
- DTOs should not modify database records.
- DTOs should not depend heavily on HTTP.
- Prefer immutable/read-only DTOs when practical.
- Use explicit types.

The typical flow is:

```text
HTTP Request
    ↓
validated data
    ↓
DTO
    ↓
Action
```

---

# 13. Form Requests

All non-trivial HTTP input must have a dedicated Form Request.

Example:

```text
Modules/Orders/app/Http/Requests/
├── StoreOrderRequest.php
├── UpdateOrderRequest.php
└── CancelOrderRequest.php
```

## Request responsibilities

Requests are responsible for:

- Input validation.
- Request authorization.
- Validation preparation when necessary.
- Defining the HTTP input contract.

Requests are NOT responsible for:

- Creating records.
- Updating records.
- Running business workflows.
- Calculating business amounts.
- Dispatching unrelated jobs.
- Calling multiple services to perform business operations.

Example:

```php
final class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'merchant_id' => ['required', 'integer'],
            'amount' => ['required', 'numeric', 'min:0'],
        ];
    }
}
```

If validation becomes complex or reusable, create a custom Rule.

---

# 14. HTTP Responses

The application uses custom HTTP Response classes to standardize API output.

Possible structure:

```text
app/Http/Responses/
├── ApiResponse.php
├── SuccessResponse.php
├── ErrorResponse.php
└── PaginatedResponse.php
```

Module-specific response classes may live in:

```text
Modules/{ModuleName}/app/Http/Responses/
```

if the response behavior is specific to that Module.

## Response rules

- API response formatting must be consistent.
- Do not manually duplicate response structures across controllers.
- Do not expose internal exceptions or database errors.
- Use appropriate HTTP status codes.
- Keep response formatting separate from business logic.

Example:

```json
{
    "success": true,
    "message": "Order created successfully.",
    "data": {}
}
```

---

# 15. Controllers

Controllers are HTTP adapters.

A controller should:

1. Receive the Request.
2. Validate through a Form Request.
3. Build or receive the DTO.
4. Call an Action.
5. Transform the result.
6. Return the appropriate Response.

Example:

```php
public function store(StoreOrderRequest $request)
{
    $order = $this->createOrder->execute(
        CreateOrderDTO::fromRequest($request)
    );

    return OrderResource::make($order);
}
```

A controller should NOT contain:

- Complex business logic.
- Complex database queries.
- Financial calculations.
- Large condition trees.
- Multiple unrelated operations.
- Manual duplicated API response structures.

## Thin Controller Rule

If a controller method starts becoming large, move the responsibility to the appropriate layer.

---

# 16. Services

Services contain reusable business/domain operations.

Examples:

```text
OrderPricingService
CourierBalanceService
CommissionCalculator
OrderStatusService
DistanceCalculator
```

A Service answers:

> How is this reusable business operation performed?

An Action answers:

> What complete use case is being performed?

Example:

```text
CreateOrderAction
    ↓
OrderPricingService
```

The Action coordinates the use case.

The Service performs reusable business logic.

## Service rules

- One coherent responsibility.
- No giant "everything" services.
- Do not put HTTP logic inside Services.
- Do not put validation rules that belong to Requests inside Services.
- Do not use Services as a dumping ground.

Bad:

```text
OrderService
    createOrder()
    updateOrder()
    cancelOrder()
    assignCourier()
    calculateCommission()
    refund()
    notify()
    export()
```

---

# 17. Repositories

Repositories isolate persistence and data-access logic.

Example:

```text
Modules/Orders/app/Repositories/
└── OrderRepository.php
```

A Repository may handle:

- Queries.
- Complex retrieval.
- Persistence.
- Eager-loading decisions.
- Filters.
- Data-access-specific operations.

Example:

```php
public function findForSettlement(int $courierId): Courier
{
    return Courier::query()
        ->with(['transactions'])
        ->findOrFail($courierId);
}
```

## Repository rules

Repositories should NOT:

- Contain business authorization.
- Decide business workflows.
- Calculate domain rules.
- Send notifications.
- Dispatch unrelated events.
- Become generic "do everything" classes.

Do not automatically create a repository for every Eloquent model.

Create one when it provides meaningful separation or encapsulates meaningful data-access complexity.

---

# 18. Transformers

Transformers convert application/domain data into API representations.

In Laravel, this can be implemented through:

- API Resources.
- Resource Collections.
- Dedicated transformer classes when appropriate.

Recommended location:

```text
Modules/Orders/app/Transformers/
├── OrderResource.php
└── OrderCollection.php
```

## Transformer rules

- Presentation only.
- Explicit output fields.
- No business workflows.
- Avoid database queries.
- Avoid hidden N+1 queries.
- Do not mutate domain state.

Example:

```php
return [
    'id' => $this->id,
    'status' => $this->status,
    'amount' => $this->amount,
];
```

---

# 19. Models

Models represent persistence and domain-related model behavior.

Example:

```text
Modules/Orders/app/Models/Order.php
```

Models may contain:

- Relationships.
- Casts.
- Accessors.
- Mutators.
- Scopes.
- Persistence-related behavior.

Do not turn Models into giant business services.

If a method represents a significant application use case, move it to an Action.

---

# 20. Events

Events represent facts that happened.

Examples:

```text
OrderCreated
OrderCancelled
CourierAssigned
PaymentReceived
SettlementApproved
AccountingPeriodClosed
```

An Event should communicate:

> Something happened.

It should not contain the entire reaction workflow.

Example:

```text
OrderCreated
```

rather than:

```text
OrderCreatedAndNotifyMerchantAndCreateAccountingAndSyncExternalSystem
```

---

# 21. Listeners

Listeners react to Events.

Examples:

```text
CreateAccountingEntry
NotifyMerchant
UpdateCourierStatistics
SyncOrderToExternalService
```

The relationship should be:

```text
Event
    ↓
Listener
```

Example:

```text
OrderCreated
    ↓
CreateOrderAccountingEntry
```

Listeners should have one clear reaction.

If the reaction is expensive, use a queued listener or dispatch a Job.

---

# 22. Jobs

Jobs are used for asynchronous, delayed, scheduled, or expensive operations.

Examples:

```text
GenerateReportJob
SyncOrdersJob
ProcessSettlementJob
CloseAccountingPeriodJob
SendBulkNotificationsJob
```

Use Jobs for:

- Long-running operations.
- External API synchronization.
- Large reports.
- Batch processing.
- Large notification operations.
- Background processing.

Do not use Jobs simply to hide badly structured synchronous code.

---

# 23. Policies

Authorization belongs in Policies.

Examples:

```text
OrderPolicy
CourierPolicy
MerchantPolicy
SettlementPolicy
```

Use Policies for questions such as:

```text
Can this user update this order?
Can this user approve this settlement?
Can this user delete this merchant?
```

Do not scatter authorization logic throughout Controllers and Services.

---

# 24. Middleware

Middleware handles HTTP pipeline concerns.

Examples:

```text
Authenticate
SetLocale
CheckRole
EnsureAccountingPeriodIsOpen
VerifyApiToken
```

Middleware should remain focused.

Do not place a complete business workflow inside middleware.

If middleware needs substantial business logic, move it to an appropriate class.

---

# 25. Rules

Custom Laravel validation Rules belong in:

```text
Modules/{ModuleName}/app/Rules/
```

when the rule is module-specific.

Global reusable validation Rules can live in:

```text
app/Rules/
```

Examples:

```text
ValidCourierBalance
ValidAccountingPeriod
ValidOrderStatusTransition
```

Rules validate input/business constraints.

They should not perform unrelated application workflows.

---

# 26. Support

`Support/` contains reusable technical utilities.

Examples:

```text
Support/
├── Money/
├── Date/
├── Strings/
├── Pagination/
├── Api/
└── Formatting/
```

Support must not become a dumping ground.

Bad:

```text
Support/
└── Helper.php
```

Good:

```text
Support/Money/MoneyFormatter.php
Support/Date/DateRange.php
Support/Api/ApiPaginator.php
```

Every Support class must have a clear technical responsibility.

---

# 27. Exceptions

Business-specific exceptions should be explicit.

Examples:

```text
OrderCannotBeCancelled
CourierBalanceExceeded
AccountingPeriodClosed
SettlementAlreadyProcessed
```

Exceptions should describe meaningful failure conditions.

Do not expose internal implementation details to API clients.

Use centralized exception handling for API responses.

---

# 28. Database Transactions

Database transactions should surround operations that must be atomic.

Example:

```php
DB::transaction(function () {
    // coordinated changes
});
```

Transactions are normally coordinated at the Action/use-case level.

Example:

```text
ApproveSettlementAction
    ↓
DB::transaction()
    ├── create settlement
    ├── create ledger transaction
    ├── update balance
    └── update status
```

Do not scatter transaction boundaries randomly throughout low-level classes.

---

# 29. Financial and Accounting Rules

Financial operations require extra strictness.

Rules:

- Never trust financial amounts from the frontend.
- Calculate authoritative values on the backend.
- Use database transactions for atomic financial mutations.
- Preserve accounting history.
- Avoid destructive deletion of ledger records.
- Use dedicated Actions for financial operations.
- Validate accounting-period state.
- Prevent duplicate settlements/payments.
- Design retryable operations to be idempotent.
- Keep balance mutations explicit.
- Do not hide financial mutations inside unrelated Services.

For example:

```text
CreateSettlementAction
ApproveSettlementAction
ReverseSettlementAction
```

is preferred over:

```text
SettlementService
```

containing every possible settlement workflow.

---

# 30. Idempotency

Operations that can be retried must be safe against duplication.

Important examples:

- Payments.
- Settlements.
- Webhooks.
- External synchronization.
- Queue Jobs.
- Report generation requests when they create persistent records.

Possible techniques:

- Unique database constraints.
- Idempotency keys.
- Status checks.
- External event IDs.
- Safe upserts where appropriate.

A retry must not create duplicate financial transactions.

---

# 31. Routes

Module-specific routes belong inside the Module.

Example:

```text
Modules/Orders/routes/
├── api.php
└── web.php
```

Routes should primarily define HTTP endpoints and middleware.

Do not place business logic inside route closures for production application features.

Prefer Controllers.

---

# 32. Module Database Structure

Each Module owns its database-related resources.

Correct:

```text
Modules/Orders/database/
├── factories/
├── migrations/
└── seeders/
```

Do not place Order-specific migrations inside the root database directory.

Root:

```text
database/
```

should contain only application-wide database resources.

---

# 33. Module Resources

Module-specific frontend assets (React/Inertia admin UI) live under:

```text
Modules/{ModuleName}/resources/assets/admin/
```

with page entry points under:

```text
Modules/{ModuleName}/resources/assets/admin/pages/
```

The full frontend folder structure, component patterns, and conventions for this directory are documented in `frontend-architecture.md` — that document is the source of truth for anything under `resources/assets/admin/`. This backend document only defines where the directory lives relative to the Module.

Do not duplicate frontend code between a Module's `resources/assets/admin/` and another Module without a clear reason.

---

# 34. Module Tests

Module tests belong to:

```text
Modules/{ModuleName}/tests/
```

Recommended:

```text
Modules/Orders/tests/
├── Feature/
└── Unit/
```

Tests should follow the same domain boundaries as production code.

---

# 35. Backend / Frontend Responsibility Boundary

Backend owns:

- Authentication.
- Authorization.
- Validation.
- Business rules.
- Financial calculations.
- Data integrity.
- Database operations.
- Security.
- API contracts.

Frontend owns:

- UI.
- User interaction.
- Local UI state.
- Form presentation.
- Client-side convenience validation.
- Display formatting.

Frontend validation is not a security mechanism.

Every important business rule must be enforced on the backend.

---

# 36. Request-to-Response Flow

The preferred backend flow is:

```text
HTTP Request
    ↓
Form Request
    ↓
DTO
    ↓
Controller
    ↓
Action
    ↓
Service / Repository
    ↓
Model / Database
    ↓
Event
    ↓
Listener / Job
    ↓
Transformer / Resource
    ↓
HTTP Response
```

Not every request requires every layer.

For example, a simple read operation may not need a Service.

The architecture must not become ceremony for its own sake.

---

# 37. Recommended Controller Flow

Example:

```php
final class OrderController
{
    public function __construct(
        private CreateOrderAction $createOrder,
    ) {}

    public function store(StoreOrderRequest $request)
    {
        $order = $this->createOrder->execute(
            CreateOrderDTO::fromRequest($request)
        );

        return OrderResource::make($order);
    }
}
```

The controller is intentionally boring.

That is a feature, not a problem.

---

# 38. File Placement Decision Tree

Before creating a file, use this decision tree.

## Complete application use case?

```text
Yes → Actions/
```

## Structured data transfer?

```text
Yes → DTOs/
```

## HTTP input validation?

```text
Yes → Http/Requests/
```

## HTTP response formatting?

```text
Yes → Http/Responses/
```

## Reusable business operation?

```text
Yes → Services/
```

## Database/data-access logic?

```text
Yes → Repositories/
```

## API representation?

```text
Yes → Transformers/
```

## Something happened?

```text
Yes → Events/
```

## Reaction to an Event?

```text
Yes → Listeners/
```

## Background/asynchronous work?

```text
Yes → Jobs/
```

## Authorization?

```text
Yes → Policies/
```

## HTTP pipeline behavior?

```text
Yes → Middleware/
```

## Validation rule?

```text
Yes → Rules/
```

## Reusable technical utility?

```text
Yes → Support/
```

## Database model?

```text
Yes → Models/
```

---

# 39. Naming Conventions

Use explicit names.

Good:

```text
CreateOrderAction
UpdateOrderAction
CancelOrderAction
StoreOrderRequest
UpdateOrderRequest
CreateOrderDTO
OrderRepository
OrderPricingService
OrderResource
OrderCollection
OrderCreated
CreateAccountingEntryListener
SyncOrderJob
OrderPolicy
```

Avoid vague names:

```text
Helper
Manager
Handler
Processor
CommonService
GeneralService
Utility
DataHelper
```

unless the name accurately represents a real responsibility.

---

# 40. Method Naming

Prefer clear verbs.

Good:

```text
execute()
create()
update()
cancel()
assign()
calculate()
approve()
reverse()
findForSettlement()
generate()
```

Avoid:

```text
process()
handleData()
doSomething()
manage()
run()
```

when the actual behavior can be named explicitly.

---

# 41. Dependency Injection

Prefer constructor injection.

Good:

```php
public function __construct(
    private CreateOrderAction $createOrder,
) {}
```

Avoid resolving dependencies manually inside methods:

```php
app(CreateOrderAction::class)->execute(...);
```

unless there is a specific framework/infrastructure reason.

Dependencies should be visible.

---

# 42. Interfaces

Do not create an interface for every class.

Create interfaces when there is a real architectural benefit, such as:

- Multiple implementations.
- External infrastructure.
- Testing substitution.
- Stable architectural boundary.
- Plugin/adapter architecture.

Avoid:

```text
OrderServiceInterface
OrderService
```

when there is only one implementation and no meaningful abstraction.

---

# 43. Clean Code Rules

All code should follow these principles:

- Prefer readability over cleverness.
- Keep classes focused.
- Keep methods reasonably small.
- Use meaningful names.
- Avoid deep nesting.
- Prefer early returns when they improve clarity.
- Use strict types where practical.
- Type parameters and return values.
- Avoid duplicated logic.
- Avoid magic values when constants/enums are appropriate.
- Prefer enums for finite states.
- Keep dependencies explicit.
- Do not silently swallow exceptions.
- Do not leave debugging code in production.
- Remove `dd()`.
- Remove `dump()`.
- Remove temporary `console.log()`.
- Do not leave commented-out dead code.
- Comments should explain why, not obvious code behavior.

---

# 44. Database and Query Rules

- Avoid N+1 queries.
- Eager load relationships intentionally.
- Select only needed columns for heavy queries when appropriate.
- Use transactions for atomic operations.
- Avoid duplicating complex queries.
- Keep persistence logic in the appropriate Repository/query layer.
- Use Eloquent scopes for simple reusable query constraints.
- Do not put complex queries in Controllers.
- Do not hide critical business rules inside raw SQL without a strong reason.

---

# 45. Error Handling

Errors must be intentional and consistent.

Use:

- Validation exceptions for invalid input.
- Authorization exceptions for forbidden operations.
- Domain/application exceptions for business failures.
- Centralized API exception handling.

Never return:

```text
SQLSTATE[...]
```

or internal stack traces to normal API consumers.

Log internal technical details appropriately while returning a safe public error.

---

# 46. Events vs Direct Calls

Use a direct call when the operation is required for the current use case.

Example:

```text
CreateOrderAction
    ↓
OrderRepository
```

Use an Event when other parts of the system should react to a fact.

Example:

```text
OrderCreated
    ↓
Accounting
    ↓
Notification
    ↓
Statistics
```

Do not use Events simply to make straightforward code look "more advanced".

---

# 47. Jobs vs Services

A Service answers:

> How do we perform this business operation?

A Job answers:

> This operation should be executed asynchronously/background.

Example:

```text
GenerateReportService
```

contains report generation logic.

```text
GenerateReportJob
```

executes that work asynchronously.

A Job should normally delegate substantial business work to the appropriate Action/Service rather than containing hundreds of lines itself.

---

# 48. Actions vs Services

Use an Action when the operation represents a complete use case.

Example:

```text
ApproveSettlementAction
```

Use a Service for reusable logic:

```text
SettlementBalanceCalculator
```

Example:

```text
ApproveSettlementAction
    ├── SettlementRepository
    ├── SettlementBalanceCalculator
    ├── DB Transaction
    └── SettlementApproved Event
```

---

# 49. Avoid God Classes

A class becomes a problem when it starts owning unrelated responsibilities.

Examples of bad classes:

```text
OrderManager
ApplicationService
CommonService
Helper
BaseRepository
```

with dozens of unrelated methods.

When this happens, split responsibilities into proper classes.

---

# 50. Avoid God Modules

A Module should represent a meaningful domain.

Do not create:

```text
Modules/Core/
```

and put the entire application inside it.

Do not create:

```text
Modules/Everything/
```

A Module should have a clear business boundary.

---

# 51. Refactoring Existing Code

When modifying existing code:

1. Read the surrounding implementation first.
2. Search for existing related classes.
3. Identify current dependencies.
4. Preserve existing behavior unless the requirement changes it.
5. Refactor only the relevant area.
6. Do not introduce duplicate architecture.
7. Do not move files blindly.
8. Update namespaces/imports after moving files.
9. Update tests.
10. Verify routes and module registration.

Do not rewrite an entire module just because one method needs modification.

---

# 52. AI Coding Workflow

AI coding assistants must follow this process.

## Step 1 — Understand the request

Determine:

- Business domain.
- Module.
- Use case.
- Expected API behavior.
- Frontend feature if applicable.

## Step 2 — Search existing code

Before creating anything, search for:

- Similar Actions.
- Similar Services.
- Similar DTOs.
- Similar Requests.
- Similar Resources.
- Similar Repositories.
- Existing Events.
- Existing Jobs.
- Existing frontend services/hooks/components.
- Existing validation rules.

Never create duplicate functionality without checking first.

## Step 3 — Determine ownership

Ask:

```text
Is this global?
```

If yes:

```text
app/
```

If it belongs to one business domain:

```text
Modules/{ModuleName}/app/
```

## Step 4 — Determine responsibility

Choose the correct layer.

## Step 5 — Implement minimally

Create only the files that are actually needed.

## Step 6 — Keep boundaries clean

Do not move business logic into Controllers, Requests, Resources, or Models just because it is convenient.

## Step 7 — Verify

Check:

- Namespaces.
- Imports.
- Dependency injection.
- Routes.
- Validation.
- Authorization.
- API response structure.
- Database transactions.
- Tests.
- TypeScript types.
- Frontend API integration.

---

# 53. AI Rule: Do Not Assume Old Module Structure

Never generate this structure:

```text
Modules/Orders/
├── Actions/
├── Services/
├── Models/
└── Database/
```

The project uses:

```text
Modules/Orders/
├── app/
├── database/
├── resources/
├── routes/
├── tests/
├── config/
└── module.json
```

Application PHP classes must be under:

```text
Modules/Orders/app/
```

Database resources must be under:

```text
Modules/Orders/database/
```

---

# 54. AI Rule: Preserve Laravel Structure Inside Modules

Each Module should follow Laravel conventions internally.

For example:

```text
Modules/Orders/app/Http/Controllers/
Modules/Orders/app/Http/Requests/
Modules/Orders/app/Models/
Modules/Orders/app/Policies/
Modules/Orders/app/Providers/
```

Additional architecture layers are placed under `app`:

```text
Modules/Orders/app/Actions/
Modules/Orders/app/DTOs/
Modules/Orders/app/Repositories/
Modules/Orders/app/Services/
Modules/Orders/app/Transformers/
Modules/Orders/app/Support/
```

This keeps the Module structurally familiar to Laravel developers.

---

# 55. Example: Orders Module

A complete Orders module may look like:

```text
Modules/Orders/
│
├── app/
│   ├── Actions/
│   │   ├── CreateOrderAction.php
│   │   ├── UpdateOrderAction.php
│   │   ├── CancelOrderAction.php
│   │   └── AssignCourierAction.php
│   │
│   ├── DTOs/
│   │   ├── CreateOrderDTO.php
│   │   └── UpdateOrderDTO.php
│   │
│   ├── Events/
│   │   ├── OrderCreated.php
│   │   └── OrderCancelled.php
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── OrderController.php
│   │   ├── Middleware/
│   │   ├── Requests/
│   │   │   ├── StoreOrderRequest.php
│   │   │   └── UpdateOrderRequest.php
│   │   └── Responses/
│   │       └── OrderResponse.php
│   │
│   ├── Jobs/
│   │   └── SyncOrderJob.php
│   │
│   ├── Listeners/
│   │   └── CreateOrderAccountingEntry.php
│   │
│   ├── Models/
│   │   └── Order.php
│   │
│   ├── Policies/
│   │   └── OrderPolicy.php
│   │
│   ├── Providers/
│   │   └── OrdersServiceProvider.php
│   │
│   ├── Repositories/
│   │   └── OrderRepository.php
│   │
│   ├── Rules/
│   │   └── ValidOrderStatusTransition.php
│   │
│   ├── Services/
│   │   ├── OrderPricingService.php
│   │   └── OrderStatusService.php
│   │
│   ├── Support/
│   │   └── OrderNumberGenerator.php
│   │
│   └── Transformers/
│       ├── OrderResource.php
│       └── OrderCollection.php
│
├── database/
│   ├── factories/
│   │   └── OrderFactory.php
│   ├── migrations/
│   │   └── 2026_..._create_orders_table.php
│   └── seeders/
│       └── OrderSeeder.php
│
├── resources/
├── routes/
│   ├── api.php
│   └── web.php
│
├── tests/
│   ├── Feature/
│   │   └── Orders/
│   └── Unit/
│       ├── Actions/
│       └── Services/
│
├── config/
└── module.json
```

---

# 56. Example: Create Order

The preferred flow:

```text
POST /orders
       ↓
OrderController
       ↓
StoreOrderRequest
       ↓
CreateOrderDTO
       ↓
CreateOrderAction
       ├── OrderPricingService
       ├── OrderRepository
       ├── DB Transaction
       └── OrderCreated
                    ↓
              Listeners / Jobs
       ↓
OrderResource
       ↓
ApiResponse
```

Controller:

```php
public function store(StoreOrderRequest $request)
{
    $order = $this->createOrder->execute(
        CreateOrderDTO::fromRequest($request)
    );

    return OrderResource::make($order);
}
```

The controller should remain this simple.

---

# 57. Example: Courier Settlement

A financial operation might follow:

```text
POST /couriers/{courier}/settlements
       ↓
StoreSettlementRequest
       ↓
CreateSettlementDTO
       ↓
CreateSettlementAction
       ├── CourierRepository
       ├── SettlementRepository
       ├── BalanceCalculator
       ├── DB Transaction
       └── SettlementCreated
                    ↓
              Accounting Listener
                    ↓
              Ledger Job if needed
       ↓
SettlementResource
       ↓
ApiResponse
```

The frontend must never be trusted to determine the authoritative settlement amount.

---

# 58. When a Layer Is Not Needed

Do not force every operation through every layer.

Simple read:

```text
Controller
    ↓
Repository
    ↓
Resource
```

Business operation:

```text
Controller
    ↓
Request
    ↓
DTO
    ↓
Action
    ↓
Repository / Service
    ↓
Resource
```

Complex asynchronous operation:

```text
Controller
    ↓
Request
    ↓
DTO
    ↓
Action
    ↓
Event
    ↓
Listener
    ↓
Job
```

Use the simplest architecture that correctly separates responsibilities.

---

# 59. Performance Rules

- Avoid N+1 queries.
- Avoid unnecessary database queries in Resources.
- Avoid repeated API calls from React.
- Paginate large collections.
- Use queue Jobs for expensive operations.
- Use chunking for large datasets.
- Avoid loading thousands of records into memory unnecessarily.
- Do not optimize prematurely.
- Measure before introducing complex optimization.

---

# 60. Security Rules

- Never trust client-provided authorization.
- Never trust client-provided financial calculations.
- Validate all external input.
- Authorize sensitive operations.
- Do not expose internal exceptions.
- Do not expose sensitive model fields through Resources.
- Validate file uploads.
- Use policies for resource authorization.
- Protect webhooks and external integrations appropriately.
- Never commit secrets.

---

# 61. API Contract Stability

Frontend code depends on backend response contracts.

When changing an API:

1. Search all frontend consumers.
2. Search all backend consumers.
3. Check Resources and Collections.
4. Update types.
5. Update tests.
6. Avoid silently changing field meanings.

Do not rename/remove an API field without checking its consumers.

---

# 62. Testing Priorities

Prioritize tests for:

- Critical Actions.
- Financial operations.
- Authorization.
- Validation.
- API responses.
- State transitions.
- Event/listener behavior.
- Idempotency.
- Repository queries with meaningful complexity.
- Important Services.

Example:

```text
Modules/Accounting/tests/
├── Feature/
│   ├── CreateTransactionTest.php
│   ├── ApproveSettlementTest.php
│   └── ClosePeriodTest.php
└── Unit/
    └── BalanceCalculatorTest.php
```

---

# 63. Final Architectural Rule

The goal is NOT to create as many folders, classes, interfaces, or abstractions as possible.

The goal is:

> Every responsibility has one clear home.

The preferred architecture is:

```text
                    HTTP
                     │
                     ▼
                Controller
                     │
                     ▼
                 Request
                     │
                     ▼
                   DTO
                     │
                     ▼
                  Action
                 /      \
                ▼        ▼
            Service   Repository
                \        /
                 ▼      ▼
                  Model
                    │
                    ▼
                 Database
                    │
                    ▼
                  Event
                    │
             ┌──────┴──────┐
             ▼             ▼
         Listener         Job
             │             │
             └──────┬──────┘
                    ▼
              Transformer
                    │
                    ▼
                Response
```

Not every request uses every layer.

The architecture exists to separate responsibilities, not to increase the number of files.

---

# 64. Golden Rule for Developers and AI

Before creating or modifying code, always ask:

> "What is this code responsible for, and what is the single correct place for that responsibility?"

Then verify:

```text
1. Is it global or module-specific?
2. Does an existing implementation already exist?
3. Is it a use case?
4. Is it business logic?
5. Is it data access?
6. Is it validation?
7. Is it transformation?
8. Is it an event/reaction?
9. Is it asynchronous work?
10. Is it authorization?
11. Is it HTTP infrastructure?
12. Is it frontend UI or feature logic? (→ see `frontend-architecture.md`, not this document)
```

Only after answering these questions should a new file or modification be created.

The codebase must remain modular, predictable, clean, and consistent with Laravel conventions while maintaining strict separation of responsibilities.

---

# 65. Module Testing Placement

- **Module-Specific Tests (Mandatory):** Any Feature or Unit test related to a module must be placed directly inside `Modules/{ModuleName}/tests/` (e.g. `Modules/{ModuleName}/tests/Feature/` or `Modules/{ModuleName}/tests/Unit/`).
- **Root `tests/` Directory:** Only tests that cover application-wide infrastructure or cross-module integrations without a single domain owner belong in the root `tests/` directory.
- **Execution:** Run module-specific tests using `php artisan test Modules/{ModuleName}/tests --compact` or by targeting a specific test file.
