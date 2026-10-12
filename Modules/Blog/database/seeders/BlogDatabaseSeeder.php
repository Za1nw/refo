<?php

namespace Modules\Blog\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Modules\Blog\Models\Blog;
use Modules\Blog\Models\BlogCategory;
use Modules\Blog\Models\BlogTag;
use Modules\MenuBuilder\Database\Seeders\MenuBuilderDatabaseSeeder;
use RuntimeException;

class BlogDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(MenuBuilderDatabaseSeeder::class, ['config' => 'blog'])->run();

        $categories = collect($this->categories())
            ->map(function (array $category) {
                return BlogCategory::factory()
                    ->create($category['arabic']);
            });

        $tags = collect($this->tags())
            ->map(function (array $tag) {
                return BlogTag::factory()
                    ->create($tag['arabic']);
            });

        foreach (array_slice($this->blogs(), 0, 20) as $blogData) {
            $blog = Blog::factory()
                ->withContent($blogData['arabic'], $blogData['english'])
                ->create([
                    'slug' => $blogData['slug'],
                    'views' => $blogData['views'],
                    'category_id' => $categories[$blogData['category']]->id,
                ]);

            $blog->setTranslations($blogData['arabic'], 'ar');
            $blog->setTranslations($blogData['english'], 'en');

            $blog->tags()->attach(
                collect($blogData['tags'])
                    ->map(fn (int $tagIndex) => $tags[$tagIndex]->id)
                    ->all()
            );

            $blog->addMedia($this->randomSeederImagePath())
                ->toMediaCollection();
        }
    }

    private function randomSeederImagePath(): string
    {
        $paths = $this->seederImagePaths();

        if (empty($paths)) {
            return $this->createPlaceholderSeederImage();
        }

        return $this->copySeederImageToTemporaryLocation(Arr::random($paths));
    }

    private function copySeederImageToTemporaryLocation(string $sourcePath): string
    {
        $tmp = storage_path('app/seeder');

        if (! is_dir($tmp)) {
            mkdir($tmp, 0755, true);
        }

        $extension = pathinfo($sourcePath, PATHINFO_EXTENSION);
        $targetPath = $tmp.'/blog-'.uniqid().($extension !== '' ? '.'.$extension : '');

        if (! copy($sourcePath, $targetPath)) {
            throw new RuntimeException('Unable to copy seeder image to a temporary location.');
        }

        return $targetPath;
    }

    private function createPlaceholderSeederImage(): string
    {
        $tmp = storage_path('app/seeder');

        if (! is_dir($tmp)) {
            mkdir($tmp, 0755, true);
        }

        $file = $tmp.'/placeholder-'.uniqid().'.svg';
        file_put_contents($file, '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="48" fill="#6b7280">Placeholder</text></svg>');

        return $file;
    }

    private function seederImagePaths(): array
    {
        $candidates = [
            public_path('assets/new'),
        ];

        $extensions = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];

        $files = [];

        foreach ($candidates as $dir) {
            if (! is_dir($dir)) {
                continue;
            }

            $rii = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($dir));

            foreach ($rii as $file) {
                if ($file->isDir()) {
                    continue;
                }

                $ext = strtolower(pathinfo($file->getFilename(), PATHINFO_EXTENSION));

                if (in_array($ext, $extensions, true)) {
                    $files[] = $file->getPathname();
                }
            }
        }

        return array_values(array_unique($files));
    }

    private function categories(): array
    {
        return [
            [
                'arabic' => [
                    'name' => [
                        'ar' => 'التقاضي والأحكام',
                        'en' => 'Litigation and Judgments',
                    ],
                    'slug' => 'litigation-and-judgments',
                    'description' => [
                        'ar' => 'مقالات حول النزاعات وإجراءات المحاكم.',
                        'en' => 'Articles about disputes and court procedures.',
                    ],
                    'is_active' => true,
                ],
            ],
            [
                'arabic' => [
                    'name' => [
                        'ar' => 'تأسيس الشركات',
                        'en' => 'Company Formation',
                    ],
                    'slug' => 'company-formation',
                    'description' => [
                        'ar' => 'إرشادات لتأسيس الكيانات وإدارتها.',
                        'en' => 'Guidance for forming and managing entities.',
                    ],
                    'is_active' => true,
                ],
            ],
            [
                'arabic' => [
                    'name' => [
                        'ar' => 'الملكية الفكرية',
                        'en' => 'Intellectual Property',
                    ],
                    'slug' => 'intellectual-property',
                    'description' => [
                        'ar' => 'كل ما يتعلق بالعلامات والحقوق والابتكار.',
                        'en' => 'Everything related to brands, rights, and innovation.',
                    ],
                    'is_active' => true,
                ],
            ],
            [
                'arabic' => [
                    'name' => [
                        'ar' => 'العقود والحوكمة',
                        'en' => 'Contracts and Governance',
                    ],
                    'slug' => 'contracts-and-governance',
                    'description' => [
                        'ar' => 'صياغة العقود وبناء الأطر الإدارية.',
                        'en' => 'Contract drafting and administrative frameworks.',
                    ],
                    'is_active' => true,
                ],
            ],
            [
                'arabic' => [
                    'name' => [
                        'ar' => 'الامتثال والتحصيل',
                        'en' => 'Compliance and Recovery',
                    ],
                    'slug' => 'compliance-and-recovery',
                    'description' => [
                        'ar' => 'محتوى حول الامتثال وإدارة المطالبات.',
                        'en' => 'Content about compliance and claims recovery.',
                    ],
                    'is_active' => true,
                ],
            ],
        ];
    }

    private function tags(): array
    {
        return [
            ['arabic' => ['name' => ['ar' => 'العقود', 'en' => 'Contracts'], 'slug' => 'contracts', 'is_active' => true], 'english' => ['name' => 'Contracts', 'slug' => 'contracts']],
            ['arabic' => ['name' => ['ar' => 'التحكيم', 'en' => 'Arbitration'], 'slug' => 'arbitration', 'is_active' => true], 'english' => ['name' => 'Arbitration', 'slug' => 'arbitration']],
            ['arabic' => ['name' => ['ar' => 'الشركات', 'en' => 'Companies'], 'slug' => 'companies', 'is_active' => true], 'english' => ['name' => 'Companies', 'slug' => 'companies']],
            ['arabic' => ['name' => ['ar' => 'الامتثال', 'en' => 'Compliance'], 'slug' => 'compliance', 'is_active' => true], 'english' => ['name' => 'Compliance', 'slug' => 'compliance']],
            ['arabic' => ['name' => ['ar' => 'التقاضي', 'en' => 'Litigation'], 'slug' => 'litigation', 'is_active' => true], 'english' => ['name' => 'Litigation', 'slug' => 'litigation']],
            ['arabic' => ['name' => ['ar' => 'التقنية القانونية', 'en' => 'Legal Tech'], 'slug' => 'legal-tech', 'is_active' => true], 'english' => ['name' => 'Legal Tech', 'slug' => 'legal-tech']],
            ['arabic' => ['name' => ['ar' => 'العلامات التجارية', 'en' => 'Trademarks'], 'slug' => 'trademarks', 'is_active' => true], 'english' => ['name' => 'Trademarks', 'slug' => 'trademarks']],
            ['arabic' => ['name' => ['ar' => 'الملكية الفكرية', 'en' => 'IP'], 'slug' => 'ip', 'is_active' => true], 'english' => ['name' => 'IP', 'slug' => 'ip']],
            ['arabic' => ['name' => ['ar' => 'التوظيف', 'en' => 'Employment'], 'slug' => 'employment', 'is_active' => true], 'english' => ['name' => 'Employment', 'slug' => 'employment']],
            ['arabic' => ['name' => ['ar' => 'الضرائب', 'en' => 'Tax'], 'slug' => 'tax', 'is_active' => true], 'english' => ['name' => 'Tax', 'slug' => 'tax']],
            ['arabic' => ['name' => ['ar' => 'التحصيل', 'en' => 'Debt Recovery'], 'slug' => 'debt-recovery', 'is_active' => true], 'english' => ['name' => 'Debt Recovery', 'slug' => 'debt-recovery']],
            ['arabic' => ['name' => ['ar' => 'الصياغة', 'en' => 'Drafting'], 'slug' => 'drafting', 'is_active' => true], 'english' => ['name' => 'Drafting', 'slug' => 'drafting']],
            ['arabic' => ['name' => ['ar' => 'الوساطة', 'en' => 'Mediation'], 'slug' => 'mediation', 'is_active' => true], 'english' => ['name' => 'Mediation', 'slug' => 'mediation']],
            ['arabic' => ['name' => ['ar' => 'الجرائم الإلكترونية', 'en' => 'Cybercrime'], 'slug' => 'cybercrime', 'is_active' => true], 'english' => ['name' => 'Cybercrime', 'slug' => 'cybercrime']],
            ['arabic' => ['name' => ['ar' => 'البيانات', 'en' => 'Data'], 'slug' => 'data', 'is_active' => true], 'english' => ['name' => 'Data', 'slug' => 'data']],
            ['arabic' => ['name' => ['ar' => 'الاستثمار', 'en' => 'Investment'], 'slug' => 'investment', 'is_active' => true], 'english' => ['name' => 'Investment', 'slug' => 'investment']],
            ['arabic' => ['name' => ['ar' => 'الحوكمة', 'en' => 'Governance'], 'slug' => 'governance', 'is_active' => true], 'english' => ['name' => 'Governance', 'slug' => 'governance']],
            ['arabic' => ['name' => ['ar' => 'الوراثة', 'en' => 'Inheritance'], 'slug' => 'inheritance', 'is_active' => true], 'english' => ['name' => 'Inheritance', 'slug' => 'inheritance']],
            ['arabic' => ['name' => ['ar' => 'التسوية الودية', 'en' => 'Settlement'], 'slug' => 'settlement', 'is_active' => true], 'english' => ['name' => 'Settlement', 'slug' => 'settlement']],
            ['arabic' => ['name' => ['ar' => 'التركات', 'en' => 'Estate Planning'], 'slug' => 'estate-planning', 'is_active' => true], 'english' => ['name' => 'Estate Planning', 'slug' => 'estate-planning']],
        ];
    }

    private function blogs(): array
    {
        $topics = [
            ['slug' => 'guide-professional-contracts', 'views' => 180, 'category' => 3, 'tags' => [0, 11], 'title_ar' => 'دليل العقود الاحترافية', 'title_en' => 'A Practical Guide to Professional Contracts'],
            ['slug' => 'choose-company-structure', 'views' => 240, 'category' => 1, 'tags' => [2, 15], 'title_ar' => 'كيف تختار هيكل الشركة المناسب', 'title_en' => 'How to Choose the Right Company Structure'],
            ['slug' => 'protect-trademark-from-imitation', 'views' => 320, 'category' => 2, 'tags' => [6, 7], 'title_ar' => 'حماية العلامة التجارية من التقليد', 'title_en' => 'Protecting a Trademark from Imitation'],
            ['slug' => 'internal-compliance-for-organizations', 'views' => 155, 'category' => 4, 'tags' => [3, 11], 'title_ar' => 'الامتثال الداخلي للمؤسسات', 'title_en' => 'Internal Compliance for Organizations'],
            ['slug' => 'when-to-choose-arbitration', 'views' => 410, 'category' => 0, 'tags' => [1, 4], 'title_ar' => 'متى تلجأ إلى التحكيم', 'title_en' => 'When to Choose Arbitration'],
            ['slug' => 'legal-tech-in-law-offices', 'views' => 280, 'category' => 4, 'tags' => [5, 14], 'title_ar' => 'التقنية القانونية في المكاتب', 'title_en' => 'Legal Technology in Law Offices'],
            ['slug' => 'employment-relationships', 'views' => 190, 'category' => 3, 'tags' => [8, 11], 'title_ar' => 'تنظيم العلاقات العمالية بوضوح', 'title_en' => 'Structuring Employment Relationships Clearly'],
            ['slug' => 'investment-legal-protection', 'views' => 430, 'category' => 1, 'tags' => [2, 15, 16], 'title_ar' => 'الاستثمار والحماية القانونية', 'title_en' => 'Investment and Legal Protection'],
            ['slug' => 'manage-disputes-practically', 'views' => 210, 'category' => 0, 'tags' => [4, 12], 'title_ar' => 'إدارة النزاعات بطريقة عملية', 'title_en' => 'A Practical Way to Manage Disputes'],
            ['slug' => 'data-and-privacy-legal-sector', 'views' => 265, 'category' => 4, 'tags' => [5, 14], 'title_ar' => 'البيانات والخصوصية في القطاع القانوني', 'title_en' => 'Data and Privacy in the Legal Sector'],
            ['slug' => 'drafting-legal-notices', 'views' => 175, 'category' => 3, 'tags' => [0, 11], 'title_ar' => 'الصياغة الاحترافية للإنذارات', 'title_en' => 'Professional Drafting of Legal Notices'],
            ['slug' => 'structured-debt-recovery', 'views' => 340, 'category' => 4, 'tags' => [10, 12], 'title_ar' => 'حلول للتحصيل المنظم', 'title_en' => 'Structured Debt Recovery Solutions'],
            ['slug' => 'governance-of-boards', 'views' => 150, 'category' => 3, 'tags' => [2, 11], 'title_ar' => 'حوكمة المجالس والقرارات', 'title_en' => 'Governance of Boards and Decisions'],
            ['slug' => 'digital-ip-solutions', 'views' => 290, 'category' => 2, 'tags' => [6, 7, 14], 'title_ar' => 'حلول للملكية الفكرية الرقمية', 'title_en' => 'Digital Intellectual Property Solutions'],
            ['slug' => 'startup-contracting', 'views' => 230, 'category' => 1, 'tags' => [0, 2, 15], 'title_ar' => 'التعاقد في المشاريع الناشئة', 'title_en' => 'Contracting in Startup Projects'],
            ['slug' => 'real-estate-documentation', 'views' => 360, 'category' => 4, 'tags' => [0, 18], 'title_ar' => 'العقارات والتوثيق القانوني', 'title_en' => 'Real Estate and Legal Documentation'],
            ['slug' => 'debt-management-strategies', 'views' => 195, 'category' => 4, 'tags' => [10, 16], 'title_ar' => 'استراتيجيات إدارة الديون', 'title_en' => 'Debt Management Strategies'],
            ['slug' => 'family-governance-in-companies', 'views' => 125, 'category' => 3, 'tags' => [2, 17], 'title_ar' => 'الحوكمة العائلية في الشركات', 'title_en' => 'Family Governance in Companies'],
            ['slug' => 'inheritance-procedures-overview', 'views' => 205, 'category' => 0, 'tags' => [17, 19], 'title_ar' => 'إجراءات الأصل الوراثي', 'title_en' => 'Inheritance Procedures Overview'],
            ['slug' => 'friendly-settlement-between-parties', 'views' => 315, 'category' => 0, 'tags' => [1, 12], 'title_ar' => 'التسوية الودية بين الأطراف', 'title_en' => 'Friendly Settlement Between Parties'],
        ];

        return array_map(function (array $topic): array {
            $descriptionAr = 'مقال عملي حول '.$topic['title_ar'].'.';
            $descriptionEn = 'A practical article about '.$topic['title_en'].'.';

            return [
                'slug' => $topic['slug'],
                'views' => $topic['views'],
                'category' => $topic['category'],
                'tags' => $topic['tags'],
                'arabic' => [
                    'title' => $topic['title_ar'],
                    'description' => $descriptionAr,
                    'content' => 'يشرح هذا المقال '.$topic['title_ar'].' بطريقة عملية ومباشرة، مع التركيز على الخطوات التي تساعد فريق العمل على التطبيق السليم داخل المكتب القانوني.',
                ],
                'english' => [
                    'title' => $topic['title_en'],
                    'description' => $descriptionEn,
                    'content' => 'This article explains '.$topic['title_en'].' in a practical and direct way, focusing on the steps that help the team apply it correctly in a legal office.',
                ],
            ];
        }, $topics);
    }
}
