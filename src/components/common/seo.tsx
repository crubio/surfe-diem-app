import { Helmet } from 'react-helmet-async';
import { SITE_NAME, DEFAULT_OG_IMAGE, canonicalUrl, type PageMeta } from 'config/seo-meta';

// Same tags prerender.js writes into each page's HTML (built from the same
// config/seo-meta helpers), so the page keeps them once JS takes over
const SEO = ({ title, description, path }: PageMeta) => {
  const url = canonicalUrl(path);
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
    </Helmet>
  );
};

export default SEO;
