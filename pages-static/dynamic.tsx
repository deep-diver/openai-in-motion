import { lazy, Suspense, type ComponentType } from 'react';

// The same scene components load lazily in both the Sites and static builds.
export default function dynamic<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  options: { ssr?: boolean; loading?: ComponentType } = {},
) {
  const Component = lazy(loader);
  const Loading = options.loading;
  return function DynamicComponent(props: P) {
    return (
      <Suspense fallback={Loading ? <Loading /> : null}>
        <Component {...props} />
      </Suspense>
    );
  };
}
