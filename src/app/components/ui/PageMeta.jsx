import { Helmet } from 'react-helmet-async';

export default function PageMeta({ title, description, noSuffix = false }) {
  const fullTitle = noSuffix ? title : `${title} | ME-DB`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
  );
}
