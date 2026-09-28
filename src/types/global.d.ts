declare module '*.scss' {
  const content: string;
  export default content;
}
declare module '*.css' {
  const content: string;
  export default content;
}

// Make this file a module so global augmentation works
export {};

declare global {
  interface Window {
    DMN_PUBLIC_BOOT: {
      restUrl: string; // e.g. "https://yoursite.com/wp-json/dmn/v1/"
      /** Whether to record anonymous widget events for the admin's Analytics section. */
      tracking?: '1' | '0' | boolean;
      /** The site's time zone: an IANA name or an offset such as "+01:00". */
      timezone?: string;
    };
  }

  // WordPress localize also defines a global var (window-scoped)
  const DMN_PUBLIC_BOOT: {
    restUrl: string;
    tracking?: '1' | '0' | boolean;
  };
}
