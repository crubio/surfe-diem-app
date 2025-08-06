import { getHomePageVariation } from 'utils/ab-testing';
import DashboardHome from "./dashboard-home";
import DiscoveryHome from "./discovery-home";
import DataRichHome from "./data-rich-home";

const Home = () => {
  const variation = getHomePageVariation();
  
  switch (variation) {
    case 'dashboard':
      return <DashboardHome />;
    case 'discovery':
      return <DiscoveryHome />;
    case 'data-rich':
      return <DataRichHome />;
    default: // Fallback to data-rich if no valid variation is assigned
      return <DataRichHome />;
  }
};

export default Home;