import type { ComponentProps } from 'react';
import { sitePath } from '../lib/sitePath';

export default function Link({ href = '', children, ...props }: ComponentProps<'a'>) {
  const path = /^\/en$/.test(href) ? `${href}/` : href;
  return <a {...props} href={sitePath(path)}>{children}</a>;
}
