declare module 'next-build-id' {
  function nextBuildId(options?: { dir?: string; describe?: boolean }): Promise<string>;
  namespace nextBuildId {
    function sync(options?: { dir?: string; describe?: boolean }): string;
  }
  export = nextBuildId;
}