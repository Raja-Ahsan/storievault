<?php

namespace App\Console\Commands;

use App\Services\SitemapGenerator;
use Illuminate\Console\Command;

class GenerateSitemap extends Command
{
    protected $signature = 'sitemap:generate';

    protected $description = 'Generate sitemap.xml and save to public/sitemap.xml';

    public function handle(SitemapGenerator $generator): int
    {
        $path = public_path('sitemap.xml');
        $xml = $generator->generate();

        if (file_put_contents($path, $xml) === false) {
            $this->error('Failed to write sitemap.xml');

            return self::FAILURE;
        }

        $this->info('Sitemap created: ' . $path);

        return self::SUCCESS;
    }
}
