import { getHomePageVariation } from 'utils/ab-testing';
import DashboardHome from "./dashboard-home";
import DiscoveryHome from "./discovery-home";
import MinimalistHome from "./minimalist-home";
import DataRichHome from "./data-rich-home";

const Home = () => {
  const variation = getHomePageVariation();
  
  switch (variation) {
    case 'dashboard':
      return <DashboardHome />;
    case 'discovery':
      return <DiscoveryHome />;
    case 'minimalist':
      return <MinimalistHome />;
    case 'data-rich':
    default:
      return <DataRichHome />;
  }
};

export default Home;