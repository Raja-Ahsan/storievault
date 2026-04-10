<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Post;
use Illuminate\Database\Seeder;

class BlogDummySeeder extends Seeder
{
    /**
     * StoriVault-themed blog categories, tags, and 10 published posts.
     */
    public function run(): void
    {
        $categoryNames = [
            'For Writers',
            'Community & Reading',
            'Publishing & Packages',
            'Genres & Inspiration',
            'Platform News',
        ];

        foreach ($categoryNames as $name) {
            BlogCategory::firstOrCreate(
                ['slug' => str()->slug($name)],
                ['name' => $name]
            );
        }

        $tagNames = [
            'Storytelling',
            'Writing Tips',
            'Community',
            'Sci-Fi',
            'Fantasy',
            'Memoir',
            'Publishing',
            'Subscriptions',
            'Contests',
            'From the Vault',
            'AI Writing Tools',
            'Reader Feedback',
        ];

        foreach ($tagNames as $name) {
            BlogTag::firstOrCreate(
                ['slug' => str()->slug($name)],
                ['name' => $name]
            );
        }

        $categories = BlogCategory::whereIn('name', $categoryNames)->get()->keyBy('name');
        $tags = BlogTag::whereIn('name', $tagNames)->get()->keyBy('name');

        $sync = function (Post $post, array $categoryNames, array $tagNames) use ($categories, $tags) {
            $post->categories()->sync(
                collect($categoryNames)->map(fn ($n) => $categories[$n]->id ?? null)->filter()->values()->all()
            );
            $post->tags()->sync(
                collect($tagNames)->map(fn ($n) => $tags[$n]->id ?? null)->filter()->values()->all()
            );
        };

        $posts = [
            [
                'slug' => 'welcome-to-storievault-your-home-for-stories',
                'title' => 'Welcome to StoriVault: Your Home for Stories',
                'excerpt' => 'Save memories, share your voice, and explore a growing archive of human stories—all in one place.',
                'featured' => true,
                'categories' => ['Platform News', 'Community & Reading'],
                'tags' => ['Storytelling', 'Community', 'From the Vault'],
                'content' => <<<'HTML'
<h2>Why StoriVault exists</h2>
<p>Every family has stories that deserve to be remembered. StoriVault is built so you can <strong>write, preserve, and share</strong> those moments—whether they are lighthearted anecdotes or chapters of a longer memoir.</p>
<h2>What you can do here</h2>
<ul>
<li>Browse curated and community stories across genres.</li>
<li>Use optional tools to spark ideas without replacing your voice.</li>
<li>Publish on your terms with clear packages and support.</li>
</ul>
<p>We are glad you are here. Your story matters.</p>
HTML,
                'faqs' => [
                    [
                        'question' => 'Who can publish on StoriVault?',
                        'answer' => 'Members can write and share stories according to the packages and options they choose. You can browse and read much of the community content as a visitor.',
                    ],
                    [
                        'question' => 'Is my work only for the community?',
                        'answer' => 'You control visibility. Some writers keep drafts private; others publish for the community or wider audiences when they are ready.',
                    ],
                ],
            ],
            [
                'slug' => 'how-the-community-feed-works',
                'title' => 'How the Community Feed Works',
                'excerpt' => 'A quick guide to reading, engaging, and finding voices you will love in the StoriVault community.',
                'featured' => true,
                'categories' => ['Community & Reading'],
                'tags' => ['Community', 'Reader Feedback'],
                'content' => <<<'HTML'
<h2>Discovering new voices</h2>
<p>The community area surfaces stories from members who choose to share publicly. You can explore by interest, follow threads of conversation, and leave thoughtful comments.</p>
<h2>Respectful engagement</h2>
<p>We encourage feedback that helps authors grow: what resonated, what you remembered, and gentle suggestions. Harassment or spam has no place here.</p>
<p>Happy reading—and thank you for supporting other storytellers.</p>
HTML,
            ],
            [
                'slug' => 'from-the-vault-why-we-preserve-stories',
                'title' => 'From the Vault: Why We Preserve Stories',
                'excerpt' => '“From the Vault” highlights standout pieces from our archive—here is why preservation matters.',
                'featured' => false,
                'categories' => ['Community & Reading', 'Genres & Inspiration'],
                'tags' => ['From the Vault', 'Storytelling'],
                'content' => <<<'HTML'
<h2>More than a bookshelf</h2>
<p><strong>From the Vault</strong> is our way of celebrating stories that have earned attention—through reads, comments, and heart from the community.</p>
<h2>For future readers</h2>
<p>Preserving stories today means students, families, and curious readers tomorrow can learn from real experiences—not only headlines.</p>
<p>Explore the vault often; new gems appear as the community grows.</p>
HTML,
            ],
            [
                'slug' => 'five-tips-for-stronger-opening-lines',
                'title' => 'Five Tips for Stronger Opening Lines',
                'excerpt' => 'Hook readers from the first sentence with these practical techniques for any genre.',
                'featured' => false,
                'categories' => ['For Writers', 'Genres & Inspiration'],
                'tags' => ['Writing Tips', 'Storytelling'],
                'content' => <<<'HTML'
<h2>1. Start in motion</h2>
<p>Even a small action—a door closing, a question unanswered—signals that something is already happening.</p>
<h2>2. Anchor a specific detail</h2>
<p>One vivid image (a sound, a smell, a broken object) often beats a paragraph of general scene-setting.</p>
<h2>3. Hint at stakes</h2>
<p>Let us feel what could be gained or lost, without explaining the whole plot.</p>
<h2>4. Match tone to genre</h2>
<p>Memoir might invite intimacy; sci-fi might open with a strange rule of your world.</p>
<h2>5. Revise after the draft</h2>
<p>First lines are easier to sharpen once you know where the story lands.</p>
HTML,
            ],
            [
                'slug' => 'using-ai-as-a-writing-assistant-not-a-replacement',
                'title' => 'Using AI as a Writing Assistant (Not a Replacement)',
                'excerpt' => 'How StoriVault thinks about optional AI support: inspiration and polish—your voice stays central.',
                'featured' => true,
                'categories' => ['For Writers', 'Platform News'],
                'tags' => ['AI Writing Tools', 'Writing Tips'],
                'content' => <<<'HTML'
<h2>Tools, not authors</h2>
<p>Many writers use AI to brainstorm titles, check grammar, or overcome a blank page. On StoriVault, these features are <strong>optional</strong>—you decide when and how to use them.</p>
<h2>Your story, your choices</h2>
<p>We believe technology works best when it supports human creativity rather than replacing it. The best pieces on our platform still sound like <em>you</em>.</p>
<h2>Transparency with readers</h2>
<p>When sharing work publicly, consider what feels honest for your audience. Community guidelines help keep expectations clear for everyone.</p>
HTML,
            ],
            [
                'slug' => 'understanding-subscription-packages-for-writers',
                'title' => 'Understanding Subscription Packages for Writers',
                'excerpt' => 'A plain-language overview of how packages unlock community reading, word limits, and publishing options.',
                'featured' => false,
                'categories' => ['Publishing & Packages'],
                'tags' => ['Subscriptions', 'Publishing', 'Community'],
                'content' => <<<'HTML'
<h2>Why packages exist</h2>
<p>StoriVault balances free reading for guests with deeper access for members who want to write, join the community, and publish.</p>
<h2>What to compare</h2>
<ul>
<li>Word limits and how many stories you can work on.</li>
<li>Access to community-only content and features.</li>
<li>Publishing add-ons when you are ready to go wider.</li>
</ul>
<p>Visit the <strong>Packages</strong> page for current plans—we update benefits as the platform evolves.</p>
HTML,
            ],
            [
                'slug' => 'join-our-monthly-fiction-contest',
                'title' => 'Join Our Monthly Fiction Contest',
                'excerpt' => 'Challenge yourself, meet other writers, and see your story highlighted on StoriVault.',
                'featured' => false,
                'categories' => ['Platform News', 'Genres & Inspiration'],
                'tags' => ['Contests', 'Community', 'Fantasy', 'Sci-Fi'],
                'content' => <<<'HTML'
<h2>Why enter?</h2>
<p>Contests give you a deadline, a theme, and a reason to finish a draft. Our monthly fiction spotlight is open to members who love short-form storytelling.</p>
<h2>How it usually works</h2>
<p>Watch the <strong>Contests</strong> section for prompts, word counts, and submission windows. Winners and honorable mentions are often featured for extra visibility.</p>
<p>Whether you place or not, you will have a complete story to refine or expand later.</p>
HTML,
            ],
            [
                'slug' => 'building-believable-characters-in-short-fiction',
                'title' => 'Building Believable Characters in Short Fiction',
                'excerpt' => 'Limited word count? Focus on desire, contradiction, and one memorable choice.',
                'featured' => false,
                'categories' => ['For Writers', 'Genres & Inspiration'],
                'tags' => ['Writing Tips', 'Fantasy', 'Sci-Fi', 'Storytelling'],
                'content' => <<<'HTML'
<h2>One driving want</h2>
<p>In short fiction, give your protagonist a clear desire early—even if it is small. It pulls the reader through the scene.</p>
<h2>A contradiction</h2>
<p>People are messy. A kind character who lies once, or a cynic who keeps a sentimental object, creates instant depth.</p>
<h2>A single decisive moment</h2>
<p>Endings land harder when the character makes a choice we have been dreading or hoping for. Build toward that beat.</p>
HTML,
            ],
            [
                'slug' => 'how-to-get-helpful-feedback-from-readers',
                'title' => 'How to Get Helpful Feedback from Readers',
                'excerpt' => 'Ask better questions in comments and revisions so your next draft levels up.',
                'featured' => false,
                'categories' => ['For Writers', 'Community & Reading'],
                'tags' => ['Reader Feedback', 'Community', 'Writing Tips'],
                'content' => <<<'HTML'
<h2>Invite specific reactions</h2>
<p>Instead of “What did you think?”, try: “Did the ending feel earned?” or “Where did your attention dip?”</p>
<h2>Separate taste from craft</h2>
<p>Not every reader loves your genre—and that is fine. Look for notes on clarity, pacing, and emotional impact.</p>
<h2>Say thank you and iterate</h2>
<p>Readers who feel heard often come back for your next piece. Small updates after feedback show you are serious about the work.</p>
HTML,
            ],
            [
                'slug' => 'memoir-snippets-preserving-family-voices',
                'title' => 'Memoir Snippets: Preserving Family Voices',
                'excerpt' => 'You do not need a full book to capture something true—short memories belong on StoriVault too.',
                'featured' => false,
                'categories' => ['Genres & Inspiration', 'Community & Reading'],
                'tags' => ['Memoir', 'Storytelling', 'From the Vault'],
                'content' => <<<'HTML'
<h2>Small moments count</h2>
<p>A recipe story, a road trip mishap, or the way someone laughed can hold as much meaning as a “big” life event.</p>
<h2>Write it while it is fresh</h2>
<p>Details fade faster than we expect. Even a few paragraphs today can become a gift later—for you or your family.</p>
<h2>Share when you are ready</h2>
<p>Keep drafts private, share with a circle, or publish for the community. StoriVault is flexible because real lives are too.</p>
HTML,
            ],
        ];

        foreach ($posts as $row) {
            $attributes = [
                'title' => $row['title'],
                'content' => $row['content'],
                'excerpt' => $row['excerpt'],
                'meta_title' => $row['title'].' | StoriVault Blog',
                'meta_description' => $row['excerpt'],
                'meta_tags' => implode(', ', $row['tags']),
                'facebook_meta' => $row['title'],
                'twitter_meta' => $row['title'],
                'post_type' => 'general',
                'featured' => $row['featured'],
                'visibility' => 'public',
                'status' => 'published',
                'image' => null,
            ];
            if (array_key_exists('faqs', $row)) {
                $attributes['faqs'] = $row['faqs'];
            }

            $post = Post::updateOrCreate(
                ['slug' => $row['slug']],
                $attributes
            );

            $sync($post, $row['categories'], $row['tags']);
        }
    }
}
