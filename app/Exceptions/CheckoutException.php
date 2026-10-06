<?php

namespace App\Exceptions;

use Exception;

class CheckoutException extends Exception
{
    public function __construct(
        string $userMessage,
        protected string $logContext = '',
        int $statusCode = 422,
        ?\Throwable $previous = null,
    ) {
        parent::__construct($userMessage, $statusCode, $previous);
        $this->logContext = $logContext ?: $userMessage;
    }

    public function statusCode(): int
    {
        return (int) $this->getCode() ?: 422;
    }

    public function logContext(): string
    {
        return $this->logContext;
    }

    public function userMessage(): string
    {
        return $this->getMessage();
    }
}
