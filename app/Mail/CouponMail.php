<?php

namespace App\Mail;


use App\Models\Coupon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CouponMail extends Mailable
{
    use Queueable, SerializesModels;
    public $coupon;
    public $story;
    
    /**
     * Create a new message instance.
     */
    public function __construct(Coupon $coupon, $story = null)
    {
        $this->coupon = $coupon;
        $this->story = $story;
    }

    public function build()
    {
        return $this->subject('🎉 You received a discount coupon!')
                    ->view('emails.coupon')
                    ->with([
                        'coupon' => $this->coupon,
                        'story' => $this->story
                    ]);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🎉 You received a discount coupon!',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.coupon',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
