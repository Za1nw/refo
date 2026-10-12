
import { useTranslation } from "react-i18next";
import AppLogoIcon from "./app-logo-icon";

export default function AppLogo() {
     const { t } = useTranslation('main');
    return (
        <>
            <div className="flex px-0.5 aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className=" fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {t("Manafe")}
                </span>
            </div>
        </>
    );
}
