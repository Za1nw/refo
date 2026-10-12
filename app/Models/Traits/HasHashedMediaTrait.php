<?php

namespace App\Models\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\FileAdder;

trait HasHashedMediaTrait
{
    use InteractsWithMedia {
        InteractsWithMedia::addMedia as parentAddMedia;
    }

    public function addMedia($file): FileAdder
    {
        $adder = $this->parentAddMedia($file);

        if ($file instanceof UploadedFile) {
            return $adder->usingFileName($file->hashName());
        }

        $ext = is_object($file) && method_exists($file, 'getClientOriginalExtension')
            ? $file->getClientOriginalExtension()
            : pathinfo((string) $file, PATHINFO_EXTENSION);

        $name = (string) Str::uuid();
        $filename = $ext ? "{$name}.{$ext}" : $name;

        return $adder->usingFileName($filename);
    }
}
