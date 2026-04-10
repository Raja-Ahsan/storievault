<?php

namespace App\Http\Controllers;

use App\Services\SitemapGenerator;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate sitemap.xml for search engines. Served at /sitemap.xml from Laravel.
     * Includes static pages and dynamic content (e.g. stories). Updates automatically
     * when new content is added (generated on each request from the database).
     */
    public function index(SitemapGenerator $generator): Response
    {
        $xml = $generator->generate();

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
