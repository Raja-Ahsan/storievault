<?php

namespace App\Services;

use App\Models\Story;

class SitemapGenerator
{
    public function generate(): string
    {
        $configUrl = rtrim(config('app.url'), '/');
        // Use production URL if not on localhost to ensure SEO consistency
        $baseUrl = (str_contains($configUrl, 'localhost')) 
            ? $configUrl 
            : 'https://www.storievault.com';
        $staticLastmod = now()->toDateString();

        $staticUrls = [
            ['path' => '/', 'priority' => '1.0', 'changefreq' => 'weekly'],
            ['path' => '/from-the-vault', 'priority' => '0.9', 'changefreq' => 'weekly'],
            ['path' => '/about', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['path' => '/stories', 'priority' => '0.9', 'changefreq' => 'daily'],
            ['path' => '/publish', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['path' => '/packages', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['path' => '/how-it-works', 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['path' => '/faqs', 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['path' => '/terms-and-conditions', 'priority' => '0.5', 'changefreq' => 'yearly'],
            ['path' => '/privacy-policy', 'priority' => '0.5', 'changefreq' => 'yearly'],
            ['path' => '/community-guidelines', 'priority' => '0.5', 'changefreq' => 'yearly'],
            ['path' => '/custom-prompt-generator', 'priority' => '0.6', 'changefreq' => 'monthly'],
            ['path' => '/contests', 'priority' => '0.7', 'changefreq' => 'weekly'],
            ['path' => '/create-contest', 'priority' => '0.6', 'changefreq' => 'monthly'],
            ['path' => '/monthly-fiction-contest', 'priority' => '0.6', 'changefreq' => 'weekly'],
            ['path' => '/poetry-contest', 'priority' => '0.6', 'changefreq' => 'weekly'],
            ['path' => '/login', 'priority' => '0.4', 'changefreq' => 'monthly'],
            ['path' => '/register', 'priority' => '0.4', 'changefreq' => 'monthly'],
        ];

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        foreach ($staticUrls as $url) {
            $xml .= $this->urlEntry(
                $baseUrl . $url['path'],
                $url['priority'],
                $url['changefreq'],
                $staticLastmod
            );
        }

        $stories = Story::select('id', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->get();

        foreach ($stories as $story) {
            $lastmod = $story->updated_at?->format('Y-m-d') ?? $staticLastmod;
            $xml .= $this->urlEntry(
                $baseUrl . '/stories/' . $story->id,
                '0.8',
                'weekly',
                $lastmod
            );
        }

        $xml .= '</urlset>';

        return $xml;
    }

    private function urlEntry(string $loc, string $priority, string $changefreq, ?string $lastmod): string
    {
        $loc = htmlspecialchars($loc, ENT_XML1, 'UTF-8');
        $lastmod = $lastmod ?? now()->toDateString();

        return "  <url>\n" .
            "    <loc>{$loc}</loc>\n" .
            "    <lastmod>{$lastmod}</lastmod>\n" .
            "    <priority>{$priority}</priority>\n" .
            "    <changefreq>{$changefreq}</changefreq>\n" .
            "  </url>\n";
    }
}
