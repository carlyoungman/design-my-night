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
    };
  }

  // WordPress localize also defines a global var (window-scoped)
  const DMN_PUBLIC_BOOT: {
    restUrl: string;
  };
}
