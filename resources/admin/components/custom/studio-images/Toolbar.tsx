import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { StudioImagesTexts } from "@/hooks/useStudioImages";

const Toolbar = memo(function Toolbar({
    activeTab,
    setTab,
    refresh,
    isLoading,
    search,
    setSearch,
    t,
}: {
    activeTab: "view" | "upload";
    setTab: (tab: "view" | "upload") => void;
    refresh: () => void;
    isLoading: boolean;
    search: string;
    setSearch: (v: string) => void;
    t: StudioImagesTexts;
}) {
    return (
        <div className="flex gap-2 flex-wrap items-center w-full">
            <Button variant={activeTab === "view" ? "default" : "outline"} onClick={() => setTab("view")}>
                {t.gallery}
            </Button>
            <Button variant={activeTab === "upload" ? "default" : "outline"} onClick={() => setTab("upload")}>
                {t.upload}
            </Button>
            <div className="ms-auto flex items-center gap-2 flex-wrap">
                {/* <input
                    placeholder={t.searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-48 h-9 px-3 py-1 border rounded-md bg-background"
                />
                <Button variant="outline" onClick={refresh} disabled={isLoading}>
                    {isLoading ? t.reloading : t.refresh}
                </Button> */}
            </div>
        </div>
    );
});

export default Toolbar;
