import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
}

const SEO = ({
  title = 'Surfe Diem - Free Surf Conditions for the Community',
}: SEOProps) => {
  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  );
};

export default SEO;
