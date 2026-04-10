<!DOCTYPE html>
<html>

<head>
    <title>Your Discount Coupon - Story Vault</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #fea257;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }

        .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }

        .coupon-box {
            background-color: #fff;
            border: 2px dashed #fea257;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
            border-radius: 8px;
        }

        .coupon-code {
            font-size: 24px;
            font-weight: bold;
            color: #fea257;
            margin: 10px 0;
        }

        .discount {
            font-size: 18px;
            color: #666;
        }

        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
        }

        @media (max-width: 480px) {
            .coupon-code {
                font-size: 15px;
            }
            .header h1 {
                font-size: 18px;
            }
                
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>🎉 Congratulations!</h1>
        <p>You've received a special discount coupon</p>
    </div>

    <div class="content">
        <p>Hello <strong>{{ $coupon->user->name }}</strong>,</p>

        @if ($story)
            <p>Congratulations on the amazing impact your community story <strong>"{{ $story->title }}"</strong> has
                made! 🎉</p>
        @else
            <p>Congratulations on your amazing community story! 🎉</p>
        @endif

        <p>Your contribution is inspiring others and gaining great attention in the Story Vault community.</p>

        <p>As a token of appreciation, we are excited to offer you a special discount coupon that you can use to publish
            your story on additional platforms and reach an even wider audience.</p>

        <div class="coupon-box">
            <h3>Your Discount Coupon</h3>
            <div class="coupon-code">{{ $coupon->code }}</div>
            <div class="discount">{{ $coupon->discount }}% OFF</div>
            <p><small>Use this coupon during checkout to unlock your publishing discount</small></p>
        </div>

        <p>We're proud to support your journey and can't wait to see your story make an even greater difference. If
            you'd like to know more about how to publish your story on other platforms, feel free to contact us anytime.
        </p>

        <div class="footer">
            <p>Thank you for being a valuable part of the Story Vault community.</p>
            <p><strong>Best regards,<br>Story Vault Team</strong></p>
        </div>
    </div>
</body>

</html>
