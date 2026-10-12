<?php

namespace Modules\MenuBuilder\Http\Responses;

use Modules\MenuBuilder\Interfaces\Response\MenuItemResponse as MenuItemResponseContract;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class MenuItemResponse implements MenuItemResponseContract
{
    public function __construct(
        private array $data = []
    ) {}

    public function toResponse($request): Response
    {
        return new JsonResponse($this->data);
    }
}
