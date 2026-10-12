import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img {...props} src="/favicon.svg" alt="App Logo" />
    );
}
