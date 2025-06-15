declare module 'react-helmet' {
  import * as React from 'react';
  
  interface HelmetProps {
    htmlAttributes?: React.HTMLAttributes<HTMLHtmlElement>;
    title?: string;
    titleTemplate?: string;
    defaultTitle?: string;
    base?: { target?: string; href?: string };
    meta?: Array<React.MetaHTMLAttributes<HTMLMetaElement>>;
    link?: Array<React.LinkHTMLAttributes<HTMLLinkElement>>;
    script?: Array<React.ScriptHTMLAttributes<HTMLScriptElement>>;
    noscript?: Array<React.HTMLAttributes<HTMLElement>>;
    style?: Array<React.StyleHTMLAttributes<HTMLStyleElement>>;
    onChangeClientState?: (newState: any, addedTags: any, removedTags: any) => void;
  }
  
  export class Helmet extends React.Component<HelmetProps> {
    static renderStatic(): {
      base: { toComponent(): React.Component; toString(): string };
      bodyAttributes: { toComponent(): React.Component; toString(): string };
      htmlAttributes: { toComponent(): React.Component; toString(): string };
      link: { toComponent(): React.Component; toString(): string };
      meta: { toComponent(): React.Component; toString(): string };
      noscript: { toComponent(): React.Component; toString(): string };
      script: { toComponent(): React.Component; toString(): string };
      style: { toComponent(): React.Component; toString(): string };
      title: { toComponent(): React.Component; toString(): string };
    };
  }
  
  export default Helmet;
} 